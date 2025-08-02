import { useState, useCallback } from "react";
import type { AutoSaveStatus } from "@/types/design";

export function useAutoSave() {
  const [autoSaveStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt] = useState<string | null>(null);

  // Disabled auto-save for now - just return the interface
  const getAutoSaveDesign = useCallback(async () => null, []);
  const clearAutoSave = useCallback(async () => {}, []);
  const forceAutoSave = useCallback(() => {}, []);
  const triggerAutoSave = useCallback(() => {}, []);

  return {
    autoSaveStatus,
    lastSavedAt,
    getAutoSaveDesign,
    clearAutoSave,
    forceAutoSave,
    triggerAutoSave,
  };
}
