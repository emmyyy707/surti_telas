import { create } from 'zustand';
import { orderUseCases } from '@/infrastructure/container/orderContainer';
import type { Order } from '@/domain/entities/Order';
import type { CreateOrderInput } from '@/domain/repositories/OrderRepository';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;

  loadOrders: () => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['estado']) => Promise<Order>;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Ocurrió un error procesando la solicitud';

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  loadOrders: async () => {
    set({ loading: true, error: null });

    try {
      const orders = await orderUseCases.getOrders.execute();
      set({ orders });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (input) => {
    set({ loading: true, error: null });

    try {
      const order = await orderUseCases.createOrder.execute(input);
      set((state) => ({
        orders: [order, ...state.orders],
      }));

      return order;
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });

    try {
      const updatedOrder = await orderUseCases.updateOrderStatus.execute(orderId, status);

      set((state) => ({
        orders: state.orders.map(order => order.id === orderId ? updatedOrder : order),
      }));

      return updatedOrder;
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
