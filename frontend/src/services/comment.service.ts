import api from '../lib/api';
import { Comment } from '../types';

export const commentService = {
  getCommentsByVideoId: async (videoId: string): Promise<Comment[]> => {
    const { data } = await api.get(`/comments/video/${videoId}`);
    return data.data;
  },

  createComment: async (commentData: {
    videoId: string;
    text: string;
    parentComment?: string;
    isQuestion?: boolean;
  }): Promise<Comment> => {
    const { data } = await api.post('/comments', commentData);
    return data.data;
  },

  updateComment: async (id: string, text: string): Promise<Comment> => {
    const { data } = await api.put(`/comments/${id}`, { text });
    return data.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },

  toggleLike: async (id: string): Promise<Comment> => {
    const { data } = await api.post(`/comments/${id}/like`);
    return data.data;
  },
};

export default commentService;
