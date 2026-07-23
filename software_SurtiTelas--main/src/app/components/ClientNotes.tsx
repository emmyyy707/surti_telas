import { useState } from 'react';
import { FileText, Plus, Trash2, Edit2, Save, X, Clock, User } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';

interface ClientNote {
  id: string;
  clientId: string;
  advisorName: string;
  content: string;
  date: string;
  type: 'general' | 'seguimiento' | 'importante' | 'venta';
}

interface ClientNotesProps {
  clientId: string;
  clientName: string;
  advisorName: string;
}

export function ClientNotes({ clientId, clientName, advisorName }: ClientNotesProps) {
  const [notes, setNotes] = useState<ClientNote[]>([
    {
      id: 'note-1',
      clientId: clientId,
      advisorName: advisorName,
      content: 'Cliente interesado en uniformes empresariales. Solicita cotización para 50 unidades.',
      date: '2025-11-05 10:30',
      type: 'importante',
    },
    {
      id: 'note-2',
      clientId: clientId,
      advisorName: advisorName,
      content: 'Prefiere tallas L y XL. Color corporativo: Azul marino.',
      date: '2025-11-05 10:35',
      type: 'general',
    },
  ]);

  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedType, setSelectedType] = useState<ClientNote['type']>('general');

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Por favor escribe una nota');
      return;
    }

    const note: ClientNote = {
      id: `note-${Date.now()}`,
      clientId: clientId,
      advisorName: advisorName,
      content: newNote,
      date: new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: selectedType,
    };

    setNotes([note, ...notes]);
    setNewNote('');
    setSelectedType('general');
    toast.success('Nota agregada', {
      description: 'La nota se guardó correctamente',
    });
  };

  const handleEditNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setEditingId(id);
      setEditContent(note.content);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) {
      toast.error('La nota no puede estar vacía');
      return;
    }

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              content: editContent,
              date: new Date().toLocaleString('es-CO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : note
      )
    );
    setEditingId(null);
    setEditContent('');
    toast.success('Nota actualizada');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    toast.success('Nota eliminada');
  };

  const getTypeColor = (type: ClientNote['type']) => {
    switch (type) {
      case 'importante':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'seguimiento':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'venta':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeLabel = (type: ClientNote['type']) => {
    switch (type) {
      case 'importante':
        return 'âš ï¸ Importante';
      case 'seguimiento':
        return 'ðŸ‘€ Seguimiento';
      case 'venta':
        return 'ðŸ’° Venta';
      default:
        return 'ðŸ“ General';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-gray-100 rounded-lg p-3">
        <FileText className="h-5 w-5 text-slate-700" />
        <div>
          <h4 className="text-sm">Notas de Cliente</h4>
          <p className="text-xs text-gray-600">Seguimiento y observaciones sobre {clientName}</p>
        </div>
      </div>

      {/* Add New Note */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <Label className="text-xs mb-2 flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" />
          Nueva Nota
        </Label>
        <Textarea
          placeholder="Escribe una nota sobre el cliente..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="mb-3 resize-none"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <div className="flex gap-2 flex-1">
            <Button
              size="sm"
              variant={selectedType === 'general' ? 'default' : 'outline'}
              onClick={() => setSelectedType('general')}
              className="text-xs"
            >
              ðŸ“ General
            </Button>
            <Button
              size="sm"
              variant={selectedType === 'importante' ? 'default' : 'outline'}
              onClick={() => setSelectedType('importante')}
              className="text-xs"
            >
              âš ï¸ Importante
            </Button>
            <Button
              size="sm"
              variant={selectedType === 'seguimiento' ? 'default' : 'outline'}
              onClick={() => setSelectedType('seguimiento')}
              className="text-xs"
            >
              ðŸ‘€ Seguimiento
            </Button>
            <Button
              size="sm"
              variant={selectedType === 'venta' ? 'default' : 'outline'}
              onClick={() => setSelectedType('venta')}
              className="text-xs"
            >
              ðŸ’° Venta
            </Button>
          </div>
          <Button onClick={handleAddNote} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </Card>

      {/* Notes List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {notes.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">No hay notas para este cliente</p>
              <p className="text-xs text-gray-500 mt-1">Agrega la primera nota arriba</p>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className={`p-4 ${editingId === note.id ? 'border-2 border-blue-500' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getTypeColor(note.type)}`}>{getTypeLabel(note.type)}</Badge>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{note.advisorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {editingId === note.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(note.id)}
                          className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleEditNote(note.id)}
                          variant="ghost"
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === note.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 pt-2 border-t">
                  <Clock className="h-3 w-3" />
                  <span>{note.date}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <Card className="p-3 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg">{notes.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-lg">{notes.filter((n) => n.type === 'importante').length}</p>
            <p className="text-xs text-gray-600">Importantes</p>
          </div>
          <div>
            <p className="text-lg">{notes.filter((n) => n.type === 'seguimiento').length}</p>
            <p className="text-xs text-gray-600">Seguimiento</p>
          </div>
          <div>
            <p className="text-lg">{notes.filter((n) => n.type === 'venta').length}</p>
            <p className="text-xs text-gray-600">Ventas</p>
          </div>
        </div>
      </Card>
    </div>
  );
}



