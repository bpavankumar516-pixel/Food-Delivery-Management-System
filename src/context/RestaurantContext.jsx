import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { INITIAL_RESTAURANTS } from '../data/mockRestaurants';
import { generateDefaultMenuForRestaurant } from '../data/mockMenuItems';
import { INITIAL_MENU_MANAGEMENT_ITEMS } from '../data/mockMenuManagementItems';
import restaurantService from '../services/restaurantService';
import menuService from '../services/menuService';

export const RestaurantContext = createContext(null);

const STORAGE_KEY = 'foodix_restaurants_v3';
const ACTIVITIES_STORAGE_KEY = 'foodix_activities_v2';
const MENUS_STORAGE_KEY = 'foodix_restaurant_menus_v2';
const MASTER_MENU_STORAGE_KEY = 'foodix_master_menu_v4';

const INITIAL_ACTIVITIES = [
  {
    id: 'act_1',
    type: 'order',
    action: 'order',
    title: 'New order #FDX1005',
    subtitle: 'Preparing • Pizza Hut',
    time: '2 mins ago',
    timestamp: Date.now() - 2 * 60 * 1000,
    color: 'emerald',
    badge: 'Order',
  },
  {
    id: 'act_2',
    type: 'restaurant',
    action: 'create',
    title: 'New restaurant registered',
    subtitle: 'Burger King (Koramangala)',
    restaurantId: 'rest_001',
    time: '5 mins ago',
    timestamp: Date.now() - 5 * 60 * 1000,
    color: 'orange',
    badge: 'Restaurant',
  },
  {
    id: 'act_3',
    type: 'delivery',
    action: 'delivery',
    title: 'Order #FDX1004 delivered',
    subtitle: "Domino's Pizza • Jayanagar",
    time: '8 mins ago',
    timestamp: Date.now() - 8 * 60 * 1000,
    color: 'emerald',
    badge: 'Delivered',
  },
  {
    id: 'act_4',
    type: 'customer',
    action: 'customer',
    title: 'New customer registered',
    subtitle: 'Rahul Sharma (Bangalore)',
    time: '12 mins ago',
    timestamp: Date.now() - 12 * 60 * 1000,
    color: 'blue',
    badge: 'Customer',
  },
];

