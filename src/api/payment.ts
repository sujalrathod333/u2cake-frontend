import api from "./axios";

export interface PaymentData {
  orderId: string;
  paymentMethod: "COD" | "CARD" | "UPI";
  amount: number;
}

export interface ProcessPaymentData {
  orderId: string;
  paymentId: string;
  transactionId?: string;
  paymentMethod: "COD" | "CARD" | "UPI";
}


// Initiate payment
export const initiatePayment = async (paymentData: PaymentData) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    payment: any;
  }>("/payments/initiate", paymentData);
  return response.data;
};

// Process payment
export const processPayment = async (processData: ProcessPaymentData) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    payment: any;
  }>("/payments/process", processData);
  return response.data;
};

// Verify payment
export const verifyPayment = async (paymentId: string, transactionId?: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    payment: any;
  }>("/payments/verify", { paymentId, transactionId });
  return response.data;
};

// Handle payment failure
export const handlePaymentFailure = async (
  paymentId: string,
  reason?: string
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    payment: any;
  }>("/payments/failure", { paymentId, reason });
  return response.data;
};

// Get payment by order
export const getPaymentByOrder = async (orderId: string) => {
  const response = await api.get<{
    success: boolean;
    payment: any;
  }>(`/payments/order/${orderId}`);
  return response.data;
};

// Get user's payments
export const getUserPayments = async (page: number = 1, limit: number = 10) => {
  const response = await api.get<{
    success: boolean;
    data: {
      payments: any[];
      page: number;
      limit: number;
      totalPages: number;
      totalPayments: number;
    };
  }>(`/payments/my-payments?page=${page}&limit=${limit}`);
  return response.data;
};

// Refund payment
export const refundPayment = async (
  paymentId: string,
  amount?: number,
  reason?: string
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    payment: any;
  }>(`/payments/${paymentId}/refund`, { amount, reason });
  return response.data;
};
