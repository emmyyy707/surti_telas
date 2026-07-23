import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { SurtitelasLanding } from './pages/SurtitelasLanding';
import AdminDashboard from './components/AdminDashboard';
import { SimpleLoginPage } from './components/SimpleLoginPage';
import { ThemeProvider } from './contexts/ThemeContext';

type UserRole = 'admin' | 'asesor' | 'domiciliario' | 'cliente' | null;

interface User {
  role: UserRole;
  name: string;
  email: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLoginRequest = () => {
    setCurrentView('login');
  };

  const handleLogin = (email: string, password: string) => {
    // Simulación de autenticación con validación de contraseña
    const users: { [key: string]: { user: User; password: string } } = {
      'admin@surticamisetas.com': {
        user: { role: 'admin', name: 'Administrador', email: 'admin@surticamisetas.com' },
        password: 'admin123'
      },
      'asesor@surticamisetas.com': {
        user: { role: 'asesor', name: 'Asesor', email: 'asesor@surticamisetas.com' },
        password: 'asesor123'
      },
      'domiciliario@surticamisetas.com': {
        user: { role: 'domiciliario', name: 'Domiciliario', email: 'domiciliario@surticamisetas.com' },
        password: 'domi123'
      },
      'cliente@email.com': {
        user: { role: 'cliente', name: 'Cliente', email: 'cliente@email.com' },
        password: 'cliente123'
      },
    };

    const userCredentials = users[email];

    if (userCredentials && userCredentials.password === password) {
      setUser(userCredentials.user);
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleNavigateToLanding = () => {
    setCurrentView('landing');
  };

  const handleUpdateUserName = (newName: string) => {
    if (user) {
      setUser({ ...user, name: newName });
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return (
          <SimpleLoginPage
            onLogin={handleLogin}
            onBackToLanding={handleBackToLanding}
          />
        );
      case 'dashboard':
        if (!user) {
          setCurrentView('landing');
          return null;
        }

        // Mostrar AdminDashboard para todos los roles (admin, asesor, domiciliario, cliente)
        return (
          <AdminDashboard
            onLogout={handleLogout}
            userRole={user.role as 'admin' | 'asesor' | 'domiciliario' | 'cliente'}
            userName={user.name}
            onUpdateUserName={handleUpdateUserName}
            onNavigateToLanding={handleNavigateToLanding}
          />
        );
      case 'landing':
      default:
        return (
          <SurtitelasLanding
            onLoginRequest={handleLoginRequest}
            user={user}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      {renderContent()}
      <Toaster />
    </ThemeProvider>
  );
}



