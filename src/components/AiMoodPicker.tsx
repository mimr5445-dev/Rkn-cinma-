import { useState } from 'react';
import { Sparkles, Gamepad2, BrainCircuit, HeartHandshake, Skull, Flame, Laugh, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface AiMoodPickerProps {
  onPickMood: (moodPrompt: string) => void;
}

interface MoodOption {
  icon: any;
  label: string;
  desc: string;
  prompt: string;
  color: string;
}

export function AiMoodPicker({ onPickMood }: AiMoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const MOODS: MoodOption[] = [
    {
      icon: Compass,
      label: "ملحمة فضاء وأكوان",
      desc: "عوالم بعيدة وأسفار مستحيلة",
      prompt: "أنا بمزاج تصفح فيلم ملحمي عن فضاء وأبعاد أخرى وثقوب زمنية وسفر عبر الأكوان، ما اقتراحاتك؟",
      color: "from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-300"
    },
    {
      icon: BrainCircuit,
      label: "غموض وتحليل نفسي",
      desc: "ألغاز وأفكار تلعب بالعقول",
      prompt: "أريد فيلماً ذكياً معقداً يناقش العقل الباطن، الأحلام، أو ألغاز نفسية غامضة ذات حبكة صادمة!",
      color: "from-cyan-600/20 to-teal-600/20 border-cyan-500/30 text-cyan-300"
    },
    {
      icon: Flame,
      label: "أكشن وإثارة ملهبة",
      desc: "بين الفوضى والعدالة وصراع القوة",
      prompt: "مزاجي اليوم مائل لأكشن وإثارة من الدرجة الأولى وعالم جريمة مظلم يحبس الأنفاس!",
      color: "from-red-600/20 to-orange-600/20 border-red-500/30 text-red-300"
    },
    {
      icon: HeartHandshake,
      label: "دراما ملحمية مؤثرة",
      desc: "حكايات عميقة تلامس الروح",
      prompt: "اقترح علي فيلماً درامياً عميقاً ومؤثراً، يناقش معضلات أخلاقية وقضايا عائلية أو تاريخية تلامس القلب.",
      color: "from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-300"
    },
    {
      icon: Sparkles,
      label: "عوالم سحرية وخيال",
      desc: "أنيميشن وبساطة ساحرة دافئة",
      prompt: "أريد الانغماس في عالم سحري رائع، أنيميشن خيالي مذهل وممتع يبعث الدفء والطاقة الإيجابية.",
      color: "from-amber-600/20 to-yellow-600/20 border-amber-500/30 text-amber-300"
    },
    {
      icon: Laugh,
      label: "بهجة ومرح عائلي",
      desc: "ضحكة وبساطة ولطافة غير معقدة",
      prompt: "أبحث عن فيلم كوميدي خفيف أو موسيقي مبهج وجميل لضبط المزاج، هل لديك اقتراحات ساحرة؟",
      color: "from-emerald-600/20 to-green-600/20 border-emerald-500/30 text-emerald-300"
    }
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {MOODS.map((mood, idx) => {
          const IconComponent = mood.icon;
          return (
            <motion.div
              key={idx}
              className={`p-5 rounded-2xl border bg-gradient-to-br ${mood.color} hover:scale-102 transition-all cursor-pointer flex flex-col justify-between text-right h-36 border-white/5 relative overflow-hidden group`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMood(idx);
                onPickMood(mood.prompt);
              }}
            >
              {/* Abs behind background visual touch */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <IconComponent size={54} className="text-white/5" />
              </div>

              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gold shadow-sm group-hover:bg-gold/10 group-hover:border-gold/30 transition-all">
                  <IconComponent size={20} />
                </div>
                {selectedMood === idx && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-primary-text mb-1 font-cairo">
                  {mood.label}
                </h3>
                <p className="text-xs text-secondary-text leading-tight font-tajawal drop-shadow-sm">
                  {mood.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
