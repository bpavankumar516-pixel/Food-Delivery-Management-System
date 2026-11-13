import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  ShieldCheck,
  Tag,
  CheckCircle2,
  ArrowLeft,
  Info,
  LocateFixed,
  Lock,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/customerPortal/CustomerLayout';
import { useCustomerPortal } from '../../context/CustomerPortalContext';
import { useAuth } from '../../context/AuthContext';

const INSTRUCTION_PRESETS = [
  'Leave at doorstep',
  'Do not ring doorbell',
  'Call upon arrival at gate',
  'Include extra cutlery & tissues',
];

const PAYMENT_OPTIONS = [
  {
    id: 'UPI (PhonePe / GPay)',
    label: 'UPI (PhonePe / Google Pay)',
    desc: 'Instant UPI approval & QR code',
    icon: Smartphone,
    popular: true,
  },
  {
    id: 'Credit / Debit Card',
    label: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, RuPay & Amex',
    icon: CreditCard,
  },
  {
    id: 'Net Banking',
    label: 'Net Banking',
    desc: 'All major Indian banks supported',
    icon: Landmark,
  },
  {
    id: 'Cash on Delivery',
    label: 'Cash on Delivery',
    desc: 'Pay cash or UPI on doorstep',
    icon: Banknote,
  },
];

const UPI_APPS = [
  {
    id: 'PhonePe',
    name: 'PhonePe',
    badge: 'Fastest',
    color: 'bg-purple-600',
    handle: '@ybl',
  },
  {
    id: 'Google Pay',
    name: 'Google Pay',
    badge: 'Popular',
    color: 'bg-blue-600',
    handle: '@okhdfcbank',
  },
  {
    id: 'Paytm',
    name: 'Paytm UPI',
    badge: 'Instant',
    color: 'bg-sky-500',
    handle: '@paytm',
  },
  {
    id: 'BHIM UPI',
    name: 'BHIM UPI',
    badge: 'Govt NPCI',
    color: 'bg-emerald-700',
    handle: '@upi',
  },
];

const POPULAR_BANKS = [
  { id: 'HDFC Bank', name: 'HDFC Bank', code: 'HDFC', badge: 'Fastest' },
  { id: 'ICICI Bank', name: 'ICICI Bank', code: 'ICICI', badge: 'Popular' },
  { id: 'State Bank of India', name: 'State Bank of India', code: 'SBI', badge: 'Govt' },
  { id: 'Axis Bank', name: 'Axis Bank', code: 'AXIS', badge: 'Active' },
  { id: 'Kotak Mahindra Bank', name: 'Kotak Mahindra', code: 'KOTAK', badge: 'Instant' },
  { id: 'Punjab National Bank', name: 'Punjab National Bank', code: 'PNB', badge: 'Govt' },
];

const OTHER_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC FIRST Bank',
  'Federal Bank',
  'Indian Bank',
  'Central Bank of India',
];

function getCardBrand(num = '') {
  const clean = num.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
  if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
  if (/^3[47]/.test(clean)) return 'Amex';
  return 'Card';
}

function formatCardNumber(value = '') {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 16);
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.join(' ');
}

function formatExpiry(value = '') {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) {
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  }
  return clean;
}

