export interface Movie {
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

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Stats {
  total: number;
  aiAdded: number;
  missingPoster: number;
  watchable: number;
  genresCount: number;
}
