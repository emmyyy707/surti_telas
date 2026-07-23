import { Target, TrendingUp, Users, MessageSquare, Award, CheckCircle, Clock, Zap, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Employee } from '../types';

interface AdvisorMetricsProps {
  employee: Employee;
  activeClients: number;
  assistedSalesToday: number;
  interactionsToday: number;
}

export function AdvisorMetrics({ employee, activeClients, assistedSalesToday, interactionsToday }: AdvisorMetricsProps) {
  // Calcular métricas
  const monthlyGoal = 5000000; // Meta mensual
  const progressToGoal = (employee.salesThisMonth / monthlyGoal) * 100;
  const dailyGoal = 10; // Interacciones diarias esperadas
  const dailyProgress = (interactionsToday / dailyGoal) * 100;

  // Calcular días restantes del mes
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = Math.max(0, lastDayOfMonth.getDate() - today.getDate());

  // Promedio necesario diario para alcanzar la meta
  const remainingToGoal = monthlyGoal - employee.salesThisMonth;
  const dailyAverageNeeded = daysRemaining > 0 ? remainingToGoal / daysRemaining : 0;

  // Tasa de conversión (simulada)
  const conversionRate = 68;

  // Nivel de rendimiento
  const getPerformanceLevel = () => {
    if (progressToGoal >= 100) return { label: 'ðŸ† Excepcional', color: 'from-yellow-500 to-orange-500' };
    if (progressToGoal >= 80) return { label: 'â­ Excelente', color: 'from-green-500 to-emerald-500' };
    if (progressToGoal >= 60) return { label: 'ðŸ‘ Muy Bueno', color: 'from-blue-500 to-cyan-500' };
    if (progressToGoal >= 40) return { label: 'ðŸ“ˆ Bueno', color: 'from-purple-500 to-pink-500' };
    return { label: 'ðŸ’ª En Progreso', color: 'from-gray-500 to-slate-500' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <Card className={`p-6 bg-gradient-to-r ${performance.color} text-white overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg mb-1">Rendimiento del Mes</h3>
              <p className="text-sm text-white/90">Noviembre 2025</p>
            </div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white text-base px-4 py-2 border-white/30">
              {performance.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/80 mb-1">Meta del Mes</p>
              <p className="text-3xl">${(monthlyGoal / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">Alcanzado</p>
              <p className="text-3xl">${(employee.salesThisMonth / 1000000).toFixed(1)}M</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso</span>
              <span>{progressToGoal.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all shadow-lg"
                style={{ width: `${Math.min(progressToGoal, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Today's Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <Users className="h-8 w-8 text-blue-600" />
            <Badge className="bg-blue-600 text-white">{activeClients}</Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">Clientes Activos</p>
          <p className="text-2xl text-blue-900">{activeClients}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <Badge className="bg-green-600 text-white">{assistedSalesToday}</Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">Ventas Hoy</p>
          <p className="text-2xl text-green-900">{assistedSalesToday}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <Badge className="bg-purple-600 text-white">{interactionsToday}</Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">Interacciones</p>
          <p className="text-2xl text-purple-900">{interactionsToday}</p>
        </Card>
      </div>

      {/* Goals & Targets */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 rounded-lg p-2">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm">Meta Diaria de Interacciones</h4>
              <p className="text-xs text-gray-600">Objetivo: {dailyGoal} contactos</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progreso del Día</span>
              <span className={dailyProgress >= 100 ? 'text-green-600' : ''}>
                {interactionsToday}/{dailyGoal}
              </span>
            </div>
            <Progress value={Math.min(dailyProgress, 100)} className="h-2" />
          </div>

          {dailyProgress >= 100 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-xs text-green-700">
                ðŸŽ‰ Â¡Meta diaria alcanzada! Â¡Excelente trabajo!
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-700">
                ðŸ’ª Faltan {dailyGoal - interactionsToday} interacciones más
              </p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 rounded-lg p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm">Proyección del Mes</h4>
              <p className="text-xs text-gray-600">Basado en rendimiento actual</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Días restantes</span>
              <Badge variant="outline">{daysRemaining} días</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Faltante</span>
              <span className="text-sm">
                ${remainingToGoal > 0 ? (remainingToGoal / 1000).toFixed(0) : 0}k
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promedio diario necesario</span>
              <span className="text-sm">${(dailyAverageNeeded / 1000).toFixed(0)}k/día</span>
            </div>
          </div>

          {progressToGoal >= 100 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center mt-3">
              <p className="text-xs text-yellow-800">
                ðŸ† Â¡Meta mensual superada! Â¡Increíble!
              </p>
            </div>
          ) : remainingToGoal > 0 && daysRemaining > 0 ? (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center mt-3">
              <p className="text-xs text-purple-700">
                ðŸŽ¯ Mantén el ritmo para alcanzar tu meta
              </p>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card className="p-5">
        <h4 className="text-sm mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Indicadores de Rendimiento
        </h4>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600">Tasa Conversión</p>
            </div>
            <p className="text-2xl text-blue-900">{conversionRate}%</p>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600">Pedidos</p>
            </div>
            <p className="text-2xl text-green-900">{employee.ordersCompleted}</p>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600">Ticket Promedio</p>
            </div>
            <p className="text-2xl text-purple-900">
              ${Math.round(employee.totalSales / employee.ordersCompleted / 1000)}k
            </p>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Award className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-gray-600">Comisiones</p>
            </div>
            <p className="text-2xl text-orange-900">
              ${Math.round((employee.salesThisMonth * employee.commission) / 100 / 1000)}k
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Tips */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm mb-2">ðŸ’¡ Consejos para Mejorar tu Rendimiento</h4>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Contacta clientes con carritos abandonados en las primeras 2 horas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Usa recomendaciones inteligentes para aumentar el ticket promedio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Registra notas detalladas para dar seguimiento efectivo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Mantén al menos 10 interacciones diarias con clientes</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}




