import api from './axios';

export const getUserDashboard = async () => {
  const response = await api.get('/user/dashboard');
  return response.data;
};

export const getWatchlist = async () => {
  const response = await api.get('/user/watchlist');
  return response.data;
};

export const toggleWatchlist = async (auctionId) => {
  const response = await api.post(`/user/watchlist/${auctionId}`);
  return response.data;
};

export const uploadKYC = async (formData) => {
  const response = await api.post('/user/kyc', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};