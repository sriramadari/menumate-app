/**
 * Sample data for the offline demo. Seeded into AsyncStorage on first run
 * and restorable at any time from the "Reset demo data" action.
 */

/** The restaurant the merchant side manages. */
export const MY_RESTAURANT_ID = "r1";

export const SEED_RESTAURANTS = [
  {
    id: "r1",
    name: "Spice Route",
    cuisine: "North Indian",
    area: "Banjara Hills",
    emoji: "🍛",
    rating: 4.5,
    tagline: "Slow-cooked curries and clay-oven breads",
  },
  {
    id: "r2",
    name: "Dosa Junction",
    cuisine: "South Indian",
    area: "Madhapur",
    emoji: "🥞",
    rating: 4.3,
    tagline: "Crisp dosas on cast iron, all day",
  },
  {
    id: "r3",
    name: "Charminar Biryani",
    cuisine: "Hyderabadi",
    area: "Old City",
    emoji: "🍚",
    rating: 4.7,
    tagline: "Dum biryani the way it has always been made",
  },
];

export const SEED_MENU = [
  // Spice Route
  { id: "m1", restaurantId: "r1", name: "Paneer Butter Masala", description: "Cottage cheese in a tomato-cashew gravy", price: 280, category: "Mains", veg: true, available: true },
  { id: "m2", restaurantId: "r1", name: "Dal Makhani", description: "Black lentils simmered overnight", price: 240, category: "Mains", veg: true, available: true },
  { id: "m3", restaurantId: "r1", name: "Butter Naan", description: "Clay-oven flatbread, brushed with butter", price: 60, category: "Breads", veg: true, available: true },
  { id: "m4", restaurantId: "r1", name: "Chicken Tikka", description: "Charred yoghurt-marinated chicken", price: 320, category: "Starters", veg: false, available: true },
  { id: "m5", restaurantId: "r1", name: "Gulab Jamun", description: "Warm milk dumplings in rose syrup", price: 120, category: "Desserts", veg: true, available: true },
  { id: "m6", restaurantId: "r1", name: "Masala Chai", description: "Cardamom and ginger, brewed strong", price: 50, category: "Drinks", veg: true, available: false },

  // Dosa Junction
  { id: "m7", restaurantId: "r2", name: "Masala Dosa", description: "Crisp crepe with spiced potato", price: 140, category: "Mains", veg: true, available: true },
  { id: "m8", restaurantId: "r2", name: "Idli Sambar", description: "Steamed rice cakes, lentil broth", price: 90, category: "Mains", veg: true, available: true },
  { id: "m9", restaurantId: "r2", name: "Filter Coffee", description: "Chicory blend, served in a tumbler", price: 60, category: "Drinks", veg: true, available: true },
  { id: "m10", restaurantId: "r2", name: "Medu Vada", description: "Crisp lentil doughnuts", price: 80, category: "Starters", veg: true, available: true },

  // Charminar Biryani
  { id: "m11", restaurantId: "r3", name: "Chicken Dum Biryani", description: "Sealed-pot biryani with saffron rice", price: 340, category: "Mains", veg: false, available: true },
  { id: "m12", restaurantId: "r3", name: "Mutton Biryani", description: "Slow-cooked mutton, long-grain rice", price: 420, category: "Mains", veg: false, available: true },
  { id: "m13", restaurantId: "r3", name: "Veg Biryani", description: "Seasonal vegetables, whole spices", price: 260, category: "Mains", veg: true, available: true },
  { id: "m14", restaurantId: "r3", name: "Mirchi ka Salan", description: "Chilli and peanut curry", price: 110, category: "Sides", veg: true, available: true },
  { id: "m15", restaurantId: "r3", name: "Qubani ka Meetha", description: "Stewed apricots with cream", price: 150, category: "Desserts", veg: true, available: true },
];

export const SEED_TABLES = [
  { id: "t1", restaurantId: "r1", label: "Table 1", seats: 2 },
  { id: "t2", restaurantId: "r1", label: "Table 2", seats: 4 },
  { id: "t3", restaurantId: "r1", label: "Table 3", seats: 4 },
  { id: "t4", restaurantId: "r1", label: "Terrace 1", seats: 6 },
  { id: "t5", restaurantId: "r2", label: "Table 1", seats: 2 },
  { id: "t6", restaurantId: "r3", label: "Table 1", seats: 4 },
];

/** One order already in flight, so the merchant dashboard isn't empty on first open. */
export const SEED_ORDERS = [
  {
    id: "o1",
    restaurantId: "r1",
    tableId: "t2",
    tableLabel: "Table 2",
    items: [
      { itemId: "m1", name: "Paneer Butter Masala", price: 280, qty: 1 },
      { itemId: "m3", name: "Butter Naan", price: 60, qty: 2 },
    ],
    total: 400,
    status: "preparing",
    placedBy: "9876543210",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
];
