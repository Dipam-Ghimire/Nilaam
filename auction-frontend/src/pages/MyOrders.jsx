import { useState, useEffect } from 'react';
import { getMyOrders, payForOrder, confirmReceipt } from '../api/payments';

const STORAGE_URL = 'http://127.0.0.1:8000/storage';

const statusLabels = {
  pending_payment: { text: 'Payment Required', color: 'bg-yellow-100 text-yellow-700' },
  paid_escrow: { text: 'Paid — Held Pending Delivery', color: 'bg-blue-100 text-blue-700' },
  completed: { text: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { text: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
  refunded: { text: 'Refunded', color: 'bg-red-100 text-red-700' },
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  function load() {
    getMyOrders().then((r) => setOrders(r.data));
  }

  useEffect(() => { load(); }, []);

  async function handlePay(order) {
    setLoading(true);
    try {
      const response = await payForOrder(order.id);
      window.location.href = response.data.payment_url;
    } catch (error) {
      alert(error.response?.data?.message || 'Could not start payment');
      setLoading(false);
    }
  }

  async function handleConfirm(order) {
    if (!window.confirm('Confirm you received this item? This releases payment to the seller.')) return;
    try {
      await confirmReceipt(order.id);
      load();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not confirm receipt');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't won any auctions yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const product = order.auction?.product;
            const label = statusLabels[order.status] || { text: order.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
                {product?.image_url ? (
                  <img src={`${STORAGE_URL}/${product.image_url}`} className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900">{product?.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${label.color}`}>{label.text}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Sold by {order.seller?.name}</p>
                  <p className="text-gray-900 font-bold mt-1">Rs. {order.final_price}</p>
                </div>
                {order.status === 'pending_payment' && (
                  <button disabled={loading} onClick={() => handlePay(order)} className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition disabled:opacity-50">
                    Pay with Khalti
                  </button>
                )}
                {order.status === 'paid_escrow' && (
                  <button onClick={() => handleConfirm(order)} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition">
                    Confirm Receipt
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;