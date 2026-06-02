import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Plus } from 'lucide-react';
import { Message } from '../types';

interface ChatWidgetProps {
  onMovieAdded?: () => void;
  initialQuery?: string;
}

export function ChatWidget({ onMovieAdded, initialQuery }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً بك في استراحة السينما الذكية! 🎬 أنا مساعدك الشخصي المدعوم بالذكاء الاصطناعي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن الأفلام، طلب توصيات مخصصة لمزاجك، أو ببساطة كتابة أمر إضافة فيلم مثل [/add Oppenheimer] لأقوم بالبحث عنه وضمه فوراً للكتالوج السحري!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Handle triggered initial query (e.g. from mood picker or dynamic action)
  useEffect(() => {
    if (initialQuery) {
      setIsOpen(true);
      triggerAutoMessage(initialQuery);
    }
  }, [initialQuery]);

  const triggerAutoMessage = async (text: string) => {
    const userMessage = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      // If a film is added in the backend, trigger callback count refreshes
      if (userMessage.includes('/add') || (data.reply && data.reply.includes('تم إضافة'))) {
        if (onMovieAdded) onMovieAdded();
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ أثناء محاولة الاتصال بالخادم. يرجى التأكد من تشغيل الخادم وتجربة مفتاح API ذكي.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    await triggerAutoMessage(currentInput);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <motion.button
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gold text-[#07070f] flex items-center justify-center shadow-lg shadow-gold/30 hover:bg-gold-light focus:outline-none transition-all cursor-pointer"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="مساعد السينما الذكي"
        id="chat-trigger-btn"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <MessageCircle size={24} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0de8d0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0de8d0]"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Conversation Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[520px] flex flex-col rounded-2xl overflow-hidden bg-bg-surface border border-gold/20 shadow-2xl shadow-black/80 font-sans"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20 }}
            id="chat-window-card"
          >
            {/* Header section with radial gold-smoke gradient */}
            <div className="flex items-center gap-3 p-4 border-b border-gold/15 bg-gradient-to-l from-gold/10 via-transparent to-transparent">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                <Bot size={20} className="text-gold" />
              </div>
              <div className="flex-1 text-right">
                <div className="flex items-center gap-1.5 justify-start">
                  <p className="text-sm font-bold text-primary-text font-cairo">مُرشد السينما الذكي</p>
                  <Sparkles size={13} className="text-gold animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 justify-start">
                  <span className="h-2 w-2 rounded-full bg-cyan inline-block animate-ping"></span>
                  <p className="text-xs text-gold">متصل وبانتظارك الآن</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation list segment */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary/50 scroll-container">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-right max-w-[85%] ${
                    msg.role === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
                  }`}
                >
                  {/* Sender Icon */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                    msg.role === 'user' 
                      ? 'bg-gold/10 border-gold/30' 
                      : 'bg-cyan/10 border-cyan/30'
                  }`}>
                    {msg.role === 'user' 
                      ? <User size={14} className="text-gold" /> 
                      : <Bot size={14} className="text-cyan" />
                    }
                  </div>

                  {/* Bubble body with glass fallback styling */}
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gold/20 text-primary-text rounded-tr-none'
                      : 'bg-white/5 text-primary-text border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Bot typing loader state */}
              {isLoading && (
                <div className="flex gap-3 ml-auto text-right max-w-[82%]">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-cyan/10 border border-cyan/30">
                    <Bot size={14} className="text-cyan animate-spin" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full bg-secondary-text"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Helper command buttons inside chat overlay */}
            <div className="px-4 py-2 border-t border-white/5 bg-bg-surface flex gap-2 overflow-x-auto scroll-container justify-start">
              <button 
                onClick={() => setInput('/add أوبنهايمر')}
                className="text-xs bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-full px-3 py-1 cursor-pointer transition-all whitespace-nowrap flex items-center gap-1"
              >
                <Plus size={12} />
                أمر إضافة فيلم
              </button>
              <button 
                onClick={() => setInput('اقترح علي أفلاماً ممتازة للسفر عبر الفضاء')}
                className="text-xs bg-white/5 hover:bg-white/10 text-secondary-text border border-white/10 rounded-full px-3 py-1 cursor-pointer transition-all whitespace-nowrap"
              >
                توصيات الخيال العلمي 🚀
              </button>
              <button 
                onClick={() => setInput('هل لديك أفلام رعب غامضة؟')}
                className="text-xs bg-white/5 hover:bg-white/10 text-secondary-text border border-white/10 rounded-full px-3 py-1 cursor-pointer transition-all whitespace-nowrap"
              >
                أجواء رعب وإثارة 👻
              </button>
            </div>

            {/* Chat inputs section */}
            <div className="p-4 border-t border-gold/15 bg-bg-surface">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="اسألني عن فيلم، أو اطلب ترشيحاً، أو أضف فيلماً..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-primary-text placeholder-text-dim outline-none focus:border-gold/50 transition-colors text-right"
                  dir="rtl"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-gold text-[#07070f] flex items-center justify-center hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex-shrink-0"
                  id="chat-send-btn"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
