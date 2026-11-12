import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

const NotificationSupportContext = createContext(null);
const NOTIF_KEY = 'foodix_notifications_v2';
const TICKET_KEY = 'foodix_support_tickets_v2';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'New High-Value Order Received',
    message: 'Priya Sharma placed order #FDX-2048 from Pizza Hut worth ₹805.',
    type: 'order',
    orderId: '#FDX-2048',
    timestamp: Date.now() - 3 * 60 * 1000,
    timeFormatted: '3 mins ago',
    isRead: false,
  },
  {
    id: 'notif_2',
    title: 'Order Status Advanced',
    message: 'Order #FDX-2044 is now Out for Delivery with rider Sunil Kumar.',
    type: 'status',
    orderId: '#FDX-2044',
    timestamp: Date.now() - 15 * 60 * 1000,
    timeFormatted: '15 mins ago',
    isRead: false,
  },
  {
    id: 'notif_3',
    title: 'Order Cancellation Request',
    message: 'Divya Nair cancelled order #FDX-2042 due to address update.',
    type: 'cancellation',
    orderId: '#FDX-2042',
    timestamp: Date.now() - 45 * 60 * 1000,
    timeFormatted: '45 mins ago',
    isRead: true,
  },
  {
    id: 'notif_4',
    title: 'New VIP Customer Registered',
    message: 'Karan Mehra registered on Foodix platform via web portal.',
    type: 'customer',
    customerId: 'cust_8',
    timestamp: Date.now() - 90 * 60 * 1000,
    timeFormatted: '1.5 hrs ago',
    isRead: true,
  },
  {
    id: 'notif_5',
    title: 'Coupon Milestone Reached',
    message: 'Coupon FOODIX50 has been redeemed 428 times this week.',
    type: 'coupon',
    timestamp: Date.now() - 180 * 60 * 1000,
    timeFormatted: '3 hrs ago',
    isRead: true,
  },
];

const INITIAL_TICKETS = [
  {
    id: 'TCK-501',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    orderId: '#FDX-2048',
    subject: 'Request extra seasoning and cutlery packet',
    category: 'Order Customization',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: 'Today, 1:18 PM',
    timestamp: Date.now() - 25 * 60 * 1000,
    messages: [
      {
        sender: 'customer',
        senderName: 'Priya Sharma',
        text: 'Hello, please inform the restaurant to pack extra oregano sachets and wooden cutlery.',
        timestamp: '1:18 PM',
      },
      {
        sender: 'admin',
        senderName: 'Pavan Kumar (Admin)',
        text: 'Noted Priya! We have flagged your instructions to the Pizza Hut kitchen team.',
        timestamp: '1:21 PM',
      },
    ],
  },
  {
    id: 'TCK-502',
    customerName: 'Rahul Kumar',
    customerEmail: 'rahul.kumar@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    orderId: '#FDX-2047',
    subject: 'Delivery partner contact not reachable',
    category: 'Rider Inquiry',
    priority: 'High',
    status: 'Open',
    createdAt: 'Today, 1:05 PM',
    timestamp: Date.now() - 40 * 60 * 1000,
    messages: [
      {
        sender: 'customer',
        senderName: 'Rahul Kumar',
        text: 'I am trying to coordinate entry at the gated security, but the rider number is busy.',
        timestamp: '1:05 PM',
      },
    ],
  },
  {
    id: 'TCK-503',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    orderId: '#FDX-2046',
    subject: 'Payment receipt & GST invoice copy',
    category: 'Billing',
    priority: 'Low',
    status: 'Resolved',
    createdAt: 'Today, 12:45 PM',
    timestamp: Date.now() - 90 * 60 * 1000,
    messages: [
      {
        sender: 'customer',
        senderName: 'Sneha Reddy',
        text: 'Could you please email the GST invoice for my corporate expense filing?',
        timestamp: '12:45 PM',
      },
      {
        sender: 'admin',
        senderName: 'Pavan Kumar (Admin)',
        text: 'Hi Sneha, the GST invoice has been forwarded to your registered email address.',
        timestamp: '12:55 PM',
      },
    ],
  },
  {
    id: 'TCK-504',
    customerName: 'Divya Nair',
    customerEmail: 'divya.nair@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    orderId: '#FDX-2042',
    subject: 'UPI Refund confirmation for cancelled order',
    category: 'Refunds',
    priority: 'High',
    status: 'Resolved',
    createdAt: 'Today, 11:30 AM',
    timestamp: Date.now() - 150 * 60 * 1000,
    messages: [
      {
        sender: 'customer',
        senderName: 'Divya Nair',
        text: 'I cancelled order #FDX-2042 due to address mismatch. Please confirm the refund UTR number.',
        timestamp: '11:30 AM',
      },
      {
        sender: 'admin',
        senderName: 'Pavan Kumar (Admin)',
        text: 'Refund of ₹777 was successfully credited via PhonePe (UTR: 6419280012).',
        timestamp: '11:42 AM',
      },
    ],
  },
];

