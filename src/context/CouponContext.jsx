import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { INITIAL_COUPONS } from '../data/mockCoupons';

export const CouponContext = createContext(null);
const STORAGE_KEY = 'foodix_coupons_v10';

export function CouponProvider({ children }) {
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse coupons from localStorage', e);
    }
    return INITIAL_COUPONS;
  });

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.warn('Failed to save coupons to localStorage', e);
    }
  }, [coupons]);

  // Statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.status === 'Active').length;
    const expired = coupons.filter((c) => c.status === 'Expired').length;
    const inactive = coupons.filter((c) => c.status === 'Inactive').length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

    return { total, active, expired, inactive, totalRedemptions };
  }, [coupons]);

  // Add Coupon
  const addCoupon = (couponData) => {
    const code = couponData.code?.toUpperCase().trim();
    if (!code) {
      toast.error('Coupon code is required.');
      return false;
    }

    const duplicate = coupons.find((c) => c.code.toUpperCase() === code);
    if (duplicate) {
      toast.error(`Coupon code "${code}" already exists!`);
      return false;
    }

    const newCoupon = {
      id: `cpn_${Date.now()}`,
      ...couponData,
      code,
      usedCount: 0,
      status: couponData.status || 'Active',
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    toast.success(`Coupon "${code}" created successfully!`);
    return true;
  };

  // Update Coupon
  const updateCoupon = (id, updatedData) => {
    const code = updatedData.code?.toUpperCase().trim();
    const duplicate = coupons.find((c) => c.code.toUpperCase() === code && c.id !== id);
    if (duplicate) {
      toast.error(`Coupon code "${code}" is already in use by another voucher.`);
      return false;
    }

    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData, code: code || c.code } : c))
    );
    toast.success(`Coupon updated successfully!`);
    return true;
  };

  // Delete Coupon
  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.info('Coupon voucher removed.');
  };

  // Toggle Coupon Status
  const toggleCouponStatus = (id) => {
    let targetCode = '';
    let nextStatus = '';

    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
          targetCode = c.code;
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );

    if (targetCode) {
      toast.info(`Coupon ${targetCode} is now ${nextStatus}`);
    }
  };

  // Validate and calculate discount for an order amount
  const calculateDiscount = (code, orderAmount) => {
    if (!code) return { valid: false, discount: 0, message: 'No coupon applied' };
    const found = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());

    if (!found) {
      return { valid: false, discount: 0, message: 'Invalid coupon code' };
    }

    if (found.status !== 'Active') {
      return { valid: false, discount: 0, message: `Coupon is ${found.status.toLowerCase()}` };
    }

    // Expiry check (end-of-day inclusive when date is valid)
    if (found.expiryDate) {
      const expDate = new Date(found.expiryDate);
      if (!Number.isNaN(expDate.getTime())) {
        expDate.setHours(23, 59, 59, 999);
        if (expDate < new Date()) {
          return { valid: false, discount: 0, message: 'Coupon has expired' };
        }
      }
    }

    // Min order amount check
    if (found.minOrderAmount && orderAmount < found.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Min order value of ₹${found.minOrderAmount} required for this coupon`,
      };
    }

    // Usage limit check
    if (found.usageLimit && found.usedCount >= found.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = (orderAmount * found.discountValue) / 100;
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = Math.min(found.discountValue, orderAmount);
    }

    return {
      valid: true,
      discount: Math.round(discount),
      coupon: found,
      message: `₹${Math.round(discount)} saved with ${found.code}!`,
    };
  };

  // Record usage when order is placed
  const recordCouponUsage = (code) => {
    if (!code) return;
    setCoupons((prev) =>
      prev.map((c) =>
        c.code.toUpperCase() === code.toUpperCase().trim()
          ? { ...c, usedCount: (c.usedCount || 0) + 1 }
          : c
      )
    );
  };

  return (
    <CouponContext.Provider
      value={{
        coupons,
        stats,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        calculateDiscount,
        recordCouponUsage,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupons() {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupons must be used within a CouponProvider');
  }
  return context;
}
