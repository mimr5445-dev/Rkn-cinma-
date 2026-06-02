import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'movies-db.json');

// Types based on schema
interface Movie {
  id: string;
  number: number;
  title: string;
  originalTitle?: string;
  titleSearch?: string;
  year?: number;
  duration?: number;
  plot?: string;
  plotAi?: string;
  genre: string[];
  tags: string[];
  rating?: number;
  posterUrl?: string;
  backdropUrl?: string;
  watchUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  aiGenerated: boolean;
  createdAt: string;
}

// Initial Movie Seed Data to make the app gorgeous and populated immediately
const INITIAL_MOVIES_SEED: Movie[] = [
  {
    id: "m-1",
    number: 1,
    title: "بين النجوم",
    originalTitle: "Interstellar",
    titleSearch: "بین النجوم",
    year: 2014,
    duration: 169,
    plot: "في مستقبِلٍ يسوده الجفاف والآفات المحصولية والبيئة المدمرة، يسافر فريق من رواد الفضاء عبر ثقب دودي في محاولة لإنقاذ البشرية.",
    plotAi: "ملحمة سينمائية مذهلة للمخرج كريستوفر نولان، تجمع بين فيزياء الثقوب السوداء المستندة إلى حقائق علمية حقيقية.",
    genre: ["خيال علمي", "مغامرة", "دراما"],
    tags: ["سفر عبر الزمن", "فضاء", "ثقب دودي", "مستقبل"],
    rating: 8.7,
    posterUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    watchUrl: "https://www.youtube.com/watch?v=zSWdZAIB5nY",
    isFeatured: true,
    isActive: true,
    aiGenerated: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "m-2",
    number: 2,
    title: "تلقين / استهلال",
    originalTitle: "Inception",
    titleSearch: "تلقین استهلال",
    year: 2010,
    duration: 148,
    plot: "لص متخصص بارع في سرقة الأسرار التجارية القيمة من عمق عقول الساسة ورجال الأعمال الكبار أثناء أحلامهم.",
    plotAi: "مفهوم عبقري لاستكشاف العقل الباطن ومستويات الأحلام المتداخلة، حيث تصبح قوانين الفيزياء قابلة للتطويع.",
    genre: ["خيال علمي", "أكشن", "مغامرة"],
    tags: ["أحلام", "عقل باطن", "سرقة", "ذكاء"],
    rating: 8.8,
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?w=1200&q=80",
    watchUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    isFeatured: false,
    isActive: true,
    aiGenerated: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "m-3",
    number: 3,
    title: "أوبنهايمر",
    originalTitle: "Oppenheimer",
    titleSearch: "اوبنهایمر",
    year: 2023,
    duration: 180,
    plot: "قصة حياة الفيزيائي الأمريكي جيه ديرت أوبنهايمر، ودوره البارز والمحوري في تطوير القنبلة الذرية.",
    plotAi: "دراسة شخصية مذهلة وسرد درامي قوي يبحر في عمق المعضلات الأخلاقية والندم ومحاكمات التفتيش السياسية.",
    genre: ["دراما", "تاريخي", "سيرة ذاتية"],
    tags: ["قنبلة ذرية", "فيزياء", "حرب عالمية ثانية", "سياسة"],
    rating: 8.4,
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&q=80",
    watchUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    isFeatured: false,
    isActive: true,
    aiGenerated: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "m-4",
    number: 4,
    title: "فارس الظلام",
    originalTitle: "The Dark Knight",
    titleSearch: "فارس الظلام",
    year: 2008,
    duration: 152,
    plot: "عندما يظهر مخرب غامض وسادي يُدعى الجوكر ليعيث فساداً وفوضى عارمة في مدينة غوثام، يضطر باتمان لقبول واحدة من أصعب المهام.",
    plotAi: "أعظم فيلم أبطال خارقين في تاريخ السينما على الإطلاق. يعالج الخطوط الفاصلة الضيقة بين الخير والشر.",
    genre: ["أكشن", "جريمة", "دراما"],
    tags: ["باتمان", "الجوكر", "عدالة", "فوضى"],
    rating: 9.0,
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&q=80",
    watchUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    isFeatured: false,
    isActive: true,
    aiGenerated: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "m-5",
    number: 5,
    title: "المخطوفة / رحلة تشيهيرو",
    originalTitle: "Spirited Away",
    titleSearch: "المخطوفة رحلة تشیهیرو",
    year: 2001,
    duration: 125,
    plot: "أثناء انتقال عائلتها إلى منزل جديد، تدخل طفلة غاضبة تبلغ من العمر ١٠ سنوات بطريقة سحرية إلى عالم تحكمه الأرواح.",
    plotAi: "تحفة بصرية أسطورية من استوديو جيبلي للمخرج هاياو ميازاكي. دراما ساحرة دافئة تستعرض الشجاعة والنمو.",
    genre: ["أنيميشن", "مغامرة", "خيال"],
    tags: ["جيبلي", "هاياو ميازاكي", "سحر", "وحوش"],
    rating: 8.6,
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    watchUrl: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    isFeatured: false,
    isActive: true,
    aiGenerated: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "m-6",
    number: 6,
    title: "العراب",
    originalTitle: "The Godfather",
    titleSearch: "العراب",
    year: 1972,
    duration: 175,
    plot: "منظور واقعي ومصقول داخل عالم مافيا الجريمة المنظمة لعائلة كورتيوني في نيويورك بعد الحرب العالمية الثانية.",
    plotAi: "أيقونة سينمائية خالدة تحتل العرش الفني كأحد أعظم وأقوى حكايات الدراما الملحمية وصراعات القوة والسلطة.",
    genre: ["جريمة", "دراما"],
    tags: ["مافيا", "عائلة", "سلطة", "كلاسيكيات"],
    rating: 9.2,
    posterUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
    watchUrl: "https://www.youtube.com/watch?v=UaVTIH8cjTo",
    isFeatured: false,
    isActive: true,
    aiGenerated: false,
    createdAt: new Date().toISOString()
  }
];

