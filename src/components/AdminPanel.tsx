import { useState, useEffect, useRef } from 'react';
import { Plus, Bot, RefreshCw, Trash2, Edit, Search, Upload, HelpCircle, HardDrive, Film, Shield, Check, Terminal, ExternalLink, Play, Pause } from 'lucide-react';
import { Stats, Movie } from '../types';

interface AdminPanelProps {
  onMovieAdded?: () => void;
  moviesList: Movie[];
  onViewMovie: (movie: Movie) => void;
}

export function AdminPanel({ onMovieAdded, moviesList, onViewMovie }: AdminPanelProps) {
  const [aiInput, setAiInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addLog, setAddLog] = useState<string[]>([]);
  
  // Bulk import state
  const [bulkStatus, setBulkStatus] = useState({ totalCount: 0, alreadyImported: 0, pending: 0 });
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkLog, setBulkLog] = useState<string[]>([]);
  const stopBulkRef = useRef(false);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    aiAdded: 0,
    missingPoster: 0,
    watchable: 0,
    genresCount: 0
  });

  // Load backend stats
  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBulkStatus = async () => {
    try {
      const res = await fetch('/api/admin/bulk-status');
      if (res.ok) {
        const data = await res.json();
        setBulkStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
    fetchBulkStatus();
  }, [moviesList]);

  const startBulkImport = async () => {
    if (isBulkImporting) return;
    setIsBulkImporting(true);
    stopBulkRef.current = false;
    setBulkLog(prev => [...prev, "🚀 بدء جولة الاستيراد التلقائي الذكي لدفعة من القائمة الحقيقية الموثقة (412 فيلماً)..."]);

    // Let's copy initial status values
    let currentImported = bulkStatus.alreadyImported;
    let total = bulkStatus.totalCount;

    while (currentImported < total) {
      if (stopBulkRef.current) {
        setBulkLog(prev => [...prev, "⏸️ تم إيقاف عملية الاستيراد مؤقتاً بنجاح بطلب من المشرف."]);
        break;
      }

      setBulkLog(prev => [...prev, `⏳ جاري توليد تفاصيل وصور الدفعة التالية بدءاً من المؤشر #${currentImported}...`]);

      try {
        const res = await fetch('/api/admin/bulk-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startIndex: currentImported })
        });

        if (!res.ok) {
          throw new Error("حدث فشل في استجابة الخادم الذكي للدفعة.");
        }

        const data = await res.json();
        if (data.success) {
          const count = data.count || 0;
          if (count > 0) {
            setBulkLog(prev => [
              ...prev,
              `✅ تم بنجاح جلب وتوليد وإضافة ${count} فيلم حقيقي جديد!  (معاينات: ${data.movies?.slice(0, 3).map((m: any) => m.title).join('، ')})`
            ]);
            if (onMovieAdded) onMovieAdded();
          } else {
            setBulkLog(prev => [...prev, "ℹ️ تم تخطي أو الانتهاء من جميع أفلام الدفعة الحالية لأنها مستوردة مسبقاً."]);
          }

          // Fetch fresh status in loop
          const resStatus = await fetch('/api/admin/bulk-status');
          if (resStatus.ok) {
            const statusData = await resStatus.json();
            setBulkStatus(statusData);
            currentImported = statusData.alreadyImported;
            total = statusData.totalCount;

            // If nothing is left pending, we break
            if (statusData.pending === 0) {
              setBulkLog(prev => [...prev, "🎉 مبارك! تم استيراد وتوليد جميع أفلام القائمة الـ 412 بنجاح تام وبشكل حقيقي بالكامل!"]);
              break;
            }
          } else {
            currentImported += 15; // fallback step
          }
          await loadStats();
        } else {
          throw new Error(data.error || "خطأ غير معروف");
        }
      } catch (err: any) {
        console.error(err);
        setBulkLog(prev => [...prev, `⚠️ تنبيه: تعذر إتمام الدفعة الفنية الحالية (أمر طبيعي بسبب ضغط الشبكة أو التحقق). سنحاول مرة أخرى تلقائياً بعد 3 ثوانٍ. السبب: ${err.message}`]);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // 1.5s delay inside loop
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsBulkImporting(false);
  };

  const pauseBulkImport = () => {
    stopBulkRef.current = true;
    setIsBulkImporting(false);
    setBulkLog(prev => [...prev, "⏳ جاري إرسال إشارة الإيقاف المؤقت للدفعة الجارية..."]);
  };

  const handleAiAdd = async () => {
    if (!aiInput.trim()) return;
    
    setIsAdding(true);
    const movieQueryName = aiInput.trim();
    setAiInput('');
    
    // Add nice starting tracking line to logs console
    setAddLog(prev => [...prev, `🔍 جاري البحث وتغطية التفاصيل لفيلم: [${movieQueryName}]...`]);
    
    try {
      const res = await fetch('/api/ai/add-movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieName: movieQueryName })
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (data.movies && Array.isArray(data.movies)) {
          const successLogs = data.movies.map((m: any) => 
            `✅ تم توليد وإضافة فيلم [${m.title}] بنجاح تحت التسلسل رقم #${m.number}!  (السنة: ${m.year || 'غير معروفة'})`
          );
          setAddLog(prev => [...prev, ...successLogs]);
        } else if (data.movie) {
          setAddLog(prev => [
            ...prev, 
            `✅ تم توليد وإضافة فيلم [${data.movie.title}] بنجاح تحت التسلسل رقم #${data.movie.number}!  (السنة: ${data.movie.year || 'غير معروفة'})`
          ]);
        }
        if (onMovieAdded) onMovieAdded();
        await loadStats();
      } else {
        setAddLog(prev => [...prev, `❌ فشل: ${data.error || 'لم نتمكن من الوصول لنتائج دقيقة.'}`]);
      }
    } catch {
      setAddLog(prev => [...prev, `❌ فشل الاتصال بالخادم الذكي. تأكد من إعداد مفتاح GEMINI_API_KEY.`]);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-24 px-6 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gold font-cairo">لوحة تحكم المُشرف والذكاء الاصطناعي</h1>
            <p className="text-secondary-text text-sm mt-1">تتيح لك إدارة كتالوج الأفلام الشخصي وإثرائه تلقائياً بواسطة قدرات Gemini العبقرية</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 text-gold border border-gold/20 rounded-xl text-xs font-bold font-mono">
            <Shield size={14} />
            <span>صلاحية مُدير كملة</span>
          </div>
        </div>

        {/* Gemini movie adder panel based on page 21 guidelines */}
        <div className="bg-bg-surface border border-gold/15 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-black/45">
          {/* Subtle background bot watermark decoration */}
          <Bot size={130} className="absolute -left-10 -bottom-10 text-white/2 pointer-events-none" />

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-text mb-2 flex items-center gap-2 justify-start font-cairo">
              <Bot className="text-gold" size={24} />
              <span>إضافة فيلم ذكياً وتلقائياً بالذكاء الاصطناعي</span>
            </h2>
            <p className="text-secondary-text text-sm">
              اكتب اسم أي فيلم عربي أو عالمي ترغب بضمه. سيقوم نظام الذكاء الاصطناعي بالتنقيب في كشافات السينما وتوليد قصته وتلخيصه وتحليله النقدي الفني، مع اختيار صور ملصقات وخلفيات سينمائية دقيقة وضمه فوراً للكتالوج كنسخة وارفة التفاصيل!
            </p>

            {/* AI Generation Form input layout */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input 
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiAdd()}
                disabled={isAdding}
                placeholder="أدخل اسم فيلم أو مجموعة أسماء مفصولة بفواصل (مثال: أوبنهايمر، بين النجوم، العراب)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-primary-text placeholder-text-dim outline-none focus:border-gold/50 transition-colors text-right"
              />
              <button
                onClick={handleAiAdd}
                disabled={isAdding || !aiInput.trim()}
                className="flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-[#07070f] font-black px-6 py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm font-cairo shadow-md shadow-gold/10"
              >
                {isAdding ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>جاري التوليد الفني...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>أضف الفيلم فورياً</span>
                  </>
                )}
              </button>
            </div>

            {/* Tracking logs system output console on page 22 */}
            {addLog.length > 0 && (
              <div className="mt-4 bg-black/50 border border-white/5 rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto font-mono text-xs text-secondary-text scroll-container">
                <div className="flex items-center gap-1 text-gold border-b border-white/5 pb-1.5 mb-2">
                  <Terminal size={12} />
                  <span className="font-bold font-cairo">سجل عمليات التوليد الفني:</span>
                </div>
                {addLog.map((log, idx) => (
                  <p key={idx} className="leading-relaxed text-right flex items-start gap-1">
                    <span>⚡</span>
                    <span className="flex-1">{log}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk loader card (412 movies) */}
        <div className="bg-bg-surface border border-cyan/20 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-black/45">
          <div className="absolute top-0 left-0 bg-cyan/15 text-cyan text-[11px] font-black px-3 py-1 rounded-bl-xl font-mono">
            412 MOVIES CATALOG
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-text mb-2 flex items-center gap-2 justify-start font-cairo">
              <Film className="text-cyan animate-pulse" size={24} />
              <span>شحن واستكشاف القائمة المجمعة الموثقة (412 فيلماً)</span>
            </h2>
            <p className="text-secondary-text text-sm">
              تم إعداد وتنسيق قائمة سينمائية متكاملة وحقيقية تضم <strong>412 عملاً سينمائياً</strong> حقيقياً مع سنوات إنتاجها المعتمدة. يمكنك الضغط على زر الاستيراد لبدء جولات التوليد التلقائي لقصص وتحليلات وعينات تصاميم تلك الأفلام وضمها تلقائياً بالتدريج لكتالوج المنصة بشكل دقيق ومن دون أي تأليف وهمي!
            </p>

            {/* Quick status progress elements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-secondary-text mb-1 flex items-center justify-center gap-1 font-cairo">إجمالي الأفلام المستهدفة بالاستيراد</p>
                <p className="text-2xl font-black text-cyan font-mono">412</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                <p className="text-xs text-secondary-text mb-1 flex items-center justify-center gap-1 font-cairo">تم تحقيقها واستيرادها</p>
                <p className="text-2xl font-black text-emerald-400 font-mono">{bulkStatus.alreadyImported} فيلم</p>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-secondary-text mb-1 flex items-center justify-center gap-1 font-cairo">الأفلام القيد الانتظار</p>
                <p className="text-2xl font-black text-gold font-mono">{bulkStatus.pending}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold font-mono text-cyan-400">
                <span>{((bulkStatus.alreadyImported / 412) * 100).toFixed(1)}% مكتمل</span>
                <span>تقدم جلب كشاف الأفلام الموحد</span>
              </div>
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (bulkStatus.alreadyImported / 412) * 100)}%` }}
                />
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-3 pt-2">
              {!isBulkImporting ? (
                <button
                  onClick={startBulkImport}
                  disabled={bulkStatus.pending === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-[#07070f] font-black px-6 py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-cairo shadow-lg shadow-cyan-500/10 text-sm"
                >
                  <Play size={16} />
                  <span>{bulkStatus.alreadyImported > 0 ? "استئناف الاستيراد الذكي التلقائي" : "بدء استيراد ومزامنة الـ 412 فيلماً دفعة واحدة"}</span>
                </button>
              ) : (
                <button
                  onClick={pauseBulkImport}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#07070f] font-black px-6 py-3.5 rounded-xl transition-all cursor-pointer font-cairo shadow-lg shadow-amber-500/10 text-sm"
                >
                  <Pause size={16} />
                  <span>إيقاف مؤقت للاستيراد</span>
                </button>
              )}
            </div>

            {/* Scrolling Bulk console logs */}
            {bulkLog.length > 0 && (
              <div className="mt-4 bg-black/60 border border-cyan/15 rounded-xl p-4 space-y-2 max-h-56 overflow-y-auto font-mono text-xs text-cyan-300 scroll-container">
                <div className="flex items-center gap-1.5 text-cyan border-b border-white/5 pb-2 mb-2">
                  <Terminal size={12} className="animate-spin" />
                  <span className="font-bold font-cairo">سجل المزامنة المجمعة المستمرة بالذكاء الاصطناعي:</span>
                </div>
                {bulkLog.map((log, idx) => (
                  <p key={idx} className="leading-relaxed text-right flex items-start gap-1">
                    <span className="text-cyan text-[10px]">✨</span>
                    <span className="flex-1">{log}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistical dashboards list on page 22 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {[
            { label: "إجمالي الأفلام بالكتالوج", value: stats.total, color: "text-gold border-gold/15 bg-gold/5" },
            { label: "أفلام وُلدت بالذكاء الاصطناعي", value: stats.aiAdded, color: "text-cyan border-cyan/15 bg-cyan/5" },
            { label: "أفلام بروابط مشاهدة ترويجية", value: stats.watchable, color: "text-emerald-400 border-emerald-500/15 bg-emerald-500/5" },
            { label: "عدد التصنيفات الإبداعية", value: stats.genresCount, color: "text-purple-400 border-purple-500/15 bg-purple-500/5" }
          ].map((stat, idx) => (
            <div key={idx} className={`border rounded-2xl p-5 text-right flex flex-col justify-between h-28 shadow-sm ${stat.color}`}>
              <p className="text-xs text-secondary-text leading-none">{stat.label}</p>
              <h3 className="text-3xl font-black font-mono leading-none tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Editable movie quick tables checklist */}
        <div className="pt-6">
          <div className="bg-bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-md">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-primary-text font-cairo">قائمة أفلام الكتالوج المتوفرة حالياً</h3>
              <span className="text-xs bg-white/5 text-secondary-text px-2.5 py-1 rounded-full font-bold">{moviesList.length} فيلم متاح</span>
            </div>
            
            <div className="overflow-x-auto scroll-container">
              <table className="w-full text-right text-sm">
                <thead className="bg-[#0c0c18] text-secondary-text text-xs border-b border-white/5">
                  <tr>
                    <th className="p-4 font-bold font-cairo"># التسلسل</th>
                    <th className="p-4 font-bold font-cairo">عنوان الفيلم</th>
                    <th className="p-4 font-bold font-cairo">التصنيفات</th>
                    <th className="p-4 font-bold font-cairo">السنة</th>
                    <th className="p-4 font-bold font-cairo">التوليد الذكي</th>
                    <th className="p-4 font-bold font-cairo">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {moviesList.map(m => (
                    <tr key={m.id} className="hover:bg-white/1 cursor-pointer" onClick={() => onViewMovie(m)}>
                      <td className="p-4 font-mono font-bold text-gold">#{m.number}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-primary-text">{m.title}</p>
                          <p className="text-xs text-secondary-text font-mono">{m.originalTitle || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {m.genre.map((g, idx) => (
                            <span key={idx} className="text-[10px] bg-white/5 text-primary-text px-2 py-0.5 rounded-md">{g}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-secondary-text">{m.year || '؟'}</td>
                      <td className="p-4">
                        {m.aiGenerated ? (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-cyan/10 border border-cyan/20 text-cyan px-2 py-0.5 rounded-full font-bold">
                            <Bot size={10} />
                            <span>تلقائي 🤖</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 text-secondary-text px-2 py-0.5 rounded-full">
                            <span>يدوي ✍️</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => onViewMovie(m)}
                          className="text-xs text-gold hover:text-gold-light border border-gold/20 hover:border-gold/50 bg-gold/5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>عرض وتعديل</span>
                          <ExternalLink size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
