import React, { useState } from 'react';
import PageHeader from '../components/ui-custom/PageHeader';
import {Bell,LineChart,CreditCard,FileText,UserCheck,CheckCircle,AlertTriangle,Info} from 'lucide-react';
import Navbar1 from '../components/layout/Navbar1';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Market Trend Change',
      message: 'The market has shown a positive trend with 15% increase in the technology sector.',
      time: '2 hours ago',
      type: 'info',
      category: 'market',
      read: false
    },
    {
      id: 2,
      title: 'Report Generated',
      message: 'Your Q2 financial report has been successfully generated and is ready for download.',
      time: '5 hours ago',
      type: 'success',
      category: 'report',
      read: false
    },
    {
      id: 3,
      title: 'Subscription Renewal',
      message: 'Your premium subscription will renew in 7 days. Please ensure your payment method is up to date.',
      time: '1 day ago',
      type: 'warning',
      category: 'subscription',
      read: false
    },
    {
      id: 4,
      title: 'New Login Detected',
      message: 'A new login was detected from New York, USA at 9:45 AM today.',
      time: '10 hours ago',
      type: 'info',
      category: 'login',
      read: false
    },
    {
      id: 5,
      title: 'Market Alert',
      message: 'Significant volatility detected in market trends. Consider reviewing your portfolio.',
      time: '3 days ago',
      type: 'warning',
      category: 'market',
      read: true
    },
    {
      id: 6,
      title: 'Monthly Report Available',
      message: 'Your monthly financial summary report is now available for review.',
      time: '4 days ago',
      type: 'success',
      category: 'report',
      read: true
    },
    {
      id: 7,
      title: 'User Login',
      message: 'A user logged into the system from a new device in San Francisco.',
      time: '5 days ago',
      type: 'info',
      category: 'login',
      read: true
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.category === filter);
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const getIconByCategory = (category) => {
    switch (category) {
      case 'market':
        return <LineChart className="h-5 w-5" />;
      case 'subscription':
        return <CreditCard className="h-5 w-5" />;
      case 'report':
        return <FileText className="h-5 w-5" />;
      case 'login':
        return <UserCheck className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
      <div className="page-container mt-10 py-8 text-left">
        <Navbar1/>
        <PageHeader
          title="Notifications"
          description="Stay updated with all your important alerts and notifications"
        />

        <div className="mt-8 space-y-6">
          <div className="flex sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-5">
              <button
              className='flex bg-[#565656] rounded-lg p-2 hover:text-white hover:bg-[#0FCE7C] hover:scale-105'
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                <Bell className="mr-1 mt-1 h-4 w-4" /> All
                {unreadCount > 0 && (
                  <span className="ml-1 mt-1 bg-red-500 text-white rounded-full px-2 py-0.5 h-5 text-xs">{unreadCount}</span>
                )}
              </button>
              <button
              className='flex bg-[#565656]   rounded-lg p-2 hover:text-white hover:bg-[#0FCE7C] hover:scale-105'
                variant={filter === 'market' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('market')}
              >
                <LineChart className="mr-1 mt-1 h-4 w-4  " /> Market
              </button>

              <button
              className='flex bg-[#565656]   rounded-lg p-2 hover:text-white hover:bg-[#0FCE7C] hover:scale-105'
                variant={filter === 'subscription' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('subscription')}
              >
                <CreditCard className="mr-1 mt-1 h-4 w-4" /> Subscription
              </button>
              <button
              className='flex bg-[#565656] rounded-lg p-2 hover:text-white hover:bg-[#0FCE7C] hover:scale-105'
                variant={filter === 'report' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('report')}
              >
                <FileText className="mr-1 mt-1 h-4 w-4" /> Reports
              </button>
              <button
              className='flex bg-[#565656] rounded-lg p-2 hover:text-white hover:bg-[#0FCE7C] hover:scale-105'
                variant={filter === 'login' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('login')}
              >
                <UserCheck className="mr-1 mt-1 h-4 w-4" /> Logins
              </button>
            </div>

            {unreadCount > 0 && (
              <button variant="outline" size="sm" onClick={markAllAsRead}
              className='p-2 rounded-lg bg-white text-black hover:bg-[#0FCE7C] hover:scale-105'>
                Mark all as read
              </button>
            )}
          </div>

          <div className="space-y-4">
            {getFilteredNotifications().length === 0 ? (
              <div className="glass-card p-6 text-center rounded-lg">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                <p className="text-gray-400">You don't have any {filter !== 'all' ? filter + ' ' : ''}notifications at the moment.</p>
              </div>
            ) : (
              getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`glass-card p-4 rounded-lg transition-all ${!notification.read ? 'border-l-4 border-l-[#0FCE7C]' : 'opacity-75'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`rounded-full p-2 ${
                      notification.type === 'success' ? 'bg-green-500/20 text-green-500' :
                      notification.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {getIconByType(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{notification.title}</h3>
                            <span className="border border-gray-500 rounded-full px-2 py-0.5 text-xs text-gray-400">
                              {notification.category}
                            </span>
                          </div>
                          <p className="text-gray-400 mt-1">{notification.message}</p>
                        </div>

                        <div className="text-xs text-gray-500">{notification.time}</div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center text-xs text-gray-400">
                          {getIconByCategory(notification.category)}
                          <span className="ml-1 capitalize">{notification.category} Update</span>
                        </div>

                        <div className="flex gap-2">
                          {!notification.read && (
                            <button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className='p-2 rounded-lg bg-white text-black hover:bg-[#0FCE7C] hover:scale-105'
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="bg-red-500 hover:bg-red-600 hover:bg-red-500/10 rounded-lg p-2 hover:scale-105"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
};

export default Notifications;