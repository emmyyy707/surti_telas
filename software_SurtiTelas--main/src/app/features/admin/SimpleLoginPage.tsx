import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, ShoppingBag, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

interface SimpleLoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onBackToLanding: () => void;
}

export function SimpleLoginPage({ onLogin, onBackToLanding }: SimpleLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    // Intentar login
    const success = onLogin(email, password);

    if (!success) {
      setError('Credenciales incorrectas. Revisa las credenciales de prueba.');
      setIsLoading(false);
      toast.error('Error de autenticación', {
        description: 'Las credenciales ingresadas son incorrectas'
      });
    } else {
      toast.success('Inicio de sesión exitoso', {
        description: 'Redirigiendo al dashboard...'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBackToLanding}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-black to-[#3D3D3D] rounded-2xl flex items-center justify-center">
              <ShoppingBag className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Bienvenido a Surtitelas</h1>
          <p className="text-gray-600">Inicia sesión para acceder al dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@surticamisetas.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-[#1A1A1A] text-white h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Iniciando sesión...</>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          {/* Credentials Info */}
          <div className="mt-6 bg-[#F5F5F5] p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3">Credenciales de prueba:</p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[120px]">ðŸ‘¨â€ðŸ’¼ Administrador:</span>
                <span className="text-xs">admin@surticamisetas.com / admin123</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[120px]">ðŸ‘” Asesor:</span>
                <span className="text-xs">asesor@surticamisetas.com / asesor123</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[120px]">ðŸšš Domiciliario:</span>
                <span className="text-xs">domiciliario@surticamisetas.com / domi123</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[120px]">ðŸ‘¤ Cliente:</span>
                <span className="text-xs">cliente@email.com / cliente123</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Â© 2026 Surtitelas. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
}





