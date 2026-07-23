import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  User,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import { auth } from '@config/firebase';

export type UserRole =
  | 'admin'
  | 'asesor'
  | 'domiciliario'
  | 'cliente';

interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
}

interface LoginResult {
  success: boolean;
  role?: UserRole;
  error?: string;
}

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;

  loginWithCredentials: (
    email: string,
    password: string
  ) => LoginResult;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextProps | null>(
    null
  );

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: Props) => {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  // MOCK LOGIN TEMPORAL
  const loginWithCredentials = (
    email: string,
    password: string
  ): LoginResult => {
    const accounts = [
      {
        email: 'admin@surticamisetas.com',
        password: 'admin123',
        role: 'admin' as UserRole,
      },

      {
        email: 'asesor@surticamisetas.com',
        password: 'asesor123',
        role: 'asesor' as UserRole,
      },

      {
        email: 'domiciliario@surticamisetas.com',
        password: 'domi123',
        role: 'domiciliario' as UserRole,
      },

      {
        email: 'cliente@email.com',
        password: 'cliente123',
        role: 'cliente' as UserRole,
      },
    ];

    const account = accounts.find(
      (acc) =>
        acc.email === email &&
        acc.password === password
    );

    if (!account) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      };
    }

    const authUser: AuthUser = {
      uid: crypto.randomUUID(),
      email: account.email,
      role: account.role,
    };

    localStorage.setItem(
      'auth_user',
      JSON.stringify(authUser)
    );

    setUser(authUser);

    return {
      success: true,
      role: account.role,
    };
  };

  useEffect(() => {
    const storedUser =
      localStorage.getItem('auth_user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser: User | null) => {
          if (firebaseUser) {
            const authUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'cliente',
            };

            setUser(authUser);

            localStorage.setItem(
              'auth_user',
              JSON.stringify(authUser)
            );
          }
        }
      );

    setLoading(false);

    return unsubscribe;
  }, []);

  const logout = async () => {
    localStorage.removeItem('auth_user');

    setUser(null);

    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de AuthProvider'
    );
  }

  return context;
};



