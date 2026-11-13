import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { useRestaurants } from './RestaurantContext';
import { useOrders } from './OrderContext';
import { useCustomers } from './CustomerContext';
import { useCoupons } from './CouponContext';
import { useNotificationSupport } from './NotificationSupportContext';
import { useSettings } from './SettingsContext';
import { generateDefaultMenuForRestaurant } from '../data/mockMenuItems';
import {
  detectCurrentPosition,
  reverseGeocode,
  searchAddressSuggestions,
  getRestaurantGeoMeta,
} from '../services/locationService';

const DEFAULT_CUSTOMER_PREFERENCES = {
  vegOnlyDefault: false,
  contactlessDelivery: true,
  orderUpdates: true,
  promoOffers: true,
  emailAlerts: true,
  saveSearchHistory: true,
  shareAnalytics: false,
  language: 'English',
};

const CustomerPortalContext = createContext(null);

function formatSelectedLocationLabel(loc) {
  if (!loc) return '';
  if (loc.displayName) return loc.displayName;
  const parts = [loc.area || loc.locality, loc.city].filter(Boolean);
  return parts.join(', ') || loc.fullAddress || '';
}

function safeReadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed JSON
  }
  return fallback;
}

function safeWriteStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota
  }
}

export function CustomerPortalProvider({ children }) {
  const { user } = useAuth();
  const { restaurants, menusByRestaurant, allMenuItems } = useRestaurants();
  const { orders, createOrder, cancelOrder, refreshOrdersFromApi } = useOrders();
  const { customers, ensureCustomerAccount } = useCustomers();
  const { coupons, calculateDiscount, recordCouponUsage } = useCoupons();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    tickets,
    createSupportTicket,
    addCustomerReply,
  } = useNotificationSupport();
  const { settings } = useSettings();

  const isCustomerUser = user?.role === 'Customer';
  const userKey = useMemo(
    () => (user?.id || user?.email || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_'),
    [user?.id, user?.email]
  );

  // Ensure authenticated Customer exists in CustomerContext for 2-way Admin sync
  useEffect(() => {
    if (isCustomerUser && user?.email && ensureCustomerAccount) {
      ensureCustomerAccount(user);
    }
  }, [isCustomerUser, user, ensureCustomerAccount]);

  const linkedCustomer = useMemo(() => {
    if (!user?.email) return null;
    const normEmail = user.email.trim().toLowerCase();
    return (
      customers.find((c) => c.email?.toLowerCase() === normEmail || c.id === user.id) || null
    );
  }, [customers, user?.email, user?.id]);

  // Storage keys scoped per customer account
  const KEYS = useMemo(
    () => ({
      liveLocation: `foodix_cust_live_loc_${userKey}`,
      cart: `foodix_cust_cart_${userKey}`,
      coupon: `foodix_cust_coupon_${userKey}`,
      favRests: `foodix_cust_fav_rests_${userKey}`,
      favDishes: `foodix_cust_fav_dishes_${userKey}`,
      addresses: `foodix_cust_addrs_${userKey}`,
      selectedAddr: `foodix_cust_sel_addr_${userKey}`,
      recentViews: `foodix_cust_recent_rests_${userKey}`,
      recentSearches: `foodix_cust_searches_${userKey}`,
      prefs: `foodix_cust_prefs_${userKey}`,
    }),
    [userKey]
  );

  const [liveLocation, setLiveLocation] = useState(() =>
    safeReadStorage(KEYS.liveLocation, null)
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const [cart, setCart] = useState(() =>
    safeReadStorage(KEYS.cart, { restaurantId: null, restaurantName: '', items: [] })
  );
  const [appliedCouponCode, setAppliedCouponCode] = useState(() =>
    safeReadStorage(KEYS.coupon, '')
  );
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState(() =>
    safeReadStorage(KEYS.favRests, [])
  );
  const [favoriteDishIds, setFavoriteDishIds] = useState(() =>
    safeReadStorage(KEYS.favDishes, [])
  );
  const [addresses, setAddresses] = useState(() => safeReadStorage(KEYS.addresses, []));
  const [selectedAddressId, setSelectedAddressId] = useState(() =>
    safeReadStorage(KEYS.selectedAddr, '')
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() =>
    safeReadStorage(KEYS.recentViews, [])
  );
  const [recentSearches, setRecentSearches] = useState(() =>
    safeReadStorage(KEYS.recentSearches, [])
  );
  const [preferences, setPreferences] = useState(() => ({
    ...DEFAULT_CUSTOMER_PREFERENCES,
    ...safeReadStorage(KEYS.prefs, {}),
  }));

  // Reload customer-specific state when user switches session
  useEffect(() => {
    setLiveLocation(safeReadStorage(KEYS.liveLocation, null));
    setLocationError(null);
    setCart(safeReadStorage(KEYS.cart, { restaurantId: null, restaurantName: '', items: [] }));
    setAppliedCouponCode(safeReadStorage(KEYS.coupon, ''));
    setFavoriteRestaurantIds(safeReadStorage(KEYS.favRests, []));
    setFavoriteDishIds(safeReadStorage(KEYS.favDishes, []));
    const savedAddrs = safeReadStorage(KEYS.addresses, []);
    setAddresses(savedAddrs);
    setSelectedAddressId(
      safeReadStorage(
        KEYS.selectedAddr,
        savedAddrs.find((a) => a.isDefault)?.id || savedAddrs[0]?.id || ''
      )
    );
    setRecentlyViewedIds(safeReadStorage(KEYS.recentViews, []));
    setRecentSearches(safeReadStorage(KEYS.recentSearches, []));
    setPreferences({
      ...DEFAULT_CUSTOMER_PREFERENCES,
      ...safeReadStorage(KEYS.prefs, {}),
    });
  }, [KEYS]);

  // Persist customer state to LocalStorage
  useEffect(() => safeWriteStorage(KEYS.liveLocation, liveLocation), [KEYS.liveLocation, liveLocation]);
  useEffect(() => safeWriteStorage(KEYS.cart, cart), [KEYS.cart, cart]);
  useEffect(() => safeWriteStorage(KEYS.coupon, appliedCouponCode), [KEYS.coupon, appliedCouponCode]);
  useEffect(() => safeWriteStorage(KEYS.favRests, favoriteRestaurantIds), [KEYS.favRests, favoriteRestaurantIds]);
  useEffect(() => safeWriteStorage(KEYS.favDishes, favoriteDishIds), [KEYS.favDishes, favoriteDishIds]);
  useEffect(() => safeWriteStorage(KEYS.addresses, addresses), [KEYS.addresses, addresses]);
  useEffect(() => safeWriteStorage(KEYS.selectedAddr, selectedAddressId), [KEYS.selectedAddr, selectedAddressId]);
  useEffect(() => safeWriteStorage(KEYS.recentViews, recentlyViewedIds), [KEYS.recentViews, recentlyViewedIds]);
  useEffect(() => safeWriteStorage(KEYS.recentSearches, recentSearches), [KEYS.recentSearches, recentSearches]);
  useEffect(() => safeWriteStorage(KEYS.prefs, preferences), [KEYS.prefs, preferences]);

  // Conflict modal, location modal & active dish detail modal states
  const [cartConflict, setCartConflict] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeFoodModal, setActiveFoodModal] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Pure function to get a restaurant's merged menu synced with Admin edits (both RestaurantDetails & MenuManagement)
  const getMergedMenuForRestaurant = useCallback(
    (restaurantId) => {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      if (!restaurant) return [];

      const baseMenu =
        Array.isArray(menusByRestaurant[restaurantId]) && menusByRestaurant[restaurantId].length > 0
          ? menusByRestaurant[restaurantId]
          : generateDefaultMenuForRestaurant(restaurant);

      const masterDishesForRest = allMenuItems.filter(
        (d) =>
          d.restaurantId === restaurantId ||
          d.restaurantName?.toLowerCase().trim() === restaurant.name?.toLowerCase().trim()
      );

      const masterById = new Map(allMenuItems.map((d) => [d.id, d]));
      const mergedMap = new Map();

      baseMenu.forEach((dish) => {
        const masterOverride = masterById.get(dish.id);
        mergedMap.set(dish.id, {
          ...dish,
          ...(masterOverride || {}),
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        });
      });

      masterDishesForRest.forEach((dish) => {
        if (!mergedMap.has(dish.id)) {
          mergedMap.set(dish.id, {
            ...dish,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
          });
        }
      });

      return Array.from(mergedMap.values());
    },
    [restaurants, menusByRestaurant, allMenuItems]
  );

  // Full live platform dish catalog across all restaurants (used by Home, Search, Favorites)
  const allPlatformDishes = useMemo(() => {
    const map = new Map();

    allMenuItems.forEach((dish) => {
      const rest =
        restaurants.find((r) => r.id === dish.restaurantId) ||
        restaurants.find((r) => r.name?.toLowerCase() === dish.restaurantName?.toLowerCase());
      map.set(dish.id, {
        ...dish,
        restaurantId: rest?.id || dish.restaurantId || 'rest_001',
        restaurantName: rest?.name || dish.restaurantName || 'Foodix Partner',
        restaurantStatus: rest?.status || 'Open',
      });
    });

    restaurants.forEach((rest) => {
      const menu = getMergedMenuForRestaurant(rest.id);
      menu.forEach((dish) => {
        if (!map.has(dish.id)) {
          map.set(dish.id, {
            ...dish,
            restaurantId: rest.id,
            restaurantName: rest.name,
            restaurantStatus: rest.status || 'Open',
          });
        }
      });
    });

    return Array.from(map.values());
  }, [allMenuItems, restaurants, getMergedMenuForRestaurant]);

  // Derived header label from user's liveLocation (never hardcoded)
  const selectedLocation = useMemo(
    () => formatSelectedLocationLabel(liveLocation),
    [liveLocation]
  );

  // Location-aware enrichment of live Admin restaurants
  const locationAwareRestaurants = useMemo(() => {
    return restaurants.map((r) => {
      const geo = getRestaurantGeoMeta(r, liveLocation);
      return {
        ...r,
        ...geo,
        deliveryTime: liveLocation ? geo.effectiveEta : r.deliveryTime,
      };
    });
  }, [restaurants, liveLocation]);

  // Save a detected or manually chosen location as a reusable delivery address
  const saveLocationAsAddress = useCallback(
    (locObj, label = 'Current Location', makeDefault = true) => {
      if (!locObj) return null;
      const streetVal =
        locObj.street ||
        locObj.area ||
        locObj.locality ||
        locObj.fullAddress?.split(',')[0] ||
        locObj.displayName ||
        'Detected Street';
      const cityVal = locObj.city || locObj.locality || locObj.displayName || '';
      const newAddr = {
        id: `addr_${Date.now()}`,
        label,
        fullName: user?.name || 'Customer',
        phone: user?.phone || '',
        street: streetVal,
        landmark: locObj.locality && locObj.locality !== streetVal ? locObj.locality : '',
        city: cityVal,
        state: locObj.state || '',
        pincode: locObj.pincode || '',
        lat: locObj.lat ?? null,
        lng: locObj.lng ?? null,
        fullAddress: locObj.fullAddress || [streetVal, cityVal, locObj.state, locObj.pincode].filter(Boolean).join(', '),
        isDefault: !!makeDefault,
      };

      setAddresses((prev) => {
        const filtered = prev.filter(
          (a) =>
            !(
              a.label === label &&
              a.street?.toLowerCase() === streetVal.toLowerCase() &&
              a.city?.toLowerCase() === cityVal.toLowerCase()
            )
        );
        const base = newAddr.isDefault ? filtered.map((a) => ({ ...a, isDefault: false })) : filtered;
        return [newAddr, ...base];
      });
      if (makeDefault) {
        setSelectedAddressId(newAddr.id);
      }
      return newAddr;
    },
    [user?.name, user?.phone]
  );

  // Detect live GPS location via Browser Geolocation + Reverse Geocoding
  const detectCurrentLocation = useCallback(
    async ({ saveAsAddress = false } = {}) => {
      setLocationLoading(true);
      setLocationError(null);
      try {
        const coords = await detectCurrentPosition();
        const resolved = await reverseGeocode(coords.lat, coords.lng);
        const payload = {
          ...resolved,
          accuracy: coords.accuracy,
          updatedAt: Date.now(),
        };
        setLiveLocation(payload);
        if (saveAsAddress) {
          saveLocationAsAddress(payload, 'Current Location', true);
        }
        toast.success(`Location updated: ${formatSelectedLocationLabel(payload)}`);
        return payload;
      } catch (err) {
        const errObj = {
          code: err?.code || 'LOCATION_ERROR',
          message: err?.message || 'Unable to detect your current location.',
        };
        setLocationError(errObj);
        toast.error(errObj.message);
        return null;
      } finally {
        setLocationLoading(false);
      }
    },
    [saveLocationAsAddress]
  );

  // Select a manual address from search suggestions or direct input
  const selectManualLocation = useCallback(
    (locObj, { saveAsAddress = false, label = 'Delivery Point' } = {}) => {
      if (!locObj) return;
      const payload = {
        ...locObj,
        source: locObj.source || 'manual',
        updatedAt: Date.now(),
      };
      setLiveLocation(payload);
      setLocationError(null);
      if (saveAsAddress) {
        saveLocationAsAddress(payload, label, true);
      }
      toast.success(`Delivery location set to ${formatSelectedLocationLabel(payload)}`);
    },
    [saveLocationAsAddress]
  );

  const clearLocation = useCallback(() => {
    setLiveLocation(null);
    setLocationError(null);
  }, []);

  // Hydrate cart items against live Admin restaurant & dish data (real-time price & stock sync)
  const cartRestaurant = useMemo(
    () => locationAwareRestaurants.find((r) => r.id === cart.restaurantId) || null,
    [locationAwareRestaurants, cart.restaurantId]
  );

  const hydratedCartItems = useMemo(() => {
    if (!cart.items || cart.items.length === 0) return [];
    const restMenu = cart.restaurantId ? getMergedMenuForRestaurant(cart.restaurantId) : [];
    const dishLookup = new Map([
      ...allPlatformDishes.map((d) => [d.id, d]),
      ...restMenu.map((d) => [d.id, d]),
    ]);

    return cart.items.map((item) => {
      const liveDish = dishLookup.get(item.id);
      const isRestClosed = cartRestaurant?.status === 'Closed';
      const inStock = liveDish ? liveDish.inStock !== false : item.inStock !== false;
      return {
        ...item,
        name: liveDish?.name || item.name,
        price: liveDish?.price ?? item.price,
        originalPrice: liveDish?.originalPrice ?? item.originalPrice,
        image: liveDish?.image || item.image,
        isVeg: liveDish?.isVeg ?? item.isVeg,
        inStock,
        isOrderable: inStock && !isRestClosed,
      };
    });
  }, [cart.items, cart.restaurantId, cartRestaurant, getMergedMenuForRestaurant, allPlatformDishes]);

  const cartItemCount = useMemo(
    () => hydratedCartItems.reduce((sum, item) => sum + item.qty, 0),
    [hydratedCartItems]
  );

  const hasUnavailableCartItems = useMemo(
    () => hydratedCartItems.some((item) => !item.inStock) || cartRestaurant?.status === 'Closed',
    [hydratedCartItems, cartRestaurant]
  );

  // Coupon & Total Calculations
  const cartTotals = useMemo(() => {
    const subtotal = hydratedCartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (subtotal === 0) {
      return {
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        tax: 0,
        grandTotal: 0,
        couponResult: null,
        freeDeliveryThreshold: settings?.delivery?.freeDeliveryThreshold ?? 499,
      };
    }

    const freeThreshold = settings?.delivery?.freeDeliveryThreshold ?? 499;
    const baseFee =
      cartRestaurant?.effectiveDeliveryFee ??
      cartRestaurant?.deliveryFee ??
      settings?.delivery?.baseDeliveryFee ??
      35;
    let deliveryFee = subtotal >= freeThreshold ? 0 : baseFee;

    let discount = 0;
    let couponResult = null;
    if (appliedCouponCode) {
      couponResult = calculateDiscount(appliedCouponCode, subtotal);
      if (couponResult.valid) {
        if (appliedCouponCode.toUpperCase() === 'FREEDLV') {
          deliveryFee = 0;
          discount = 0;
        } else {
          discount = Math.min(couponResult.discount, subtotal);
        }
      }
    }

    const gstPct = settings?.tax?.isTaxEnabled === false ? 0 : settings?.tax?.gstPercentage ?? 5;
    const taxableAmount = Math.max(subtotal - discount, 0);
    const tax = Math.round((taxableAmount * gstPct) / 100);
    const grandTotal = Math.max(taxableAmount + deliveryFee + tax, 0);

    return {
      subtotal,
      discount,
      deliveryFee,
      tax,
      gstPct,
      grandTotal,
      couponResult,
      freeDeliveryThreshold: freeThreshold,
    };
  }, [hydratedCartItems, appliedCouponCode, calculateDiscount, cartRestaurant, settings]);

  // Cart Actions
  const addToCart = (dish, qty = 1, forceReplace = false) => {
    if (!dish) return false;
    if (dish.inStock === false) {
      toast.error(`"${dish.name}" is currently Sold Out and cannot be ordered.`);
      return false;
    }

    const targetRest =
      restaurants.find((r) => r.id === dish.restaurantId) ||
      restaurants.find((r) => r.name?.toLowerCase() === dish.restaurantName?.toLowerCase());

    if (targetRest?.status === 'Closed') {
      toast.warn(`${targetRest.name} is currently closed and not accepting orders.`);
      return false;
    }

    const targetRestId = targetRest?.id || dish.restaurantId || 'rest_001';
    const targetRestName = targetRest?.name || dish.restaurantName || 'Foodix Kitchen';

    // Single-restaurant cart enforcement with user confirmation dialog
    if (
      !forceReplace &&
      cart.restaurantId &&
      cart.items.length > 0 &&
      cart.restaurantId !== targetRestId
    ) {
      setCartConflict({
        dish,
        qty,
        targetRestId,
        targetRestName,
        existingRestName: cart.restaurantName,
      });
      return false;
    }

    setCart((prev) => {
      const baseItems =
        forceReplace || !prev.restaurantId || prev.restaurantId !== targetRestId ? [] : prev.items;
      const existing = baseItems.find((i) => i.id === dish.id);
      const nextItems = existing
        ? baseItems.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + qty } : i))
        : [
            ...baseItems,
            {
              id: dish.id,
              name: dish.name,
              price: dish.price,
              originalPrice: dish.originalPrice,
              image: dish.image,
              isVeg: dish.isVeg,
              inStock: dish.inStock !== false,
              restaurantId: targetRestId,
              restaurantName: targetRestName,
              qty,
            },
          ];

      return {
        restaurantId: targetRestId,
        restaurantName: targetRestName,
        items: nextItems,
      };
    });

    if (forceReplace) {
      setAppliedCouponCode('');
      setCartConflict(null);
    }
    toast.success(`Added ${qty}× ${dish.name} to your cart`);
    return true;
  };

  const confirmReplaceCart = () => {
    if (!cartConflict) return;
    addToCart(cartConflict.dish, cartConflict.qty, true);
  };

  const cancelReplaceCart = () => setCartConflict(null);

  const updateCartItemQty = (dishId, nextQty) => {
    setCart((prev) => {
      const updated = prev.items
        .map((i) => (i.id === dishId ? { ...i, qty: nextQty } : i))
        .filter((i) => i.qty > 0);
      if (updated.length === 0) {
        return { restaurantId: null, restaurantName: '', items: [] };
      }
      return { ...prev, items: updated };
    });
  };

  const removeFromCart = (dishId) => {
    updateCartItemQty(dishId, 0);
    toast.info('Item removed from cart');
  };

  const clearCart = () => {
    setCart({ restaurantId: null, restaurantName: '', items: [] });
    setAppliedCouponCode('');
  };

  // Coupon Application with real validation
  const applyCoupon = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      toast.warn('Please enter a coupon code.');
      return false;
    }
    if (hydratedCartItems.length === 0) {
      toast.warn('Add items to your cart before applying a coupon.');
      return false;
    }
    const check = calculateDiscount(clean, cartTotals.subtotal);
    if (!check.valid) {
      toast.error(check.message);
      return false;
    }
    setAppliedCouponCode(clean);
    toast.success(
      clean === 'FREEDLV' ? 'FREEDLV applied — Free Delivery unlocked!' : check.message
    );
    return true;
  };

  const removeCoupon = () => {
    setAppliedCouponCode('');
    toast.info('Coupon removed');
  };

  // Favorites & Wishlist
  const toggleFavoriteRestaurant = (restaurantId) => {
    let willExist = false;
    setFavoriteRestaurantIds((prev) => {
      const exists = prev.includes(restaurantId);
      willExist = !exists;
      return exists ? prev.filter((id) => id !== restaurantId) : [restaurantId, ...prev];
    });
    toast.info(willExist ? 'Saved restaurant to favorites!' : 'Removed restaurant from favorites');
  };

  const toggleFavoriteDish = (dish) => {
    const id = typeof dish === 'string' ? dish : dish?.id;
    if (!id) return;
    let willExist = false;
    setFavoriteDishIds((prev) => {
      const exists = prev.includes(id);
      willExist = !exists;
      return exists ? prev.filter((dId) => dId !== id) : [id, ...prev];
    });
    toast.info(willExist ? 'Saved dish to wishlist!' : 'Removed dish from wishlist');
  };

  // Recently Viewed Restaurants & Search History
  const recordRestaurantView = useCallback((restaurantId) => {
    if (!restaurantId) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== restaurantId);
      return [restaurantId, ...filtered].slice(0, 8);
    });
  }, []);

  const addSearchHistory = useCallback(
    (term) => {
      if (!preferences.saveSearchHistory) return;
      const clean = (term || '').trim();
      if (!clean || clean.length < 2) return;
      setRecentSearches((prev) => {
        const filtered = prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
        return [clean, ...filtered].slice(0, 8);
      });
    },
    [preferences.saveSearchHistory]
  );

  const removeSearchTerm = (term) => {
    setRecentSearches((prev) => prev.filter((t) => t !== term));
  };

  const clearSearchHistory = () => {
    setRecentSearches([]);
    toast.info('Recent search history cleared');
  };

  // Address Book CRUD
  const addAddress = (addrData) => {
    const newAddr = {
      id: `addr_${Date.now()}`,
      label: addrData.label || 'Home',
      fullName: addrData.fullName || user?.name || 'Customer',
      phone: addrData.phone || user?.phone || '',
      street: addrData.street,
      landmark: addrData.landmark || '',
      city: addrData.city || liveLocation?.city || '',
      state: addrData.state || liveLocation?.state || '',
      pincode: addrData.pincode || liveLocation?.pincode || '',
      lat: addrData.lat ?? liveLocation?.lat ?? null,
      lng: addrData.lng ?? liveLocation?.lng ?? null,
      isDefault: !!addrData.isDefault || addresses.length === 0,
    };

    setAddresses((prev) => {
      const base = newAddr.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [newAddr, ...base];
    });
    setSelectedAddressId(newAddr.id);
    if (newAddr.isDefault && (newAddr.city || newAddr.street)) {
      setLiveLocation((prev) => ({
        displayName: [newAddr.street, newAddr.city].filter(Boolean).slice(0, 2).join(', '),
        area: newAddr.street,
        locality: newAddr.landmark || newAddr.city,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        fullAddress: [newAddr.street, newAddr.landmark, newAddr.city, newAddr.state, newAddr.pincode]
          .filter(Boolean)
          .join(', '),
        lat: newAddr.lat ?? prev?.lat ?? null,
        lng: newAddr.lng ?? prev?.lng ?? null,
        source: 'manual',
        updatedAt: Date.now(),
      }));
    }
    toast.success('Delivery address saved!');
    return newAddr;
  };

  const updateAddress = (addrId, fields) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === addrId) return { ...a, ...fields };
        if (fields.isDefault) return { ...a, isDefault: false };
        return a;
      })
    );
    toast.success('Address updated successfully!');
  };

  const deleteAddress = (addrId) => {
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== addrId);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      if (selectedAddressId === addrId) {
        setSelectedAddressId(remaining[0]?.id || '');
      }
      return remaining;
    });
    toast.info('Address deleted');
  };

  const setDefaultAddress = (addrId) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === addrId }))
    );
    setSelectedAddressId(addrId);
    const chosen = addresses.find((a) => a.id === addrId);
    if (chosen) {
      setLiveLocation({
        displayName: [chosen.street, chosen.city].filter(Boolean).slice(0, 2).join(', '),
        area: chosen.street,
        locality: chosen.landmark || chosen.city,
        city: chosen.city,
        state: chosen.state,
        pincode: chosen.pincode,
        fullAddress: [chosen.street, chosen.landmark, chosen.city, chosen.state, chosen.pincode]
          .filter(Boolean)
          .join(', '),
        lat: chosen.lat ?? null,
        lng: chosen.lng ?? null,
        source: 'saved',
        updatedAt: Date.now(),
      });
    }
    toast.success('Default delivery address updated!');
  };

  // Customer Orders (Live synced with Admin OrderContext!)
  const myOrders = useMemo(() => {
    if (!user?.email) return [];
    const normEmail = user.email.trim().toLowerCase();
    return orders
      .filter(
        (o) =>
          (linkedCustomer && (o.customerId === linkedCustomer.id || o.customer?.id === linkedCustomer.id)) ||
          o.customer?.email?.toLowerCase() === normEmail ||
          o.customerId === user.id
      )
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [orders, user?.email, user?.id, linkedCustomer]);

  const activeOrders = useMemo(
    () =>
      myOrders.filter((o) =>
        ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.status)
      ),
    [myOrders]
  );

  // Place Order with Business Validations + Duplicate Submission Lock
  const placeCustomerOrder = async ({
    paymentMethod = 'UPI (PhonePe)',
    specialInstructions = '',
    addressId = selectedAddressId,
  } = {}) => {
    if (isPlacingOrder) return null;

    if (hydratedCartItems.length === 0) {
      toast.error('Your cart is empty. Add delicious items before checkout.');
      return null;
    }

    if (cartRestaurant?.status === 'Closed') {
      toast.error(`${cartRestaurant.name} is currently closed.`);
      return null;
    }

    const unavailable = hydratedCartItems.filter((i) => !i.inStock);
    if (unavailable.length > 0) {
      toast.error(`Remove unavailable item(s): ${unavailable.map((u) => u.name).join(', ')}`);
      return null;
    }

    const deliveryAddrObj =
      addresses.find((a) => a.id === addressId) || addresses.find((a) => a.isDefault) || addresses[0];

    if (!deliveryAddrObj) {
      toast.error('Please add and select a delivery address before placing your order.');
      return null;
    }

    setIsPlacingOrder(true);
    try {
      const custRecord = ensureCustomerAccount ? ensureCustomerAccount(user) : linkedCustomer;
      const fullAddress = [
        deliveryAddrObj.street,
        deliveryAddrObj.landmark,
        deliveryAddrObj.city,
        deliveryAddrObj.state,
      ]
        .filter(Boolean)
        .join(', ')
        .concat(deliveryAddrObj.pincode ? ` - ${deliveryAddrObj.pincode}` : '');

      const orderDateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const created = await createOrder({
        source: 'Customer Portal',
        orderDate: orderDateStr,
        customerId: custRecord?.id || user?.id,
        customer: {
          id: custRecord?.id || user?.id,
          name: deliveryAddrObj.fullName || user?.name,
          email: user?.email,
          phone: deliveryAddrObj.phone || user?.phone,
          avatar: user?.avatar,
          address: fullAddress,
          city: deliveryAddrObj.city,
          state: deliveryAddrObj.state,
        },
        restaurant: cartRestaurant?.name || cart.restaurantName || 'Foodix Kitchen',
        restaurantId: cart.restaurantId || 'rest_001',
        items: hydratedCartItems.map((it) => ({
          id: it.id,
          name: it.name,
          qty: it.qty,
          price: it.price,
          instructions: '',
        })),
        subtotal: cartTotals.subtotal,
        discount: cartTotals.discount,
        couponCode: cartTotals.couponResult?.valid ? appliedCouponCode : null,
        deliveryFee: cartTotals.deliveryFee,
        tax: cartTotals.tax,
        grandTotal: cartTotals.grandTotal,
        amount: cartTotals.grandTotal,
        paymentMethod,
        deliveryAddress: fullAddress,
        specialInstructions:
          specialInstructions ||
          (preferences.contactlessDelivery ? 'Contactless delivery requested at doorstep.' : ''),
        estimatedDeliveryTime: cartRestaurant?.deliveryTime || '25-35 mins',
      });

      if (!created?.id) return null;

      if (cartTotals.couponResult?.valid && appliedCouponCode) {
        recordCouponUsage(appliedCouponCode);
      }

      if (preferences.orderUpdates !== false) {
        addNotification({
          title: `Order ${created.id} Placed!`,
          message: `Your order from ${
            cartRestaurant?.name || cart.restaurantName
          } worth ₹${(created.grandTotal || cartTotals.grandTotal).toLocaleString()} is awaiting restaurant confirmation.`,
          type: 'order',
          orderId: created.id,
          customerEmail: user?.email,
        });
      }

      clearCart();
      return created;
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Reorder Past Order (validates live stock & prices)
  const reorderPastOrder = (order) => {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      toast.warn('No items found in this order to reorder.');
      return false;
    }

    const rest =
      restaurants.find((r) => r.id === order.restaurantId) ||
      restaurants.find((r) => r.name?.toLowerCase() === order.restaurant?.toLowerCase());

    if (rest?.status === 'Closed') {
      toast.warn(`${rest.name} is currently closed for orders.`);
      return false;
    }

    const restMenu = rest ? getMergedMenuForRestaurant(rest.id) : allPlatformDishes;
    const itemsToAdd = [];
    const skipped = [];

    order.items.forEach((it) => {
      const liveDish =
        restMenu.find((d) => d.id === it.id || d.name?.toLowerCase() === it.name?.toLowerCase()) ||
        allPlatformDishes.find((d) => d.name?.toLowerCase() === it.name?.toLowerCase());

      if (liveDish && liveDish.inStock === false) {
        skipped.push(it.name);
        return;
      }

      itemsToAdd.push({
        id: liveDish?.id || it.id || `dish_${it.name}`,
        name: liveDish?.name || it.name,
        price: liveDish?.price ?? it.price ?? 149,
        originalPrice: liveDish?.originalPrice,
        image:
          liveDish?.image ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
        isVeg: liveDish?.isVeg ?? true,
        inStock: true,
        restaurantId: rest?.id || order.restaurantId || 'rest_001',
        restaurantName: rest?.name || order.restaurant || 'Foodix Partner',
        qty: it.qty || 1,
      });
    });

    if (itemsToAdd.length === 0) {
      toast.error('All items from this order are currently unavailable.');
      return false;
    }

    setCart({
      restaurantId: rest?.id || order.restaurantId || 'rest_001',
      restaurantName: rest?.name || order.restaurant || 'Foodix Partner',
      items: itemsToAdd,
    });
    setAppliedCouponCode('');

    if (skipped.length > 0) {
      toast.warn(`Added available items. Skipped unavailable: ${skipped.join(', ')}`);
    } else {
      toast.success(`Added ${itemsToAdd.length} item(s) from ${order.id} to your cart!`);
    }
    return true;
  };

  // Eligible Cancellation Rule: Only Pending or Confirmed orders can be cancelled by customer
  const canCancelOrder = (order) =>
    ['Pending', 'Confirmed'].includes(order?.status);

  const cancelCustomerOrder = (orderId, reason) => {
    const target = myOrders.find((o) => o.id === orderId);
    if (!target) return false;
    if (!canCancelOrder(target)) {
      toast.error(
        `Order ${orderId} is already "${target.status}" and cannot be cancelled now.`
      );
      return false;
    }
    cancelOrder(orderId, reason || 'Cancelled by customer');
    if (preferences.orderUpdates !== false) {
      addNotification({
        title: `Order ${orderId} Cancelled`,
        message: `Cancellation confirmed. Refund (if paid online) will reflect within 2-4 business hours.`,
        type: 'cancellation',
        orderId,
        customerEmail: user?.email,
      });
    }
    return true;
  };

  // Customer-scoped Notifications & Support Tickets
  const myNotifications = useMemo(() => {
    const normEmail = user?.email?.toLowerCase();
    return notifications.filter(
      (n) => !n.customerEmail || n.customerEmail.toLowerCase() === normEmail
    );
  }, [notifications, user?.email]);

  const myUnreadNotificationsCount = useMemo(
    () => myNotifications.filter((n) => !n.isRead).length,
    [myNotifications]
  );

  const myTickets = useMemo(() => {
    const normEmail = user?.email?.toLowerCase();
    return tickets.filter(
      (t) =>
        !t.customerEmail ||
        t.customerEmail.toLowerCase() === normEmail ||
        t.customerName === user?.name
    );
  }, [tickets, user?.email, user?.name]);

  const updatePreferences = (partial) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
    toast.success('Preferences saved!');
  };

  return (
    <CustomerPortalContext.Provider
      value={{
        // Live Location
        liveLocation,
        selectedLocation,
        locationLoading,
        locationError,
        setLocationError,
        isLocationModalOpen,
        setIsLocationModalOpen,
        detectCurrentLocation,
        selectManualLocation,
        saveLocationAsAddress,
        clearLocation,
        searchAddressSuggestions,
        // Catalog & Menus (enriched with real proximity & delivery zone)
        restaurants: locationAwareRestaurants,
        getMergedMenuForRestaurant,
        allPlatformDishes,
        coupons,
        // Cart & Checkout
        cart,
        cartRestaurant,
        hydratedCartItems,
        cartItemCount,
        hasUnavailableCartItems,
        cartTotals,
        appliedCouponCode,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        cartConflict,
        confirmReplaceCart,
        cancelReplaceCart,
        isPlacingOrder,
        placeCustomerOrder,
        // Orders & Tracking
        myOrders,
        activeOrders,
        refreshOrdersFromApi,
        reorderPastOrder,
        canCancelOrder,
        cancelCustomerOrder,
        // Favorites & Discovery
        favoriteRestaurantIds,
        favoriteDishIds,
        toggleFavoriteRestaurant,
        toggleFavoriteDish,
        recentlyViewedIds,
        recordRestaurantView,
        recentSearches,
        addSearchHistory,
        removeSearchTerm,
        clearSearchHistory,
        // Addresses
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        // Modals & Preferences
        activeFoodModal,
        setActiveFoodModal,
        preferences,
        updatePreferences,
        linkedCustomer,
        // Notifications & Support
        myNotifications,
        myUnreadNotificationsCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        myTickets,
        createSupportTicket,
        addCustomerReply,
      }}
    >
      {children}
    </CustomerPortalContext.Provider>
  );
}

export function useCustomerPortal() {
  const ctx = useContext(CustomerPortalContext);
  if (!ctx) {
    throw new Error('useCustomerPortal must be used within a CustomerPortalProvider');
  }
  return ctx;
}
