import { useEffect } from "react";
import { AppState } from "react-native";
import { supabase } from "./supabase";

/**
 * Keeps the Supabase session refreshing while the app is foregrounded.
 * Registered per-screen via an effect so the listener is always torn down —
 * the previous module-level `AppState.addEventListener` call leaked one
 * listener per import and was duplicated across both auth screens.
 */
export function useAutoRefresh() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => subscription.remove();
  }, []);
}
