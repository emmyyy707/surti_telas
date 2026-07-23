import { useState, useEffect } from 'react';
import { User, Lock, Mail, LogIn, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import logoBlack from 'figma:asset/6b1b01bec62a36f96143e42f8161cda0f047b918.png';
import type { User as UserType } from '../types';
import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';

interface LoginPageProps {
  onLogin: (email: string, role: 'customer' | 'admin' | 'employee') => void;
  currentUser: UserType | null;
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function LoginPage({ onLogin, currentUser, onNavigate, onCartClick, cartItemCount }: LoginPageProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Si el usuario ya está logueado, mostrar opciones de navegación
  const [showLoggedInView, setShowLoggedInView] = useState(false);

  useEffect(() => {
    setShowLoggedInView(!!currentUser);
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!loginData.email || !loginData.password) {
      toast.error('Campos incompletos', {
        description: 'Por favor completa todos los campos',
      });
      return;
    }

    if (loginData.password.length < 6) {
      toast.error('Contraseña muy corta', {
        description: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    // Sistema de autenticación con credenciales específicas
    const credentials = {
      admin: { email: 'admin@surticamisetas.com', password: 'admin123' },
      employee: { email: 'empleado@surticamisetas.com', password: 'empleado123' },
      client: { email: 'cliente@ejemplo.com', password: 'cliente123' }
    };

    let role: 'customer' | 'admin' | 'employee' = 'customer';

    // Detectar automáticamente el rol según las credenciales
    if (loginData.email === credentials.admin.email && loginData.password === credentials.admin.password) {
      role = 'admin';
    } 
    else if (loginData.email === credentials.employee.email && loginData.password === credentials.employee.password) {
      role = 'employee';
    } 
    else if (loginData.email === credentials.client.email && loginData.password === credentials.client.password) {
      role = 'customer';
    }
    // Cualquier otra combinación válida (6+ caracteres) es cliente
    else {
      role = 'customer';
    }

    onLogin(loginData.email, role);
    
    const roleDescription = role === 'admin' 
      ? 'Bienvenido, Administrador' 
      : role === 'employee' 
      ? 'Bienvenido, Asesor' 
      : 'Bienvenido de vuelta';

    toast.success('Inicio de sesión exitoso', {
      description: roleDescription,
    });

    // Mostrar mensaje adicional para ir al perfil
    setTimeout(() => {
      toast.success('Sesión iniciada correctamente', {
        description: 'Ahora puedes ir a tu perfil',
      });
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Contraseña muy corta', {
        description: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    // Por defecto todos se registran como clientes
    onLogin(registerData.email, 'customer');
    toast.success('Registro exitoso', {
      description: 'Tu cuenta ha sido creada correctamente',
    });
  };

  // Si ya está logueado, mostrar mensaje de bienvenida y opciones
  if (showLoggedInView && currentUser) {
    const getDashboardText = () => {
      switch (currentUser.role) {
        case 'admin':
          return { title: 'Panel de Administrador', button: 'Ir al Panel de Administración', page: 'admin' };
        case 'employee':
          return { title: 'Panel de Empleado', button: 'Ir a Mi Panel de Trabajo', page: 'employee' };
        default:
          return { title: 'Mi Cuenta', button: 'Ir a Mi Dashboard', page: 'client' };
      }
    };

    const dashboardInfo = getDashboardText();

    return (
      <div className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <NavigationBar
            onNavigate={onNavigate}
            currentUser={currentUser}
            activePage="login"
            onCartClick={onCartClick}
            cartItemCount={cartItemCount}
          />
        </div>
        <div className="h-20"></div>
        <div className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-md mx-auto px-3 sm:px-4">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-28 h-auto flex items-center justify-center">
                  <img 
                    src={logoBlack} 
                    alt="SurtiCamisetas" 
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl mb-2">Â¡Ya estás conectado!</h1>
              <p className="text-sm sm:text-base text-gray-600 px-2">Sesión activa como {currentUser.name}</p>
            </div>

            <Card className="p-5 sm:p-6 md:p-8 rounded-xl">
              <div className="text-center space-y-5 sm:space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <User className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Rol</p>
                  <p className="text-base sm:text-lg text-gray-900 mt-1">
                    {currentUser.role === 'admin' ? 'Administrador' : 
                     currentUser.role === 'employee' ? 'Empleado/Asesor' : 
                     'Cliente'}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => onLogin(currentUser.email, currentUser.role)}
                    className="w-full bg-black text-white hover:bg-gray-800 text-sm sm:text-base"
                  >
                    {dashboardInfo.button}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <p className="text-xs sm:text-sm text-gray-600 px-2">
                    Â¿Quieres iniciar sesión con otra cuenta?
                  </p>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowLoggedInView(false)}
                    className="w-full text-sm sm:text-base"
                  >
                    Cambiar de Usuario
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <NavigationBar
          onNavigate={onNavigate}
          currentUser={currentUser}
          activePage="login"
          onCartClick={onCartClick}
          cartItemCount={cartItemCount}
        />
      </div>
      <div className="h-20"></div>
      <div className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-md mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-28 h-auto flex items-center justify-center">
                <img 
                  src={logoBlack} 
                  alt="SurtiCamisetas" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl mb-2">Bienvenido</h1>
            <p className="text-sm sm:text-base text-gray-600 px-2">Inicia sesión o crea una cuenta nueva</p>
          </div>

          <Card className="p-5 sm:p-6 md:p-8 rounded-xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Recordarme
                    </label>
                    <a href="#" className="text-black hover:underline">
                      Â¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>

                  <div className="text-center text-sm text-gray-600 mt-4 space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="mb-2 text-gray-900">Credenciales de Prueba:</p>
                    <div className="space-y-2 text-left">
                      <div>
                        <p className="text-gray-900">ðŸ‘¨â€ðŸ’¼ Administrador:</p>
                        <p className="text-xs">admin@surticamisetas.com / admin123</p>
                      </div>
                      <div>
                        <p className="text-gray-900">ðŸ‘” Empleado/Asesor:</p>
                        <p className="text-xs">empleado@surticamisetas.com / empleado123</p>
                      </div>
                      <div>
                        <p className="text-gray-900">ðŸ‘¤ Cliente:</p>
                        <p className="text-xs">cliente@ejemplo.com / cliente123</p>
                      </div>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="register-name">Nombre Completo</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        placeholder="Juan Pérez"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, confirmPassword: e.target.value })
                        }
                        placeholder="•••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                    Crear Cuenta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}



