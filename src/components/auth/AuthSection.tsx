import { EchoSignIn, EchoTokenPurchase } from "@zdql/echo-react-sdk";
import { useShirtData } from "@/context/ShirtDataContext";

export function AuthSection() {
  const { isAuthenticated } = useShirtData();

  if (isAuthenticated) {
    // Top right when logged in
    return (
      <div className="absolute top-4 right-4">
        <EchoTokenPurchase />
      </div>
    );
  }

  // Dead center when not logged in
  return (
    <div className="flex justify-center mt-6 mb-4">
      <EchoSignIn />
    </div>
  );
}