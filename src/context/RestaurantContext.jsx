import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { INITIAL_RESTAURANTS } from '../data/mockRestaurants';
import { generateDefaultMenuForRestaurant } from '../data/mockMenuItems';

const RestaurantContext = createContext(null);

const STORAGE_KEY = 'foodix_restaurants_v3';
const ACTIVITIES_STORAGE_KEY = 'foodix_activities_v2';
const MENUS_STORAGE_KEY = 'foodix_restaurant_menus_v2';

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
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newStatus = r.status === 'Open' ? 'Closed' : 'Open';

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
  };

  // Toggle Favorite Heart + Logs Activity
  const toggleFavorite = (id) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextFav = !r.isFavorite;

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

  // Get Restaurant Menu items (returns existing or dynamically generated defaults)
  const getRestaurantMenu = (restaurantId) => {
    if (menusByRestaurant[restaurantId] && Array.isArray(menusByRestaurant[restaurantId])) {
      return menusByRestaurant[restaurantId];
    }
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) return [];
    const defaults = generateDefaultMenuForRestaurant(restaurant);
    return defaults;
  };

  // Add Menu Item to Restaurant
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
      name: newItemData.name.trim(),
      category: newItemData.category || 'Main Course',
      price: parseInt(newItemData.price) || 199,
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

    setMenusByRestaurant((prev) => ({
      ...prev,
      [restaurantId]: [newItem, ...existing],
    }));

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

  // Update Menu Item
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

    if (newStatus) {
      toast.success(`"${itemName}" is now In Stock (Available for orders)`);
    } else {
      toast.warn(`"${itemName}" marked as Sold Out (Unavailable)`);
    }
  };

  // Delete Menu Item
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
