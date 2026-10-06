import api from './axios';

export function getNotifications() {
  return api.get('/notifications');
}

export function markNotificationAsRead(id) {
  return api.post(`/notifications/${id}/read`);
}

export function markAllNotificationsAsRead() {
  return api.post('/notifications/read-all');
}