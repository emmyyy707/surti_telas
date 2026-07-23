import { useState } from 'react';
import { Star, Send, MessageCircle, User as UserIcon, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { User, Employee, AdvisorRating } from '../types';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdvisorRatingSectionProps {
  currentUser?: User | null;
  assignedAdvisor?: Employee;
  ratings: AdvisorRating[];
  onSubmitRating: (rating: number, comment: string) => void;
}

export function AdvisorRatingSection({
  currentUser,
  assignedAdvisor,
  ratings,
  onSubmitRating
}: AdvisorRatingSectionProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  // Filtrar calificaciones del asesor asignado
  const advisorRatings = assignedAdvisor
    ? ratings.filter(r => r.advisorId === assignedAdvisor.id)
    : [];

  // Calcular promedio de calificaciones
  const averageRating = advisorRatings.length > 0
    ? advisorRatings.reduce((sum, r) => sum + r.rating, 0) / advisorRatings.length
    : 0;

  const handleSubmitRating = () => {
    if (selectedRating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    if (!comment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    onSubmitRating(selectedRating, comment);
    setSelectedRating(0);
    setComment('');
    setShowDialog(false);
    toast.success('Â¡Gracias por tu calificación!', {
      description: 'Tu opinión es muy importante para nosotros',
    });
  };

  if (!assignedAdvisor) {
    return null;
  }

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header - Responsivo */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-2xl md:text-3xl mb-2 sm:mb-3">Calificaciones de tu Asesor</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Conoce la experiencia de otros clientes y comparte tu opinión sobre el servicio
            </p>
          </div>

          {/* Advisor Card with Stats - Completamente Responsivo */}
          <Card className="p-4 sm:p-5 md:p-6 mb-6 sm:mb-7 md:mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 md:gap-6">
              {/* Advisor Info - Responsivo */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {assignedAdvisor.avatar ? (
                    <ImageWithFallback
                      src={assignedAdvisor.avatar}
                      alt={assignedAdvisor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white" />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl mb-1">{assignedAdvisor.name}</h3>
                  <Badge variant="outline" className="mb-1 text-xs sm:text-sm">
                    {assignedAdvisor.role === 'asesor' ? 'Asesor de Ventas' : 'Vendedor'}
                  </Badge>
                  <p className="text-xs sm:text-sm text-gray-600 break-all">{assignedAdvisor.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl">{averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-600">Calificación</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl mb-1">{advisorRatings.length}</p>
                  <p className="text-xs text-gray-600">Opiniones</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl mb-1">{assignedAdvisor.ordersCompleted}</p>
                  <p className="text-xs text-gray-600">Pedidos</p>
                </div>
              </div>

              {/* Submit Rating Button */}
              {currentUser?.role === 'customer' && (
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Calificar Asesor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Califica a {assignedAdvisor.name}</DialogTitle>
                      <DialogDescription>
                        Comparte tu experiencia y ayuda a otros clientes
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Star Rating */}
                      <div>
                        <Label className="mb-2 block">Calificación</Label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-10 w-10 ${
                                  star <= (hoverRating || selectedRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {selectedRating > 0 && (
                          <p className="text-center text-sm text-gray-600 mt-2">
                            {selectedRating === 5 && 'Â¡Excelente!'}
                            {selectedRating === 4 && 'Muy bueno'}
                            {selectedRating === 3 && 'Bueno'}
                            {selectedRating === 2 && 'Regular'}
                            {selectedRating === 1 && 'Necesita mejorar'}
                          </p>
                        )}
                      </div>

                      {/* Comment */}
                      <div>
                        <Label htmlFor="comment" className="mb-2 block">
                          Comentario
                        </Label>
                        <Textarea
                          id="comment"
                          placeholder="Cuéntanos sobre tu experiencia con el asesor..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSubmitRating}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Calificación
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Card>

          {/* Ratings List */}
          <div className="space-y-4">
            <h3 className="text-xl mb-4">Opiniones de Clientes</h3>

            {advisorRatings.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">
                  Aún no hay calificaciones para este asesor
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Sé el primero en compartir tu opinión
                </p>
              </Card>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {advisorRatings.map((rating) => (
                    <Card key={rating.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{rating.clientName}</h4>
                              <div className="flex items-center gap-2 mt-1">
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
                                <span className="text-sm text-gray-500">
                                  {rating.rating}.0
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(rating.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3">{rating.comment}</p>

                          {rating.response && (
                            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-purple-600 text-white">
                                  Respuesta del Asesor
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
                          )}

                          {!rating.response && (
                            <Badge variant="outline" className="text-xs">
                              Pendiente de respuesta
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}




