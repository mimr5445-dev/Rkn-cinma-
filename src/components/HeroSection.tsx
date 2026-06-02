import { Play, Info, Star, Calendar, Clock, Film } from 'lucide-react';
import { Movie } from '../types';

interface HeroSectionProps {
  movie: Movie | null;
  onViewDetails: (movie: Movie) => void;
}

export function HeroSection({ movie, onViewDetails }: HeroSectionProps) {
  if (!movie) {
    return (
      <div className="relative h-[480px] w-full bg-gradient-to-b from-bg-surface to-bg-primary flex flex-col items-center justify-center text-center p-6 border-b border-white/5">
        <Film size={48} className="text-gold/40 mb-3 animate-pulse" />
        <p className="text-secondary-text max-w-md">لا توجد سينما مميزة معروضة حالياً. جرب إضافة أفلام مذهلة من لوحة تحكم المنصة.</p>
      </div>
    );
  }

  const handleWatchTrack = () => {
    if (movie.watchUrl) {
      window.open(movie.watchUrl, '_blank');
    }
  };

  const runtimeHours = movie.duration ? Math.floor(movie.duration / 60) : 0;
  const runtimeMins = movie.duration ? movie.duration % 60 : 0;

  return (
    <div className="relative w-full h-[580px] overflow-hidden flex items-end">
      {/* Absolute Backdrop image layout */}
      <div className="absolute inset-0 z-0">
        <img 
          src={movie.backdropUrl || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200"} 
          alt={movie.title}
          className="w-full h-full object-cover scale-105 object-top"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic multi-gradient lighting layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-[#07070f]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/40 to-transparent" />
      </div>

      {/* Main hero foreground controls */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 pt-32 text-right">
        {/* Featured Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold hover:bg-gold-light text-[#07070f] text-xs font-black rounded-full mb-4 shadow-md shadow-gold/20">
          <Star size={12} fill="currentColor" />
          <span>فيلم الأسبوع المميز</span>
        </div>

        {/* Cinematic titles */}
        <h1 className="text-4xl md:text-6xl font-black text-primary-text mb-2 font-cairo tracking-tight leading-none drop-shadow-md">
          {movie.title}
        </h1>
        {movie.originalTitle && (
          <p className="text-lg md:text-xl text-gold-light font-medium tracking-wide mb-4 drop-shadow-sm font-sans">
            {movie.originalTitle}
          </p>
        )}

        {/* Sub-details (Duration, Year, rating, categories) */}
        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-secondary-text mb-6">
          {movie.year && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
              <Calendar size={13} className="text-gold" />
              <span>{movie.year}</span>
            </div>
          )}
          {movie.duration && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
              <Clock size={13} className="text-gold" />
              <span>{runtimeHours > 0 ? `${runtimeHours} س و ` : ''}{runtimeMins} دقيقة</span>
            </div>
          )}
          {movie.rating && (
            <div className="flex items-center gap-1 bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-md text-gold">
              <Star size={13} fill="currentColor" />
              <span className="font-bold">{movie.rating.toFixed(1)} / 10</span>
            </div>
          )}
          <div className="flex gap-1">
            {movie.genre.map((g, i) => (
              <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-primary-text">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Plot preview in Arabic */}
        <p className="text-secondary-text text-sm md:text-base max-w-2xl leading-relaxed mb-8 drop-shadow-sm line-clamp-3">
          {movie.plotAi || movie.plot || 'لا تتوفر مراجعة وصفية للفيلم حالياً..'}
        </p>

        {/* Dynamic call to actions */}
        <div className="flex flex-wrap items-center gap-4">
          {movie.watchUrl ? (
            <button 
              onClick={handleWatchTrack}
              className="flex items-center gap-2 bg-gold hover:bg-gold-light text-[#07070f] font-black px-6 py-3 rounded-xl shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:scale-102 transition-all cursor-pointer text-sm"
              id="hero-play-btn"
            >
              <Play size={16} fill="currentColor" />
              <span>مشاهدة العرض الآن</span>
            </button>
          ) : (
            <button 
              onClick={() => onViewDetails(movie)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-primary-text border border-white/10 px-6 py-3 rounded-xl transition-all cursor-pointer text-sm"
            >
              <span>أضف رابط مشاهدة</span>
            </button>
          )}

          <button 
            onClick={() => onViewDetails(movie)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-primary-text border border-white/10 px-5 py-3 rounded-xl hover:border-gold/30 hover:scale-102 transition-all cursor-pointer text-sm"
            id="hero-details-btn"
          >
            <Info size={16} />
            <span>تفاصيل الفيلم الكاملة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
