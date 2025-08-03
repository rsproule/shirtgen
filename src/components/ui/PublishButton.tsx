import { useState, useEffect } from "react";
import { Share2, ExternalLink, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShirtData } from "@/context/ShirtDataContext";
import { printifyService } from "@/services/printify";
import { db } from "@/services/db";
import { generateDataUrlHash, getPublishedProduct } from "@/services/imageHash";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
  isPublishing?: boolean;
  error?: string;
  shopifyUrl?: string;
  isPublished?: boolean;
}

function PublishModal({
  isOpen,
  onClose,
  designName,
  isPublishing,
  error,
  shopifyUrl,
  isPublished,
}: PublishModalProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Publish Design
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            disabled={isPublishing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-4 text-gray-600">
            {isPublishing
              ? `Publishing "${designName}" to your store...`
              : `Ready to share "${designName}" with the world?`}
          </p>

          {isPublishing && (
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">
                  Creating product on Printify and syncing to Shopify...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border bg-red-50 p-4">
              <h4 className="mb-2 font-medium text-red-900">
                Publishing Failed
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isPublished && !isPublishing && (
            <div className="rounded-lg border bg-green-50 p-4">
              <h4 className="mb-3 font-medium text-green-900">
                Product published successfully!
              </h4>
              <p className="mb-3 text-sm text-green-700">
                Your shirt is now available on Shopify. Click below to view the
                product page.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isPublished && !isPublishing ? (
            <>
              <Button
                onClick={() =>
                  window.open(
                    shopifyUrl || "https://shirt-slop.myshopify.com",
                    "_blank",
                  )
                }
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {shopifyUrl ? "View Product" : "View Store"}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Close
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className="w-full"
              size="sm"
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Close"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PublishButton() {
  const { shirtData } = useShirtData();
  const [showModal, setShowModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string>();
  const [shopifyUrl, setShopifyUrl] = useState<string>();
  const [isPublished, setIsPublished] = useState(false);
  const [alreadyPublished, setAlreadyPublished] = useState<{
    shopifyUrl?: string;
    productName: string;
  } | null>(null);

  // Check if this image is already published when shirtData changes
  useEffect(() => {
    const checkPublishedStatus = async () => {
      if (!shirtData?.imageUrl) {
        setAlreadyPublished(null);
        return;
      }

      try {
        const imageHash = await generateDataUrlHash(shirtData.imageUrl);
        const publishedProduct = getPublishedProduct(imageHash);

        if (publishedProduct) {
          console.log(
            "📦 Found already published product:",
            publishedProduct.productName,
          );
          setAlreadyPublished({
            shopifyUrl: publishedProduct.shopifyUrl,
            productName: publishedProduct.productName,
          });
        } else {
          setAlreadyPublished(null);
        }
      } catch (error) {
        console.warn("Failed to check published status:", error);
        setAlreadyPublished(null);
      }
    };

    checkPublishedStatus();
  }, [shirtData?.imageUrl]);

  const handlePublish = async () => {
    if (!shirtData?.imageUrl || !shirtData?.prompt) return;

    setShowModal(true);
    setIsPublishing(true);
    setError(undefined);
    setShopifyUrl(undefined);
    setIsPublished(false);

    try {
      const description = `Custom AI-generated shirt design: ${shirtData.prompt}`;

      const result = await printifyService.createShirtFromDesign(
        shirtData.imageUrl,
        shirtData.prompt, // Pass the full prompt for LLM name generation
        description,
      );

      // Set the Shopify URL if we have the handle
      if (result.product.external?.handle) {
        const url = printifyService.getShopifyUrl(
          result.product.external.handle,
        );
        setShopifyUrl(url);
      }

      // Update IndexedDB with published product info
      try {
        const existingItems = await db.shirtHistory
          .where("prompt")
          .equals(shirtData.prompt)
          .toArray();

        if (existingItems.length > 0) {
          // Update existing record
          await db.shirtHistory.update(existingItems[0].id, {
            imageUrl: shirtData.imageUrl,
            // Add any other fields we want to track for published products
          });
          console.log("💾 Updated shirt history with published product");
        }
      } catch (dbError) {
        console.warn("Failed to update database:", dbError);
      }

      setIsPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish shirt");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(undefined);
    setShopifyUrl(undefined);
    setIsPublished(false);
  };

  const isDisabled =
    !shirtData?.imageUrl ||
    !shirtData?.prompt ||
    shirtData?.isPartial !== false ||
    isPublishing;

  // If already published, show store link button
  if (alreadyPublished) {
    return (
      <Button
        onClick={() =>
          window.open(
            alreadyPublished.shopifyUrl || "https://shirt-slop.myshopify.com",
            "_blank",
          )
        }
        size="sm"
        className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
      >
        <ExternalLink className="h-4 w-4" />
        {alreadyPublished.shopifyUrl ? "View Product" : "View Store"}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handlePublish}
        disabled={isDisabled}
        size="sm"
        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        {isPublishing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {shirtData?.isPartial
          ? "Generating..."
          : isPublishing
            ? "Publishing..."
            : "Publish"}
      </Button>

      <PublishModal
        isOpen={showModal}
        onClose={handleCloseModal}
        designName={
          shirtData?.prompt?.substring(0, 30) + "..." || "Untitled Design"
        }
        isPublishing={isPublishing}
        error={error}
        shopifyUrl={shopifyUrl}
        isPublished={isPublished}
      />
    </>
  );
}
