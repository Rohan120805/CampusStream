import api from '../lib/api';
import { Playlist } from '../types';

export const playlistService = {
  getAllPlaylists: async (params?: {
    page?: number;
    limit?: number;
    subject?: string;
    semester?: string;
  }): Promise<Playlist[]> => {
    const { data } = await api.get('/playlists', { params });
    return data.data;
  },

  getPlaylistById: async (id: string): Promise<Playlist> => {
    const { data } = await api.get(`/playlists/${id}`);
    return data.data;
  },

  createPlaylist: async (playlistData: {
    name: string;
    description: string;
    subject: string;
    semester: string;
    isPublic?: boolean;
  }): Promise<Playlist> => {
    const { data } = await api.post('/playlists', playlistData);
    return data.data;
  },

  updatePlaylist: async (
    id: string,
    playlistData: Partial<Playlist>
  ): Promise<Playlist> => {
    const { data } = await api.put(`/playlists/${id}`, playlistData);
    return data.data;
  },

  deletePlaylist: async (id: string): Promise<void> => {
    await api.delete(`/playlists/${id}`);
  },

  addVideoToPlaylist: async (
    playlistId: string,
    videoId: string
  ): Promise<Playlist> => {
    const { data } = await api.post(`/playlists/${playlistId}/videos`, {
      videoId,
    });
    return data.data;
  },

  removeVideoFromPlaylist: async (
    playlistId: string,
    videoId: string
  ): Promise<Playlist> => {
    const { data } = await api.delete(
      `/playlists/${playlistId}/videos/${videoId}`
    );
    return data.data;
  },

  getMyPlaylists: async (): Promise<Playlist[]> => {
    const { data } = await api.get('/playlists/user/my-playlists');
    return data.data;
  },
};

export default playlistService;
