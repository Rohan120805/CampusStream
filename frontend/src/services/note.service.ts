import api from '../lib/api';

export interface Note {
  _id: string;
  user: string;
  video: string;
  content: string;
  timestamp: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export const noteService = {
  createNote: async (videoId: string, content: string, timestamp: number) => {
    const { data } = await api.post('/notes', { videoId, content, timestamp });
    return data;
  },

  getNotesByVideo: async (videoId: string) => {
    const { data } = await api.get(`/notes/video/${videoId}`);
    return data;
  },

  getAllUserNotes: async () => {
    const { data } = await api.get('/notes/user');
    return data;
  },

  updateNote: async (id: string, content: string, timestamp?: number) => {
    const { data } = await api.put(`/notes/${id}`, { content, timestamp });
    return data;
  },

  deleteNote: async (id: string) => {
    const { data } = await api.delete(`/notes/${id}`);
    return data;
  },
};

export default noteService;
