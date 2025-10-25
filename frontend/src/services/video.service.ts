import api from '../lib/api';
import axios from 'axios';
import { Video, VideoFilters } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const videoService = {
  getAllVideos: async (params?: VideoFilters) => {
    const { data } = await api.get('/videos', { params });
    return data;
  },

  getAllSubjects: async (): Promise<string[]> => {
    // Use axios directly to bypass auth interceptor for public endpoint
    const { data } = await axios.get(`${API_URL}/videos/subjects/all`);
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
