import { useCallback, useEffect, useState } from "react";
import { subscribe } from "./store";

/**
 * Loads data from the store and reloads it whenever the store changes, so
 * a write on one screen is reflected on every other screen.
 *
 * `loader` must be stable -- wrap it in useCallback at the call site.
 */
export function useStoreData(loader, initial = null) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (alive = () => true) => {
      try {
        const result = await loader();
        if (alive()) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (alive()) setError(e?.message ?? "Could not load data.");
      } finally {
        if (alive()) setLoading(false);
      }
    },
    [loader]
  );

  useEffect(() => {
    let mounted = true;
    const alive = () => mounted;

    run(alive);
    const unsubscribe = subscribe(() => run(alive));

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [run]);

  return { data, loading, error, reload: () => run() };
}
