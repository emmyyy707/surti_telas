import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '573001234567'; // Número de WhatsApp (formato internacional sin + ni espacios)
  const message = encodeURIComponent('Â¡Hola! Me gustaría obtener más información sobre los servicios de SurtiCamisetas.');
  
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Â¡Chatea con nosotros!
      </span>
    </button>
  );
}




