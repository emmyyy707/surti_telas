import { cn } from '@/shared/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
};

const colors = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-pink-500',
];
const getColor = (name?: string) => colors[(name?.charCodeAt(0) || 0) % colors.length];

export const Avatar = ({ src, name, size = 'md', className, children }: AvatarProps) => (
  <div
    className={cn(
      'rounded-full overflow-hidden shrink-0 flex items-center justify-center font-semibold text-white',
      sizeMap[size],
      !src && !children && getColor(name),
      className
    )}
  >
    {children || (src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : getInitials(name))}
  </div>
);

export const AvatarFallback = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <span className={cn('flex items-center justify-center w-full h-full', className)} {...props}>
    {children}
  </span>
);

export const AvatarImage = ({ src, alt, className }: { src: string; alt?: string; className?: string }) => (
  <img src={src} alt={alt} className={cn('w-full h-full object-cover', className)} />
);
