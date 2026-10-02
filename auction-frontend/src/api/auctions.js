import api from './axios';

export const getAuctions = () => {
  return api.get('/auctions');
};

export const getAuctionById = (id) => {
  return api.get(`/auctions/${id}`);
};

// Updated to explicitly pass multipart/form-data header for file uploads
export const createProduct = (data) => {
  return api.post('/products', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getProducts = () => {
  return api.get('/products');
};

export const placeBid = (auctionId, data) => {
  return api.post('/bids', {
    auction_id: auctionId,
    amount: data.amount,
  });
};