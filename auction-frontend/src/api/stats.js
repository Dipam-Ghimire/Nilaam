import api from './axios';

export const getMyStats = () => {
  return api.get('/my-stats');
};

export const getMarketplaceStats = () => {
  return api.get('/marketplace-stats');
};