export function NotificationSupportProvider({ children }) {
  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIF_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Support Tickets State
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(TICKET_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse support tickets from localStorage', e);
    }
    return INITIAL_TICKETS;
  });

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(TICKET_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.warn('Failed to save tickets', e);
    }
  }, [tickets]);

  // Unread Count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Notification Actions
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read.');
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.info('Notification feed cleared.');
  };

  const addNotification = (notifData) => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      timestamp: Date.now(),
      timeFormatted: 'Just now',
      isRead: false,
      ...notifData,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Create new Customer Support Ticket
  const createSupportTicket = ({
    customerName,
    customerEmail,
    customerAvatar,
    orderId = '',
    subject,
    category = 'Order Issue',
    priority = 'Medium',
    message,
  }) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ticketId = `TCK-${Math.floor(510 + Math.random() * 480)}`;
    const newTicket = {
      id: ticketId,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || 'customer@foodix.com',
      customerAvatar:
        customerAvatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName || 'C')}&background=163A2D&color=fff`,
      orderId,
      subject: subject.trim(),
      category,
      priority,
      status: 'Open',
      createdAt: `Today, ${timeStr}`,
      timestamp: Date.now(),
      messages: [
        {
          sender: 'customer',
          senderName: customerName || 'Customer',
          text: message.trim(),
          timestamp: timeStr,
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    addNotification({
      title: `Support Ticket ${ticketId} Created`,
      message: `${subject.trim()}${orderId ? ` (${orderId})` : ''}`,
      type: 'support',
      customerEmail,
    });
    toast.success(`Support ticket ${ticketId} submitted! Our team will respond shortly.`);
    return newTicket;
  };

  // Customer Follow-up Reply on Support Ticket
  const addCustomerReply = (ticketId, replyText, customerName = 'Customer') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: t.status === 'Resolved' ? 'Open' : t.status,
          messages: [
            ...(t.messages || []),
            {
              sender: 'customer',
              senderName: customerName,
              text: replyText,
              timestamp: timeStr,
            },
          ],
        };
      })
    );
    toast.success('Follow-up message sent to Foodix Support.');
  };

  // Support Ticket Actions
  const addTicketReply = (ticketId, replyText, adminName = 'Pavan Kumar (Admin)') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updatedMessages = [
            ...(t.messages || []),
            {
              sender: 'admin',
              senderName: adminName,
              text: replyText,
              timestamp: timeStr,
            },
          ];
          return {
            ...t,
            messages: updatedMessages,
            status: t.status === 'Open' ? 'In Progress' : t.status,
          };
        }
        return t;
      })
    );
    toast.success('Reply submitted to customer ticket.');
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    toast.info(`Ticket ${ticketId} status changed to ${newStatus}`);
  };

  return (
    <NotificationSupportContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        tickets,
        createSupportTicket,
        addCustomerReply,
        addTicketReply,
        updateTicketStatus,
      }}
    >
      {children}
    </NotificationSupportContext.Provider>
  );
}

export function useNotificationSupport() {
  const context = useContext(NotificationSupportContext);
  if (!context) {
    throw new Error('useNotificationSupport must be used within a NotificationSupportProvider');
  }
  return context;
}
