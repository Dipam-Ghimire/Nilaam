import { useEffect, useRef, useState } from 'react';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notifications';
import { useNavigate } from 'react-router-dom';


function NotificationBell() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);

  async function loadNotifications() {
    try {
      const response = await getNotifications();

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error.response?.data || error
      );
    }
  }

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 15 seconds.
    const interval = setInterval(loadNotifications, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function handleNotificationClick(notification) {
    try {
      if (!notification.read_at) {
        await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item
          )
        );

        setUnreadCount((count) => Math.max(0, count - 1));
      }

      setOpen(false);

      const url = notification.data?.url;

      if (url) {
        navigate(url);
      }
    } catch (error) {
      console.error(
        'Failed to open notification:',
        error.response?.data || error
      );
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) return;

    setLoading(true);

    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        'Failed to mark notifications as read:',
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  }

  function formatTime(date) {
    if (!date) return '';

    return new Date(date).toLocaleString();
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      {/* Notification Button */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink-2 hover:bg-gray-300 transition"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.6"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Unread Count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-[360px] bg-white border border-line rounded-xl shadow-xl overflow-hidden z-50">

          {/* Header */}
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ink">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <p className="text-xs text-ink-3 mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-xs font-medium text-primary hover:text-primary-hover disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="max-h-[420px] overflow-y-auto">

            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="text-3xl mb-2">
                  🔔
                </div>

                <p className="text-sm font-medium text-ink">
                  No notifications
                </p>

                <p className="text-xs text-ink-3 mt-1">
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.read_at;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className={`w-full text-left px-4 py-3 border-b border-line hover:bg-canvas transition ${
                      isUnread ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex gap-3">

                      {/* Status dot */}
                      <div className="pt-1.5">
                        <span
                          className={`block w-2.5 h-2.5 rounded-full ${
                            isUnread
                              ? 'bg-primary'
                              : 'bg-gray-300'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">

                        <p
                          className={`text-sm ${
                            isUnread
                              ? 'font-semibold text-ink'
                              : 'font-medium text-ink-2'
                          }`}
                        >
                          {notification.data?.title}
                        </p>

                        <p className="text-xs text-ink-3 mt-1 leading-relaxed">
                          {notification.data?.message}
                        </p>

                        <p className="text-[10px] text-ink-3 mt-2">
                          {formatTime(notification.created_at)}
                        </p>

                      </div>
                    </div>
                  </button>
                );
              })
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;