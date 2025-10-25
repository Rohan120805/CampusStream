import api from '../lib/api';
import { User } from '../types';

export const authService = {
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.put('/auth/profile', userData);
    return data.data;
  },

  logout: () => {
    localStorage.removeItem('auth0_token');
  },
};

export default authService;
