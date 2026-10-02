import api from './axios';

export const register = (data) => {
  return api.post('/register', data);
};

export const login = (data) => {
  return api.post('/login', data);
};
export const getCurrentUser = () => {
  return api.get('/user');
};