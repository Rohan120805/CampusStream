import api from '../lib/api';
import { Video, VideoFilters } from '../types';

export const videoService = {
  getAllVideos: async (params?: VideoFilters) => {
    const { data } = await api.get('/videos', { params });
    return data;
  },

  getAllSubjects: async (): Promise<string[]> => {
    // Public endpoint – the api instance's auth interceptor only adds the
    // Bearer token when one is present in localStorage, so this is safe to
    // call both with and without an active session.
    const { data } = await api.get('/videos/subjects/all');
    return data.data;
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

  getTranscript: async (id: string) => {
    const { data } = await api.get(`/videos/${id}/transcript`);
    return data;
  },

  updateTranscription: async (id: string, formData: FormData) => {
    const { data } = await api.put(`/videos/${id}/transcript`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  generateTranscript: async (id: string) => {
    const { data } = await api.post(`/videos/${id}/generate-transcript`);
    return data;
  },

  getRelatedVideos: async (id: string, limit: number = 6) => {
    const { data } = await api.get(`/videos/${id}/related`, { params: { limit } });
    return data;
  },

  incrementShareCount: async (id: string) => {
    const { data } = await api.post(`/videos/${id}/share`);
    return data;
  },

  updateChapters: async (id: string, chapters: any[]) => {
    const { data } = await api.put(`/videos/${id}/chapters`, { chapters });
    return data;
  },
};

export default videoService;
