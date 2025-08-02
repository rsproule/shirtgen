import { useState, useCallback } from "react";
import { useAutoSave } from "./useAutoSave";

export function useRecoveryPrompt() {
  const { clearAutoSave } = useAutoSave();
  const [recoveryData, setRecoveryData] = useState<null>(null);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  // Check for unsaved work on app startup (disabled for now)
  const checkForUnsavedWork = useCallback(async () => {
    // Disabled - auto-save functionality is not active
    return;
  }, []);

  // Disabled for now

  // Recover the unsaved work (disabled)
  const recoverWork = useCallback(async () => {
    // Disabled for now
    return;
  }, []);

  // Start fresh (dismiss recovery)
  const startFresh = useCallback(() => {
    clearAutoSave();
    setShowRecoveryPrompt(false);
    setRecoveryData(null);
  }, [clearAutoSave]);

  // Dismiss recovery prompt (keep auto-save data)
  const dismissRecovery = useCallback(() => {
    setShowRecoveryPrompt(false);
    setRecoveryData(null);
  }, []);

  return {
    showRecoveryPrompt,
    recoveryData,
    recoverWork,
    startFresh,
    dismissRecovery,
    checkForUnsavedWork,
  };
}