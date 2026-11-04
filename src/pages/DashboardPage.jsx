import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatCards from '../components/dashboard/StatCards';
import PromoBanner from '../components/dashboard/PromoBanner';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrderStatusDonut from '../components/dashboard/OrderStatusDonut';
import RecentActivities from '../components/dashboard/RecentActivities';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import QuickActions from '../components/dashboard/QuickActions';

// Interactive Modals
import OrderDetailsModal from '../components/dashboard/modals/OrderDetailsModal';
import AddRestaurantModal from '../components/restaurants/AddRestaurantModal';
import AddMenuItemModal from '../components/dashboard/modals/AddMenuItemModal';
import ApplyCouponModal from '../components/dashboard/modals/ApplyCouponModal';
import ReportsModal from '../components/dashboard/modals/ReportsModal';
import AllActivitiesModal from '../components/dashboard/modals/AllActivitiesModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAllActivitiesOpen, setIsAllActivitiesOpen } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8faf9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Dark Emerald Sidebar (Sticky on Desktop, Drawer on Mobile) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Sticky Header with Search, Notifications, Profile */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Inner Dashboard Page Content */}
        <main className="p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1700px] w-full mx-auto">
          {/* Top Section: Welcome Header & Promo Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Welcome Greeting on the Left */}
            <div className="lg:col-span-5 xl:col-span-5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Welcome Back, {user?.name ? user.name.split(' ')[0] : 'Admin'}!</span>
                <span className="inline-block animate-bounce origin-bottom-right">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Here's what's happening with your Foodix platform today.
              </p>
            </div>

            {/* Promo Banner on the Right matching reference */}
            <div className="lg:col-span-7 xl:col-span-7">
              <PromoBanner />
            </div>
          </div>

          {/* Section 2: 6 Overview Stat Cards */}
          <StatCards />

          {/* Section 3: Middle Row (Revenue 5 cols + Donut 4 cols + Recent Activities 3 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Revenue Overview Line Chart */}
            <div className="lg:col-span-5 flex flex-col">
              <RevenueChart />
            </div>

            {/* Order Status Distribution Donut Chart */}
            <div className="lg:col-span-4 flex flex-col">
              <OrderStatusDonut />
            </div>

            {/* Recent Activities Feed */}
            <div className="lg:col-span-3 flex flex-col">
              <RecentActivities />
            </div>
          </div>

          {/* Section 4: Bottom Row (Recent Orders 8 cols + Quick Actions 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pb-6">
            {/* Recent Orders Table */}
            <div className="lg:col-span-8 flex flex-col">
              <RecentOrdersTable />
            </div>

            {/* Quick Actions 2x2 Cards */}
            <div className="lg:col-span-4 flex flex-col">
              <QuickActions />
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Modals Layer */}
      <OrderDetailsModal />
      <AddRestaurantModal />
      <AddMenuItemModal />
      <ApplyCouponModal />
      <ReportsModal />
      <AllActivitiesModal
        isOpen={isAllActivitiesOpen}
        onClose={() => setIsAllActivitiesOpen(false)}
      />
    </div>
  );
}
