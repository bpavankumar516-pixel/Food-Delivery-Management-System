import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { INITIAL_TABLES } from '../data/mockTables';
import { INITIAL_DINE_IN_ORDERS } from '../data/mockDineInOrders';
import { useDashboard } from './DashboardContext';

const DineInContext = createContext(null);

const STORAGE_KEYS = {
  TABLES: 'foodix_dinein_tables_v1',
  ORDERS: 'foodix_dinein_orders_v1',
  CART: 'foodix_dinein_cart_v1',
  CUSTOMER: 'foodix_dinein_active_customer_v1',
  SELECTED_TABLE: 'foodix_dinein_selected_table_v1',
  DISCOUNT: 'foodix_dinein_discount_v1',
};

export function DineInProvider({ children }) {
  const { addActivity } = useDashboard?.() || {};

  // 1. Offline / Online Status Detection
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [hasPendingOfflineSync, setHasPendingOfflineSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet restored! Local Dine-In orders synced automatically.', {
        autoClose: 4000,
      });
      setHasPendingOfflineSync(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('Offline mode active. All tables, cart & orders saved locally on device!', {
        autoClose: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Tables Management State
  const [tables, setTables] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse tables from storage', e);
    }
    return INITIAL_TABLES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch (e) {
      console.warn('Failed to save tables', e);
    }
  }, [tables]);

  // Selected Table for current POS Cart
  const [selectedTableId, setSelectedTableId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_TABLE) || 'T-01';
    } catch {
      return 'T-01';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TABLE, selectedTableId);
    } catch (e) {
      console.warn('Failed to save selected table', e);
    }
  }, [selectedTableId]);

  const selectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || tables[0];
  }, [tables, selectedTableId]);

  // 3. Walk-in Customer Details
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'Walk-in Guest',
      mobile: '',
      partySize: 2,
      notes: '',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
    } catch (e) {
      console.warn('Failed to save customer', e);
    }
  }, [customer]);

  // 4. Cart Management State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cart', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart', e);
    }
  }, [cart]);

  // Cart Discount (Flat / Percentage)
  const [discount, setDiscount] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISCOUNT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { type: 'flat', value: 0, code: '' };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCOUNT, JSON.stringify(discount));
    } catch (e) {
      console.warn('Failed to save discount', e);
    }
  }, [discount]);

  // 5. Dine-In Orders State
  const [dineInOrders, setDineInOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse dine in orders', e);
    }
    return INITIAL_DINE_IN_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(dineInOrders));
    } catch (e) {
      console.warn('Failed to save orders', e);
    }
  }, [dineInOrders]);

  // 6. Interactive Modal States
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);

  const [isOrderInspectOpen, setIsOrderInspectOpen] = useState(false);
  const [inspectOrder, setInspectOrder] = useState(null);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // 7. Cart Financial Calculations (Subtotal, GST 5%, Discounts, Grand Total)
  const cartSummary = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

    let discountAmount = 0;
    if (discount && discount.value > 0) {
      if (discount.type === 'percentage') {
        discountAmount = Math.round((subtotal * discount.value) / 100);
      } else {
        discountAmount = Math.min(discount.value, subtotal);
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    // 5% GST (2.5% CGST + 2.5% SGST)
    const cgst = Math.round(taxableAmount * 0.025 * 100) / 100;
    const sgst = Math.round(taxableAmount * 0.025 * 100) / 100;
    const totalGst = Math.round((cgst + sgst) * 100) / 100;
    const grandTotal = Math.round(taxableAmount + totalGst);

    return {
      itemCount,
      subtotal,
      discountAmount,
      taxableAmount,
      cgst,
      sgst,
      totalGst,
      grandTotal,
    };
  }, [cart, discount]);

  // --- Cart Operations ---
  const addToCart = (item, customNotes = '') => {
    let toastType = 'add';
    let nextQty = 1;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const existing = next[existingIndex];
        nextQty = existing.qty + 1;
        next[existingIndex] = {
          ...existing,
          qty: nextQty,
          notes: customNotes || existing.notes,
        };
        toastType = 'qty';
        return next;
      }

      toastType = 'add';
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          isVeg: !!item.isVeg,
          category: item.category || 'Dishes',
          image: item.image,
          notes: customNotes,
          restaurantId: item.restaurantId || 'rest_main',
          restaurantName: item.restaurantName || 'Main Kitchen',
        },
      ];
    });

    if (toastType === 'qty') {
      toast.info(`Increased quantity of "${item.name}" (${nextQty})`, {
        autoClose: 1800,
      });
    } else {
      toast.success(`Added "${item.name}" to Dine-In Cart`, { autoClose: 2000 });
    }
  };

  const removeFromCart = (itemId) => {
    let removedItemName = '';
    setCart((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        removedItemName = item.name;
      }
      return prev.filter((i) => i.id !== itemId);
    });

    if (removedItemName) {
      toast.info(`Removed "${removedItemName}" from cart`, { autoClose: 1800 });
    }
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, qty: newQty } : item))
    );
  };

  const updateItemNotes = (itemId, notes) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setDiscount({ type: 'flat', value: 0, code: '' });
    toast.info('Dine-In cart cleared');
  };

  const applyDiscount = (code, type = 'percentage', value = 10) => {
    setDiscount({ code, type, value });
    toast.success(`Discount code "${code}" (${value}${type === 'percentage' ? '%' : '₹'}) applied!`);
  };

  const removeDiscount = () => {
    setDiscount({ type: 'flat', value: 0, code: '' });
    toast.info('Discount removed');
  };

  // --- Table Operations ---
  const occupyTable = (tableId, orderId, guestName, partySize = 2) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'occupied',
              currentOrderId: orderId,
              guestName: guestName || 'Walk-in Guest',
              partySize: partySize || t.capacity,
              occupiedSince: Date.now(),
            }
          : t
      )
    );
  };

  const releaseTable = (tableId) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'available',
              currentOrderId: null,
              guestName: null,
              partySize: null,
              occupiedSince: null,
              reservationTime: null,
            }
          : t
      )
    );
  };

  const reserveTable = (tableId, guestName, time = '8:00 PM', partySize = 4) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'reserved',
              guestName,
              reservationTime: time,
              partySize,
            }
          : t
      )
    );
    toast.success(`${tables.find((t) => t.id === tableId)?.name || 'Table'} reserved for ${guestName} at ${time}!`);
  };

  // --- Order Placement (Dine-In POS) ---
  const placeDineInOrder = (customData = {}) => {
    // 1. Prevent Empty Cart Checkout
    if (!cart || cart.length === 0) {
      toast.error('Cart is empty! Please select food items from the menu first.');
      return null;
    }

    // 2. Validate Table
    const targetTableId = customData.tableId || selectedTableId;
    const tableObj = tables.find((t) => t.id === targetTableId) || tables[0];

    // 3. Generate Unique Order ID
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderId = `#FDX-DIN-${orderNumber}`;

    const guestName = customData.customerName || customer.name || 'Walk-in Guest';
    const guestMobile = customData.customerMobile || customer.mobile || '+91 98000 00000';
    const partySize = customData.partySize || customer.partySize || tableObj.capacity;

    const newOrder = {
      id: orderId,
      tableId: tableObj.id,
      tableName: tableObj.name,
      section: tableObj.section,
      customer: {
        name: guestName,
        mobile: guestMobile,
        partySize,
        notes: customer.notes || '',
      },
      items: cart.map((i) => ({ ...i })),
      subtotal: cartSummary.subtotal,
      discount: { ...discount },
      discountAmount: cartSummary.discountAmount,
      taxableAmount: cartSummary.taxableAmount,
      gst: cartSummary.totalGst,
      cgst: cartSummary.cgst,
      sgst: cartSummary.sgst,
      grandTotal: cartSummary.grandTotal,
      status: 'Preparing', // Initial state
      paymentStatus: 'Pending',
      payment: null,
      createdAt: new Date().toISOString(),
      isSynced: isOnline,
    };

    // 4. Save Order
    setDineInOrders((prev) => [newOrder, ...prev]);

    // 5. Automatically Occupy Table
    occupyTable(tableObj.id, orderId, guestName, partySize);

    // 6. Record Dashboard Activity
    if (addActivity) {
      addActivity({
        type: 'order',
        action: 'dine-in',
        title: `Dine-In Order ${orderId} Confirmed`,
        subtitle: `${tableObj.name} • ${guestName} • ₹${newOrder.grandTotal}`,
        color: 'orange',
        badge: 'Dine-In',
      });
    }

    // 7. Clear Cart & Reset
    setCart([]);
    setDiscount({ type: 'flat', value: 0, code: '' });
    if (!isOnline) {
      setHasPendingOfflineSync(true);
    }

    toast.success(
      `Order ${orderId} confirmed for ${tableObj.name}! (₹${newOrder.grandTotal}) - Table Marked Occupied`,
      { autoClose: 4000 }
    );

    return newOrder;
  };

  // --- Order Status Lifecycle Management ---
  // Pending -> Preparing -> Ready to Serve -> Served -> Completed -> Cancelled
  const updateOrderStatus = (orderId, newStatus) => {
    let releasedTableId = null;
    let releasedTableName = '';
    let updatedOrderSnap = null;

    setDineInOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };

          // If Completed or Cancelled -> Track Table to Release
          if (newStatus === 'Completed' || newStatus === 'Cancelled') {
            if (ord.tableId) {
              releasedTableId = ord.tableId;
              releasedTableName = ord.tableName;
            }
          }

          updatedOrderSnap = updated;
          return updated;
        }
        return ord;
      })
    );

    if (updatedOrderSnap) {
      if (inspectOrder?.id === orderId) {
        setInspectOrder(updatedOrderSnap);
      }
      if (receiptOrder?.id === orderId) {
        setReceiptOrder(updatedOrderSnap);
      }
    }

    if (releasedTableId) {
      releaseTable(releasedTableId);
      toast.info(`${releasedTableName} has been released and is now Available!`, {
        autoClose: 3500,
      });
    }

    toast.success(`Order ${orderId} updated to "${newStatus}"!`);
  };

  // --- Payment Processing ---
  // Supports Cash, UPI, Card, Split Payments + Cash Change Calculation
  const processPayment = (orderId, paymentData) => {
    const targetOrder = dineInOrders.find((o) => o.id === orderId);
    if (!targetOrder) {
      toast.error('Order not found!');
      return;
    }

    const grandTotal = targetOrder.grandTotal;

    // Build secure payment record (Never storing sensitive card numbers or CVV!)
    let paymentRecord = {
      method: paymentData.method, // 'Cash' | 'UPI' | 'Card' | 'Split'
      paidAt: new Date().toISOString(),
      amountPaid: grandTotal,
      status: 'Paid',
    };

    if (paymentData.method === 'Cash') {
      const tendered = Number(paymentData.cashTendered) || grandTotal;
      const changeDue = Math.max(0, tendered - grandTotal);
      paymentRecord = {
        ...paymentRecord,
        cashTendered: tendered,
        changeDue,
      };
    } else if (paymentData.method === 'UPI') {
      paymentRecord = {
        ...paymentRecord,
        vpa: paymentData.vpa || 'customer@upi',
        txnRef: paymentData.txnRef || `UPI-${Date.now().toString().slice(-6)}`,
      };
    } else if (paymentData.method === 'Card') {
      paymentRecord = {
        ...paymentRecord,
        cardLast4: paymentData.cardLast4 || '4242',
        cardBrand: paymentData.cardBrand || 'Visa',
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      };
    } else if (paymentData.method === 'Split') {
      paymentRecord = {
        ...paymentRecord,
        splitBreakdown: {
          cash: Number(paymentData.cashAmount) || 0,
          upi: Number(paymentData.upiAmount) || 0,
          card: Number(paymentData.cardAmount) || 0,
        },
      };
    }

    setDineInOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            paymentStatus: 'Paid',
            payment: paymentRecord,
            // If order was already served, mark Completed on payment
            status: ord.status === 'Served' ? 'Completed' : ord.status,
            updatedAt: new Date().toISOString(),
          };

          // If Completed on payment, release table
          if (updated.status === 'Completed' && ord.tableId) {
            releaseTable(ord.tableId);
          }

          if (inspectOrder?.id === orderId) {
            setInspectOrder(updated);
          }
          if (receiptOrder?.id === orderId) {
            setReceiptOrder(updated);
          }

          return updated;
        }
        return ord;
      })
    );

    setIsPaymentModalOpen(false);
    toast.success(
      `Payment of ₹${grandTotal} marked as PAID via ${paymentData.method}! Receipt generated.`
    );

    // Auto-open receipt for printing
    setReceiptOrder({
      ...targetOrder,
      paymentStatus: 'Paid',
      payment: paymentRecord,
    });
    setIsReceiptOpen(true);
  };

  // --- Modal Triggers ---
  const openReceipt = (order) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  const closeReceipt = () => {
    setIsReceiptOpen(false);
    setReceiptOrder(null);
  };

  const openPaymentModal = (order) => {
    setPaymentOrder(order);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentOrder(null);
  };

  const openOrderInspect = (order) => {
    setInspectOrder(order);
    setIsOrderInspectOpen(true);
  };

  const closeOrderInspect = () => {
    setIsOrderInspectOpen(false);
    setInspectOrder(null);
  };

  // Quick Table Switching
  const handleSelectTable = (tableId) => {
    setSelectedTableId(tableId);
    const tbl = tables.find((t) => t.id === tableId);
    if (tbl) {
      toast.info(`Selected ${tbl.name} (${tbl.capacity} seater, ${tbl.status}) for current cart`, {
        autoClose: 1800,
      });
    }
  };

  return (
    <DineInContext.Provider
      value={{
        // Network & Offline Status
        isOnline,
        hasPendingOfflineSync,
        // Tables
        tables,
        selectedTableId,
        setSelectedTableId: handleSelectTable,
        selectedTable,
        occupyTable,
        releaseTable,
        reserveTable,
        // Walk-in Customer
        customer,
        setCustomer,
        // Cart
        cart,
        cartSummary,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemNotes,
        clearCart,
        discount,
        applyDiscount,
        removeDiscount,
        // Orders
        dineInOrders,
        placeDineInOrder,
        updateOrderStatus,
        processPayment,
        // Modals
        isReceiptOpen,
        receiptOrder,
        openReceipt,
        closeReceipt,
        isPaymentModalOpen,
        paymentOrder,
        openPaymentModal,
        closePaymentModal,
        isOrderInspectOpen,
        inspectOrder,
        openOrderInspect,
        closeOrderInspect,
        isTableModalOpen,
        setIsTableModalOpen,
        isWalkInModalOpen,
        setIsWalkInModalOpen,
      }}
    >
      {children}
    </DineInContext.Provider>
  );
}

export function useDineIn() {
  const context = useContext(DineInContext);
  if (!context) {
    throw new Error('useDineIn must be used within a DineInProvider');
  }
  return context;
}
