import api from "./axios";
import type { CreateOrderPayload, Order } from "../types/order.types";

export const createOrder = async (orderData: CreateOrderPayload) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    order: Order;
    orderId: string;
  }>("/orders", orderData);
  return response.data;
};


export const getMyOrders = async () => {
  const response = await api.get<{ success: boolean; orders: Order[] }>(
    "/orders/my-orders"
  );
  return response.data;
};

export const getSingleOrder = async (orderId: string) => {
  const response = await api.get<{ success: boolean; order: Order }>(
    `/orders/${orderId}`
  );
  return response.data;
};

export const getAllOrders = async (page: number = 1, limit: number = 10) => {
  const response = await api.get<{
    success: boolean;
    data: {
      orders: Order[];
      page: number;
      limit: number;
      totalPages: number;
      totalOrders: number;
    };
  }>(`/admin/orders?page=${page}&limit=${limit}`);
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.patch<{ success: boolean; order: Order }>(
    `/admin/orders/${orderId}/status`,
    { status }
  );
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get<{
    success: boolean;
    data: {
      totalUsers: number;
      totalCakes: number;
      totalOrders: number;
      pendingOrders: number;
      deliveredOrders: number;
      cancelledOrders: number;
      totalRevenue: number;
      recentOrders: Order[];
    };
  }>("/admin/dashboard");
  return response.data;
};