export function RestaurantProvider({ children }) {
  // Initialize from localStorage or fallback to pre-seeded 24 restaurants
  const [restaurants, setRestaurants] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved restaurants from localStorage', e);
    }
    return INITIAL_RESTAURANTS;
  });

  // Sync to localStorage whenever restaurants state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
    } catch (e) {
      console.warn('Failed to save restaurants to localStorage', e);
    }
  }, [restaurants]);

  // Initial fetch: triggers GET /api/restaurants visible in browser Network tab
  useEffect(() => {
    restaurantService.getRestaurants().catch((err) => {
      console.warn('[API Network] GET /api/restaurants handled:', err.message);
    });
  }, []);

  // Real-Time Dynamic Activities
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse activities from localStorage', e);
    }
    return INITIAL_ACTIVITIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.warn('Failed to save activities to localStorage', e);
    }
  }, [activities]);

  // Add Dynamic Activity
  const addActivity = (actData) => {
    const newAct = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: 'Just now',
      timestamp: Date.now(),
      ...actData,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
  };

  const clearActivities = () => {
    setActivities(INITIAL_ACTIVITIES);
    localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
  };

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All Cuisines');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [sortBy, setSortBy] = useState('Most Popular');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Interactive Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Custom Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    restaurant: null,
    onConfirmed: null,
  });

  // Dynamically compute stats from actual restaurant list
  const stats = useMemo(() => {
    const total = restaurants.length;
    const open = restaurants.filter((r) => r.status === 'Open').length;
    const closed = restaurants.filter((r) => r.status === 'Closed').length;
    return {
      totalRestaurants: total,
      totalChange: '+12% vs last month',
      openRestaurants: open,
      openChange: '+8% vs last month',
      closedRestaurants: closed,
      closedChange: '-3% vs last month',
    };
  }, [restaurants]);

  // Dynamically compute cuisine categories with counts matching reference
  const cuisineCategories = useMemo(() => {
    const baseCategories = [
      { id: 'burgers', name: 'Burgers', icon: 'burger' },
      { id: 'pizza', name: 'Pizza', icon: 'pizza' },
      { id: 'indian', name: 'Indian', icon: 'curry' },
      { id: 'chinese', name: 'Chinese', icon: 'noodles' },
      { id: 'mexican', name: 'Mexican', icon: 'taco' },
      { id: 'japanese', name: 'Japanese', icon: 'sushi' },
      { id: 'fast_food', name: 'Fast Food', icon: 'fastfood' },
      { id: 'others', name: 'Others', icon: 'others' },
    ];

    return baseCategories.map((cat) => {
      const count = restaurants.filter(
        (r) => r.category === cat.name || r.secondaryCategory === cat.name
      ).length;
      return { ...cat, count };
    });
  }, [restaurants]);

  // Filtered and Sorted Restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = r.name?.toLowerCase().includes(q);
          const matchLoc = r.location?.toLowerCase().includes(q);
          const matchCuisine =
            Array.isArray(r.cuisines) &&
            r.cuisines.some((c) => c.toLowerCase().includes(q));
          if (!matchName && !matchLoc && !matchCuisine) return false;
        }

        if (selectedCuisine && selectedCuisine !== 'All Cuisines') {
          const matchCat =
            r.category?.toLowerCase() === selectedCuisine.toLowerCase() ||
            r.secondaryCategory?.toLowerCase() === selectedCuisine.toLowerCase();
          if (!matchCat) return false;
        }

        if (selectedRating && selectedRating !== 'All Ratings') {
          if (selectedRating === '4.5 & above' && r.rating < 4.5) return false;
          if (selectedRating === '4.0 & above' && r.rating < 4.0) return false;
          if (selectedRating === '3.5 & above' && r.rating < 3.5) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Highest Rated') return b.rating - a.rating;
        if (sortBy === 'Delivery Time') {
          const getTime = (str) => parseInt(str.split('-')[0]) || 0;
          return getTime(a.deliveryTime) - getTime(b.deliveryTime);
        }
        if (sortBy === 'Delivery Fee') return a.deliveryFee - b.deliveryFee;
        if (sortBy === 'Name (A-Z)') return a.name.localeCompare(b.name);
        const parseReviews = (rev) => {
          if (typeof rev === 'number') return rev;
          if (rev.includes('k')) return parseFloat(rev) * 1000;
          return parseInt(rev) || 0;
        };
        return parseReviews(b.reviews) - parseReviews(a.reviews);
      });
  }, [restaurants, searchQuery, selectedCuisine, selectedRating, sortBy]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage) || 1;
  const paginatedRestaurants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRestaurants.slice(start, start + itemsPerPage);
  }, [filteredRestaurants, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCuisine, selectedRating, sortBy]);

  const getRestaurantById = (id) => {
    return restaurants.find((r) => r.id === id);
  };

  // Add Restaurant Action + Logs Activity
  const addRestaurant = (newRestaurantData) => {
    const newRestaurant = {
      id: `rest_${Date.now()}`,
      name: newRestaurantData.name.trim(),
      logo:
        newRestaurantData.logo ||
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=150',
      image:
        newRestaurantData.image ||
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600',
      status: newRestaurantData.status || 'Open',
      category: newRestaurantData.category || 'Burgers',
      secondaryCategory: newRestaurantData.secondaryCategory || null,
      cuisines: Array.isArray(newRestaurantData.cuisines)
        ? newRestaurantData.cuisines
        : typeof newRestaurantData.cuisines === 'string'
        ? newRestaurantData.cuisines.split(',').map((c) => c.trim()).filter(Boolean)
        : ['Fast Food', 'Delicacy'],
      rating: parseFloat(newRestaurantData.rating) || 4.5,
      reviews: newRestaurantData.reviews || '1',
      deliveryTime: newRestaurantData.deliveryTime || '25-35 mins',
      deliveryFee: parseInt(newRestaurantData.deliveryFee) || 0,
      formattedFee: parseInt(newRestaurantData.deliveryFee) === 0 ? 'Free Delivery' : `₹${parseInt(newRestaurantData.deliveryFee) || 35} delivery fee`,
      location: newRestaurantData.location || 'Koramangala, Bengaluru',
      address: newRestaurantData.address || `${newRestaurantData.location || 'Koramangala'}, Bengaluru, Karnataka`,
      phone: newRestaurantData.phone || '+91 80 4000 1234',
      pureVeg: !!newRestaurantData.pureVeg,
      featuredDishes: Array.isArray(newRestaurantData.featuredDishes)
        ? newRestaurantData.featuredDishes
        : typeof newRestaurantData.featuredDishes === 'string'
        ? newRestaurantData.featuredDishes.split(',').map((d) => d.trim()).filter(Boolean)
        : ['Chef Special Dish', 'Popular Combo', 'Classic Delight'],
      isFavorite: false,
      ownerName: newRestaurantData.ownerName || 'Foodix Partner',
      createdAt: new Date().toISOString(),
    };

    setRestaurants((prev) => [newRestaurant, ...prev]);
    setCurrentPage(1);

    // Network Tab: POST /api/restaurants
    restaurantService.createRestaurant(newRestaurant).catch((err) => {
      console.warn('[Network API] POST /api/restaurants:', err.message);
    });

    // Dynamically log activity for Dashboard Recent Activities
    addActivity({
      type: 'restaurant',
      action: 'create',
      title: 'New restaurant registered',
      subtitle: `${newRestaurant.name} (${newRestaurant.location})`,
      restaurantId: newRestaurant.id,
      color: 'orange',
      badge: 'New Partner',
    });

    toast.success(`Restaurant "${newRestaurant.name}" added successfully!`);
    setIsAddModalOpen(false);
    return newRestaurant;
  };

  // Update Restaurant Action + Logs Activity
  const updateRestaurant = (id, updatedFields) => {
    let updatedTarget = null;
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = {
            ...r,
            ...updatedFields,
            cuisines: Array.isArray(updatedFields.cuisines)
              ? updatedFields.cuisines
              : typeof updatedFields.cuisines === 'string'
              ? updatedFields.cuisines.split(',').map((c) => c.trim())
              : r.cuisines,
          };
          if (updatedFields.deliveryFee !== undefined) {
            updated.deliveryFee = parseInt(updatedFields.deliveryFee);
            updated.formattedFee = `₹${updated.deliveryFee} delivery fee`;
          }
          updatedTarget = updated;
          return updated;
        }
        return r;
      })
    );

    // Network Tab: PUT /api/restaurants/:id
    restaurantService.updateRestaurant(id, updatedFields).catch((err) => {
      console.warn(`[Network API] PUT /api/restaurants/${id}:`, err.message);
    });

    if (updatedTarget) {
      addActivity({
        type: 'restaurant',
        action: 'update',
        title: 'Restaurant details updated',
        subtitle: `${updatedTarget.name} • ${updatedTarget.location}`,
        restaurantId: updatedTarget.id,
        color: 'blue',
        badge: 'Updated',
      });
    }

    toast.success('Restaurant details updated successfully!');
    setIsEditModalOpen(false);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (restaurant, onConfirmed = null) => {
    setDeleteModalState({
      isOpen: true,
      restaurant,
      onConfirmed,
    });
  };

  // Close Delete Confirmation Modal
  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      restaurant: null,
      onConfirmed: null,
    });
  };

  // Confirm Delete Action + Logs Activity
  const confirmDelete = () => {
    if (!deleteModalState.restaurant) return;
    const target = deleteModalState.restaurant;
    setRestaurants((prev) => prev.filter((r) => r.id !== target.id));

    // Network Tab: DELETE /api/restaurants/:id
    restaurantService.deleteRestaurant(target.id).catch((err) => {
      console.warn(`[Network API] DELETE /api/restaurants/${target.id}:`, err.message);
    });

    // Log deletion activity
    addActivity({
      type: 'restaurant',
      action: 'delete',
      title: 'Restaurant removed from platform',
      subtitle: `${target.name} (${target.location})`,
      color: 'rose',
      badge: 'Removed',
    });

    toast.info(`Restaurant "${target.name}" has been deleted.`);
    closeDeleteModal();
  };

  // Direct Delete fallback
  const deleteRestaurant = (id) => {
    const target = restaurants.find((r) => r.id === id);
    if (target) {
      openDeleteModal(target);
    }
  };

  // Toggle Restaurant Open/Closed Status + Logs Activity
  const toggleStatus = (id) => {
    let nextStatus = 'Open';
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newStatus = r.status === 'Open' ? 'Closed' : 'Open';
          nextStatus = newStatus;

          // Log live status update activity
          addActivity({
            type: 'restaurant',
            action: 'status',
            title: `${r.name} marked as ${newStatus}`,
            subtitle: `${r.location} • Now ${newStatus.toLowerCase()} for orders`,
            restaurantId: r.id,
            color: newStatus === 'Open' ? 'emerald' : 'rose',
            badge: newStatus,
          });

          toast.info(`${r.name} status changed to ${newStatus}`);
          return { ...r, status: newStatus };
        }
        return r;
      })
    );

    // Network Tab: PATCH /api/restaurants/:id/status
    restaurantService.toggleStatus(id, nextStatus).catch((err) => {
      console.warn(`[Network API] PATCH /api/restaurants/${id}/status:`, err.message);
    });
  };

  // Toggle Favorite Heart + Logs Activity
  const toggleFavorite = (id) => {
    let targetFav = false;
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextFav = !r.isFavorite;
          targetFav = nextFav;

          if (nextFav) {
            addActivity({
              type: 'restaurant',
              action: 'favorite',
              title: 'Marked as favorite',
              subtitle: `${r.name} (${r.category})`,
              restaurantId: r.id,
              color: 'rose',
              badge: 'Favorite',
            });
          }

          return { ...r, isFavorite: nextFav };
        }
        return r;
      })
    );

    // Network Tab: PATCH /api/restaurants/:id/favorite
    restaurantService.toggleFavorite(id, targetFav).catch((err) => {
      console.warn(`[Network API] PATCH /api/restaurants/${id}/favorite:`, err.message);
    });
  };

  // Open Details Modal
  const openDetailsModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsEditModalOpen(true);
  };

  // Reset to default 24 restaurants
  const resetToDefaults = () => {
    setRestaurants(INITIAL_RESTAURANTS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MENUS_STORAGE_KEY);
    setMenusByRestaurant({});
    toast.info('Restored 24 initial restaurants and menus.');
  };

  // Restaurant-specific Food Items & Menus (with localStorage persistence)
  const [menusByRestaurant, setMenusByRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem(MENUS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse menus from localStorage', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(menusByRestaurant));
    } catch (e) {
      console.warn('Failed to save menus to localStorage', e);
    }
  }, [menusByRestaurant]);

  // Master Menu Items for Central Menu Management (pre-seeded 24 items with exact categories)
  const [allMenuItems, setAllMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem(MASTER_MENU_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse master menu items from localStorage', e);
    }
    return INITIAL_MENU_MANAGEMENT_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(MASTER_MENU_STORAGE_KEY, JSON.stringify(allMenuItems));
    } catch (e) {
      console.warn('Failed to save master menu items to localStorage', e);
    }
  }, [allMenuItems]);

  // Network Tab Trigger: GET /api/menu on initial mount
  useEffect(() => {
    menuService.getAllMenuItems().catch(() => {});
  }, []);

  // Custom Delete Confirmation Modal State for Menu Items
  const [deleteMenuModalState, setDeleteMenuModalState] = useState({
    isOpen: false,
    item: null,
    onConfirmed: null,
  });

  const openDeleteMenuModal = (item, onConfirmed = null) => {
    setDeleteMenuModalState({
      isOpen: true,
      item,
      onConfirmed,
    });
  };

  const closeDeleteMenuModal = () => {
    setDeleteMenuModalState({
      isOpen: false,
      item: null,
      onConfirmed: null,
    });
  };

  const confirmDeleteMenuItem = () => {
    if (!deleteMenuModalState.item) return;
    const target = deleteMenuModalState.item;
    deleteMasterMenuItem(target.id);
    if (typeof deleteMenuModalState.onConfirmed === 'function') {
      deleteMenuModalState.onConfirmed();
    }
    closeDeleteMenuModal();
  };

  // Central Menu Management: Add New Dish (Two-way synced with restaurant)
  const addMasterMenuItem = (dishData) => {
    const dishId = `dish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedPrice = parseInt(dishData.price) || 199;
    const parsedOrig = dishData.originalPrice
      ? parseInt(dishData.originalPrice)
      : Math.round(parsedPrice * 1.25);

    // Find assigned restaurant if any
    const assignedRest = restaurants.find((r) => r.id === dishData.restaurantId);

    const newDish = {
      id: dishId,
      name: dishData.name.trim(),
      category: dishData.category || 'Pizza',
      isVeg: !!dishData.isVeg,
      price: parsedPrice,
      originalPrice: parsedOrig,
      description:
        dishData.description?.trim() ||
        'Chef-crafted delicacy made fresh with organic ingredients and signature seasonings.',
      image:
        dishData.image ||
        (dishData.isVeg
          ? 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600'
          : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600'),
      inStock: dishData.inStock !== false,
      isFavorite: false,
      rating: parseFloat(dishData.rating) || 4.7,
      votes: Math.floor(Math.random() * 80) + 20,
      restaurantId: dishData.restaurantId || (assignedRest ? assignedRest.id : 'rest_001'),
      restaurantName: assignedRest ? assignedRest.name : 'Foodix Kitchen',
      spicyLevel: dishData.spicyLevel || 'Mild',
      prepTime: dishData.prepTime || '15-20 mins',
      calories: dishData.calories || `${Math.floor(Math.random() * 300) + 350} kcal`,
      createdAt: new Date().toISOString(),
    };

    // 1. Add to central master menu items
    setAllMenuItems((prev) => [newDish, ...prev]);

    // 2. Also two-way sync: Add to the restaurant's menu list!
    if (newDish.restaurantId) {
      const restId = newDish.restaurantId;
      setMenusByRestaurant((prev) => {
        const rest = restaurants.find((r) => r.id === restId);
        const existing = prev[restId] || (rest ? generateDefaultMenuForRestaurant(rest) : []);
        return {
          ...prev,
          [restId]: [newDish, ...existing],
        };
      });

      // Network Tab: POST /api/restaurants/:id/menu
      menuService.addDish(restId, newDish).catch(() => {});
    }

    // Network Tab: POST /api/menu
    menuService.addMasterMenuItem(newDish).catch(() => {});

    // Live Dashboard Activity
    addActivity({
      type: 'menu',
      action: 'item_add',
      title: 'New food item added to platform',
      subtitle: `${newDish.name} (${newDish.category} • ₹${newDish.price}) - ${newDish.restaurantName}`,
      restaurantId: newDish.restaurantId,
      color: newDish.isVeg ? 'emerald' : 'orange',
      badge: newDish.isVeg ? 'Veg' : 'Non-Veg',
    });

    toast.success(`"${newDish.name}" added to Menu successfully!`);
    return newDish;
  };

  // Central Menu Management: Update Dish
  const updateMasterMenuItem = (dishId, updatedFields) => {
    let targetDish = null;

    setAllMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === dishId) {
          const updated = {
            ...item,
            ...updatedFields,
            price:
              updatedFields.price !== undefined
                ? parseInt(updatedFields.price) || 0
                : item.price,
            originalPrice:
              updatedFields.originalPrice !== undefined
                ? parseInt(updatedFields.originalPrice) || 0
                : item.originalPrice,
          };
          targetDish = updated;
          return updated;
        }
        return item;
      })
    );

    // Two-way sync: Update in restaurant menu if assigned
    if (targetDish && targetDish.restaurantId) {
      const restId = targetDish.restaurantId;
      setMenusByRestaurant((prev) => {
        if (!prev[restId]) return prev;
        return {
          ...prev,
          [restId]: prev[restId].map((m) => (m.id === dishId ? { ...m, ...targetDish } : m)),
        };
      });

      // Network Tab: PUT /api/restaurants/:id/menu/:itemId
      menuService.updateDish(restId, dishId, targetDish).catch(() => {});
    }

    // Network Tab: PUT /api/menu/:id
    menuService.updateMasterMenuItem(dishId, updatedFields).catch(() => {});

    toast.success('Menu item updated successfully!');
  };

  // Central Menu Management: Delete Dish
  const deleteMasterMenuItem = (dishId) => {
    let deletedName = 'Dish';
    let targetRestId = null;

    setAllMenuItems((prev) => {
      const found = prev.find((item) => item.id === dishId);
      if (found) {
        deletedName = found.name;
        targetRestId = found.restaurantId;
      }
      return prev.filter((item) => item.id !== dishId);
    });

    // Two-way sync: Remove from restaurant menu
    if (targetRestId) {
      setMenusByRestaurant((prev) => {
        if (!prev[targetRestId]) return prev;
        return {
          ...prev,
          [targetRestId]: prev[targetRestId].filter((m) => m.id !== dishId),
        };
      });

      // Network Tab: DELETE /api/restaurants/:id/menu/:itemId
      menuService.deleteDish(targetRestId, dishId).catch(() => {});
    }

    // Network Tab: DELETE /api/menu/:id
    menuService.deleteMasterMenuItem(dishId).catch(() => {});

    // Activity Log
    addActivity({
      type: 'menu',
      action: 'delete',
      title: 'Food item deleted',
      subtitle: `"${deletedName}" removed from active platform menu`,
      color: 'rose',
      badge: 'Removed',
    });

    toast.info(`"${deletedName}" deleted from menu.`);
  };

  // Central Menu Management: Toggle Item Stock
  const toggleMasterItemStock = (dishId) => {
    let newStatus = true;
    let itemName = 'Dish';
    let targetRestId = null;

    setAllMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === dishId) {
          newStatus = !item.inStock;
          itemName = item.name;
          targetRestId = item.restaurantId;
          return { ...item, inStock: newStatus };
        }
        return item;
      })
    );

    // Two-way sync: Also toggle in restaurant menu
    if (targetRestId) {
      setMenusByRestaurant((prev) => {
        if (!prev[targetRestId]) return prev;
        return {
          ...prev,
          [targetRestId]: prev[targetRestId].map((m) =>
            m.id === dishId ? { ...m, inStock: newStatus } : m
          ),
        };
      });

      // Network Tab: PATCH /api/restaurants/:id/menu/:itemId/stock
      menuService.toggleStock(targetRestId, dishId, newStatus).catch(() => {});
    }

    // Network Tab: PATCH /api/menu/:id/stock
    menuService.toggleMasterItemStock(dishId, newStatus).catch(() => {});

    if (newStatus) {
      toast.success(`"${itemName}" is now marked as Available`);
    } else {
      toast.warn(`"${itemName}" is marked as Unavailable (Out of Stock)`);
    }
  };

  // Central Menu Management: Toggle Favorite Heart
  const toggleMasterItemFavorite = (dishId) => {
    let nextFav = false;
    setAllMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === dishId) {
          nextFav = !item.isFavorite;
          return { ...item, isFavorite: nextFav };
        }
        return item;
      })
    );

    // Network Tab: PATCH /api/menu/:id/favorite
    menuService.toggleMasterItemFavorite(dishId, nextFav).catch(() => {});
  };

  // Get Restaurant Menu items (returns existing or dynamically generated defaults)
  const getRestaurantMenu = (restaurantId) => {
    // Trigger Network Tab: GET /api/restaurants/:id/menu
    menuService.getMenu(restaurantId).catch(() => {});

    if (menusByRestaurant[restaurantId] && Array.isArray(menusByRestaurant[restaurantId])) {
      return menusByRestaurant[restaurantId];
    }
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) return [];
    const defaults = generateDefaultMenuForRestaurant(restaurant);
    return defaults;
  };

  // Add Menu Item to Restaurant (automatically syncs to master menu items too!)
  const addMenuItem = (restaurantId, newItemData) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    const existing =
      menusByRestaurant[restaurantId] ||
      (restaurant ? generateDefaultMenuForRestaurant(restaurant) : []);
    const isPureVegRestaurant = !!(restaurant && restaurant.pureVeg);

    const isVeg = isPureVegRestaurant ? true : !!newItemData.isVeg;
    const newItem = {
      id: `dish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      restaurantId,
      restaurantName: restaurant?.name || 'Partner Restaurant',
      name: newItemData.name.trim(),
      category: newItemData.category || 'Main Course',
      price: parseInt(newItemData.price) || 199,
      originalPrice: newItemData.originalPrice
        ? parseInt(newItemData.originalPrice)
        : Math.round((parseInt(newItemData.price) || 199) * 1.25),
      rating: parseFloat(newItemData.rating) || 4.7,
      votes: Math.floor(Math.random() * 80) + 20,
      isVeg,
      isBestseller: !!newItemData.isBestseller,
      inStock: newItemData.inStock !== false,
      spicyLevel: newItemData.spicyLevel || 'Mild',
      description:
        newItemData.description?.trim() ||
        'Prepared fresh using chef secret herbs, premium farm ingredients, and authentic recipes.',
      image:
        newItemData.image ||
        (isVeg
          ? 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=450'
          : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=450'),
      createdAt: new Date().toISOString(),
    };

    // 1. Add to restaurant's menu
    setMenusByRestaurant((prev) => ({
      ...prev,
      [restaurantId]: [newItem, ...existing],
    }));

    // 2. Also two-way sync: Add to master menu items so it appears in Menu Management!
    setAllMenuItems((prev) => {
      if (prev.some((item) => item.id === newItem.id)) return prev;
      return [newItem, ...prev];
    });

    // Network Tab: POST /api/restaurants/:id/menu
    menuService.addDish(restaurantId, newItem).catch((err) => {
      console.warn(`[Network API] POST /api/restaurants/${restaurantId}/menu:`, err.message);
    });

    // Log Activity for real-time dashboard feed
    addActivity({
      type: 'menu',
      action: 'item_add',
      title: 'New food item introduced',
      subtitle: `${newItem.name} (${newItem.isVeg ? '🟢 Veg' : '🔴 Non-Veg'} • ₹${newItem.price}) - ${restaurant?.name || 'Restaurant'}`,
      restaurantId,
      color: newItem.isVeg ? 'emerald' : 'orange',
      badge: newItem.isVeg ? 'Veg' : 'Non-Veg',
    });

    toast.success(`"${newItem.name}" added to menu successfully!`);
    return newItem;
  };

  // Update Menu Item (two-way sync with master menu)
  const updateMenuItem = (restaurantId, itemId, updatedFields) => {
    setMenusByRestaurant((prev) => {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      const existing =
        prev[restaurantId] || (restaurant ? generateDefaultMenuForRestaurant(restaurant) : []);
      const updated = existing.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            ...updatedFields,
            price:
              updatedFields.price !== undefined
                ? parseInt(updatedFields.price) || 0
                : item.price,
            rating:
              updatedFields.rating !== undefined
                ? parseFloat(updatedFields.rating) || item.rating
                : item.rating,
          };
        }
        return item;
      });
      return { ...prev, [restaurantId]: updated };
    });

    // Sync with allMenuItems
    setAllMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updatedFields } : item))
    );

    // Network Tab: PUT /api/restaurants/:id/menu/:itemId
    menuService.updateDish(restaurantId, itemId, updatedFields).catch((err) => {
      console.warn(`[Network API] PUT /api/restaurants/${restaurantId}/menu/${itemId}:`, err.message);
    });

    toast.success('Food item updated successfully!');
  };

  // Toggle Item Stock (In Stock / Sold Out)
  const toggleItemStock = (restaurantId, itemId) => {
    let newStatus = true;
    let itemName = 'Dish';

    setMenusByRestaurant((prev) => {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      const existing =
        prev[restaurantId] || (restaurant ? generateDefaultMenuForRestaurant(restaurant) : []);
      const updated = existing.map((item) => {
        if (item.id === itemId) {
          newStatus = !item.inStock;
          itemName = item.name;
          return { ...item, inStock: newStatus };
        }
        return item;
      });
      return { ...prev, [restaurantId]: updated };
    });

    // Sync with allMenuItems
    setAllMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, inStock: newStatus } : item))
    );

    // Network Tab: PATCH /api/restaurants/:id/menu/:itemId/stock
    menuService.toggleStock(restaurantId, itemId, newStatus).catch((err) => {
      console.warn(`[Network API] PATCH /api/restaurants/${restaurantId}/menu/${itemId}/stock:`, err.message);
    });

    if (newStatus) {
      toast.success(`"${itemName}" is now In Stock (Available for orders)`);
    } else {
      toast.warn(`"${itemName}" marked as Sold Out (Unavailable)`);
    }
  };

  // Delete Menu Item (two-way sync with master menu)
  const deleteMenuItem = (restaurantId, itemId) => {
    let itemName = 'Dish';
    setMenusByRestaurant((prev) => {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      const existing =
        prev[restaurantId] || (restaurant ? generateDefaultMenuForRestaurant(restaurant) : []);
      const itemToDelete = existing.find((i) => i.id === itemId);
      if (itemToDelete) itemName = itemToDelete.name;
      const updated = existing.filter((item) => item.id !== itemId);
      return { ...prev, [restaurantId]: updated };
    });

    // Sync with allMenuItems
    setAllMenuItems((prev) => prev.filter((item) => item.id !== itemId));

    // Network Tab: DELETE /api/restaurants/:id/menu/:itemId
    menuService.deleteDish(restaurantId, itemId).catch((err) => {
      console.warn(`[Network API] DELETE /api/restaurants/${restaurantId}/menu/${itemId}:`, err.message);
    });

    toast.info(`"${itemName}" removed from restaurant menu.`);
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        filteredRestaurants,
        paginatedRestaurants,
        stats,
        cuisineCategories,
        getRestaurantById,
        // Activities
        activities,
        addActivity,
        clearActivities,
        // Filter states
        searchQuery,
        setSearchQuery,
        menuSearchQuery,
        setMenuSearchQuery,
        selectedCuisine,
        setSelectedCuisine,
        selectedRating,
        setSelectedRating,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        // Modals
        isAddModalOpen,
        setIsAddModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        selectedRestaurant,
        setSelectedRestaurant,
        openDetailsModal,
        openEditModal,
        // Custom Delete Confirmation Modal
        deleteModalState,
        openDeleteModal,
        closeDeleteModal,
        confirmDelete,
        // Actions
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        toggleStatus,
        toggleFavorite,
        resetToDefaults,
        // Menu Items & Dishes Management
        menusByRestaurant,
        getRestaurantMenu,
        addMenuItem,
        updateMenuItem,
        toggleItemStock,
        deleteMenuItem,
        // Master Menu Management (Central Page + Two-way sync)
        allMenuItems,
        setAllMenuItems,
        addMasterMenuItem,
        updateMasterMenuItem,
        deleteMasterMenuItem,
        toggleMasterItemStock,
        toggleMasterItemFavorite,
        // Custom Delete Confirmation Modal for Menu
        deleteMenuModalState,
        openDeleteMenuModal,
        closeDeleteMenuModal,
        confirmDeleteMenuItem,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
}
