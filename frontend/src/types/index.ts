export interface User {
  _id: string;
  auth0Id: string;
  email: string;
  name: string;
  picture: string;
  role: 'user';
  department?: string;
  uploadedVideos: string[];
  playlists: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  uploadedBy: User;
  subject: string;
  topics: string[];
  tags: string[];
  semester: string;
  views: number;
  likes: string[];
  transcript?: string;
  summary?: string;
  isPublic: boolean;
  isApproved: boolean;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  createdBy: User;
  videos: Video[];
  subject: string;
  semester: string;
  isPublic: boolean;
  isSyllabusBased: boolean;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  videoId: string;
  userId: User;
  text: string;
  parentComment: string | null;
  isQuestion: boolean;
  isAnswer: boolean;
  likes: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface VideoFilters {
  page?: number;
  limit?: number;
  subject?: string;
  semester?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
