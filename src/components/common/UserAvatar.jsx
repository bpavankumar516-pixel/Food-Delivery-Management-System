import React, { useState } from 'react';

/**
 * Helper to compute 1 or 2 uppercase initials from a full name
 * e.g., "Pavan Kumar" -> "PK", "Admin" -> "A", "Mario Rossi" -> "MR"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'PK';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PK';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Gradient presets for name-based avatars
 */
export const AVATAR_GRADIENTS = {
  orange: 'from-[#ff5722] via-[#ff6b3d] to-[#ff8552] text-white shadow-orange-500/25',
  emerald: 'from-[#059669] via-[#10b981] to-[#34d399] text-white shadow-emerald-500/25',
  indigo: 'from-[#4338ca] via-[#6366f1] to-[#818cf8] text-white shadow-indigo-500/25',
  rose: 'from-[#e11d48] via-[#f43f5e] to-[#fb7185] text-white shadow-rose-500/25',
  amber: 'from-[#d97706] via-[#f59e0b] to-[#fbbf24] text-white shadow-amber-500/25',
  dark: 'from-[#05291e] via-[#0b3d2e] to-[#125540] text-emerald-300 shadow-emerald-950/30',
};

export default function UserAvatar({
  name = 'Pavan Kumar',
  avatar = null,
  useCustomAvatar = false,
  gradient = 'orange',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showBadge = false,
  badgeStatus = 'online', // 'online' | 'busy' | 'offline'
  className = '',
}) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);

  // Size specifications
  const sizeMap = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm',
    lg: 'w-12 h-12 text-sm sm:text-base',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 text-lg sm:text-xl font-black',
    '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl font-black',
  };

  const badgeSizeMap = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2 sm:ring-3',
    '2xl': 'w-5 h-5 ring-3 sm:ring-4',
  };

  const badgeColorMap = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-400',
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;
  const currentBadgeClass = badgeSizeMap[size] || badgeSizeMap.md;
  const currentGradient = AVATAR_GRADIENTS[gradient] || AVATAR_GRADIENTS.orange;

  // If user uploaded/configured custom photo AND it hasn't errored:
  const shouldRenderImage = useCustomAvatar && avatar && !imageError;

  return (
    <div className={`relative inline-flex shrink-0 select-none rounded-full ${className}`}>
      {shouldRenderImage ? (
        <img
          src={avatar}
          alt={name}
          onError={() => setImageError(true)}
          className={`${currentSizeClass} rounded-full object-cover border border-slate-200/90 shadow-xs`}
        />
      ) : (
        /* Name-based letter avatar (default) */
        <div
          className={`${currentSizeClass} rounded-full bg-gradient-to-br ${currentGradient} font-black tracking-wider flex items-center justify-center border border-white/30 shadow-md transform transition-transform group-hover:scale-105`}
          title={name}
        >
          <span>{initials}</span>
        </div>
      )}

      {/* Optional Online / Active Status Badge */}
      {showBadge && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${badgeColorMap[badgeStatus] || badgeColorMap.online} ${currentBadgeClass}`}
          title={badgeStatus === 'online' ? 'Active Now' : badgeStatus}
        />
      )}
    </div>
  );
}
