import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { EchoProvider } from "@zdql/echo-react-sdk";
import { ShirtDataProvider } from "@/context/ShirtDataContext";
import { useRecoveryPrompt } from "@/hooks/useRecoveryPrompt";
import { RecoveryPrompt } from "@/components/ui/RecoveryPrompt";
import { HomePage } from "@/pages/HomePage";
import { ViewPage } from "@/pages/ViewPage";
import { Analytics } from "@vercel/analytics/react";

const echoConfig = {
  appId: "157aa247-4d72-473c-8e27-6927c602892c",
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

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/view" element={<ViewPage />} />
        </Routes>
      </Router>

      {/* Recovery Prompt - Global overlay */}
      {showRecoveryPrompt && recoveryData && (
        <RecoveryPrompt
          recoveryData={recoveryData}
          onRecover={recoverWork}
          onStartFresh={startFresh}
          onDismiss={dismissRecovery}
        />
      )}
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
