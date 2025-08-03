import { useEffect, useState } from "react";

interface EchoErrorToastState {
  message: string;
  isVisible: boolean;
}

export function useEchoErrorToast() {
  const [toast, setToast] = useState<EchoErrorToastState>({
    message: "",
    isVisible: false,
  });

  useEffect(() => {
    // Monitor for Echo-related errors in the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for Echo error elements
            const errorElement = element.querySelector && element.querySelector('.echo-error') || 
                                element.querySelector && element.querySelector('[class*="error"]') ||
                                (element.classList && element.classList.contains('echo-error') ? element : null);
            
            if (errorElement) {
              const errorText = errorElement.textContent?.trim();
              
              // Check for session renewal error specifically
              if (errorText?.includes('Session renewal failed') || 
                  errorText?.includes('Please sign in again')) {
                showToast("Your session has expired. Please sign in again.");
                return;
              }
              
              // Show generic auth error
              if (errorText && errorText.length > 0) {
                showToast(errorText);
              }
            }
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const hideToast = () => {
    setToast({ message: "", isVisible: false });
  };

  return {
    toast,
    hideToast,
  };
}