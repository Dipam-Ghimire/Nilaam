import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import { formatCurrency } from '../../utils/formatCurrency';
import Badge from '../ui/Badge';

export default function AuctionCard({ auction }) {
  const {
    id,
    title,
    image_url,
    current_bid,
    starting_price,
    end_time,
    status = 'active',
  } = auction;

  return (
    <Link
      to={`/auctions/${id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
    >
      <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
        <img
          src={image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={status === 'active' ? 'success' : 'gray'}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {title}
          </h3>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Current Bid</p>
            <p className="font-bold text-gray-900">
              {formatCurrency(current_bid || starting_price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Time Left</p>
            <CountdownTimer endTime={end_time} />
          </div>
        </div>
      </div>
    </Link>
  );
}