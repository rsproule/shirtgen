import { useState } from "react";
import { Share2, ExternalLink, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShirtData } from "@/context/ShirtDataContext";
import { printifyService } from "@/services/printify";

interface PrintifyVariant {
  id: number;
  title: string;
  price: number;
  options: number[];
  external?: {
    id: string;
  };
}

interface PrintifyOption {
  name: string;
  type: string;
  values: Array<{
    id: number;
    title: string;
    colors?: string[];
  }>;
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
  variants?: PrintifyVariant[];
  options?: PrintifyOption[];
  isPublishing?: boolean;
  error?: string;
  shopifyUrl?: string;
}

function PublishModal({
  isOpen,
  onClose,
  designName,
  variants,
  options,
  isPublishing,
  error,
  shopifyUrl,
}: PublishModalProps) {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  if (!isOpen) return null;

  const colorOptions = options?.find(opt => opt.type === "color")?.values || [];
  const sizeOptions = options?.find(opt => opt.type === "size")?.values || [];

  const getSelectedVariant = () => {
    if (!selectedColor || !selectedSize || !variants) return null;
    return variants.find(
      v =>
        v.options.includes(selectedColor) && v.options.includes(selectedSize),
    );
  };

  const handleBuyNow = () => {
    const variant = getSelectedVariant();
    if (!variant?.external?.id) return;

    const checkoutUrl = `https://shirt-slop.myshopify.com/cart/${variant.external.id}:1?checkout`;
    window.open(checkoutUrl, "_blank");
  };

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

          {variants && options && !isPublishing && (
            <div className="rounded-lg border bg-green-50 p-4">
              <h4 className="mb-3 font-medium text-green-900">
                Product published successfully!
              </h4>
              <p className="text-sm text-green-700 mb-3">
                Your shirt is now available on Shopify. Click below to view the product page.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {variants && options && !isPublishing ? (
            <>
              <Button
                onClick={() => window.open(shopifyUrl || 'https://shirt-slop.myshopify.com', '_blank')}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {shopifyUrl ? 'View Product' : 'View Store'}
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
  const [variants, setVariants] = useState<PrintifyVariant[]>();
  const [options, setOptions] = useState<PrintifyOption[]>();
  const [error, setError] = useState<string>();
  const [shopifyUrl, setShopifyUrl] = useState<string>();

  const handlePublish = async () => {
    if (!shirtData?.imageUrl || !shirtData?.prompt) return;

    setShowModal(true);
    setIsPublishing(true);
    setError(undefined);
    setVariants(undefined);
    setOptions(undefined);
    setShopifyUrl(undefined);

    try {
      const title = shirtData.prompt.substring(0, 50);
      const description = `Custom AI-generated shirt design: ${shirtData.prompt}`;

      const result = await printifyService.createShirtFromDesign(
        shirtData.imageUrl,
        title,
        description,
      );

      setVariants(result.variants);
      setOptions(result.options);
      
      // Set the Shopify URL if we have the handle
      if (result.product.external?.handle) {
        const url = printifyService.getShopifyUrl(result.product.external.handle);
        setShopifyUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish shirt");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(undefined);
    setVariants(undefined);
    setOptions(undefined);
    setShopifyUrl(undefined);
  };

  const isDisabled =
    !shirtData?.imageUrl ||
    !shirtData?.prompt ||
    shirtData?.isPartial !== false ||
    isPublishing;

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
        variants={variants}
        options={options}
        isPublishing={isPublishing}
        error={error}
        shopifyUrl={shopifyUrl}
      />
    </>
  );
}
