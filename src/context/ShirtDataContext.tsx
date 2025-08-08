import type { ShirtData, TexturePlacement } from "@/types";
import { useEcho, type EchoUser } from "@zdql/echo-react-sdk";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ShirtDataContextType {
  shirtData: ShirtData | null;
  setShirtData: (data: ShirtData | null) => void;
  texturePlacement: TexturePlacement;
  setTexturePlacement: (placement: TexturePlacement) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  shirtColor: string;
  setShirtColor: (color: string) => void;
  signIn: () => void;
  showInsufficientBalanceModal: boolean;
  setShowInsufficientBalanceModal: (show: boolean) => void;
  user: EchoUser | null;
}

const ShirtDataContext = createContext<ShirtDataContextType | undefined>(
  undefined,
);

export function ShirtDataProvider({ children }: { children: ReactNode }) {
  const [shirtData, setShirtData] = useState<ShirtData | null>(null);
  const [texturePlacement, setTexturePlacement] =
    useState<TexturePlacement>("front");
  const [isLoading, setIsLoading] = useState(false);
  const [shirtColor, setShirtColor] = useState("#f8f9fa"); // Lightest shirt color (White)
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] =
    useState(false);

  // Centralize authentication state to prevent multiple useEcho calls
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    signIn,
    user,
    // balance,
  } = useEcho();

  // Check balance when user data becomes available
  // No longer relevant with free tier!!
  // useEffect(() => {
  //   if (isAuthenticated && user && !isAuthLoading && balance) {
  //     if (balance.credits <= 0.01) {
  //       setShowInsufficientBalanceModal(true);
  //     }
  //   }
  // }, [isAuthenticated, user, isAuthLoading, balance]);

  // Prevent navigation/refresh during loading
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLoading) {
        event.preventDefault();
        // Modern browsers require returnValue to be set
        event.returnValue =
          "Your design is still generating. Are you sure you want to leave?";
        return "Your design is still generating. Are you sure you want to leave?";
      }
    };

    if (isLoading) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoading]);

  return (
    <ShirtDataContext.Provider
      value={{
        shirtData,
        setShirtData,
        texturePlacement,
        setTexturePlacement,
        isLoading,
        setIsLoading,
        isAuthenticated,
        isAuthLoading,
        shirtColor,
        setShirtColor,
        signIn,
        showInsufficientBalanceModal,
        setShowInsufficientBalanceModal,
        user,
      }}
    >
      {children}
    </ShirtDataContext.Provider>
  );
}

export function useShirtData() {
  const context = useContext(ShirtDataContext);
  if (context === undefined) {
    throw new Error("useShirtData must be used within a ShirtDataProvider");
  }
  return context;
}
