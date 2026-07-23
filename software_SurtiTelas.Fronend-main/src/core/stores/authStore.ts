import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, type BackendRole } from '@/infrastructure/api/authApi';
import { ApiError, setUnauthorizedHandler } from '@/infrastructure/api/httpClient';
import { tokenStorage } from '@/infrastructure/api/tokenStorage';

export type UserRole = 'admin' | 'almacen' | 'asesor' | 'domiciliario' | 'cliente' | 'produccion' | 'reportes';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  permissions?: string[];
}

export interface LoginResult {
  success: boolean;
  role?: UserRole;
  error?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  sessionChecked: boolean;
  returnTo: string | null;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  checkSession: () => Promise<void>;
  setReturnTo: (path: string) => void;
  clearReturnTo: () => void;
}

/**
 * Cuentas de acceso rápido (autocompletado de email para demo).
 * Ya NO contienen contraseñas: la autenticación se valida contra el backend.
 * La contraseña real vive únicamente en la base de datos (hasheada con bcrypt).
 */
export const TEST_ACCOUNTS: { label: string; email: string; password: string }[] = [
  { label: 'Administrador', email: 'admin@surtitelas.com', password: '' },
];

const AUTH_STORAGE_KEY = 'surtitelas.auth';

const ROLE_MAP: Record<BackendRole, UserRole> = {
  ADMIN: 'admin',
  ALMACEN: 'almacen',
  ASESOR: 'asesor',
  DOMICILIARIO: 'domiciliario',
  CLIENTE: 'cliente',
  PRODUCCION: 'produccion',
  REPORTES: 'reportes',
};

const mapRole = (role: BackendRole): UserRole => ROLE_MAP[role] ?? 'cliente';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      sessionChecked: false,
      returnTo: null,
      login: (user) => set({ user, isAuthenticated: true, sessionChecked: true }),

      loginWithCredentials: async (email, password) => {
        try {
          const result = await authApi.login(email, password);
          tokenStorage.setAccessToken(result.accessToken);
          const role = mapRole(result.user.role);
          set({
            user: {
              uid: result.user.id,
              email: result.user.email,
              name: result.user.nombre,
              role,
              permissions: result.user.permissions,
            },
            isAuthenticated: true,
            sessionChecked: true,
          });
          return { success: true, role };
        } catch (err) {
          const message =
            err instanceof ApiError ? err.message : 'No se pudo iniciar sesión. Intenta de nuevo.';
          return { success: false, error: message };
        }
      },

      logout: () => {
        void authApi.logout().catch(() => undefined);
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false, sessionChecked: true });
      },

      checkSession: async () => {
        if (!tokenStorage.getAccessToken()) {
          set({ user: null, isAuthenticated: false, sessionChecked: true });
          return;
        }
        try {
          const profile = await authApi.me();
          const current = useAuthStore.getState().user;
          set({
            user: {
              uid: profile.id,
              email: profile.email,
              name: profile.nombre,
              role: mapRole(profile.role),
              permissions: current?.permissions ?? profile.permissions,
            },
            isAuthenticated: true,
            sessionChecked: true,
          });
        } catch {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false, sessionChecked: true });
        }
      },

      setReturnTo: (path) => set({ returnTo: path }),
      clearReturnTo: () => set({ returnTo: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionChecked: state.sessionChecked,
      }),
    },
  ),
);

// Cuando el backend responde 401 y no se puede refrescar, cerramos la sesión.
setUnauthorizedHandler(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

export const useAuth = useAuthStore;
