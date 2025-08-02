import { Branding } from "@/components/ui/branding";
import { Skeleton } from "@/components/ui/skeleton";
import { useShirtData } from "@/context/ShirtDataContext";
import { EchoSignIn, EchoTokenPurchase } from "@zdql/echo-react-sdk";

export function Navbar() {
  const { isAuthenticated, isAuthLoading } = useShirtData();

  return (
    <nav className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-8 flex items-center justify-between py-4">
        <Branding size="small" />

        <div className="flex items-center space-x-4">
          {isAuthLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : isAuthenticated ? (
            <EchoTokenPurchase />
          ) : (
            <EchoSignIn />
          )}
        </div>
      </div>
    </nav>
  );
}
