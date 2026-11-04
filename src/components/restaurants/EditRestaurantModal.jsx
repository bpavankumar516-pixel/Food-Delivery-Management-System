import React, { useState, useEffect } from 'react';
import { X, Edit3, Store, MapPin, Clock, DollarSign } from 'lucide-react';
import { useRestaurants } from '../../context/RestaurantContext';

export default function EditRestaurantModal() {
  const { isEditModalOpen, setIsEditModalOpen, selectedRestaurant, updateRestaurant } = useRestaurants();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Burgers',
    cuisines: '',
    location: '',
    deliveryTime: '',
    deliveryFee: '',
    rating: '',
    status: 'Open',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (selectedRestaurant) {
      setFormData({
        name: selectedRestaurant.name || '',
        category: selectedRestaurant.category || 'Burgers',
        cuisines: selectedRestaurant.cuisines ? selectedRestaurant.cuisines.join(', ') : '',
        location: selectedRestaurant.location || '',
        deliveryTime: selectedRestaurant.deliveryTime || '',
        deliveryFee: selectedRestaurant.deliveryFee || '35',
        rating: selectedRestaurant.rating || '4.5',
        status: selectedRestaurant.status || 'Open',
        phone: selectedRestaurant.phone || '',
        address: selectedRestaurant.address || '',
      });
    }
  }, [selectedRestaurant]);

  if (!isEditModalOpen || !selectedRestaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRestaurant(selectedRestaurant.id, {
      ...formData,
      cuisines: formData.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
      deliveryFee: parseInt(formData.deliveryFee) || 35,
      rating: parseFloat(formData.rating) || 4.5,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsEditModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 select-none max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#ff5e28] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Edit Restaurant</h3>
              <p className="text-xs text-orange-100">Update {selectedRestaurant.name} specifications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Restaurant Name */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Restaurant Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium text-xs sm:text-sm"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Primary Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium cursor-pointer"
              >
                <option value="Burgers">Burgers</option>
                <option value="Pizza">Pizza</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Mexican">Mexican</option>
                <option value="Japanese">Japanese</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium cursor-pointer"
              >
                <option value="Open">🟢 Open</option>
                <option value="Closed">🔴 Closed</option>
              </select>
            </div>
          </div>

          {/* Cuisine Tags */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Cuisines (comma separated)</label>
            <input
              type="text"
              value={formData.cuisines}
              onChange={(e) => setFormData({ ...formData, cuisines: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium"
            />
          </div>

          {/* Locality & Delivery Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Locality</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Delivery Time</label>
              <input
                type="text"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium"
              />
            </div>
          </div>

          {/* Delivery Fee & Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ff5e28] font-medium"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ff5e28] hover:bg-[#ff4e12] text-white font-bold shadow-md shadow-orange-600/30 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
