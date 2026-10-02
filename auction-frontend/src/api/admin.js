import api from './axios';

export const getStats = () => api.get('/admin/stats');
export const getPendingProducts = () => api.get('/admin/products/pending');
export const approveProduct = (id) => api.post(`/admin/products/${id}/approve`);
export const rejectProduct = (id) => api.post(`/admin/products/${id}/reject`);
export const getPendingKyc = () => api.get('/admin/kyc/pending');
export const verifyKyc = (id) => api.post(`/admin/kyc/${id}/verify`);
export const rejectKyc = (id) => api.post(`/admin/kyc/${id}/reject`);