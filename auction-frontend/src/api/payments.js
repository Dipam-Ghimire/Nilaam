import api from './axios';

export const getMyOrders = () => api.get('/my-orders');
export const getMySales = () => api.get('/my-sales');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const payForOrder = (id) => api.post(`/orders/${id}/pay`);
export const verifyPayment = (pidx, orderId) => api.post('/payment/verify', { pidx, order_id: orderId });
export const confirmReceipt = (id) => api.post(`/orders/${id}/confirm-receipt`);