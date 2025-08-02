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
}

function PublishModal({ isOpen, onClose, designName, variants, options, isPublishing, error }: PublishModalProps) {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  if (!isOpen) return null;

  const colorOptions = options?.find(opt => opt.type === 'color')?.values || [];
  const sizeOptions = options?.find(opt => opt.type === 'size')?.values || [];

  const getSelectedVariant = () => {
    if (!selectedColor || !selectedSize || !variants) return null;
    return variants.find(v => 
      v.options.includes(selectedColor) && v.options.includes(selectedSize)
    );
  };

  const handleBuyNow = () => {
    const variant = getSelectedVariant();
    if (!variant?.external?.id) return;
    
    const checkoutUrl = `https://shirt-slop.myshopify.com/cart/${variant.external.id}:1?checkout`;
    window.open(checkoutUrl, '_blank');
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
              : `Ready to share "${designName}" with the world?`
            }
          </p>

          {isPublishing && (
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">Creating product on Printify and syncing to Shopify...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border bg-red-50 p-4">
              <h4 className="mb-2 font-medium text-red-900">Publishing Failed</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {variants && options && !isPublishing && (
            <div className="rounded-lg border bg-green-50 p-4">
              <h4 className="mb-3 font-medium text-green-900">Choose Your Options!</h4>
              
              {/* Color selector */}
              {colorOptions.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color:</label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color.id ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.colors?.[0] || '#ccc' }}
                        title={color.title}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size selector */}
              {sizeOptions.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size:</label>
                  <div className="flex gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-1 text-sm border rounded ${
                          selectedSize === size.id 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Price display */}
              {getSelectedVariant() && (
                <div className="mb-3">
                  <span className="text-lg font-bold text-green-700">
                    ${(getSelectedVariant()!.price / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {variants && options && !isPublishing ? (
            <>
              <Button
                onClick={handleBuyNow}
                disabled={!getSelectedVariant()}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Buy Now {getSelectedVariant() && `- $${(getSelectedVariant()!.price / 100).toFixed(2)}`}
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1" size="sm">
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
              {isPublishing ? 'Publishing...' : 'Close'}
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

  const handlePublish = async () => {
    if (!shirtData?.imageUrl || !shirtData?.prompt) return;
    
    setShowModal(true);
    setIsPublishing(true);
    setError(undefined);
    setVariants(undefined);
    setOptions(undefined);

    try {
      const title = shirtData.prompt.substring(0, 50);
      const description = `Custom AI-generated shirt design: ${shirtData.prompt}`;
      
      const result = await printifyService.createShirtFromDesign(
        shirtData.imageUrl,
        title,
        description
      );
      
      setVariants(result.variants);
      setOptions(result.options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish shirt');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(undefined);
    setVariants(undefined);
    setOptions(undefined);
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
        {shirtData?.isPartial ? "Generating..." : isPublishing ? "Publishing..." : "Publish"}
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
      />
    </>
  );
}