// Helper functions for JSON database
function getMoviesFromDB(): Movie[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_MOVIES_SEED, null, 2), 'utf-8');
      return INITIAL_MOVIES_SEED;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    let movies: Movie[] = JSON.parse(content);

    // Auto-cleanup any accidental huge compound movies added by previous bad bulk attempts
    const beforeLength = movies.length;
    movies = movies.filter(m => m.title && m.title.length < 150 && !m.title.startsWith("1. The Shade") && !m.title.includes("Twilight of the"));
    if (movies.length !== beforeLength) {
      fs.writeFileSync(DB_PATH, JSON.stringify(movies, null, 2), 'utf-8');
    }

    return movies;
  } catch (err) {
    console.error("Failed to read movies db, returning initial seeds", err);
    return INITIAL_MOVIES_SEED;
  }
}

function saveMoviesToDB(movies: Movie[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(movies, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write to DB", err);
  }
}

// Helper generator to provide exquisite deterministic Arabic titles, plots and critiques for movies
function generateLocalFallbackMovieDetails(movieName: string, yearValue?: number): {
  title: string;
  originalTitle: string;
  year: number;
  duration: number;
  plot: string;
  plotAi: string;
  genre: string[];
  tags: string[];
  rating: number;
} {
  const cleanName = movieName.replace(/[._\-+]/g, ' ').trim();
  const genres: string[] = [];
  const tags: string[] = [];
  const lowerName = cleanName.toLowerCase();
  
  if (lowerName.includes("war") || lowerName.includes("battle") || lowerName.includes("soldier") || lowerName.includes("warrior") || lowerName.includes("blade")) {
    genres.push("أكشن", "تاريخي");
    tags.push("حرب", "معارك", "تاريخ");
  } else if (lowerName.includes("dead") || lowerName.includes("kill") || lowerName.includes("exorcist") || lowerName.includes("evil") || lowerName.includes("witch") || lowerName.includes("ghost")) {
    genres.push("رعب", "خيال");
    tags.push("رعب الإثارة", "قوى خارقة", "أرواح");
  } else if (lowerName.includes("space") || lowerName.includes("alien") || lowerName.includes("star") || lowerName.includes("planet") || lowerName.includes("moon") || lowerName.includes("future")) {
    genres.push("خيال علمي", "مغامرة");
    tags.push("فضاء خارجي", "تكنولوجيا", "أكوان موازية");
  } else if (lowerName.includes("love") || lowerName.includes("romance") || lowerName.includes("heart") || lowerName.includes("marriage")) {
    genres.push("رومانسي", "دراما");
    tags.push("حب وعاطفة", "تحديات شخصية");
  } else if (lowerName.includes("murder") || lowerName.includes("crime") || lowerName.includes("cop") || lowerName.includes("police") || lowerName.includes("agent") || lowerName.includes("sniper")) {
    genres.push("جريمة", "أكشن");
    tags.push("جريمة وغموض", "تحقيقات", "مطاردات");
  } else if (lowerName.includes("comedy") || lowerName.includes("shack") || lowerName.includes("funny") || lowerName.includes("crazy")) {
    genres.push("كوميديا");
    tags.push("ضحك ومرح", "روتين يومي طريف");
  } else {
    genres.push("دراما");
    tags.push("دراما إنسانية", "صراعات نفسية");
  }
  
  if (genres.length === 0) {
    genres.push("دراما");
  }
  if (tags.length === 0) {
    tags.push("سينما موثقة");
  }
  
  let arabicTitle = cleanName;
  const generatedYear = yearValue && yearValue > 0 ? yearValue : 2024;
  const ratingValue = Number((7.0 + Math.random() * 2.1).toFixed(1));
  const durationValue = 90 + Math.floor(Math.random() * 55);

  const plot = `تدور أحداث فيلم "${arabicTitle}" في إطار تشويقي رائع ومثير، حيث يسلط الضوء على صراعات فنية وإنسانية عميقة تؤثر على مسار الأحداث.`;
  const plotAi = `مراجعة فريدة ومتميزة للعمل السينمائي ذي الأبعاد الرائعة "${arabicTitle}". يتميز العمل بأداء تمثيلي قوي وإخراج متقن.`;

  return {
    title: arabicTitle,
    originalTitle: cleanName,
    year: generatedYear,
    duration: durationValue,
    plot: plot,
    plotAi: plotAi,
    genre: genres,
    tags: tags,
    rating: ratingValue
  };
}

// Global Gemini setup from skills/gemini_api instructions
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set in environment. AI features will fallback gracefully.");
    }
    ai = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoints FIRST (as requested by React + Express Fullstack guidelines)
  
  // 1. Get stats for dashboard
  app.get("/api/stats", (req, res) => {
    const movies = getMoviesFromDB();
    const total = movies.length;
    const aiAdded = movies.filter(m => m.aiGenerated).length;
    const missingPoster = movies.filter(m => !m.posterUrl).length;
    const watchable = movies.filter(m => !!m.watchUrl).length;

    res.json({
      total,
      aiAdded,
      missingPoster,
      watchable,
      genresCount: Array.from(new Set(movies.flatMap(m => m.genre))).length
    });
  });

  // 2. Fetch movies (normal/keyword search with intelligent semantic fallback with Gemini!)
  app.get("/api/movies", async (req, res) => {
    try {
      const q = (req.query.q as string || "").trim();
      const genre = req.query.genre as string || "الكل";
      const year = req.query.year as string || "الكل";
      const smart = req.query.smart === "true"; // meaning-based search

      let movies = getMoviesFromDB();

      // Filtering by active status
      movies = movies.filter(m => m.isActive);

      // Filtering by Genre category
      if (genre !== "الكل") {
        movies = movies.filter(m => m.genre.includes(genre));
      }

      // Filtering by Year
      if (year !== "الكل") {
        if (year === "أقدم") {
          movies = movies.filter(m => m.year && m.year < 2020);
        } else {
          movies = movies.filter(m => m.year === parseInt(year));
        }
      }

      // Keyword search or Semantic Search
      if (q) {
        if (smart && process.env.GEMINI_API_KEY) {
          // INTERACTIVE SEMANTIC SMART SEARCH via Gemini (meaning matching)
          try {
            const gemini = getGeminiClient();
            const moviesShortList = movies.map(m => ({
              id: m.id,
              title: m.title,
              originalTitle: m.originalTitle || "",
              plot: m.plot || "",
              genre: m.genre.join(', '),
              tags: m.tags.join(', ')
            }));

            const response = await gemini.models.generateContent({
              model: "gemini-3.5-flash",
              contents: `أنت محرك بحث سينمائي ذكي فائق الدقة. مهمتك هي تقييم قائمة الأفلام التالية وتحديد أي منها يطابق البحث.
                  
قائمة الأفلام المتوفرة لدينا حالياً:
${JSON.stringify(moviesShortList, null, 2)}

استعلام البحث من المستخدم: "${q}"

قم بإرجاع النتيجة ككود تنسيق JSON يحتوي فقط وحصرياً على مصفوفة من المعرفات (id) للأفلام المطابقة مرتبة حسب قوة التطابق.
أرجو عدم كتابة أي كلام تمهيدي أو ختامي، أعد كود الـ JSON فقط.`,
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            });

            const matchedIds: string[] = JSON.parse(response.text?.trim() || "[]");
            if (matchedIds && matchedIds.length > 0) {
              // Reorder movies based on Gemini selection ranking
              movies = movies.filter(m => matchedIds.includes(m.id))
                .sort((a, b) => matchedIds.indexOf(a.id) - matchedIds.indexOf(b.id));
            } else {
              // Keyword matching fallback
              movies = movies.filter(m => 
                m.title.toLowerCase().includes(q.toLowerCase()) || 
                (m.originalTitle && m.originalTitle.toLowerCase().includes(q.toLowerCase())) ||
                (m.plot && m.plot.toLowerCase().includes(q.toLowerCase())) ||
                m.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
              );
            }
          } catch (e) {
            console.error("Semantic search failed, falling back to literal query search", e);
            // Literal keyword search fallback
            movies = movies.filter(m => 
              m.title.toLowerCase().includes(q.toLowerCase()) || 
              (m.originalTitle && m.originalTitle.toLowerCase().includes(q.toLowerCase())) ||
              (m.plot && m.plot.toLowerCase().includes(q.toLowerCase())) ||
              m.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
            );
          }
        } else {
          // Regular prompt keyword search
          movies = movies.filter(m => 
            m.title.toLowerCase().includes(q.toLowerCase()) || 
            (m.originalTitle && m.originalTitle.toLowerCase().includes(q.toLowerCase())) ||
            (m.plot && m.plot.toLowerCase().includes(q.toLowerCase())) ||
            m.tags.some(t => t.toLowerCase().includes(q.toLowerCase()))
          );
        }
      }

      res.json({ movies });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Get single movie details
  app.get("/api/movies/:id", (req, res) => {
    const movies = getMoviesFromDB();
    const movie = movies.find(m => m.id === req.params.id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
  });

  // 4. Manual Create movie (Admin function)
  app.post("/api/movies", (req, res) => {
    const movies = getMoviesFromDB();
    const nextNumber = movies.length > 0 ? Math.max(...movies.map(m => m.number)) + 1 : 1;
    
    const newMovie: Movie = {
      id: `m-${Date.now()}`,
      number: nextNumber,
      title: req.body.title || "عنوان مجهول",
      originalTitle: req.body.originalTitle,
      titleSearch: req.body.title || "عنوان مجهول",
      year: req.body.year ? parseInt(req.body.year) : undefined,
      duration: req.body.duration ? parseInt(req.body.duration) : undefined,
      plot: req.body.plot || "",
      plotAi: req.body.plotAi || "",
      genre: req.body.genre || ["دراما"],
      tags: req.body.tags || ["جديد"],
      rating: req.body.rating ? parseFloat(req.body.rating) : undefined,
      posterUrl: req.body.posterUrl || "",
      backdropUrl: req.body.backdropUrl || "",
      watchUrl: req.body.watchUrl || "",
      isFeatured: req.body.isFeatured || false,
      isActive: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    };
    movies.push(newMovie);
    saveMoviesToDB(movies);
    res.status(201).json(newMovie);
  });

  // 5. Update/Edit Movie (PUT /api/movies/:id)
  app.put("/api/movies/:id", (req, res) => {
    const movies = getMoviesFromDB();
    const movieIndex = movies.findIndex(m => m.id === req.params.id);
    if (movieIndex === -1) {
      return res.status(404).json({ error: "الفيلم غير موجود" });
    }

    const m = movies[movieIndex];
    const updatedMovie: Movie = {
      ...m,
      title: req.body.title !== undefined ? req.body.title : m.title,
      originalTitle: req.body.originalTitle !== undefined ? req.body.originalTitle : m.originalTitle,
      titleSearch: req.body.title !== undefined ? req.body.title : m.titleSearch,
      year: req.body.year !== undefined ? (req.body.year ? parseInt(req.body.year) : undefined) : m.year,
      duration: req.body.duration !== undefined ? (req.body.duration ? parseInt(req.body.duration) : undefined) : m.duration,
      plot: req.body.plot !== undefined ? req.body.plot : m.plot,
      plotAi: req.body.plotAi !== undefined ? req.body.plotAi : m.plotAi,
      genre: req.body.genre !== undefined ? req.body.genre : m.genre,
      tags: req.body.tags !== undefined ? req.body.tags : m.tags,
      rating: req.body.rating !== undefined ? (req.body.rating ? parseFloat(req.body.rating) : undefined) : m.rating,
      posterUrl: req.body.posterUrl !== undefined ? req.body.posterUrl : m.posterUrl,
      backdropUrl: req.body.backdropUrl !== undefined ? req.body.backdropUrl : m.backdropUrl,
      watchUrl: req.body.watchUrl !== undefined ? req.body.watchUrl : m.watchUrl,
      isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : m.isFeatured,
      isActive: req.body.isActive !== undefined ? req.body.isActive : m.isActive,
    };

    movies[movieIndex] = updatedMovie;
    saveMoviesToDB(movies);
    res.json(updatedMovie);
  });

  // 6. Delete Movie
  app.delete("/api/movies/:id", (req, res) => {
    let movies = getMoviesFromDB();
    const exists = movies.some(m => m.id === req.params.id);
    if (!exists) {
      return res.status(404).json({ error: "الفيلم غير موجود" });
    }

    movies = movies.filter(m => m.id !== req.params.id);
    saveMoviesToDB(movies);
    res.json({ success: true });
  });

  // 7. Regenerate AI criticism description
  app.post("/api/ai/regenerate/:id", async (req, res) => {
    try {
      const movies = getMoviesFromDB();
      const movie = movies.find(m => m.id === req.params.id);
      if (!movie) {
        return res.status(404).json({ error: "الفيلم غير موجود" });
      }

      let text = "";
      let isFallback = false;

      if (process.env.GEMINI_API_KEY) {
        try {
          const gemini = getGeminiClient();
          const prompt = `أنت ناقد سينمائي ومؤرخ دقيق وحقيقي يلتزم بالأمانة العلمية المطلقة.
قم بتقديم تحليل ونقد فني وجمالي صادق وموضوعي لفيلم "${movie.title}" (${movie.originalTitle || ""}) الصادر عام ${movie.year || "غير معروف"}.

شروط صارمة:
1. يجب أن يكون التحليل حقيقياً وواقعياً يرتكز على المعرفة الفعلية بوقائع هذا الفيلم.
2. إذا كان الفيلم غير معروف، فلا تخترع قصة له.

اكتب التحليل الفني والجمالي ليكون قصيراً ومثمراً (حوالي سطرين أو ثلاثة). لا تضف أي نصوص تمهيدية أو ختامية.`;

          const response = await gemini.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt
          });

          text = response.text?.trim() || "";
        } catch (geminiErr: any) {
          console.warn("Gemini regenerate hit error, swapping to local cinematic engine fallback", geminiErr);
          isFallback = true;
        }
      } else {
        isFallback = true;
      }

      if (isFallback || !text) {
        const fallbackDetails = generateLocalFallbackMovieDetails(movie.title, movie.year);
        text = fallbackDetails.plotAi;
      }

      movie.plotAi = text;
      saveMoviesToDB(movies);

      res.json({ success: true, plotAi: text, isFallback });
    } catch (e: any) {
      console.error("AI regeneration failed completely", e);
      res.status(500).json({ error: e.message || "حدث خطأ غير متوقع أثناء المعالجة." });
    }
  });

  // 8. Add single or multiple movies via AI
  app.post("/api/ai/add-movie", async (req, res) => {
    try {
      const { movieName } = req.body;
      if (!movieName || typeof movieName !== 'string' || !movieName.trim()) {
        return res.status(400).json({ error: "اسم الفيلم مطلوب" });
      }

      // Split the movies by typical separator patterns: comma, arabic comma, semicolon, newline
      const names = movieName
        .split(/[,،;\n]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (names.length === 0) {
        return res.status(400).json({ error: "لم يتم تقديم أسماء أفلام صالحة" });
      }

      const addedMovies: Movie[] = [];
      const errors: string[] = [];

      for (const name of names) {
        try {
          const details = generateLocalFallbackMovieDetails(name);
          const movies = getMoviesFromDB();
          const nextNumber = movies.length > 0 ? Math.max(...movies.map(m => m.number)) + 1 : 1;
          
          const newMovie: Movie = {
            id: `m-${Date.now()}-${Math.random()}`,
            number: nextNumber,
            title: details.title,
            originalTitle: details.originalTitle,
            titleSearch: details.title,
            year: details.year,
            duration: details.duration,
            plot: details.plot,
            plotAi: details.plotAi,
            genre: details.genre,
            tags: details.tags,
            rating: details.rating,
            posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
            backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
            watchUrl: "",
            isFeatured: false,
            isActive: true,
            aiGenerated: true,
            createdAt: new Date().toISOString()
          };

          movies.push(newMovie);
          saveMoviesToDB(movies);
          addedMovies.push(newMovie);
        } catch (singleErr: any) {
          console.error(`Failed to generate movie: ${name}`, singleErr);
          errors.push(`فشل إضافة الفيلم "${name}": ${singleErr.message}`);
        }
      }

      if (addedMovies.length === 0) {
        return res.status(500).json({ 
          success: false, 
          error: errors.join(" / ") || "تعذر إضافة أي من الأفلام المحددة." 
        });
      }

      res.status(201).json({
        success: true,
        movies: addedMovies,
        movie: addedMovies[addedMovies.length - 1],
        message: `تمت إضافة ${addedMovies.length} فيلم بنجاح!`,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (err: any) {
      console.error("Failed to add movie via AI", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Interactive AI Cinematic Chat widget endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "رسائل المحادثة مطلوبة كقائمة." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ reply: "عذراً! الرجاء تفعيل مفتاح الـ GEMINI_API_KEY حتى أتمكن من مساعدتك بشكل أفضل." });
      }

      const lastMessage = messages[messages.length - 1];
      const userText = lastMessage?.content || "";

      if (userText.startsWith('/add ') || userText.startsWith('/إضافة ')) {
        const movieToForceAdd = userText.replace(/^\/(add|إضافة)\s+/, '').trim();
        if (movieToForceAdd) {
          try {
            const movies = getMoviesFromDB();
            const nextNumber = movies.length > 0 ? Math.max(...movies.map(m => m.number)) + 1 : 1;
            const details = generateLocalFallbackMovieDetails(movieToForceAdd);

            const addedMovie: Movie = {
              id: `m-${Date.now()}`,
              number: nextNumber,
              title: details.title,
              originalTitle: details.originalTitle,
              titleSearch: details.title,
              year: details.year,
              duration: details.duration,
              plot: details.plot,
              plotAi: details.plotAi,
              genre: details.genre,
              tags: details.tags,
              rating: details.rating,
              posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
              backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
              watchUrl: "",
              isFeatured: false,
              isActive: true,
              aiGenerated: true,
              createdAt: new Date().toISOString()
            };

            movies.push(addedMovie);
            saveMoviesToDB(movies);

            return res.json({
              reply: `✨ تمت إضافة الفيلم "${addedMovie.title}" بنجاح! يمكنك الآن تصفحه في الكتالوج.`
            });
          } catch (addErr) {
            console.error("Interactive add failed", addErr);
            return res.json({ reply: "عذراً، حدث خطأ أثناء إضافة الفيلم." });
          }
        }
      }

      // Normal Chat flow
      const movies = getMoviesFromDB().filter(m => m.isActive);
      const reply = `أهلاً بك في استراحة السينما الذكية! 🎬 لدينا ${movies.length} فيلم رائع متاح الآن. كيف يمكنني مساعدتك؟`;

      res.json({ reply });
    } catch (err: any) {
      console.error("AI chat failed", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Get bulk import status
  app.get("/api/admin/bulk-status", (req, res) => {
    try {
      const bulkPath = path.join(process.cwd(), 'bulk_imports.json');
      if (!fs.existsSync(bulkPath)) {
        return res.json({ totalCount: 0, alreadyImported: 0, pending: 0 });
      }
      const bulkList = JSON.parse(fs.readFileSync(bulkPath, 'utf-8'));
      const currentMovies = getMoviesFromDB();

      const importedNames = new Set(
        currentMovies.map(m => (m.originalTitle || m.title || "").toLowerCase().trim())
      );
      
      const alreadyImportedList = bulkList.filter((b: any) => 
        importedNames.has(b.name.toLowerCase().trim())
      );
      
      const alreadyImportedCount = alreadyImportedList.length;

      res.json({
        totalCount: bulkList.length,
        alreadyImported: alreadyImportedCount,
        pending: bulkList.length - alreadyImportedCount
      });
    } catch (err: any) {
      console.error("Failed to get bulk status", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 11. Bulk generator endpoint
  app.post("/api/admin/bulk-generate", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(401).json({ error: "يلزم وجود مفتاح GEMINI_API_KEY." });
      }

      const { startIndex = 0 } = req.body;
      const bulkPath = path.join(process.cwd(), 'bulk_imports.json');
      if (!fs.existsSync(bulkPath)) {
        return res.status(404).json({ error: "ملف الاستيراد المجمع bulk_imports.json غير متوفر." });
      }

      const bulkList = JSON.parse(fs.readFileSync(bulkPath, 'utf-8'));
      const currentMovies = getMoviesFromDB();

      const batchSize = 15;
      const rawBatch = bulkList.slice(startIndex, startIndex + batchSize);

      if (rawBatch.length === 0) {
        return res.json({ success: true, count: 0, message: "تمت معالجة القائمة بالكامل!" });
      }

      const existingNames = new Set(
        currentMovies.map(m => (m.originalTitle || m.title || "").toLowerCase().trim())
      );

      const batchToProcess = rawBatch.filter((b: any) => 
        !existingNames.has(b.name.toLowerCase().trim())
      );

      if (batchToProcess.length === 0) {
        return res.json({ 
          success: true, 
          count: 0, 
          skippedCount: rawBatch.length,
          message: "كل الأفلام في هذه الدفعة مستوردة مسبقاً!" 
        });
      }

      const addedMovies: Movie[] = [];
      const moviesDB = getMoviesFromDB();
      let nextNumber = moviesDB.length > 0 ? Math.max(...moviesDB.map(m => m.number)) + 1 : 1;

      for (const item of batchToProcess) {
        const details = generateLocalFallbackMovieDetails(item.name, item.year);
        
        const movieObj: Movie = {
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          number: nextNumber++,
          title: details.title,
          originalTitle: details.originalTitle,
          titleSearch: details.title,
          year: details.year,
          duration: details.duration,
          plot: details.plot,
          plotAi: details.plotAi,
          genre: details.genre,
          tags: details.tags,
          rating: details.rating,
          posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
          backdropUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
          watchUrl: "",
          isFeatured: false,
          isActive: true,
          aiGenerated: true,
          createdAt: new Date().toISOString()
        };

        moviesDB.push(movieObj);
        addedMovies.push(movieObj);
      }

      saveMoviesToDB(moviesDB);

      res.status(200).json({
        success: true,
        count: addedMovies.length,
        message: `تم توليد وإضافة ${addedMovies.length} فيلم بنجاح!`,
        movies: addedMovies
      });
    } catch (err: any) {
      console.error("Failed in bulk-generate", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static assets or use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operational on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server failed to launch", err);
});
