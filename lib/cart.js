import { createContext, useContext, useMemo, useState } from "react";

/**
 * Cart state for the diner flow. Held in memory: a cart is tied to one
 * sitting, so losing it on reload is the correct behaviour.
 *
 * A cart belongs to exactly one restaurant/table pair. Switching tables
 * clears it rather than mixing items from two venues into one order.
 */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [table, setTable] = useState(null); // { restaurantId, tableId, tableLabel }
  const [lines, setLines] = useState([]); // [{ itemId, name, price, qty }]

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const total = lines.reduce((n, l) => n + l.price * l.qty, 0);

    return {
      table,
      lines,
      count,
      total,

      /** Binds the cart to a table, clearing it if the table changed. */
      openTable(next) {
        setTable((prev) => {
          const changed =
            !prev ||
            prev.restaurantId !== next.restaurantId ||
            prev.tableId !== next.tableId;
          if (changed) setLines([]);
          return next;
        });
      },

      add(item) {
        setLines((prev) => {
          const found = prev.find((l) => l.itemId === item.id);
          if (found) {
            return prev.map((l) =>
              l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l
            );
          }
          return [
            ...prev,
            { itemId: item.id, name: item.name, price: item.price, qty: 1 },
          ];
        });
      },

      remove(itemId) {
        setLines((prev) =>
          prev
            .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0)
        );
      },

      qtyOf(itemId) {
        return lines.find((l) => l.itemId === itemId)?.qty ?? 0;
      },

      clear() {
        setLines([]);
      },
    };
  }, [table, lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider.");
  return ctx;
}
