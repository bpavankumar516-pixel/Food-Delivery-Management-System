import React from 'react';
import AuthBackground from '../components/auth/AuthBackground';
import AuthHero from '../components/auth/AuthHero';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col lg:flex-row items-center justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#faf8f3]">
      {/* Precision S-Curve Organic Background configured for 60% left / 40% right split */}
      <AuthBackground />

      {/* Left Section: Food Presentation & Hero Details (Responsive on mobile, 60% 100vh on desktop) */}
      <div className="w-full lg:w-[60%] h-auto lg:h-full lg:max-h-screen relative z-10 flex overflow-hidden shrink-0">
        <AuthHero />
      </div>

      {/* Right Section: Floating Authentication Card (Centered on mobile, 40% 100vh on desktop) */}
      <div className="w-full lg:w-[40%] h-auto lg:h-full lg:max-h-screen relative z-10 flex items-center justify-center p-3 sm:p-5 lg:p-4 xl:p-6 my-auto">
        <RegisterForm />
      </div>
    </div>
  );
}
