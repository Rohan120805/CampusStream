import api from '../lib/api';
import { Video, VideoFilters } from '../types';

export const videoService = {
  getAllVideos: async (params?: VideoFilters) => {
    const { data } = await api.get('/videos', { params });
    return data;
  },

  getVideoById: async (id: string): Promise<Video> => {
    const { data } = await api.get(`/videos/${id}`);
    return data.data;
  },

  uploadVideo: async (formData: FormData) => {
    const { data } = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  updateVideo: async (id: string, videoData: Partial<Video>) => {
    const { data } = await api.put(`/videos/${id}`, videoData);
    return data;
  },

  deleteVideo: async (id: string) => {
    const { data } = await api.delete(`/videos/${id}`);
    return data;
  },

  toggleLike: async (id: string) => {
    const { data } = await api.post(`/videos/${id}/like`);
    return data;
  },

  getMyVideos: async () => {
    const { data } = await api.get('/videos/user/my-videos');
    return data;
  },
};

export default videoService;
