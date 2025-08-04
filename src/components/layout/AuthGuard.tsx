import { useShirtData } from "@/context/ShirtDataContext";
import { Navbar } from "@/components/layout/Navbar";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthLoading, isAuthenticated } = useShirtData();
  const [showContent, setShowContent] = useState(false);

  // VERY DUMB TIMEOUT HACK
  // This is a terrible solution but necessary because Echo SDK has broken state management.
  // Echo sets isAuthenticated=true while isAuthLoading=true, causing flicker.
  // This timeout prevents showing content until auth state stabilizes.
  // TODO: Remove this hack when Echo SDK is fixed or replaced.
  useEffect(() => {
    if (!isAuthLoading && typeof isAuthenticated === "boolean") {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100); // Small delay to let Echo's broken state settle

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isAuthLoading, isAuthenticated]);

  // Show loading until the dumb timeout completes
  if (!showContent) {
    return (
      <div className="flex min-h-svh flex-col bg-white">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
