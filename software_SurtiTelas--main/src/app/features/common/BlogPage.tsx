import { useState } from 'react';
import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User as UserType } from '../types';
import { Calendar, Tag, Search, ArrowRight } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (page: string) => void;
  currentUser?: UserType | null;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function BlogPage({ onNavigate, currentUser, onCartClick, cartItemCount }: BlogPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const categories = ['todos', 'tendencias', 'consejos', 'tutoriales', 'noticias'];

  const blogPosts = [
    {
      id: 1,
      title: '5 Tendencias en Personalización de Camisetas para 2025',
      excerpt: 'Descubre las últimas tendencias en diseño y técnicas de impresión que están revolucionando la industria textil.',
      category: 'tendencias',
      date: '2025-11-10',
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBwcmludGluZyUyMGRlc2lnbnxlbnwxfHx8fDE3NjI5NjE4Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'Cómo Elegir la Mejor Tela para tu Camiseta Personalizada',
      excerpt: 'Una guía completa sobre los diferentes tipos de telas y cuál es la mejor opción según tus necesidades.',
      category: 'consejos',
      date: '2025-11-05',
      image: 'https://images.unsplash.com/photo-1708380426158-0cd91296df3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBjbG90aGluZyUyMGZhc2hpb258ZW58MXx8fHwxNzYyOTU0MDQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '7 min'
    },
    {
      id: 3,
      title: 'Tutorial: Del Diseño Digital a la Camiseta Perfecta',
      excerpt: 'Aprende paso a paso cómo convertir tu diseño digital en una camiseta de alta calidad.',
      category: 'tutoriales',
      date: '2025-10-28',
      image: 'https://images.unsplash.com/photo-1576595579783-1f2ae5674685?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRlc2lnbiUyMHdvcmtzaG9wfGVufDF8fHx8MTc2Mjk2MTgzMHww&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '10 min'
    },
    {
      id: 4,
      title: 'La Importancia de la Calidad en la Confección Textil',
      excerpt: 'Por qué invertir en calidad marca la diferencia en productos personalizados.',
      category: 'noticias',
      date: '2025-10-20',
      image: 'https://images.unsplash.com/photo-1675176785803-bffbbb0cd2f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0aWxlJTIwbWFudWZhY3R1cmluZ3xlbnwxfHx8fDE3NjI5MjQ5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '6 min'
    },
    {
      id: 5,
      title: 'Cuidados Esenciales para Mantener tus Camisetas Personalizadas',
      excerpt: 'Tips profesionales para que tus diseños se mantengan vibrantes por más tiempo.',
      category: 'consejos',
      date: '2025-10-15',
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBwcmludGluZyUyMGRlc2lnbnxlbnwxfHx8fDE3NjI5NjE4Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '4 min'
    },
    {
      id: 6,
      title: 'Ideas Creativas para Camisetas de Eventos Corporativos',
      excerpt: 'Inspiración y consejos para crear camisetas memorables para tu empresa o evento.',
      category: 'tendencias',
      date: '2025-10-08',
      image: 'https://images.unsplash.com/photo-1708380426158-0cd91296df3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBjbG90aGluZyUyMGZhc2hpb258ZW58MXx8fHwxNzYyOTU0MDQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      readTime: '8 min'
    },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar 
        onNavigate={onNavigate}
        currentUser={currentUser}
        activePage="blog"
        onCartClick={onCartClick}
        cartItemCount={cartItemCount}
      />

      {/* Hero Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-gray-900 mb-4">Blog SurtiCamisetas</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Consejos, tendencias y tutoriales sobre personalización de camisetas y moda textil
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2AA7A3] focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-[#2AA7A3] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-[#2AA7A3]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron artículos que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#2AA7A3] text-white px-3 py-1 rounded-full text-xs capitalize">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.date).toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <span>•</span>
                      <span>{post.readTime} lectura</span>
                    </div>

                    <h3 className="text-gray-900 mb-3 group-hover:text-[#2AA7A3] transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <button className="text-[#2AA7A3] flex items-center gap-2 group-hover:gap-3 transition-all">
                      Leer más
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-[#2AA7A3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4">Suscríbete a Nuestro Newsletter</h2>
          <p className="text-white/90 mb-8">
            Recibe las últimas tendencias, consejos y novedades directamente en tu correo
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-[#2AA7A3] px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
              Suscribirse
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}




