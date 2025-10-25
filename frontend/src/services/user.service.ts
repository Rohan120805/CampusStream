import api from '../lib/api';

export const userService = {
  getUserProfile: async (id: string) => {
    const { data } = await api.get(`/users/profile/${id}`);
    return data;
  },

  toggleFollow: async (id: string) => {
    const { data } = await api.post(`/users/follow/${id}`);
    return data;
  },

  toggleBookmark: async (videoId: string) => {
    const { data } = await api.post(`/users/bookmark/${videoId}`);
    return data;
  },

  toggleWatchLater: async (videoId: string) => {
    const { data } = await api.post(`/users/watch-later/${videoId}`);
    return data;
  },

  getBookmarks: async () => {
    const { data } = await api.get('/users/bookmarks');
    return data;
  },

  getWatchLater: async () => {
    const { data } = await api.get('/users/watch-later');
    return data;
  },

  getWatchHistory: async () => {
    const { data } = await api.get('/users/watch-history');
    return data;
  },

  updateWatchPosition: async (videoId: string, position: number) => {
    const { data } = await api.post(`/users/watch-position/${videoId}`, { position });
    return data;
  },

  getWatchPosition: async (videoId: string) => {
    const { data } = await api.get(`/users/watch-position/${videoId}`);
    return data;
  },

  clearWatchHistory: async () => {
    const { data } = await api.delete('/users/watch-history');
    return data;
  },
};

export default userService;
