import { useState } from 'react';
import { Play, Star, Calendar, Clock, Edit2, Trash2, Link, Bot, ArrowRight, Save, CheckCircle, RefreshCw } from 'lucide-react';
import { Movie } from '../types';

interface MovieDetailProps {
  movie: Movie;
  onBack: () => void;
  isAdmin?: boolean;
  onUpdateMovie: (updated: Movie) => void;
  onDeleteMovie: (id: string) => void;
}

export function MovieDetail({ movie, onBack, isAdmin = false, onUpdateMovie, onDeleteMovie }: MovieDetailProps) {
  const [editMode, setEditMode] = useState(false);
  
  // Edited values state
  const [title, setTitle] = useState(movie.title);
  const [originalTitle, setOriginalTitle] = useState(movie.originalTitle || '');
  const [plot, setPlot] = useState(movie.plot || '');
  const [plotAi, setPlotAi] = useState(movie.plotAi || '');
  const [watchUrl, setWatchUrl] = useState(movie.watchUrl || '');
  const [rating, setRating] = useState(movie.rating?.toString() || '');
  const [posterUrl, setPosterUrl] = useState(movie.posterUrl || '');
  const [backdropUrl, setBackdropUrl] = useState(movie.backdropUrl || '');
  
  const [isAiRegenerating, setIsAiRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdate = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/movies/${movie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle,
          plot,
          plotAi,
          watchUrl,
          rating: rating ? parseFloat(rating) : undefined,
          posterUrl,
          backdropUrl
        })
      });
      if (response.ok) {
        const data = await response.json();
        onUpdateMovie(data);
        setSuccessMsg('تم تحديث بيانات الفيلم بنجاح! ✨');
        setEditMode(false);
      } else {
        alert('فشل في حفظ التعديلات');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ أثناء تقديم الطلب');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateAiPlot = async () => {
    setIsAiRegenerating(true);
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/ai/regenerate/${movie.id}`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setPlotAi(data.plotAi);
        // Inform parent update
        onUpdateMovie({ ...movie, plotAi: data.plotAi });
        setSuccessMsg('تم إعادة توليد التحليل النقدي للفيلم عبر الذكاء الاصطناعي بنجاح! 🤖🚀');
      } else {
        const errData = await response.json();
        alert(errData.error || 'فشلت عملية توليد الوصف');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ أثناء توليد الوصف الفني');
    } finally {
      setIsAiRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`هل أنت متأكد من حذف فيلم "${movie.title}" نهائياً من الكتالوج؟`)) {
      try {
        const response = await fetch(`/api/movies/${movie.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          onDeleteMovie(movie.id);
        } else {
          alert('فشلت عملية الحذف');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleWatch = () => {
    if (watchUrl) {
      window.open(watchUrl, '_blank');
    }
  };

  const runtimeHours = movie.duration ? Math.floor(movie.duration / 60) : 0;
  const runtimeMins = movie.duration ? movie.duration % 60 : 0;

  return (
    <div className="relative min-h-screen bg-bg-primary text-primary-text font-sans pb-24" dir="rtl">
      {/* Top action header for backing to search list */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-24 pb-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light bg-white/5 border border-white/5 px-4 py-2 rounded-xl transition-all font-bold cursor-pointer"
        >
          <ArrowRight size={16} />
          <span>العودة إلى الكتالوج الرئيسي</span>
        </button>
      </div>

      {/* Giant Ambient backdrop lighting layout */}
      {movie.backdropUrl && (
        <div className="absolute top-0 inset-x-0 h-[60vh] overflow-hidden z-0">
          <img 
            src={movie.backdropUrl} 
            alt="" 
            className="w-full h-full object-cover opacity-35 filter blur-xs"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/80 to-bg-primary" />
        </div>
      )}

      {/* Main Specifications container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 mt-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Main Poster card column */}
          <div className="w-full md:w-72 flex-shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5">
              <img 
                src={movie.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"} 
                alt={movie.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Details fields column */}
          <div className="flex-1 space-y-6 text-right w-full">
            
            {/* Status alerts */}
            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-bold">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Title / Header block */}
            <div className="space-y-2">
              {editMode ? (
                <div className="space-y-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div>
                    <label className="block text-xs text-secondary-text mb-1">اسم الفيلم (بالعربية)</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-[#07070f] border border-gold/30 rounded-xl px-3 py-2 text-sm text-primary-text outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary-text mb-1">الاسم الأصلي (English)</label>
                    <input 
                      type="text"
                      value={originalTitle}
                      onChange={e => setOriginalTitle(e.target.value)}
                      className="w-full bg-[#07070f] border border-gold/30 rounded-xl px-3 py-2 text-sm text-primary-text outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary-text mb-1">تقييم الفيلم (من 10)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                      className="w-full bg-[#07070f] border border-gold/30 rounded-xl px-3 py-2 text-sm text-primary-text outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary-text mb-1">رابط صورة الملصق (Poster Image URL)</label>
                    <input 
                      type="url"
                      value={posterUrl}
                      onChange={e => setPosterUrl(e.target.value)}
                      className="w-full bg-[#07070f] border border-gold/30 rounded-xl px-3 py-2 text-sm text-primary-text outline-none focus:border-gold text-left font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary-text mb-1">رابط صورة الخلفية (Backdrop Image URL)</label>
                    <input 
                      type="url"
                      value={backdropUrl}
                      onChange={e => setBackdropUrl(e.target.value)}
                      className="w-full bg-[#07070f] border border-gold/30 rounded-xl px-3 py-2 text-sm text-primary-text outline-none focus:border-gold text-left font-mono"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-5xl font-black text-primary-text font-cairo leading-tight">
                    {movie.title}
                  </h1>
                  {movie.originalTitle && (
                    <p className="text-lg text-gold-light font-medium tracking-wide font-sans">{movie.originalTitle}</p>
                  )}
                </>
              )}
            </div>

            {/* General Specs badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-secondary-text border-b border-white/5 pb-4">
              {movie.year && (
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                  <Calendar size={13} className="text-gold" />
                  <span>{movie.year}</span>
                </span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                  <Clock size={13} className="text-gold" />
                  <span>{runtimeHours > 0 ? `${runtimeHours} س و ` : ''}{runtimeMins} دقيقة</span>
                </span>
              )}
              {movie.rating && (
                <span className="flex items-center gap-1.5 bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-md text-gold">
                  <Star size={13} fill="currentColor" />
                  <span className="font-bold">{movie.rating.toFixed(1)} / 10</span>
                </span>
              )}
            </div>

            {/* Categories Tag list */}
            <div className="flex flex-wrap gap-2">
              {movie.genre.map((g, idx) => (
                <span key={idx} className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-xs font-bold rounded-full">
                  {g}
                </span>
              ))}
            </div>

            {/* Detailed Plots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Normal basic plot */}
              <div className="p-5 rounded-2xl bg-[#0e0e1e] border border-white/5 space-y-2">
                <h3 className="text-sm font-bold text-gold-light border-b border-white/5 pb-2 font-cairo">قصة وحبكة الفيلم</h3>
                {editMode ? (
                  <textarea 
                    value={plot}
                    onChange={e => setPlot(e.target.value)}
                    rows={4}
                    className="w-full bg-[#07070f] border border-gold/30 rounded-xl p-3 text-xs text-primary-text outline-none focus:border-gold scroll-container text-right"
                  />
                ) : (
                  <p className="text-secondary-text text-sm leading-relaxed font-tajawal">
                    {plot || 'لا تتوافر قصة معروضة لهذا الفيلم حالياً.'}
                  </p>
                )}
              </div>

              {/* AI generated plot criticism */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-gold/5 to-transparent border border-gold/10 space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-gold font-cairo">التحليل والمراجعة الفنية (AI)</h3>
                  <div className="flex items-center gap-1 text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">
                    <Bot size={10} />
                    <span>Gemini AI</span>
                  </div>
                </div>
                {editMode ? (
                  <textarea 
                    value={plotAi}
                    onChange={e => setPlotAi(e.target.value)}
                    rows={4}
                    className="w-full bg-[#07070f] border border-gold/30 rounded-xl p-3 text-xs text-primary-text outline-none focus:border-gold scroll-container text-right"
                  />
                ) : (
                  <p className="text-secondary-text text-sm leading-relaxed font-tajawal">
                    {plotAi || movie.plotAi || 'لا تتوفر مراجعة فنية من الذكاء الاصطناعي حتى الآن.'}
                  </p>
                )}
              </div>
            </div>

            {/* Stream Links section */}
            <div className="p-5 rounded-2xl bg-[#000000]/20 border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-primary-text font-cairo">روابط البث والمشاهدة</h3>
              
              {editMode ? (
                <div className="space-y-2">
                  <label className="block text-xs text-secondary-text">رابط المشاهدة المباشر (يوتيوب أو بث خارجي)</label>
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      value={watchUrl}
                      onChange={e => setWatchUrl(e.target.value)}
                      placeholder="https://example.com/watch"
                      className="flex-1 bg-[#07070f] border border-gold/30 rounded-xl px-3 py-2 text-sm text-primary-text outline-none focus:border-gold text-left"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  {watchUrl ? (
                    <button 
                      onClick={handleWatch}
                      className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-[#07070f] font-black px-6 py-2.5 rounded-xl transition-all cursor-pointer text-sm shadow-md shadow-gold/20"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>مشاهدة العرض الترويجي الآن</span>
                    </button>
                  ) : (
                    <p className="text-xs text-secondary-text">لم يتم إرفاق رابط مشاهدة بعد لهذا الفيلم.</p>
                  )}
                </div>
              )}
            </div>

            {/* Admin Control Panel items */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5">
                {editMode ? (
                  <>
                    <button 
                      onClick={handleUpdate}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-[#07070f] font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm"
                    >
                      <Save size={14} />
                      <span>حفظ التعديلات</span>
                    </button>
                    <button 
                      onClick={() => setEditMode(false)}
                      className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/15 text-primary-text px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm"
                    >
                      <span>إلغاء</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm"
                    >
                      <Edit2 size={14} />
                      <span>تعديل المكونات</span>
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="inline-flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm"
                    >
                      <Trash2 size={14} />
                      <span>حذف الفيلم</span>
                    </button>
                    <button 
                      onClick={handleRegenerateAiPlot}
                      disabled={isAiRegenerating}
                      className="inline-flex items-center gap-1 bg-gold/15 border border-gold/30 text-gold hover:bg-gold/25 px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm"
                    >
                      {isAiRegenerating ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Bot size={14} />
                      )}
                      <span>تحديث الوصف الذكي (AI)</span>
                    </button>
                  </>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
