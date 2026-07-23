import { ImageWithFallback } from './figma/ImageWithFallback';
import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';
import { User } from '../types';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
  currentUser?: User | null;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function ServicesPage({ onNavigate, currentUser, onCartClick, cartItemCount }: ServicesPageProps) {
  const services = [
    {
      icon: Scissors,
      title: 'Confección',
      description: 'Fabricamos camisetas desde cero con materiales de primera calidad. Proceso completo desde el diseño hasta el producto final.',
      features: ['100% algodón premium', 'Tallas personalizadas', 'Corte y costura profesional', 'Control de calidad riguroso'],
      image: 'https://images.unsplash.com/photo-1695898341950-6b78780c1458?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0aWxlJTIwd29ya3Nob3B8ZW58MXx8fHwxNzYxMzE0MjkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Paintbrush,
      title: 'Estampado',
      description: 'Técnicas modernas de estampado que garantizan colores vibrantes y durabilidad excepcional.',
      features: ['Estampado digital', 'Serigrafía profesional', 'Diseños a todo color', 'Resistente al lavado'],
      image: 'https://images.unsplash.com/photo-1732414601271-0b63b575a795?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjB0LXNoaXJ0JTIwcHJpbnRpbmd8ZW58MXx8fHwxNzYxMjMyNzc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Sparkles,
      title: 'Bordado',
      description: 'Bordado de alta calidad que añade elegancia y durabilidad a tus prendas personalizadas.',
      features: ['Bordado computarizado', 'Hilos de colores variados', 'Diseños complejos', 'Acabado premium'],
      image: 'https://images.unsplash.com/photo-1664206529030-cf5286fc34de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbWJyb2lkZXJlZCUyMGNsb3RoaW5nfGVufDF8fHx8MTc2MTMxNDI5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Users,
      title: 'Diseño Personalizado',
      description: 'Nuestro equipo de diseñadores te ayuda a crear el diseño perfecto para tu camiseta.',
      features: ['Asesoría de diseño', 'Mockups digitales', 'Revisiones ilimitadas', 'Archivos en alta resolución'],
      image: 'https://images.unsplash.com/photo-1641573335229-331ef3e6a2b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHByaW50ZWQlMjB0c2hpcnRzfGVufDF8fHx8MTc2MTMxNDI5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar 
        onNavigate={onNavigate} 
        currentUser={currentUser}
        activePage="servicios"
        onCartClick={onCartClick}
        cartItemCount={cartItemCount}
      />
      
      <div className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header - Responsivo */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="flex justify-center mb-4 sm:mb-6">
            
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 px-2">Nuestros Servicios</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Ofrecemos una amplia gama de servicios de personalización para crear 
              las camisetas perfectas para cualquier ocasión
            </p>
          </div>

          {/* Services - Completamente Responsivo */}
          <div className="space-y-12 sm:space-y-16 md:space-y-20">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={service.title}
                  className={`flex flex-col ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  } gap-6 sm:gap-7 md:gap-8 items-center`}
                >
                  {/* Image - Responsiva */}
                  <div className="w-full md:w-1/2">
                    <div className="relative h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Content - Responsivo */}
                  <div className="w-full md:w-1/2">
                    <Card className="p-5 sm:p-6 md:p-8 h-full hover:shadow-xl transition-shadow rounded-xl sm:rounded-2xl">
                      <div className="bg-black text-white w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                      </div>
                      <h2 className="text-2xl sm:text-2xl md:text-3xl mb-3 sm:mb-4">{service.title}</h2>
                      <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-5 sm:mb-6">
                        {service.description}
                      </p>
                      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-7 md:mb-8">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <span className="bg-black text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-xs sm:text-sm">
                              âœ“
                            </span>
                            <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => onNavigate('contacto')}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Solicitar Cotización
                      </Button>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Process Section */}
          <div className="mt-20 bg-gray-50 rounded-2xl p-12">
            <h2 className="text-4xl text-center mb-12">Nuestro Proceso</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Consulta', desc: 'Conversamos sobre tu idea' },
                { step: '02', title: 'Diseño', desc: 'Creamos el diseño perfecto' },
                { step: '03', title: 'Producción', desc: 'Fabricamos con calidad' },
                { step: '04', title: 'Entrega', desc: 'Recibe tu producto final' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="text-6xl mb-4 text-gray-300">{item.step}</div>
                  <h3 className="text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}




