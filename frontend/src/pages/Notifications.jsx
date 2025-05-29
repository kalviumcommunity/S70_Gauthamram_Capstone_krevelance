import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import {
  Bell, LineChart, CreditCard, FileText, UserCheck,
  CheckCircle, AlertTriangle, Info, Trash2, BarChart
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar1 from '../components/layout/Navbar1';
import PageHeader from '../components/ui-custom/PageHeader';
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";

const getIconByCategory = (category) => {
  switch (category) {
    case 'market': return <LineChart className="h-5 w-5" />;
    case 'subscription': return <CreditCard className="h-5 w-5" />;
    case 'report': return <FileText className="h-5 w-5" />;
    case 'login': return <UserCheck className="h-5 w-5" />;
    case 'data': return <BarChart className="h-5 w-5" />;
    default: return <Bell className="h-5 w-5" />;
  }
};

const getIconByType = (type) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'info': return <Info className="h-5 w-5 text-blue-500" />;
    default: return <Bell className="h-5 w-5 text-gray-400" />;
  }
};

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to load notifications.";
        setError(errorMsg);
        toast.error(errorMsg, { position: "top-right", theme: "dark" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);

    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      try {
        await api.put(`/notifications/${id}/read`);
        toast.success(`Notification "${notification.title}" marked as read.`, { position: "top-right", theme: "dark" });
      } catch (err) {
        setNotifications(notifications);
        toast.error("Failed to mark as read.", { position: "top-right", theme: "dark" });
      }
    }
  };
  
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    try {
      await api.put('/notifications/mark-all-read');
      toast.success("All notifications marked as read.", { position: "top-right", theme: "dark" });
    } catch (err) {
      toast.error("Failed to mark all as read. Please refresh.", { position: "top-right", theme: "dark" });
    }
  };

  const deleteNotification = async (id) => {
    const toDelete = notifications.find(n => n.id === id);
    setNotifications(notifications.filter(n => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
      toast[toDelete?.type || 'info']?.(`Notification "${toDelete?.title}" deleted.`, {
        position: "top-center", theme: "dark"
      }) || toast.info(`Notification "${toDelete?.title}" deleted.`, { position: "top-center", theme: "dark" });
    } catch (err) {
      setNotifications([...notifications, toDelete]);
      toast.error("Failed to delete notification.", { position: "top-center", theme: "dark" });
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.category === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-container mt-10 py-8 text-left">
      <Navbar1 />
      <PageHeader
        title="Notifications"
        description="Stay updated with all your important alerts and notifications"
      />
      <ToastContainer />
      <div className="mt-8 space-y-6">
        <div className="flex flex-wrap justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-5">
            {['all', 'market', 'subscription',  'report', 'login', 'data'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`flex items-center rounded-lg p-2 transition-all duration-200 ${
                  filter === cat ? 'bg-[#0FCE7C]/30 text-[#0fce7c] scale-105' : 'bg-[#565656] text-white  hover:text-white'
                }`}
              >
                {getIconByCategory(cat)}
                <div className="ml-1 capitalize">{cat}</div>
                {cat === 'all' && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs leading-tight">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Mark All as Read
          </button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill().map((_, i) => <Skeleton key={i} height={80} />)
          ) : error ? (
            <div className="text-red-400">Error: {error}</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-gray-400">No notifications to show.</div>
          ) : (
            <AnimatePresence>
              {filteredNotifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg shadow-md flex items-start justify-between ${notification.read ? 'bg-gray-700/60' : 'bg-[#1F1F1F]'}`}
                >
                  <div className="flex items-start gap-3">
                    {getIconByType(notification.type)}
                    <div>
                      <h4 className="text-white font-semibold">{notification.title}</h4>
                      <p className="text-sm text-gray-300">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {!notification.read && (
                      <button onClick={() => markAsRead(notification.id)} className="text-sm text-blue-400 hover:underline">
                        Mark as Read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notification.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
