/**
 * Type declarations for paypal-rest-sdk
 * Since paypal-rest-sdk doesn't have official TypeScript types
 */

declare module "paypal-rest-sdk" {
  interface PayPalConfig {
    mode: "sandbox" | "live";
    client_id: string;
    client_secret: string;
  }

  interface PayPalPayment {
    id: string;
    state: string;
    links: Array<{
      href: string;
      rel: string;
      method: string;
    }>;
  }

  interface PayPalPaymentCreateRequest {
    intent: string;
    payer: {
      payment_method: string;
    };
    redirect_urls: {
      return_url: string;
      cancel_url: string;
    };
    transactions: Array<{
      amount: {
        total: string;
        currency: string;
      };
      description?: string;
      custom?: string;
      item_list?: {
        items: Array<{
          name: string;
          sku: string;
          price: string;
          currency: string;
          quantity: number;
        }>;
      };
    }>;
  }

  interface PayPalPaymentExecuteRequest {
    payer_id: string;
  }

  type PayPalCallback<T> = (error: any, response: T) => void;

  export function configure(config: PayPalConfig): void;
  
  export const payment: {
    create(
      payment: PayPalPaymentCreateRequest,
      callback: PayPalCallback<PayPalPayment>
    ): void;
    execute(
      paymentId: string,
      executeRequest: PayPalPaymentExecuteRequest,
      callback: PayPalCallback<PayPalPayment>
    ): void;
  };
}

