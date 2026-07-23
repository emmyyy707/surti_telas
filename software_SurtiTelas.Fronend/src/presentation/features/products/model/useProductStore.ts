import { create } from 'zustand';
import { productUseCases } from '@/infrastructure/container/productContainer';
import type { Product, ProductData } from '@/domain/entities/Product';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;

  loadProducts: () => Promise<void>;
  createProduct: (input: Parameters<typeof productUseCases.createProduct.execute>[0]) => Promise<Product>;
  updateProduct: (ref: string, changes: Partial<ProductData>) => Promise<Product>;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Ocurrió un error procesando la solicitud';

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  loadProducts: async () => {
    set({ loading: true, error: null });

    try {
      const products = await productUseCases.getProducts.execute();
      set({ products });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (input) => {
    set({ loading: true, error: null });

    try {
      const product = await productUseCases.createProduct.execute(input);
      set(state => ({
        products: [product, ...state.products],
      }));

      return product;
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (ref, changes) => {
    set({ loading: true, error: null });

    try {
      const updatedProduct = await productUseCases.updateProduct.execute(ref, changes);

      set(state => ({
        products: state.products.map(product => product.ref === ref ? updatedProduct : product),
      }));

      return updatedProduct;
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
