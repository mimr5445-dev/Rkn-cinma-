import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Info, MessageCircle, Star, Edit, Trash2 } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  onViewDetails: (movie: Movie) => void;
  onDiscussInChat?: (movie: Movie) => void;
  isAdmin?: boolean;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movie: Movie) => void;
  key?: string | number;
}

export function MovieCard({ 
  movie, 
  index = 0, 
  onViewDetails, 
  onDiscussInChat,
  isAdmin = false,
  onEdit,
  onDelete
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const posterUrl = movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500";

  return (
    <motion.div
      className="movie-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(movie)}
      style={{
        /* 3D Cinematic Perspective tilt effect based on page 10 guidelines */
        transform: isHovered
          ? 'perspective(800px) rotateY(-3deg) translateY(-8px) scale(1.02)'
          : 'perspective(800px) rotateY(0deg) translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      id={`movie-card-${movie.id}`}
    >
      {/* Poster Image */}
      <img
        src={posterUrl}
        alt={movie.title}
        className="w-full h-full object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Cinematic Linear Gradient overlay */}
      <div className="card-overlay">
        
        {/* Basic specifications on lower side of card */}
        <div className="space-y-1">
          <p className="text-[#f0ece0] font-bold text-sm leading-tight line-clamp-2 font-cairo">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#a09880]">
            <span>{movie.year || '؟'}</span>
            {movie.genre[0] && (
              <>
                <span>•</span>
                <span>{movie.genre[0]}</span>
              </>
            )}
            {movie.rating && (
              <>
                <span>•</span>
                <Star size={10} className="text-gold fill-current" />
                <span className="text-gold">{movie.rating.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>

        {/* Floating action items showing up smoothly on hover */}
        <motion.div
          className="flex gap-2 mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()} // Prevent card navigation
        >
          {/* Watch Stream Button */}
          {movie.watchUrl && (
            <button
              onClick={() => window.open(movie.watchUrl!, '_blank')}
              className="flex-1 flex items-center justify-center gap-1 bg-[#c9a84c] text-[#07070f] rounded-lg py-1.5 text-xs font-bold hover:bg-[#e4c06e] transition-colors cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              <span>شاهد</span>
            </button>
          )}

          {/* Quick Info page button */}
          <button
            onClick={() => onViewDetails(movie)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-primary-text transition-colors cursor-pointer"
            title="مشاهدة التفاصيل"
          >
            <Info size={14} />
          </button>

          {/* Chat Discuss Trigger button */}
          {onDiscussInChat && (
            <button
              onClick={() => onDiscussInChat(movie)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-primary-text transition-colors cursor-pointer"
              title="مناقشة الفيلم مع المساعد"
            >
              <MessageCircle size={14} />
            </button>
          )}

          {/* Administrator level actions */}
          {isAdmin && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit && onEdit(movie)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 transition-colors cursor-pointer"
                title="تعديل الفيلم"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete && onDelete(movie)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-300 transition-colors cursor-pointer"
                title="حذف الفيلم"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Catalog ID ranking Sticker (Top Right) */}
      <div className="absolute top-2 right-2 bg-[#07070f]/80 backdrop-blur-sm text-gold text-xs font-bold px-2 py-1 rounded-md border border-gold/30 shadow-md">
        #{movie.number}
      </div>

      {/* Featured Star Sticker (Top Left) */}
      {movie.isFeatured && (
        <div className="absolute top-2 left-2 bg-[#c9a84c] text-[#07070f] text-xs font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
          <Star size={10} fill="currentColor" />
          <span>مميز</span>
        </div>
      )}
    </motion.div>
  );
}
