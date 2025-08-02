import { createContext, useContext, useState, type ReactNode } from "react";
import { useEcho } from "@zdql/echo-react-sdk";
import type { ShirtData, TexturePlacement } from "@/types";

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
}

const ShirtDataContext = createContext<ShirtDataContextType | undefined>(
  undefined,
);

export function ShirtDataProvider({ children }: { children: ReactNode }) {
  const [shirtData, setShirtData] = useState<ShirtData | null>(null);
  const [texturePlacement, setTexturePlacement] =
    useState<TexturePlacement>("front");
  const [isLoading, setIsLoading] = useState(false);
  const [shirtColor, setShirtColor] = useState("#f8f8f8"); // Off-white default

  // Centralize authentication state to prevent multiple useEcho calls
  const { isAuthenticated, isLoading: isAuthLoading } = useEcho();

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
