import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SEED_MENU,
  SEED_ORDERS,
  SEED_RESTAURANTS,
  SEED_TABLES,
} from "./seed";

/**
 * Offline data layer. Everything lives in AsyncStorage -- no server, no
 * database. Bump STORAGE_VERSION to force a reseed on next launch.
 */
const STORAGE_VERSION = "v1";
const key = (name) => `menumate.${STORAGE_VERSION}.${name}`;

const KEYS = {
  restaurants: key("restaurants"),
  menu: key("menu"),
  tables: key("tables"),
  orders: key("orders"),
  seeded: key("seeded"),
};

/** Order lifecycle, in order. `status` always holds one of these. */
export const ORDER_STATUSES = ["placed", "preparing", "ready", "served"];

export const ORDER_STATUS_LABELS = {
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready to serve",
  served: "Served",
};

/** The status after `current`, or null when the order is complete. */
export function nextStatus(current) {
  const i = ORDER_STATUSES.indexOf(current);
  if (i === -1 || i === ORDER_STATUSES.length - 1) return null;
  return ORDER_STATUSES[i + 1];
}

// --- change notification -------------------------------------------------
// Screens subscribe so a write on one screen refreshes the others.

const listeners = new Set();

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  for (const cb of [...listeners]) {
    try {
      cb();
    } catch {
      // One bad subscriber must not stop the rest.
    }
  }
}

// --- raw helpers ---------------------------------------------------------

async function read(storageKey, fallback = []) {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function write(storageKey, value) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

// --- seeding -------------------------------------------------------------

/** Seeds sample data once. Safe to call on every launch. */
export async function initStore() {
  const seeded = await AsyncStorage.getItem(KEYS.seeded);
  if (seeded === "true") return;
  await resetDemoData();
}

/** Restores all sample data, discarding changes. Handy mid-demo. */
export async function resetDemoData() {
  await Promise.all([
    write(KEYS.restaurants, SEED_RESTAURANTS),
    write(KEYS.menu, SEED_MENU),
    write(KEYS.tables, SEED_TABLES),
    write(KEYS.orders, SEED_ORDERS),
  ]);
  await AsyncStorage.setItem(KEYS.seeded, "true");
  notify();
}

// --- restaurants ---------------------------------------------------------

export async function getRestaurants() {
  return read(KEYS.restaurants);
}

export async function getRestaurant(id) {
  const all = await getRestaurants();
  return all.find((r) => r.id === id) ?? null;
}

// --- menu ----------------------------------------------------------------

export async function getMenu(restaurantId) {
  const all = await read(KEYS.menu);
  return restaurantId ? all.filter((m) => m.restaurantId === restaurantId) : all;
}

export async function addMenuItem(item) {
  const all = await read(KEYS.menu);
  const created = { ...item, id: makeId("m"), available: item.available ?? true };
  await write(KEYS.menu, [...all, created]);
  notify();
  return created;
}

export async function updateMenuItem(id, patch) {
  const all = await read(KEYS.menu);
  const next = all.map((m) => (m.id === id ? { ...m, ...patch } : m));
  await write(KEYS.menu, next);
  notify();
}

export async function deleteMenuItem(id) {
  const all = await read(KEYS.menu);
  await write(
    KEYS.menu,
    all.filter((m) => m.id !== id)
  );
  notify();
}

export async function toggleMenuItemAvailability(id) {
  const all = await read(KEYS.menu);
  const next = all.map((m) =>
    m.id === id ? { ...m, available: !m.available } : m
  );
  await write(KEYS.menu, next);
  notify();
}

// --- tables --------------------------------------------------------------

export async function getTables(restaurantId) {
  const all = await read(KEYS.tables);
  return restaurantId ? all.filter((t) => t.restaurantId === restaurantId) : all;
}

export async function getTable(id) {
  const all = await read(KEYS.tables);
  return all.find((t) => t.id === id) ?? null;
}

export async function addTable({ restaurantId, label, seats }) {
  const all = await read(KEYS.tables);
  const created = { id: makeId("t"), restaurantId, label, seats: seats ?? 2 };
  await write(KEYS.tables, [...all, created]);
  notify();
  return created;
}

// --- orders --------------------------------------------------------------

export async function getOrders({ restaurantId, placedBy } = {}) {
  let all = await read(KEYS.orders);
  if (restaurantId) all = all.filter((o) => o.restaurantId === restaurantId);
  if (placedBy) all = all.filter((o) => o.placedBy === placedBy);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id) {
  const all = await read(KEYS.orders);
  return all.find((o) => o.id === id) ?? null;
}

export async function placeOrder({
  restaurantId,
  tableId,
  tableLabel,
  items,
  placedBy,
}) {
  if (!items?.length) throw new Error("Cannot place an empty order.");

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const created = {
    id: makeId("o"),
    restaurantId,
    tableId,
    tableLabel,
    items,
    total,
    status: "placed",
    placedBy: placedBy ?? null,
    createdAt: new Date().toISOString(),
  };

  const all = await read(KEYS.orders);
  await write(KEYS.orders, [...all, created]);
  notify();
  return created;
}

export async function advanceOrder(id) {
  const all = await read(KEYS.orders);
  const order = all.find((o) => o.id === id);
  if (!order) throw new Error("Order not found.");

  const next = nextStatus(order.status);
  if (!next) return order;

  const updated = all.map((o) => (o.id === id ? { ...o, status: next } : o));
  await write(KEYS.orders, updated);
  notify();
  return { ...order, status: next };
}

export function formatPrice(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}
