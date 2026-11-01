import { useEffect } from "react";
import { AppState } from "react-native";
import { startAutoRefresh, stopAutoRefresh } from "./auth";

/**
 * Keeps the session refreshing while the app is foregrounded.
 * Registered via an effect so the listener is always torn down -- the
 * original code called AppState.addEventListener at module scope, leaking
 * one listener per import and registering it twice.
 */
export function useAutoRefresh() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") startAutoRefresh();
      else stopAutoRefresh();
    });

    return () => subscription.remove();
  }, []);
}
