import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

/**
 * Shared viewport-positioned "More" action dropdown button used in Customer and Order rows/cards.
 */
export default function ActionMoreMenu({
  items = [],
  title = 'More Actions',
  buttonClassName = 'w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs',
}) {
  const [menuPos, setMenuPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const visibleItems = items.filter((it) => it && !it.hidden);

  useEffect(() => {
    if (!menuPos) return undefined;

    const close = () => setMenuPos(null);
    const handlePointerDown = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      close();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuPos]);

  if (visibleItems.length === 0) return null;

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (menuPos) {
      setMenuPos(null);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estHeight = visibleItems.length * 40 + 16;
    const openUp = window.innerHeight - rect.bottom < estHeight && rect.top > estHeight;
    setMenuPos({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
      openUp,
    });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        className={buttonClassName}
        title={title}
        aria-label={title}
        aria-expanded={Boolean(menuPos)}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {menuPos &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              transform: menuPos.openUp ? 'translateY(-100%)' : 'none',
            }}
            className="z-[9999] w-48 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-1.5 text-left animate-in fade-in duration-100 select-none"
          >
            {visibleItems.map((item, idx) => {
              const Icon = item.icon;
              const toneClass =
                item.tone === 'danger'
                  ? 'text-rose-600 hover:bg-rose-50'
                  : item.tone === 'warning'
                  ? 'text-amber-700 hover:bg-amber-50'
                  : item.tone === 'success'
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900';

              return (
                <React.Fragment key={item.id || item.label || idx}>
                  {item.dividerBefore && <div className="my-1 border-t border-slate-100" />}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuPos(null);
                      item.onClick?.();
                    }}
                    className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${toneClass}`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
