import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../api/payments';

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const pidx = searchParams.get('pidx');
    const orderId = searchParams.get('purchase_order_id');
    if (!pidx || !orderId) {
      setStatus('error');
      return;
    }
    verifyPayment(pidx, orderId)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {status === 'checking' && <p className="text-gray-500">Verifying your payment with Khalti...</p>}
      {status === 'success' && (
        <>
          <p className="text-emerald-700 font-semibold text-lg mb-4">Payment verified. Funds are held pending your delivery confirmation.</p>
          <button onClick={() => navigate('/my-orders')} className="px-4 py-2 bg-blue-600 text-white rounded">Go to My Orders</button>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-red-600 font-semibold text-lg mb-4">We couldn't verify this payment.</p>
          <button onClick={() => navigate('/my-orders')} className="px-4 py-2 bg-blue-600 text-white rounded">Go to My Orders</button>
        </>
      )}
    </div>
  );
}

export default PaymentCallback;