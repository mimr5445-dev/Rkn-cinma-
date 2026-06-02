import { useState, useEffect, FormEvent } from 'react';
import { Search, Shield, Bell, Menu, X, Filter, Grid, List, SlidersHorizontal, ArrowLeft, Bot, Sparkles, AlertCircle, RefreshCw, Star, Info, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from './types';

// Child components imports
import { ChatWidget } from './components/ChatWidget';
import { HeroSection } from './components/HeroSection';
import { MovieCard } from './components/MovieCard';
import { AiMoodPicker } from './components/AiMoodPicker';
import { MovieDetail } from './components/MovieDetail';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<'home' | 'catalog' | 'admin' | 'detail'>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Global movies list
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);

  // Filter lists inside pages
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('الكل');
  const [selectedYear, setSelectedYear] = useState('الكل');
  const [smartSearch, setSmartSearch] = useState(true); // AI semantic search mode

  // Chat Trigger parameters
  const [chatInitialQuery, setChatInitialQuery] = useState('');

  // Mobile menu open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Configuration values for filters (Page 25 in PDF)
  const GENRES = [
    'الكل', 'أكشن', 'رعب', 'دراما', 'كوميديا', 'خيال علمي', 
    'مغامرة', 'رومانسي', 'جريمة', 'تاريخي', 'سيرة ذاتية', 
    'رياضي', 'موسيقي', 'وثائقي', 'أنيميشن', 'خيال'
  ];
  const YEARS = ['الكل', '2024', '2023', '2022', '2021', '2020', 'أقدم'];

  // Load movies from backend server
  const loadMovies = async () => {
    setIsLoadingMovies(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedGenre !== 'الكل') params.set('genre', selectedGenre);
      if (selectedYear !== 'الكل') params.set('year', selectedYear);
      if (smartSearch) params.set('smart', 'true');

      const res = await fetch(`/api/movies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMovies(data.movies || []);
      }
    } catch (err) {
      console.error("Failed to load catalog movies list", err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  // Trigger loading when filter/genre changes
  useEffect(() => {
    loadMovies();
  }, [selectedGenre, selectedYear]);

  // Handle direct custom search execution
  const handleSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setActivePage('catalog');
    loadMovies();
  };

  // Trigger mood picking from AiMoodPicker
  const handleMoodPick = (prompt: string) => {
    setChatInitialQuery(prompt);
    // Reset initial query quickly after letting trigger run
    setTimeout(() => setChatInitialQuery(''), 500);
  };

  // discuss list in Chat widget
  const handleDiscussInChat = (movie: Movie) => {
    const talkPrompt = `مرحباً، حدثني عن فيلم "${movie.title}" وتأثيراته السينمائية وأهم أفكاره، وكيف تقيم مستواه الفني العام مقارنة بسنة إنتاجه؟`;
    setChatInitialQuery(talkPrompt);
    setTimeout(() => setChatInitialQuery(''), 500);
  };

  const handleViewMovieDetail = (movie: Movie) => {
    setSelectedMovie(movie);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setActivePage('catalog');
    setSelectedMovie(null);
  };

  const handleUpdateMovie = (updated: Movie) => {
    setMovies(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMovie(updated);
  };

  const handleDeleteMovie = (deletedId: string) => {
    setMovies(prev => prev.filter(m => m.id !== deletedId));
    setActivePage('catalog');
    setSelectedMovie(null);
  };

  // Get featured movie for Hero Section
  const featuredMovie = movies.find(m => m.isFeatured && m.isActive) || movies[0] || null;

  return (
    <div className="min-h-screen bg-bg-primary text-primary-text font-sans selection:bg-gold selection:text-bg-primary">
      
      {/* Top Navbar Header */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-[#07070f]/95 via-[#07070f]/80 to-transparent backdrop-blur-md border-b border-white/5 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Action triggers (Catalog, Admin, Hero widgets) */}
          <div className="flex items-center gap-4">
            
            {/* Standard Menu items */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => { setActivePage('home'); setIsMobileMenuOpen(false); }}
                className={`text-sm font-bold transition-all cursor-pointer ${activePage === 'home' ? 'text-gold font-black border-b border-gold pb-1' : 'text-secondary-text hover:text-primary-text'}`}
              >
                الرئيسية
              </button>
              <button 
                onClick={() => { setActivePage('catalog'); setIsMobileMenuOpen(false); }}
                className={`text-sm font-bold transition-all cursor-pointer ${activePage === 'catalog' ? 'text-gold font-black border-b border-gold pb-1' : 'text-secondary-text hover:text-primary-text'}`}
              >
                الكتالوج الشامل
              </button>
            </div>

            {/* Admin control desk */}
            <button 
              onClick={() => setActivePage('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                activePage === 'admin' 
                  ? 'bg-gold text-[#07070f] border-gold shadow-md shadow-gold/20' 
                  : 'bg-gold/5 hover:bg-gold/15 text-gold border-gold/25'
              }`}
            >
              <Shield size={13} />
              <span>لوحة الإشراف والتوليد (Admin)</span>
            </button>
          </div>

          {/* Interactive Global Search box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm mx-6 hidden md:block">
            <div className="relative w-full">
              <Search 
                size={15} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim cursor-pointer"
                onClick={() => handleSearchSubmit()}
              />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث ذكياً بالمعنى أو الكلمة..."
                className="w-full bg-white/5 border border-white/10 rounded-full pr-10 pl-4 py-1.5 text-xs text-primary-text placeholder-text-dim outline-none focus:border-gold/50 focus:bg-white/10 transition-all text-right"
                dir="rtl"
              />
            </div>
          </form>

          {/* Branding Logo */}
          <div 
            onClick={() => { setActivePage('home'); setSelectedMovie(null); }}
            className="text-gold font-black text-lg md:text-xl cursor-pointer flex items-center gap-2"
          >
            <span className="text-2xl drop-shadow-md">🎬</span>
            <span className="font-cairo tracking-tight leading-none drop-shadow-sm font-black hidden sm:block">اسْتِرَاحةُ السِّينَمَا الذَّكِيَّة</span>
          </div>

          {/* Hamburger Mobile controller */}
          <button 
            className="md:hidden text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer list */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed top-16 inset-x-0 z-30 bg-[#07070f]/95 border-b border-white/5 p-6 flex flex-col gap-4 text-right shadow-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <button 
              onClick={() => { setActivePage('home'); setIsMobileMenuOpen(false); }}
              className="font-bold text-sm text-secondary-text hover:text-primary-text transition-colors py-2 block text-right border-b border-white/5"
            >
              الرئيسية
            </button>
            <button 
              onClick={() => { setActivePage('catalog'); setIsMobileMenuOpen(false); }}
              className="font-bold text-sm text-secondary-text hover:text-primary-text transition-colors py-2 block text-right border-b border-white/5"
            >
              الكتالوج الشامل
            </button>
            <form onSubmit={handleSearchSubmit} className="relative w-full py-2">
              <Search 
                size={14} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim"
              />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بنقاء في المحتوى السلوكي..."
                className="w-full bg-[#0e0e1e] border border-white/10 rounded-full pr-10 pl-4 py-2 text-xs text-primary-text placeholder-text-dim text-right"
                dir="rtl"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page view controllers */}
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          
          {/* HOME LAYOUT */}
          {activePage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12 pb-24"
            >
              {/* Giant Featured Hero */}
              <HeroSection 
                movie={featuredMovie} 
                onViewDetails={handleViewMovieDetail}
              />

              {/* Cinema mood selection with AI */}
              <section className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="text-right border-r-4 border-gold pr-4">
                  <h2 className="text-2xl font-black text-gold font-cairo">كيف هو مزاجك النفسي اليوم؟ 🧠✨</h2>
                  <p className="text-secondary-text text-sm">اختر حالتك الشعورية ليصيغ لك الذكاء الاصطناعي وجبات عشاء سينمائية تلائم وجدانك!</p>
                </div>
                <AiMoodPicker onPickMood={handleMoodPick} />
              </section>

              {/* Added Recently carousels */}
              <section className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <button 
                    onClick={() => setActivePage('catalog')}
                    className="text-xs text-gold hover:text-gold-light font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>عرض الكل بالكتالوج</span>
                    <span>←</span>
                  </button>
                  <h2 className="text-xl font-black text-primary-text font-cairo flex items-center gap-1.5 direction-rtl">
                    <span>✨</span>
                    <span>أضيف حديثاً للكتالوج</span>
                  </h2>
                </div>

                {isLoadingMovies ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-[2/3] rounded-xl bg-bg-surface border border-white/5 animate-pulse flex items-center justify-center text-text-dim font-bold text-xs">جاري الحمولة...</div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies.slice(0, 6).map((m, idx) => (
                      <MovieCard 
                        key={m.id} 
                        movie={m} 
                        index={idx} 
                        onViewDetails={handleViewMovieDetail}
                        onDiscussInChat={handleDiscussInChat}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Highest Rated carousels */}
              <section className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <button 
                    onClick={() => setActivePage('catalog')}
                    className="text-xs text-gold hover:text-gold-light font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>تصفح الكتالوج الشامل</span>
                    <span>←</span>
                  </button>
                  <h2 className="text-xl font-black text-primary-text font-cairo flex items-center gap-1.5 direction-rtl">
                    <span>🔥</span>
                    <span>الأعلى تقييماً ونقداً</span>
                  </h2>
                </div>

                {isLoadingMovies ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="aspect-[2/3] rounded-xl bg-bg-surface border border-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies
                      .slice()
                      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                      .slice(0, 6)
                      .map((m, idx) => (
                        <MovieCard 
                          key={m.id} 
                          movie={m} 
                          index={idx} 
                          onViewDetails={handleViewMovieDetail}
                          onDiscussInChat={handleDiscussInChat}
                        />
                      ))
                    }
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {/* CATALOG SHIELD LAYOUT */}
          {activePage === 'catalog' && (
            <motion.div
              key="catalog-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 pt-24 pb-24 text-right space-y-8"
              dir="rtl"
            >
              {/* Catalog header */}
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-3xl font-black text-primary-text font-cairo">كتالوج الأفلام الإجمالي</h1>
                <p className="text-secondary-text text-sm mt-1">{movies.length} فيلم منشور متوفر للمشاهدة الفنية</p>
              </div>

              {/* Filters toolbox block based on pages 25-26 guidelines */}
              <div className="p-5 rounded-2xl bg-bg-surface border border-white/5 space-y-6">
                
                {/* Search controller with intelligent meaning finder toggle option */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs text-secondary-text">ابحث في الأفلام المنشورة:</label>
                    <div className="relative">
                      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="اكتب كلمات مفتاحية، مثل: سفر فضاء، عقل، مافيا، جريمة..."
                        className="w-full bg-[#07070f] border border-white/10 rounded-xl pr-10 pl-4 py-3 text-sm text-primary-text placeholder-text-dim outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>

                  {/* Smart Search Mode selector */}
                  <div className="flex items-center gap-3 bg-[#07070f] border border-white/5 px-4 py-3 rounded-xl">
                    <div className="text-right">
                      <p className="text-xs font-bold text-primary-text flex items-center gap-1 justify-end font-cairo">
                        <span>بحث ذكي بالمعنى</span>
                        <Sparkles size={11} className="text-gold animate-pulse" />
                      </p>
                      <p className="text-[10px] text-secondary-text font-tajawal">مقارنة المفاهيم بالذكاء الاصطناعي 🤖</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={smartSearch}
                      onChange={e => setSmartSearch(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold accent-gold cursor-pointer"
                    />
                  </div>

                  <button 
                    onClick={() => loadMovies()}
                    className="w-full md:w-auto bg-gold hover:bg-gold-light text-[#07070f] font-black px-6 py-3.5 rounded-xl transition-all cursor-pointer text-sm font-cairo flex items-center justify-center gap-1.5"
                  >
                    <Search size={14} />
                    <span>إجراء البحث</span>
                  </button>
                </div>

                {/* Genre categories checklist */}
                <div className="space-y-2">
                  <label className="block text-xs text-secondary-text">التصفية بالتصنيفات الإبداعية:</label>
                  <div className="flex gap-2 flex-wrap scroll-container">
                    {GENRES.map(g => (
                      <button 
                        key={g}
                        onClick={() => setSelectedGenre(g)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedGenre === g 
                            ? 'bg-gold text-[#07070f] border-gold font-black shadow-md shadow-gold/15' 
                            : 'bg-white/5 hover:bg-white/10 text-secondary-text border border-white/5'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year parameters filters checklist */}
                <div className="space-y-2">
                  <label className="block text-xs text-secondary-text">التصفية بسنة الإنتاج والصدور:</label>
                  <div className="flex gap-2 flex-wrap scroll-container">
                    {YEARS.map(y => (
                      <button 
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedYear === y 
                            ? 'bg-gold text-[#07070f] border-gold font-black shadow-md' 
                            : 'bg-white/5 hover:bg-white/10 text-secondary-text border border-white/5'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid movie catalog lists representation */}
              {isLoadingMovies ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl bg-bg-surface border border-white/5 animate-pulse" />
                  ))}
                </div>
              ) : movies.length === 0 ? (
                <div className="p-12 text-center bg-bg-surface border border-white/5 rounded-2xl space-y-3">
                  <AlertCircle size={32} className="text-gold/40 mx-auto" />
                  <p className="text-secondary-text text-sm font-tajawal">لم يتم العثور على أفلام مطابقة لاستعلام البحث أو المحددات النشطة.</p>
                  <button 
                    onClick={() => { setSelectedGenre('الكل'); setSelectedYear('الكل'); setSearchQuery(''); loadMovies(); }}
                    className="text-xs text-gold underline cursor-pointer"
                  >
                    إعادة تصفير فلاتر التصفية
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
                  {movies.map((m, idx) => (
                    <MovieCard 
                      key={m.id} 
                      movie={m} 
                      index={idx} 
                      onViewDetails={handleViewMovieDetail}
                      onDiscussInChat={handleDiscussInChat}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* DETAIL VIEW LAYOUT */}
          {activePage === 'detail' && selectedMovie && (
            <motion.div
              key="detail-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MovieDetail 
                movie={selectedMovie}
                onBack={handleBackToCatalog}
                isAdmin={true} // Seeding isAdmin true on AI studio preview panel for ultimate edit access
                onUpdateMovie={handleUpdateMovie}
                onDeleteMovie={handleDeleteMovie}
              />
            </motion.div>
          )}

          {/* ADMIN DESK VIEW LAYOUT */}
          {activePage === 'admin' && (
            <motion.div
              key="admin-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel 
                moviesList={movies}
                onMovieAdded={loadMovies}
                onViewMovie={handleViewMovieDetail}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Interactive Chat Widget system overlay */}
      <ChatWidget 
        onMovieAdded={loadMovies} 
        initialQuery={chatInitialQuery}
      />

    </div>
  );
}
