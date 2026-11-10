import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'foodix_admin_settings_v2';

const DEFAULT_SETTINGS = {
  // Business Settings
  business: {
    platformName: 'Foodix Online Food Delivery',
    legalEntity: 'Foodix Logistics Private Limited',
    supportEmail: 'support@foodix.com',
    supportPhone: '+91 80 4910 2200',
    businessAddress: 'Plot 104, 3rd Floor, Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103',
    openingHours: '08:00 AM',
    closingHours: '11:45 PM',
    serviceRadiusKm: 15,
  },
  // Tax Settings
  tax: {
    isTaxEnabled: true,
    gstPercentage: 5,
    cgstPercentage: 2.5,
    sgstPercentage: 2.5,
    gstinNumber: '29ABCDE1234F1Z5',
    taxInclusivePricing: true,
  },
  // Delivery Settings
  delivery: {
    baseDeliveryFee: 35,
    freeDeliveryThreshold: 499,
    surgePricingMultiplier: 1.0,
    defaultEstimatedMinutes: 30,
    maxDeliveryDistanceKm: 18,
  },
  // Application Settings
  app: {
    currencySymbol: '₹',
    currencyCode: 'INR',
    soundNotifications: true,
    emailOrderAlerts: true,
    smsAlerts: false,
    autoAssignRider: true,
    maintenanceMode: false,
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  const updateBusinessSettings = (data) => {
    setSettings((prev) => ({
      ...prev,
      business: { ...prev.business, ...data },
    }));
    toast.success('Business and platform details updated.');
  };

  const updateTaxSettings = (data) => {
    setSettings((prev) => ({
      ...prev,
      tax: { ...prev.tax, ...data },
    }));
    toast.success('GST tax configuration updated.');
  };

  const updateDeliverySettings = (data) => {
    setSettings((prev) => ({
      ...prev,
      delivery: { ...prev.delivery, ...data },
    }));
    toast.success('Delivery charges & dispatch parameters saved.');
  };

  const updateAppSettings = (data) => {
    setSettings((prev) => ({
      ...prev,
      app: { ...prev.app, ...data },
    }));
    toast.success('Application preferences updated.');
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateBusinessSettings,
        updateTaxSettings,
        updateDeliverySettings,
        updateAppSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
