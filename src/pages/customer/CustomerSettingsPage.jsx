import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  MapPin,
  Heart,
  Tag,
  Bell,
  HelpCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import ProfileSection from '../../components/customerPortal/settings/ProfileSection';
import AddressesSection from '../../components/customerPortal/settings/AddressesSection';
import FavoritesSection from '../../components/customerPortal/settings/FavoritesSection';
import OffersSection from '../../components/customerPortal/settings/OffersSection';
import NotificationsSection from '../../components/customerPortal/settings/NotificationsSection';
import SupportSection from '../../components/customerPortal/settings/SupportSection';
import AccountSettingsSection from '../../components/customerPortal/settings/AccountSettingsSection';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

const SETTINGS_TABS = [
  { id: 'profile', label: 'My Profile', desc: 'Personal details & photo', icon: User },
  { id: 'addresses', label: 'My Addresses', desc: 'Saved delivery points', icon: MapPin },
  { id: 'favorites', label: 'Favorites', desc: 'Restaurants & dishes', icon: Heart },
  { id: 'offers', label: 'Offers & Coupons', desc: 'Discounts & promo codes', icon: Tag },
  { id: 'notifications', label: 'Notifications', desc: 'Alerts & preferences', icon: Bell },
  { id: 'support', label: 'Help & Support', desc: 'FAQs & support tickets', icon: HelpCircle },
  { id: 'account', label: 'Account Settings', desc: 'Language, privacy & logout', icon: Settings },
];

export default function CustomerSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { myUnreadNotificationsCount, favoriteRestaurantIds, favoriteDishIds, addresses } =
    useCustomerPortal();

  const rawTab = searchParams.get('tab') || 'profile';
  const activeTab = SETTINGS_TABS.some((t) => t.id === rawTab) ? rawTab : 'profile';

  const switchTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const getBadge = (id) => {
    if (id === 'notifications' && myUnreadNotificationsCount > 0) return myUnreadNotificationsCount;
    if (id === 'favorites' && favoriteRestaurantIds.length + favoriteDishIds.length > 0) {
      return favoriteRestaurantIds.length + favoriteDishIds.length;
    }
    if (id === 'addresses' && addresses.length > 0) return addresses.length;
    return null;
  };

  return (
    <CustomerLayout>
      <div className="space-y-5">
        {/* Mobile Horizontal Tabs */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {SETTINGS_TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            const badge = getBadge(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer transition-all ${
                  active
                    ? 'bg-[#163A2D] text-white border-[#163A2D] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {badge != null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      active ? 'bg-[#FF6B35] text-white' : 'bg-[#FFF8F0] text-[#FF6B35]'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop 2-Column Left Navigation + Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sticky Settings Navigation */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-3 shadow-2xs sticky top-20 space-y-1">
            <div className="px-3 py-2 mb-1 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Customer Hub
              </p>
              <h1 className="text-base font-black text-[#202A24]">Account & Settings</h1>
            </div>

            {SETTINGS_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              const badge = getBadge(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTab(t.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#163A2D] text-white shadow-sm'
                      : 'text-[#202A24] hover:bg-[#FFF8F0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        active ? 'bg-[#FF6B35] text-white' : 'bg-[#E7EFE8] text-[#163A2D]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate">{t.label}</p>
                      <p
                        className={`text-[10px] truncate ${
                          active ? 'text-emerald-200/85' : 'text-slate-400'
                        }`}
                      >
                        {t.desc}
                      </p>
                    </div>
                  </div>
                  {badge != null ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        active ? 'bg-white text-[#163A2D]' : 'bg-[#FF6B35]/15 text-[#FF6B35]'
                      }`}
                    >
                      {badge}
                    </span>
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        active ? 'text-white' : 'text-slate-300'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </aside>

          {/* Right Settings Section Content */}
          <div className="lg:col-span-9 min-w-0">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'addresses' && <AddressesSection />}
            {activeTab === 'favorites' && <FavoritesSection />}
            {activeTab === 'offers' && <OffersSection />}
            {activeTab === 'notifications' && <NotificationsSection />}
            {activeTab === 'support' && <SupportSection />}
            {activeTab === 'account' && <AccountSettingsSection />}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
