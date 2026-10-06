import api from './axios';

export const createProduct = (data) => {
  return api.post('/products', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export function getProducts(params = {}) {
  return api.get('/products', {
    params,
  });
}

export const getMyProducts = () => {
  return api.get('/my-products');
};

export const createAuction = (data) => {
  return api.post('/auctions', data);
};