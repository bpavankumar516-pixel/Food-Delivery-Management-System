import React from 'react';
import AuthBackground from '../components/auth/AuthBackground';
import AuthHero from '../components/auth/AuthHero';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden">
      {/* Precision S-Curve Organic Background configured for 60% left / 40% right split */}
      <AuthBackground />

      {/* Left Section: Food Presentation & Hero Details (60% width, 100vh fit) */}
      <div className="w-full lg:w-[60%] h-full max-h-screen relative z-10 flex overflow-hidden">
        <AuthHero />
      </div>

      {/* Right Section: Floating Authentication Card (40% width, 100vh fit) */}
      <div className="w-full lg:w-[40%] h-full max-h-screen relative z-10 flex items-center justify-center p-3 sm:p-5 lg:p-4 xl:p-6 overflow-hidden">
        <LoginForm />
      </div>
    </div>
  );
}
