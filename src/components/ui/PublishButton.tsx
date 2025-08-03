import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShirtData } from "@/context/ShirtDataContext";
import { db } from "@/services/db";
import { generateDataUrlHash, getPublishedProduct } from "@/services/imageHash";
import { printifyService } from "@/services/printify";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
  isPublishing?: boolean;
  error?: string;
  shopifyUrl?: string;
  isPublished?: boolean;
  onPublish?: (productName: string) => void;
}

function PublishModal({
  isOpen,
  onClose,
  designName,
  isPublishing,
  error,
  shopifyUrl,
  isPublished,
  onPublish,
}: PublishModalProps) {
  const [productName, setProductName] = useState("");
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Initialize product name when modal opens, but don't override user edits
  useEffect(() => {
    if (designName && !hasUserEdited && !isPublished) {
      setProductName(designName);
    }
  }, [designName, hasUserEdited, isPublished]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasUserEdited(false);
      setProductName("");
    }
  }, [isOpen]);

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
    setHasUserEdited(true);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Design</DialogTitle>
          <DialogDescription>
            {isPublishing
              ? `Publishing "${designName}" to your store...`
              : isPublished
                ? `"${designName}" has been published successfully!`
                : `Ready to share "${designName}" with the world?`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isPublishing && !isPublished && !error && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="productName" className="text-sm font-medium">
                  Product Name
                </Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={handleProductNameChange}
                  placeholder="Enter product name..."
                  className="mt-1"
                  maxLength={30}
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  {productName.length}/30 characters
                </p>
              </div>
            </div>
          )}

          {isPublishing && (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium">Publishing...</p>
                <p className="text-muted-foreground text-sm">
                  Creating "{productName}"...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Publishing Failed</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {isPublished && !isPublishing && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Success!</p>
                <p className="mt-1 text-sm text-green-700">
                  "{productName}" is now live. It may take a few minutes for the
                  previews to appear.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {isPublished && !isPublishing ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {shopifyUrl && (
                <Button onClick={() => window.open(shopifyUrl, "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Product
                </Button>
              )}
            </>
          ) : !isPublishing && !error ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => onPublish?.(productName)}
                disabled={!productName.trim()}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Close"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
        const publishedProduct = await getPublishedProduct(imageHash);

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

  const handleOpenModal = () => {
    if (!shirtData?.imageUrl || !shirtData?.prompt) return;
    setShowModal(true);
  };

  const handleConfirmPublish = async (confirmedProductName: string) => {
    if (!shirtData?.imageUrl || !shirtData?.prompt) return;

    setIsPublishing(true);
    setError(undefined);
    setShopifyUrl(undefined);
    setIsPublished(false);

    try {
      const description = `Custom AI-generated shirt design: ${shirtData.prompt}`;

      const result = await printifyService.createShirtFromDesign(
        shirtData.imageUrl,
        shirtData.prompt,
        confirmedProductName,
        description,
      );

      // Set the Shopify URL using the external handle directly
      if (result.product.external?.handle) {
        setShopifyUrl(result.product.external.handle);
      }

      // Update IndexedDB with published product info
      try {
        const imageHash = await generateDataUrlHash(shirtData.imageUrl);

        // Store the complete published product information
        await db.shirtHistory.put({
          id: imageHash,
          prompt: shirtData.prompt,
          imageUrl: shirtData.imageUrl,
          generatedAt: new Date().toISOString(),
          timestamp: Date.now(),
          productName: confirmedProductName,
          printifyProductId: result.product.id,
          shopifyUrl: result.product.external?.handle,
          isPublished: true,
          publishedAt: new Date().toISOString(),
        });

        console.log("💾 Stored published product in database:", {
          productName: confirmedProductName,
          productId: result.product.id,
          shopifyUrl: result.product.external?.handle,
        });
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
        onClick={handleOpenModal}
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
        onPublish={handleConfirmPublish}
      />
    </>
  );
}
