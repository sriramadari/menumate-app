import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabase, isSupabaseConfigured } from "./supabase";

/**
 * Unified auth API with two interchangeable backends.
 *
 *   local    - no network, no database. Phone + OTP are verified on-device
 *              and the session is persisted in AsyncStorage. The generated
 *              code is returned to the caller so the UI can display it,
 *              since there is no SMS to receive.
 *   supabase - real phone OTP via Supabase (requires a live project with
 *              an SMS provider configured).
 *
 * Defaults to `local` so the app runs standalone. Opt into Supabase with
 * EXPO_PUBLIC_AUTH_MODE=supabase plus URL/anon-key in .env.
 */
const REQUESTED_MODE = process.env.EXPO_PUBLIC_AUTH_MODE ?? "local";

export const AUTH_MODE =
  REQUESTED_MODE === "supabase" && isSupabaseConfigured ? "supabase" : "local";

export const isLocalMode = AUTH_MODE === "local";

const SESSION_KEY = "menumate.local.session";
const PENDING_KEY = "menumate.local.pendingOtp";

const listeners = new Set();

function emit(session) {
  for (const cb of listeners) {
    try {
      cb(session);
    } catch {
      // A failing subscriber must not break the others.
    }
  }
}

/** Subscribe to session changes. Returns an unsubscribe function. */
export function onAuthStateChange(callback) {
  if (isLocalMode) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  const {
    data: { subscription },
  } = getSupabase().auth.onAuthStateChange((_event, session) =>
    callback(session)
  );
  return () => subscription.unsubscribe();
}

export async function getSession() {
  if (isLocalMode) {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Request a code for `phone`.
 * In local mode the returned `devCode` is the code to type in; in Supabase
 * mode it is undefined because the code arrives by SMS.
 */
export async function sendOtp(phone) {
  const normalized = normalizePhone(phone);

  if (isLocalMode) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await AsyncStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ phone: normalized, code })
    );
    return { devCode: code };
  }

  const { error } = await getSupabase().auth.signInWithOtp({
    phone: `91${normalized}`,
  });
  if (error) throw error;
  return {};
}

export async function verifyOtp(phone, code) {
  const normalized = normalizePhone(phone);
  const token = String(code ?? "").trim();

  if (isLocalMode) {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    const pending = raw ? JSON.parse(raw) : null;

    if (!pending || pending.phone !== normalized) {
      throw new Error("No code was requested for this number.");
    }
    if (pending.code !== token) {
      throw new Error("That code is incorrect.");
    }

    const session = {
      user: { id: `local-${normalized}`, phone: normalized },
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    await AsyncStorage.removeItem(PENDING_KEY);

    emit(session);
    return session;
  }

  const supabase = getSupabase();
  const {
    data: { session },
    error,
  } = await supabase.auth.verifyOtp({
    phone: `91${normalized}`,
    token,
    type: "sms",
  });
  if (error) throw error;

  await ensureProfile(supabase, session.user.id);
  return session;
}

export async function signOut() {
  if (isLocalMode) {
    await AsyncStorage.multiRemove([SESSION_KEY, PENDING_KEY]);
    emit(null);
    return;
  }

  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

/** Keeps the Supabase session fresh; a no-op with no network backend. */
export function startAutoRefresh() {
  if (!isLocalMode) getSupabase().auth.startAutoRefresh();
}

export function stopAutoRefresh() {
  if (!isLocalMode) getSupabase().auth.stopAutoRefresh();
}

function normalizePhone(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

async function ensureProfile(supabase, userId) {
  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", userId);
  if (error) throw error;

  if (profiles.length === 0) {
    const { error: insertError } = await supabase
      .from("user_profiles")
      .insert([{ id: userId }]);
    if (insertError) throw insertError;
  }
}
