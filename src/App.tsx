import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { EchoProvider } from "@zdql/echo-react-sdk";
import { ShirtDataProvider, useShirtData } from "@/context/ShirtDataContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { useRecoveryPrompt } from "@/hooks/useRecoveryPrompt";
import { useEchoErrorToast } from "@/hooks/useEchoErrorToast";
import { RecoveryPrompt } from "@/components/ui/RecoveryPrompt";
import { Toast } from "@/components/ui/Toast";
import { InsufficientBalanceModal } from "@/components/ui/InsufficientBalanceModal";
import { HomePage } from "@/pages/HomePage";
import { ViewPage } from "@/pages/ViewPage";
import { Analytics } from "@vercel/analytics/react";

const echoConfig = {
  appId: "60601628-cdb7-481e-8f7e-921981220348",
  apiUrl: "https://echo.merit.systems",
};

function AppContent() {
  const {
    showRecoveryPrompt,
    recoveryData,
    recoverWork,
    startFresh,
    dismissRecovery,
  } = useRecoveryPrompt();

  const { toast, hideToast } = useEchoErrorToast();
  const { showInsufficientBalanceModal, setShowInsufficientBalanceModal } =
    useShirtData();

  return (
    <>
      <AuthGuard>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/view" element={<ViewPage />} />
          </Routes>
        </Router>
      </AuthGuard>

      {/* Recovery Prompt - Global overlay */}
      {showRecoveryPrompt && recoveryData && (
        <RecoveryPrompt
          recoveryData={recoveryData}
          onRecover={recoverWork}
          onStartFresh={startFresh}
          onDismiss={dismissRecovery}
        />
      )}

      {/* Echo Error Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={4000}
      />

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
      />
    </>
  );
}

function App() {
  return (
    <EchoProvider config={echoConfig}>
      <ShirtDataProvider>
        <AppContent />
        <Analytics />
      </ShirtDataProvider>
    </EchoProvider>
  );
}

export default App;
