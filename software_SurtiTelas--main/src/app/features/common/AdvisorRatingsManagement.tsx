import { useState } from 'react';
import { Star, MessageCircle, Send, Calendar, User as UserIcon, Filter, CheckCircle, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { AdvisorRating, Employee } from '../types';
import { toast } from 'sonner';

interface AdvisorRatingsManagementProps {
  employee: Employee;
  ratings: AdvisorRating[];
  onRespondToRating: (ratingId: string, response: string) => void;
}

export function AdvisorRatingsManagement({
  employee,
  ratings,
  onRespondToRating
}: AdvisorRatingsManagementProps) {
  const [selectedRating, setSelectedRating] = useState<AdvisorRating | null>(null);
  const [response, setResponse] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendiente' | 'respondido'>('all');

  // Filtrar calificaciones del asesor actual
  const myRatings = ratings.filter(r => r.advisorId === employee.id);

  // Aplicar filtro de estado
  const filteredRatings = filterStatus === 'all'
    ? myRatings
    : myRatings.filter(r => r.status === filterStatus);

  // Calcular estadísticas
  const averageRating = myRatings.length > 0
    ? myRatings.reduce((sum, r) => sum + r.rating, 0) / myRatings.length
    : 0;

  const pendingCount = myRatings.filter(r => r.status === 'pendiente').length;
  const respondedCount = myRatings.filter(r => r.status === 'respondido').length;

  const handleOpenResponseDialog = (rating: AdvisorRating) => {
    setSelectedRating(rating);
    setResponse(rating.response || '');
    setShowResponseDialog(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedRating) return;

    if (!response.trim()) {
      toast.error('Por favor escribe una respuesta');
      return;
    }

    onRespondToRating(selectedRating.id, response);
    setShowResponseDialog(false);
    setSelectedRating(null);
    setResponse('');
    toast.success('Respuesta enviada exitosamente');
  };

  // Distribución de estrellas
  const starDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: myRatings.filter(r => r.rating === stars).length,
    percentage: myRatings.length > 0 ? (myRatings.filter(r => r.rating === stars).length / myRatings.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="text-2xl mb-1">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Calificación Promedio</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl mb-1">{myRatings.length}</p>
              <p className="text-xs text-gray-600">Total Calificaciones</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl mb-1">{pendingCount}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl mb-1">{respondedCount}</p>
              <p className="text-xs text-gray-600">Respondidas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Star Distribution */}
      <Card className="p-6">
        <h3 className="text-lg mb-4">Distribución de Calificaciones</h3>
        <div className="space-y-3">
          {starDistribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-24">
                <span className="text-sm">{stars}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-16 text-right">{count} ({percentage.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Ratings List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg">Calificaciones de Clientes</h3>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Filtrar:</Label>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="respondido">Respondidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRatings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No hay calificaciones para mostrar</p>
            <p className="text-sm mt-2 text-gray-400">
              {filterStatus !== 'all' && 'Prueba con otro filtro'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredRatings.map((rating) => (
                <Card key={rating.id} className={`p-6 ${rating.status === 'pendiente' ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-6 w-6 text-gray-500" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium mb-1">{rating.clientName}</h4>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= rating.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{rating.rating}.0</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(rating.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <Badge className={rating.status === 'pendiente' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                            {rating.status === 'pendiente' ? 'â° Pendiente' : 'âœ“ Respondida'}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-sm text-gray-700">{rating.comment}</p>
                      </div>

                      {rating.response ? (
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-600 text-white text-xs">
                              Tu Respuesta
                            </Badge>
                            {rating.responseDate && (
                              <span className="text-xs text-gray-500">
                                {new Date(rating.responseDate).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{rating.response}</p>
                        </div>
                      ) : null}

                      <Button
                        size="sm"
                        onClick={() => handleOpenResponseDialog(rating)}
                        className={rating.response ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {rating.response ? 'Editar Respuesta' : 'Responder'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRating?.response ? 'Editar Respuesta' : 'Responder Calificación'}
            </DialogTitle>
            <DialogDescription>
              {selectedRating && (
                <div className="mt-3">
                  <p className="text-sm mb-2">
                    <strong>Cliente:</strong> {selectedRating.clientName}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <strong className="text-sm">Calificación:</strong>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= selectedRating.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded p-3 mt-3">
                    <p className="text-sm text-gray-700">{selectedRating.comment}</p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="response" className="mb-2 block">
                Tu Respuesta
              </Label>
              <Textarea
                id="response"
                placeholder="Escribe tu respuesta al cliente..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResponseDialog(false);
                setSelectedRating(null);
                setResponse('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitResponse}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Respuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