export default function CustomerCheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    hydratedCartItems,
    hasUnavailableCartItems,
    cartRestaurant,
    cartTotals,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    liveLocation,
    locationLoading,
    detectCurrentLocation,
    coupons,
    appliedCouponCode,
    applyCoupon,
    removeCoupon,
    isPlacingOrder,
    placeCustomerOrder,
  } = useCustomerPortal();

  // Primary Selection
  const [paymentMethod, setPaymentMethod] = useState('UPI (PhonePe / GPay)');
  const [instructions, setInstructions] = useState('');
  const [couponInput, setCouponInput] = useState(appliedCouponCode || '');
  const [showNewAddrForm, setShowNewAddrForm] = useState(addresses.length === 0);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    street: liveLocation?.area || '',
    landmark: liveLocation?.locality && liveLocation?.locality !== liveLocation?.area ? liveLocation.locality : '',
    city: liveLocation?.city || '',
    state: liveLocation?.state || '',
    pincode: liveLocation?.pincode || '',
  });

  // --- 1. UPI States ---
  const [upiTab, setUpiTab] = useState('apps'); // 'apps' | 'id' | 'qr'
  const [selectedUpiApp, setSelectedUpiApp] = useState('PhonePe');
  const [customUpiId, setCustomUpiId] = useState(
    user?.email ? `${user.email.split('@')[0]}@okhdfcbank` : 'foodix.user@okhdfcbank'
  );
  const [upiVerified, setUpiVerified] = useState(true);

  // --- 2. Card States ---
  const [cardNumber, setCardNumber] = useState('4532 8920 1234 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Pavan Kumar');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('884');
  const [saveCard, setSaveCard] = useState(true);

  // --- 3. Net Banking States ---
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [otherBankName, setOtherBankName] = useState('');

  // --- 4. Cash on Delivery States ---
  const [codChangeNote, setCodChangeNote] = useState('I have exact cash');

  // --- 5. Interactive Payment Simulation Modal States ---
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [simulationPhase, setSimulationPhase] = useState('init'); // 'init' | 'authorizing' | 'success'
  const [simulatedTxnId, setSimulatedTxnId] = useState('');

  useEffect(() => {
    setCouponInput(appliedCouponCode || '');
  }, [appliedCouponCode]);

  const eligibleCoupons = useMemo(
    () => coupons.filter((c) => c.status === 'Active'),
    [coupons]
  );

  const cardBrand = useMemo(() => getCardBrand(cardNumber), [cardNumber]);

  if (hydratedCartItems.length === 0) {
    return (
      <CustomerLayout hideStickyCart={true}>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-2xs">
          <h2 className="text-xl font-black text-[#202A24]">No Items to Checkout</h2>
          <p className="text-xs text-slate-500">
            Your cart is empty. Add delicious dishes from our partner restaurants before checking out.
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/restaurants')}
            className="px-6 py-2.5 rounded-full bg-[#FF6B35] text-white font-bold text-xs cursor-pointer shadow-md hover:bg-[#e85a25] transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </CustomerLayout>
    );
  }

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street.trim() || !newAddr.city.trim() || !newAddr.pincode.trim()) {
      toast.error('Please enter street address, city, and postal code.');
      return;
    }
    addAddress({ ...newAddr, isDefault: true });
    setShowNewAddrForm(false);
    setNewAddr({
      label: 'Home',
      street: liveLocation?.area || '',
      landmark: '',
      city: liveLocation?.city || '',
      state: liveLocation?.state || '',
      pincode: liveLocation?.pincode || '',
    });
  };

  const handleUseGpsAtCheckout = async () => {
    const detected = await detectCurrentLocation({ saveAsAddress: true });
    if (detected) {
      setShowNewAddrForm(false);
    }
  };

  // Quick Demo fill test card
  const handleFillDemoCard = () => {
    setCardNumber('4532 8920 1234 4242');
    setCardHolder(user?.name || 'Pavan Kumar');
    setCardExpiry('12/28');
    setCardCvv('884');
    toast.info('Test Visa card details filled!');
  };

  // Quick Verify UPI
  const handleVerifyUpi = () => {
    if (!customUpiId.includes('@') || customUpiId.length < 5) {
      toast.error('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
      setUpiVerified(false);
      return;
    }
    setUpiVerified(true);
    toast.success(`UPI ID "${customUpiId}" verified successfully!`);
  };

  // Resolve user-friendly payment method string for backend order records
  const getResolvedPaymentMethod = () => {
    if (paymentMethod === 'UPI (PhonePe / GPay)') {
      if (upiTab === 'apps') return `UPI (${selectedUpiApp})`;
      if (upiTab === 'id') return `UPI ID (${customUpiId})`;
      return `UPI (Scan & Pay QR)`;
    }
    if (paymentMethod === 'Credit / Debit Card') {
      const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';
      return `Card (${cardBrand} •••• ${last4})`;
    }
    if (paymentMethod === 'Net Banking') {
      const bank = selectedBank === 'Other' ? otherBankName || 'Net Banking' : selectedBank;
      return `Net Banking (${bank})`;
    }
    return `Cash on Delivery (${codChangeNote})`;
  };

  // Validate payment inputs
  const validatePaymentInputs = () => {
    const deliveryAddrObj =
      addresses.find((a) => a.id === selectedAddressId) || addresses.find((a) => a.isDefault) || addresses[0];

    if (!deliveryAddrObj) {
      toast.error('Please select or add a delivery address before placing order.');
      return false;
    }

    if (paymentMethod === 'Credit / Debit Card') {
      const cleanNum = cardNumber.replace(/\D/g, '');
      if (cleanNum.length < 15) {
        toast.error('Please enter a valid 16-digit card number.');
        return false;
      }
      if (!cardExpiry || cardExpiry.length < 5 || !cardExpiry.includes('/')) {
        toast.error('Please enter a valid expiry date (MM/YY).');
        return false;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('Please enter a valid 3-digit CVV.');
        return false;
      }
    }

    if (paymentMethod === 'UPI (PhonePe / GPay)' && upiTab === 'id') {
      if (!customUpiId.includes('@') || customUpiId.length < 5) {
        toast.error('Please enter a valid UPI ID (e.g. user@bank).');
        return false;
      }
    }

    if (paymentMethod === 'Net Banking' && selectedBank === 'Other' && !otherBankName) {
      toast.error('Please select your bank from the dropdown.');
      return false;
    }

    return true;
  };

  // Trigger Place Order Flow with Interactive Gateway Simulation
  const handleInitiateOrder = async () => {
    if (!validatePaymentInputs()) return;

    const resolvedMethod = getResolvedPaymentMethod();
    const txn = `FDX-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    setSimulatedTxnId(txn);

    setIsSimulatingPayment(true);
    setSimulationPhase('init');

    // Step 1: Connecting gateway / verifying details
    setTimeout(() => {
      setSimulationPhase('authorizing');

      // Step 2: Payment Approval
      setTimeout(async () => {
        setSimulationPhase('success');

        // Step 3: Dispatch & Place Order Record
        setTimeout(async () => {
          try {
            const createdOrder = await placeCustomerOrder({
              paymentMethod: resolvedMethod,
              specialInstructions: instructions,
              addressId: selectedAddressId,
            });

            setIsSimulatingPayment(false);

            if (createdOrder?.id) {
              navigate(`/customer/tracking/${encodeURIComponent(createdOrder.id)}`);
            }
          } catch (err) {
            setIsSimulatingPayment(false);
            toast.error(err?.message || 'Payment processing failed. Please try again.');
          }
        }, 800);
      }, 1000);
    }, 800);
  };

  return (
    <CustomerLayout hideStickyCart={true}>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate('/customer/cart')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-2xl font-black text-[#202A24]">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Address, Instructions, Payment */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Delivery Address Selection */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-black text-base text-[#202A24] flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-[#FF6B35]" />
                  <span>1. Select Delivery Address</span>
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={locationLoading}
                    onClick={handleUseGpsAtCheckout}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>{locationLoading ? 'Detecting...' : 'Use Current GPS'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAddrForm((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#163A2D] hover:text-[#FF6B35] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>
              </div>

              {showNewAddrForm && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="p-4 rounded-2xl bg-[#FFF8F0] border border-orange-200/70 space-y-3 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pincode"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No., Building, Street *"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Landmark (optional)"
                      value={newAddr.landmark}
                      onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#163A2D] text-white font-bold cursor-pointer hover:bg-[#064e3b] transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const selected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        selected
                          ? 'bg-[#E7EFE8]/60 border-[#163A2D] ring-2 ring-[#163A2D]/15'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-[#163A2D] border border-slate-200 text-[10px] font-black uppercase">
                          {addr.label}
                        </span>
                        {selected && (
                          <CheckCircle2 className="w-4 h-4 text-[#163A2D]" />
                        )}
                      </div>
                      <p className="font-bold text-xs text-[#202A24] pt-1">{addr.street}</p>
                      <p className="text-[11px] text-slate-500">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Delivery Instructions */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-2xs">
              <h2 className="font-black text-base text-[#202A24]">2. Delivery Instructions</h2>
              <div className="flex flex-wrap gap-2">
                {INSTRUCTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInstructions(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                      instructions === preset
                        ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                        : 'bg-[#FFF8F0] text-[#202A24] border-orange-200/70 hover:bg-orange-100/50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any specific cooking or gate entry instructions..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            {/* 3. Payment Method Selection & Interactive Payment Section */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-black text-base text-[#202A24] flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#163A2D]" />
                  <span>3. Payment Method</span>
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                  <Lock className="w-3 h-3" />
                  256-Bit SSL Secure Gateway
                </span>
              </div>

              {/* 4 Main Payment Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#FFF8F0] border-[#FF6B35] ring-2 ring-[#FF6B35]/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          active ? 'bg-[#FF6B35] text-white' : 'bg-white text-[#163A2D] border border-slate-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-black text-xs text-[#202A24] truncate">{opt.label}</p>
                          {opt.popular && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-orange-100 text-[#FF6B35]">
                              Fast
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ============================================================== */}
              {/* DYNAMIC SUB-PANEL: SPECIFIC PAYMENT METHOD INTERFACE          */}
              {/* ============================================================== */}

              {/* A. UPI PAYMENT INTERFACE */}
              {paymentMethod === 'UPI (PhonePe / GPay)' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-[#fffbf6] border border-orange-200/80 space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setUpiTab('apps')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          upiTab === 'apps' ? 'bg-white text-[#163A2D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        UPI Apps
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiTab('id')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          upiTab === 'id' ? 'bg-white text-[#163A2D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Enter UPI ID
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiTab('qr')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          upiTab === 'qr' ? 'bg-white text-[#163A2D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Scan QR Code
                      </button>
                    </div>

                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Zero Transaction Fee
                    </span>
                  </div>

                  {/* Sub-tab 1: UPI Apps List */}
                  {upiTab === 'apps' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 font-medium">
                        Select your preferred UPI app. A simulated payment request will be sent upon clicking Place Order:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {UPI_APPS.map((app) => {
                          const active = selectedUpiApp === app.id;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.id)}
                              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative ${
                                active
                                  ? 'bg-white border-[#FF6B35] ring-2 ring-[#FF6B35]/25 shadow-xs'
                                  : 'bg-white/80 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-xl ${app.color} text-white font-black text-xs flex items-center justify-center shadow-xs`}
                              >
                                {app.id.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-xs text-slate-800">{app.name}</span>
                              <span className="text-[10px] font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50">
                                {app.badge}
                              </span>
                              {active && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FF6B35] text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200/80 text-[11px] text-purple-900 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-700 shrink-0" />
                        <span>
                          Selected: <strong className="font-bold">{selectedUpiApp}</strong> • Instant simulated approval will complete without leaving page.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 2: Custom UPI ID */}
                  {upiTab === 'id' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 font-medium">
                        Enter your Virtual Payment Address (UPI ID) from any bank or payment app:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={customUpiId}
                            onChange={(e) => {
                              setCustomUpiId(e.target.value.toLowerCase());
                              setUpiVerified(false);
                            }}
                            placeholder="e.g. mobile@ybl or username@okhdfcbank"
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#FF6B35]"
                          />
                          {upiVerified && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-2.5 top-3" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyUpi}
                          className="px-4 py-2.5 rounded-xl bg-[#163A2D] hover:bg-[#064e3b] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          {upiVerified ? 'Verified ✓' : 'Verify ID'}
                        </button>
                      </div>

                      {upiVerified ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Verified: <strong className="font-bold">{user?.name || 'Customer Account'}</strong> (Fast-Track UPI Enabled)
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          Examples: 9876543210@paytm, name@okhdfcbank, username@ybl
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 3: QR Code Scan & Pay */}
                  {upiTab === 'qr' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                      <div className="w-32 h-32 rounded-xl border-2 border-dashed border-[#163A2D]/30 p-2 flex flex-col items-center justify-center bg-white shadow-xs shrink-0">
                        {/* Mock Stylized QR Graphic */}
                        <div className="w-full h-full bg-slate-900 rounded-lg p-1.5 flex flex-col justify-between">
                          <div className="flex justify-between">
                            <div className="w-5 h-5 border-2 border-white rounded-xs bg-emerald-400" />
                            <div className="w-5 h-5 border-2 border-white rounded-xs bg-orange-400" />
                          </div>
                          <div className="text-center font-black text-[9px] text-white tracking-widest">
                            FDX•PAY
                          </div>
                          <div className="flex justify-between">
                            <div className="w-5 h-5 border-2 border-white rounded-xs bg-white" />
                            <div className="w-5 h-5 border-2 border-white rounded-xs bg-white" />
                          </div>
                        </div>
                      </div>
                      <div className="text-center sm:text-left space-y-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Dynamic Merchant QR
                        </span>
                        <h4 className="font-black text-sm text-[#202A24]">
                          Scan & Pay ₹{cartTotals.grandTotal.toLocaleString()}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Scan using GPay, PhonePe, Paytm or any BHIM UPI app on your phone.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* B. CREDIT / DEBIT CARD INTERFACE */}
              {paymentMethod === 'Credit / Debit Card' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-[#fffbf6] border border-orange-200/80 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                    <span className="font-black text-xs text-[#202A24] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#FF6B35]" />
                      <span>Card Details</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemoCard}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B35] hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Use Test Card</span>
                    </button>
                  </div>

                  {/* Interactive Virtual Card Preview Widget */}
                  <div className="w-full max-w-sm mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#163A2D] via-[#094130] to-[#06241a] text-white shadow-md relative overflow-hidden space-y-3">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-5 rounded bg-amber-400/90 border border-amber-300" />
                        <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest">
                          Debit / Credit
                        </span>
                      </div>
                      <span className="font-black text-xs tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-md">
                        {cardBrand}
                      </span>
                    </div>

                    <div className="py-1">
                      <p className="font-mono text-base sm:text-lg tracking-widest font-black text-slate-100">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/15">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-emerald-300/80 block">
                          Cardholder
                        </span>
                        <span className="font-bold truncate max-w-[150px] block">
                          {cardHolder || 'CARDHOLDER NAME'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-300/80 block">
                          Expires
                        </span>
                        <span className="font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4532 8920 1234 4242"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs focus:outline-none focus:border-[#FF6B35]"
                        />
                        <span className="absolute right-3 top-2.5 font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {cardBrand}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="12/28"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-slate-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span>Save card securely for faster checkout (RBI tokenized demo)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* C. NET BANKING INTERFACE */}
              {paymentMethod === 'Net Banking' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-[#fffbf6] border border-orange-200/80 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                    <span className="font-black text-xs text-[#202A24] flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#FF6B35]" />
                      <span>Select Bank for Net Banking</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Direct Bank Transfer
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {POPULAR_BANKS.map((b) => {
                      const active = selectedBank === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBank(b.id);
                            setOtherBankName('');
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            active
                              ? 'bg-white border-[#FF6B35] ring-2 ring-[#FF6B35]/25 shadow-xs'
                              : 'bg-white/80 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                              active ? 'bg-[#FF6B35] text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.code}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-slate-800 truncate">{b.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{b.badge}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown for other banks */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Or Select Other Indian Banks:
                    </label>
                    <select
                      value={selectedBank === 'Other' ? otherBankName : ''}
                      onChange={(e) => {
                        setSelectedBank('Other');
                        setOtherBankName(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#FF6B35]"
                    >
                      <option value="">-- Choose from 40+ Other Banks --</option>
                      {OTHER_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100/90 text-[11px] text-slate-600 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>
                      Selected Bank: <strong className="font-bold text-slate-800">{selectedBank === 'Other' ? otherBankName || 'Other Bank' : selectedBank}</strong>. You will be redirected to the secure portal for OTP approval.
                    </span>
                  </div>
                </div>
              )}

              {/* D. CASH ON DELIVERY INTERFACE */}
              {paymentMethod === 'Cash on Delivery' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/80 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                    <span className="font-black text-xs text-amber-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span>Cash on Delivery (COD) Options</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Pay on Arrival
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 text-xs space-y-2">
                    <div className="flex items-center justify-between font-black text-sm text-[#163A2D]">
                      <span>Amount to Pay at Doorstep</span>
                      <span>₹{cartTotals.grandTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Our delivery partner will accept cash or you can scan their handheld UPI QR code upon delivery.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Change Preference for Delivery Partner:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'I have exact cash',
                        'Need change for ₹500',
                        'Need change for ₹2000',
                        'Will pay via UPI QR to rider',
                      ].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCodChangeNote(opt)}
                          className={`px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                            codChangeNote === opt
                              ? 'bg-[#163A2D] text-white border-[#163A2D]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Order Summary + Coupon + Place Order CTA */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ordering From</span>
                <h3 className="font-black text-base text-[#163A2D]">
                  {cartRestaurant?.name || 'Foodix Partner'}
                </h3>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {hydratedCartItems.map((it) => (
                  <div key={it.id} className="flex justify-between gap-2">
                    <span className="text-slate-700 font-medium">
                      {it.qty}× {it.name}
                    </span>
                    <span className="font-bold text-[#202A24] shrink-0">
                      ₹{(it.price * it.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFF8F0]/70 border border-slate-200 text-xs font-mono uppercase focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponInput)}
                    className="px-3.5 py-2 rounded-xl bg-[#163A2D] hover:bg-[#064e3b] text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedCouponCode && cartTotals.couponResult?.valid ? (
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                    <span>Applied: {appliedCouponCode}</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        setCouponInput('');
                      }}
                      className="text-rose-600 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : appliedCouponCode && cartTotals.couponResult && !cartTotals.couponResult.valid ? (
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                    <span>
                      {appliedCouponCode}: {cartTotals.couponResult.message}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        setCouponInput('');
                      }}
                      className="text-rose-600 underline cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {eligibleCoupons.slice(0, 3).map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => {
                          setCouponInput(cp.code);
                          applyCoupon(cp.code);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 text-[#FF6B35] text-[10px] font-bold cursor-pointer hover:bg-orange-100 transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {cp.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Totals */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{cartTotals.subtotal.toLocaleString()}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-[#FF6B35] font-bold">
                    <span>Discount</span>
                    <span>-₹{cartTotals.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className={cartTotals.deliveryFee === 0 ? 'text-emerald-600 font-bold' : ''}>
                    {cartTotals.deliveryFee === 0 ? 'FREE' : `₹${cartTotals.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST ({cartTotals.gstPct}%)</span>
                  <span>₹{cartTotals.tax}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-[#163A2D]">
                  <span>Grand Total</span>
                  <span>₹{cartTotals.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Summary Pill */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Selected Payment:</span>
                  <strong className="text-slate-800 font-bold">{getResolvedPaymentMethod()}</strong>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isPlacingOrder || hasUnavailableCartItems || isSimulatingPayment}
                onClick={handleInitiateOrder}
                className="w-full py-3.5 rounded-2xl bg-[#FF6B35] hover:bg-[#e85a25] text-white font-black text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isPlacingOrder || isSimulatingPayment
                    ? 'Processing Payment...'
                    : paymentMethod === 'Cash on Delivery'
                    ? `Place COD Order • ₹${cartTotals.grandTotal.toLocaleString()}`
                    : `Pay & Place Order • ₹${cartTotals.grandTotal.toLocaleString()}`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Encrypted 256-bit payment simulation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE PAYMENT GATEWAY SIMULATION MODAL                   */}
      {/* ============================================================== */}
      {isSimulatingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Phase Icons */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              {simulationPhase === 'init' && (
                <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF6B35] flex items-center justify-center animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              )}
              {simulationPhase === 'authorizing' && (
                <div className="w-16 h-16 rounded-full bg-[#163A2D]/10 text-[#163A2D] flex items-center justify-center animate-bounce">
                  <Lock className="w-8 h-8 text-[#163A2D]" />
                </div>
              )}
              {simulationPhase === 'success' && (
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-4 ring-emerald-200 animate-in zoom-in duration-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* Phase Texts */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#202A24]">
                {simulationPhase === 'init' && 'Connecting to Payment Gateway...'}
                {simulationPhase === 'authorizing' && 'Authorizing Payment...'}
                {simulationPhase === 'success' && 'Payment Approved!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {simulationPhase === 'init' && 'Securing 256-bit encrypted connection with bank server...'}
                {simulationPhase === 'authorizing' &&
                  `Charging ₹${cartTotals.grandTotal.toLocaleString()} via ${getResolvedPaymentMethod()}...`}
                {simulationPhase === 'success' && 'Your order has been confirmed and dispatched to the kitchen!'}
              </p>
            </div>

            {/* Order & Transaction Details Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-bold text-slate-800">{simulatedTxnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode</span>
                <span className="font-bold text-[#163A2D]">{getResolvedPaymentMethod()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-black text-[#FF6B35]">₹{cartTotals.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FF6B35] to-emerald-500 h-full transition-all duration-500"
                style={{
                  width:
                    simulationPhase === 'init'
                      ? '35%'
                      : simulationPhase === 'authorizing'
                      ? '75%'
                      : '100%',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
