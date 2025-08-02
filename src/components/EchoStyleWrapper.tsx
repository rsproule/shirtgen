import type { ReactNode } from "react";

interface EchoStyleWrapperProps {
  children: ReactNode;
}

export function EchoStyleWrapper({ children }: EchoStyleWrapperProps) {
  return (
    <div className="echo-wrapper">
      <style>
        {`
          .echo-wrapper button {
            background: hsl(222.2 84% 4.9%) !important;
            color: hsl(210 40% 98%) !important;
            border: 1px solid hsl(217.2 32.6% 17.5%) !important;
            border-radius: 0.5rem !important;
            padding: 0.5rem 1rem !important;
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            transition: all 0.2s !important;
            cursor: pointer !important;
          }
          
          .echo-wrapper button:hover {
            background: hsl(222.2 84% 4.9%/0.8) !important;
            border-color: hsl(217.2 32.6% 25%) !important;
          }
          
          .echo-wrapper button:disabled {
            background: hsl(210 40% 98%/0.5) !important;
            color: hsl(215.4 16.3% 46.9%) !important;
            cursor: not-allowed !important;
          }
          
          .echo-wrapper input {
            background: hsl(0 0% 100%) !important;
            border: 1px solid hsl(214.3 31.8% 91.4%) !important;
            border-radius: 0.5rem !important;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.875rem !important;
          }
          
          .echo-wrapper input:focus {
            border-color: hsl(222.2 84% 4.9%) !important;
            outline: 2px solid hsl(222.2 84% 4.9%/0.2) !important;
            outline-offset: 2px !important;
          }
          
          .echo-wrapper .echo-signin,
          .echo-wrapper .echo-token-purchase {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.75rem !important;
            align-items: center !important;
          }
          
          .echo-wrapper .echo-signin h3,
          .echo-wrapper .echo-token-purchase h3 {
            font-size: 1.125rem !important;
            font-weight: 600 !important;
            color: hsl(222.2 84% 4.9%) !important;
            margin: 0 !important;
          }
          
          .echo-wrapper .echo-signin p,
          .echo-wrapper .echo-token-purchase p {
            font-size: 0.875rem !important;
            color: hsl(215.4 16.3% 46.9%) !important;
            margin: 0 !important;
            text-align: center !important;
          }
        `}
      </style>
      {children}
    </div>
  );
}
