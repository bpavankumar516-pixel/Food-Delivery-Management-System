import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  LocateFixed,
  RefreshCw,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Home,
  Briefcase,
  Navigation,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCustomerPortal } from '../../context/CustomerPortalContext';

export default function CustomerLocationModal() {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    liveLocation,
    selectedLocation,
    locationLoading,
    locationError,
    setLocationError,
    detectCurrentLocation,
    selectManualLocation,
    searchAddressSuggestions,
    addresses,
    setDefaultAddress,
    selectedAddressId,
  } = useCustomerPortal();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [saveAsAddress, setSaveAsAddress] = useState(true);
  const [showDirectForm, setShowDirectForm] = useState(false);
  const [manualFields, setManualFields] = useState({
    area: '',
    city: '',
    state: '',
    pincode: '',
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!isLocationModalOpen) return;
    setSearchError('');
    if (locationError && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isLocationModalOpen, locationError]);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
      setResults([]);
      setSearchError('');
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const list = await searchAddressSuggestions(clean);
        if (!cancelled) {
          setResults(list);
          if (list.length === 0) {
            setSearchError('No matching places found. Try entering your street/area manually below.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setSearchError(err?.message || 'Address search failed. Enter your area manually below.');
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, searchAddressSuggestions]);

  if (!isLocationModalOpen) return null;

  const handleUseCurrentLocation = async () => {
    const detected = await detectCurrentLocation({ saveAsAddress });
    if (detected) {
      setIsLocationModalOpen(false);
    } else if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePickSuggestion = (place) => {
    selectManualLocation(place, {
      saveAsAddress,
      label: 'Delivery Point',
    });
    setQuery('');
    setResults([]);
    setIsLocationModalOpen(false);
  };

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    if (!manualFields.area.trim() || !manualFields.city.trim()) {
      toast.error('Please enter both Area / Locality and City.');
      return;
    }
    const displayName = `${manualFields.area.trim()}, ${manualFields.city.trim()}`;
    selectManualLocation(
      {
        id: `manual_${Date.now()}`,
        displayName,
        area: manualFields.area.trim(),
        locality: manualFields.area.trim(),
        city: manualFields.city.trim(),
        state: manualFields.state.trim(),
        pincode: manualFields.pincode.trim(),
        fullAddress: [
          manualFields.area.trim(),
          manualFields.city.trim(),
          manualFields.state.trim(),
          manualFields.pincode.trim(),
        ]
          .filter(Boolean)
          .join(', '),
        lat: null,
        lng: null,
        source: 'manual',
      },
      { saveAsAddress, label: 'Delivery Point' }
    );
    setManualFields({ area: '', city: '', state: '', pincode: '' });
    setShowDirectForm(false);
    setIsLocationModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setIsLocationModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#163A2D] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">Delivery Location</h3>
              <p className="text-[11px] text-emerald-200/85">
                Use live GPS detection or search your exact delivery address
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Close location modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar text-xs">
          {/* Active Detected Location Card */}
          {liveLocation && (
            <div className="p-3.5 rounded-2xl bg-[#E7EFE8]/70 border border-emerald-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-[#163A2D] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-[#163A2D]">
                    {liveLocation.source === 'gps' ? 'GPS Location Active' : 'Active Delivery Area'}
                  </p>
                  <p className="font-black text-sm text-[#202A24] truncate">{selectedLocation}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                    {liveLocation.fullAddress}
                  </p>
                  {liveLocation.lat != null && liveLocation.lng != null && (
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={locationLoading}
                onClick={handleUseCurrentLocation}
                className="p-2 rounded-xl bg-white border border-emerald-200 text-[#163A2D] hover:bg-[#163A2D] hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Refresh Current Location"
              >
                <RefreshCw className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {/* Primary "Use Current Location" CTA */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={locationLoading}
              onClick={handleUseCurrentLocation}
              className="w-full p-3.5 rounded-2xl bg-[#FFF8F0] hover:bg-orange-100/70 border border-orange-200 flex items-center justify-between gap-3 cursor-pointer transition-colors disabled:opacity-60 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center shrink-0">
                  {locationLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LocateFixed className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-black text-sm text-[#202A24]">
                    {locationLoading ? 'Detecting your current location...' : 'Use Current Location'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Using browser GPS & automatic reverse geocoding
                  </p>
                </div>
              </div>
              <Navigation className="w-4 h-4 text-[#FF6B35] shrink-0" />
            </button>

            <label className="flex items-center gap-2 px-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsAddress}
                onChange={(e) => setSaveAsAddress(e.target.checked)}
                className="accent-[#FF6B35]"
              />
              <span>Save selected location into My Delivery Addresses for checkout</span>
            </label>
          </div>

          {/* Geolocation Error Banner */}
          {locationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-bold">{locationError.code?.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] leading-snug mt-0.5">{locationError.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] cursor-pointer"
                >
                  Retry GPS
                </button>
                <button
                  type="button"
                  onClick={() => setLocationError(null)}
                  className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-bold text-[11px] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Manual Address Search Fallback */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-black text-[#202A24] text-xs">
                Search Area, Street, or City
              </label>
              <button
                type="button"
                onClick={() => setShowDirectForm((v) => !v)}
                className="text-[11px] font-bold text-[#FF6B35] hover:underline cursor-pointer"
              >
                {showDirectForm ? 'Hide Manual Entry' : 'Enter Address Manually'}
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#FF6B35] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type neighborhood, landmark, city, or postal code..."
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#FF6B35] text-xs"
              />
              {searching ? (
                <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {searchError && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                {searchError}
              </p>
            )}

            {results.length > 0 && (
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-52 overflow-y-auto">
                {results.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handlePickSuggestion(place)}
                    className="w-full p-3 hover:bg-[#FFF8F0] flex items-start gap-2.5 text-left cursor-pointer transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-bold text-[#202A24] truncate">{place.displayName}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{place.fullAddress}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showDirectForm && (
              <form
                onSubmit={handleDirectSubmit}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Area / Street / Locality *"
                    value={manualFields.area}
                    onChange={(e) => setManualFields({ ...manualFields, area: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City *"
                    value={manualFields.city}
                    onChange={(e) => setManualFields({ ...manualFields, city: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="State (optional)"
                    value={manualFields.state}
                    onChange={(e) => setManualFields({ ...manualFields, state: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Pincode / ZIP (optional)"
                    value={manualFields.pincode}
                    onChange={(e) => setManualFields({ ...manualFields, pincode: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#163A2D] hover:bg-[#0f2920] text-white font-bold cursor-pointer"
                >
                  Apply Location
                </button>
              </form>
            )}
          </div>

          {/* Saved Addresses Quick Switch */}
          {addresses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] font-black uppercase text-slate-400">
                Saved Delivery Addresses
              </p>
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const Icon = addr.label === 'Work' ? Briefcase : Home;
                  const active = addr.id === selectedAddressId;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setDefaultAddress(addr.id);
                        setIsLocationModalOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#E7EFE8]/60 border-[#163A2D]'
                          : 'bg-white border-slate-200 hover:border-[#FF6B35]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#FFF8F0] text-[#FF6B35] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[#202A24]">{addr.label}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {[addr.street, addr.city, addr.pincode].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                      {active && (
                        <span className="text-[10px] font-black text-[#163A2D] shrink-0">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
