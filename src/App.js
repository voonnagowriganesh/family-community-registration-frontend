import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Upload, Download, Loader2, Mail, Phone, User, Calendar, MapPin, Home, Users, Heart, FileText, ChevronRight, ChevronLeft, Shield, Camera } from 'lucide-react';
import logo from './assets/logo.jpg';




const BASE_URL =  'https://family-community-registration-production.up.railway.app'

const STATES = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Punjab', 'Haryana', 'Jharkhand', 'Odisha', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh', 'Assam', 'Goa', 'Other'];
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Singapore', 'UAE', 'Other'];

export default function FamilyRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: OTP Method
  const [otpType, setOtpType] = useState('email');
  const [otpValue, setOtpValue] = useState('');
  
  // Step 2: OTP
  const [otp, setOtp] = useState('');

  // OTP Timer (5 minutes = 300 seconds)
  const OTP_EXPIRY_SECONDS = 300;
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY_SECONDS);
  const [otpExpired, setOtpExpired] = useState(false);
  
  // Step 3: Registration
  const [verificationType, setVerificationType] = useState('');
  const [formData, setFormData] = useState({
    verification_type: '',
    email: '',
    mobile_number: '',
    full_name: '',
    surname: '',
    desired_name: '',
    father_or_husband_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    gothram: '',
    aaradhya_daiva: '',
    kula_devata: '',
    education: '',
    occupation: '',
    house_number: '',
    village_city: '',
    mandal: '',
    district: '',
    state: 'Andhra Pradesh',
    country: 'India',
    pin_code: '',
    photo_url: '',
    referred_by_name: '',
    referred_mobile: '',
    feedback: ''
  });
  
  const [surnameOther, setSurnameOther] = useState(false);
  const [gothramOther, setGothramOther] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  
  // Step 4: Success
  const [pdfUrl, setPdfUrl] = useState('');
  const [referenceId, setReferenceId] = useState('');

  useEffect(() => {
    if (step === 4) {
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, '', window.location.href);
      };
    }
  }, [step]);

  useEffect(() => {
    if (step !== 2) return;
  
    setOtpTimer(OTP_EXPIRY_SECONDS);
    setOtpExpired(false);
  
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setOtpExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [step]);

  const sendOtp = async () => {
    setError('');
    if (!otpValue.trim()) {
      setError('Please enter your ' + otpType);
      return;
    }
    
    if (otpType === 'email' && !otpValue.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (otpType === 'mobile' && !/^\d{10}$/.test(otpValue)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: otpType, value: otpValue })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep(2);
      } else {
        setError(data.detail || data.message || data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: otpType, value: otpValue, otp })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationType(otpType);
        setFormData(prev => ({
          ...prev,
          verification_type: otpType,
          email: otpType === 'email' ? otpValue : '',
          mobile_number: otpType === 'mobile' ? otpValue : ''
        }));
        setStep(3);
      } else {
        setError(data.error || data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
  
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Only JPG, JPEG, PNG images are allowed');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
  
    setPhotoUploading(true);
    setError('');
  
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
  
      const response = await fetch(
        `${BASE_URL}/api/v1/upload/photo`,
        {
          method: 'POST',
          body: formDataObj
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || 'Photo upload failed');
      }
  
      // ✅ REAL GOOGLE DRIVE URL
      setFormData(prev => ({
        ...prev,
        photo_url: data.photo_url
      }));
  
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const validateForm = () => {
    const required = [
      'full_name', 'surname', 'father_or_husband_name', 'mother_name',
      'date_of_birth', 'gender', 'blood_group', 'gothram', 'education',
      'occupation', 'district', 'state', 'country', 'pin_code', 'photo_url'
    ];
    
    for (let field of required) {
      if (!formData[field] || formData[field].trim() === '') {
        return `${field.replace(/_/g, ' ')} is required`;
      }
    }
    
    if (!formData.village_city && !formData.mandal) {
      return 'Either Village/City or Mandal must be filled';
    }
    
    if (formData.pin_code && !/^\d{6}$/.test(formData.pin_code)) {
      return 'PIN code must be exactly 6 digits';
    }
    
    if (formData.referred_mobile && !/^\d{10}$/.test(formData.referred_mobile)) {
      return 'Referred mobile must be 10 digits';
    }
    
    return null;
  };

  const submitRegistration = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPdfUrl(data.pdf_url || '');
        setReferenceId(data.reference_id || data.registration_id || '');
        setStep(4);
      } else {
        setError(data.error || data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto relative">
      {/* Progress line */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
      <div 
        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 -z-10 transition-all duration-500"
        style={{ width: `${((step - 1) / 3) * 100}%` }}
      ></div>
      
      {[
        { number: 1, label: 'Verification', icon: <Shield className="w-5 h-5" /> },
        { number: 2, label: 'OTP', icon: <Mail className="w-5 h-5" /> },
        { number: 3, label: 'Registration', icon: <User className="w-5 h-5" /> },
        { number: 4, label: 'Success', icon: <CheckCircle className="w-5 h-5" /> }
      ].map((stepItem) => (
        <div key={stepItem.number} className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
            step >= stepItem.number 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200' 
              : 'bg-white text-gray-400 border-2 border-gray-200'
          }`}>
            {step > stepItem.number ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              stepItem.icon
            )}
          </div>
          <span className={`text-sm font-medium ${
            step >= stepItem.number ? 'text-gray-800' : 'text-gray-400'
          }`}>
            {stepItem.label}
          </span>
          <span className="text-xs text-gray-500 mt-1">Step {stepItem.number}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-amber-50">
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 text-white py-8 shadow-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                  <img
                    src={logo}
                    alt="Kanagala Charitable Trust"
                    className="w-16 h-16 object-contain rounded-full"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Kanagala Charitable Trust</h1>
                <p className="text-green-100 text-lg mt-1">Family Community Registration</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-green-100">Secure & Verified Registration</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-amber-300" />
                <span className="text-xs">Your data is protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        {step < 4 && <StepIndicator />}

        {/* Error Display */}
        {error && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">{error}</p>
                <p className="text-sm text-red-600 mt-1">Please check and try again</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: OTP Method Selection */}
        {step === 1 && (
          <div className="animate-slide-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Get Started with Registration</h2>
                <p className="text-green-100">Choose how you want to receive verification code</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div 
                    className={`cursor-pointer transition-all duration-300 ${
                      otpType === 'email' 
                        ? 'ring-2 ring-green-500 ring-offset-2' 
                        : 'hover:ring-1 hover:ring-gray-200'
                    }`}
                    onClick={() => {
                      setOtpType('email');
                      setOtpValue('');
                      setError('');
                    }}
                  >
                    <div className={`border-2 rounded-xl p-6 text-center transition-all duration-300 ${
                      otpType === 'email' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Email Verification</h3>
                      <p className="text-sm text-gray-600">Receive OTP on your email address</p>
                    </div>
                  </div>

                  <div 
                    className={`cursor-pointer transition-all duration-300 ${
                      otpType === 'mobile' 
                        ? 'ring-2 ring-green-500 ring-offset-2' 
                        : 'hover:ring-1 hover:ring-gray-200'
                    }`}
                    onClick={() => {
                      setOtpType('mobile');
                      setOtpValue('');
                      setError('');
                    }}
                  >
                    <div className={`border-2 rounded-xl p-6 text-center transition-all duration-300 ${
                      otpType === 'mobile' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Mobile Verification</h3>
                      <p className="text-sm text-gray-600">Receive OTP via SMS on your phone</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    {otpType === 'email' ? (
                      <><Mail className="w-4 h-4" /> Email Address *</>
                    ) : (
                      <><Phone className="w-4 h-4" /> Mobile Number *</>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={otpType === 'email' ? 'email' : 'tel'}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      placeholder={otpType === 'email' ? 'you@example.com' : '98XXXXXXXX'}
                      className="w-full px-5 py-4 pl-12 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {otpType === 'email' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Secure Verification</p>
                      <p className="text-xs text-blue-600 mt-1">Your contact information is only used for verification and will not be shared.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="animate-slide-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
                <p className="text-green-100">Enter the verification code sent to your {otpType}</p>
              </div>
              
              <div className="p-8">
                <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-2">Verification code sent to:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      {otpType === 'email' ? (
                        <Mail className="w-5 h-5 text-green-600" />
                      ) : (
                        <Phone className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{otpValue}</p>
                      <p className="text-sm text-gray-600">via {otpType === 'email' ? 'Email' : 'SMS'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Enter 6-digit OTP *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full px-5 py-4 text-center text-3xl tracking-widest border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none font-mono"
                      maxLength={6}
                    />
                  </div>
                  
                  {!otpExpired && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-gray-600">
                        OTP expires in <span className="font-bold text-red-600">{formatTime(otpTimer)}</span>
                      </p>
                    </div>
                  )}
                </div>

                {!otpExpired ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setStep(1);
                        setOtp('');
                        setError('');
                      }}
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                    
                    <button
                      onClick={verifyOtp}
                      disabled={loading || otpExpired || otp.length !== 6}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify OTP</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <p className="text-amber-700 font-medium">OTP has expired</p>
                      <p className="text-sm text-amber-600 mt-1">Please request a new OTP to continue</p>
                    </div>
                    
                    <button
                      onClick={async () => {
                        setOtp('');
                        setError('');
                        setLoading(true);
                      
                        try {
                          const response = await fetch(`${BASE_URL}/api/v1/auth/send-otp`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: otpType, value: otpValue })
                          });
                      
                          const data = await response.json();
                      
                          if (response.ok) {
                            setOtpExpired(false);
                            setOtpTimer(OTP_EXPIRY_SECONDS);
                          } else {
                            setError(data.error || data.message || 'Failed to send OTP');
                          }
                        } catch {
                          setError('Network error. Please try again.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          <span>Resend OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Registration Form */}
        {step === 3 && (
          <div className="animate-slide-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Complete Registration</h2>
                    <p className="text-green-100">Fill in your family details for the community</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Section */}
                  <div className="md:col-span-2">
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">Verified Contact</h3>
                          <p className="text-sm text-gray-600">
                            {verificationType === 'email' ? formData.email : formData.mobile_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields with improved styling */}
                  {[
                    { label: 'Full Name *', value: formData.full_name, onChange: (e) => setFormData({...formData, full_name: e.target.value}), icon: <User className="w-5 h-5" /> },
                    { label: 'Desired Name on ID Card', value: formData.desired_name, onChange: (e) => setFormData({...formData, desired_name: e.target.value}), icon: <FileText className="w-5 h-5" /> },
                    { label: 'Father/Husband Name *', value: formData.father_or_husband_name, onChange: (e) => setFormData({...formData, father_or_husband_name: e.target.value}), icon: <User className="w-5 h-5" /> },
                    { label: 'Mother Name *', value: formData.mother_name, onChange: (e) => setFormData({...formData, mother_name: e.target.value}), icon: <User className="w-5 h-5" /> },
                  ].map((field, index) => (
                    <div key={index} className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        {field.icon}
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                      />
                    </div>
                  ))}

                  {/* Surname */}
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Surname *</label>
                    <select
                      value={surnameOther ? 'Other' : formData.surname}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setSurnameOther(true);
                          setFormData({...formData, surname: ''});
                        } else {
                          setSurnameOther(false);
                          setFormData({...formData, surname: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    >
                      <option value="">Select Surname</option>
                      <option value="KANAGALA">KANAGALA</option>
                      <option value="Other">Other</option>
                    </select>
                    {surnameOther && (
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => setFormData({...formData, surname: e.target.value})}
                        placeholder="Enter surname"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none mt-2"
                      />
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group *</label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Gothram */}
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gothram *</label>
                    <select
                      value={gothramOther ? 'Other' : formData.gothram}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setGothramOther(true);
                          setFormData({...formData, gothram: ''});
                        } else {
                          setGothramOther(false);
                          setFormData({...formData, gothram: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    >
                      <option value="">Select Gothram</option>
                      <option value="KANAGALA">Chandrulla</option>
                      <option value="Other">Other</option>
                    </select>
                    {gothramOther && (
                      <input
                        type="text"
                        value={formData.gothram}
                        onChange={(e) => setFormData({...formData, gothram: e.target.value})}
                        placeholder="Enter gothram"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none mt-2"
                      />
                    )}
                  </div>

                  {/* Education and Occupation */}
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Education *</label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation *</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                    />
                  </div>

                  {/* Address Section */}
                  <div className="md:col-span-2">
                    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Home className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">Address Details</h3>
                          <p className="text-sm text-gray-600">Fill in your residential information</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'House Number', value: formData.house_number, onChange: (e) => setFormData({...formData, house_number: e.target.value}) },
                          { label: 'Village/City *', value: formData.village_city, onChange: (e) => setFormData({...formData, village_city: e.target.value}) },
                          { label: 'Mandal *', value: formData.mandal, onChange: (e) => setFormData({...formData, mandal: e.target.value}) },
                          { label: 'District *', value: formData.district, onChange: (e) => setFormData({...formData, district: e.target.value}) },
                        ].map((field, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                            <input
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                          <select
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                          >
                            {STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                          <select
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                          >
                            {COUNTRIES.map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                          <input
                            type="text"
                            value={formData.pin_code}
                            onChange={(e) => {
                              if (/^\d{0,6}$/.test(e.target.value)) {
                                setFormData({...formData, pin_code: e.target.value});
                              }
                            }}
                            maxLength={6}
                            placeholder="6-digit PIN"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="md:col-span-2">
                    <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">Passport Photo *</h3>
                          <p className="text-sm text-gray-600">Upload a clear front-facing photo for ID card</p>
                        </div>
                      </div>
                      
                      <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-all duration-300 bg-white">
                        {formData.photo_url ? (
                          <div className="max-w-xs mx-auto">
                            <div className="relative">
                              <img 
                                src={formData.photo_url} 
                                alt="Passport" 
                                className="w-48 h-48 object-cover mx-auto rounded-lg shadow-lg"
                              />
                              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <p className="text-sm text-green-600 font-medium mt-4 mb-2">Photo uploaded successfully</p>
                            <label className="inline-flex items-center gap-2 cursor-pointer text-green-600 hover:text-green-700 font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                              <Upload className="w-4 h-4" />
                              Change Photo
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => uploadPhoto(e.target.files[0])}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Camera className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-700 font-medium mb-2">Click to upload passport photo</p>
                            <p className="text-sm text-gray-500 mb-4">JPG, JPEG, PNG (Max 5MB)</p>
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all">
                              <Upload className="w-5 h-5" />
                              <span>Browse Files</span>
                            </div>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) => uploadPhoto(e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                        {photoUploading && (
                          <div className="mt-6 flex items-center justify-center gap-3 text-green-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Uploading your photo...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <button
                    onClick={submitRegistration}
                    disabled={loading || photoUploading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Processing Registration...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    <span className="text-red-500">*</span> Required fields must be filled
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success Screen */}
        {step === 4 && (
          <div className="animate-scale-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
                <div className="inline-flex items-center justify-center w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full mb-6 border-8 border-white/30">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Registration Successful!</h2>
                <p className="text-green-100 text-lg max-w-2xl mx-auto">
                  Welcome to the Kanagala Family Community. Your registration has been received and is being processed.
                </p>
              </div>
              
              <div className="p-8">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-10 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Registration Summary</h3>
                        <p className="text-gray-600">Your details have been submitted successfully</p>
                      </div>
                      {referenceId && (
                        <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Reference ID</p>
                          <p className="text-2xl font-bold text-emerald-700 font-mono">{referenceId}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-bold text-gray-800">{formData.full_name}</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-6 00">Surname</p>
                        <p className="font-bold text-gray-800">{formData.surname}</p>
                      </div>
                    </div>
                  </div>

                  {pdfUrl ? (
                    <div className="mb-8">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <FileText className="w-8 h-8 text-green-600" />
                        <h3 className="text-2xl font-bold text-gray-800">Registration Certificate</h3>
                      </div>
                      
                      <div className="mb-6 border-4 border-gray-200 rounded-xl overflow-hidden shadow-lg" style={{height: '70vh'}}>
                        <iframe
                          src={pdfUrl}
                          className="w-full h-full"
                          title="Registration PDF"
                          onError={() => {
                            document.getElementById('pdf-fallback').style.display = 'block';
                            document.querySelector('iframe').style.display = 'none';
                          }}
                        />
                        <div id="pdf-fallback" style={{display: 'none'}} className="p-8 text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">PDF preview not supported on this device.</p>
                          <p className="text-sm text-gray-500">Please download the PDF to view it.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => window.open(pdfUrl, '_blank')}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                        >
                          <Download className="w-6 h-6" />
                          Download Registration PDF
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:bg-gray-50"
                        >
                          <FileText className="w-6 h-6" />
                          Print Certificate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                      <FileText className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Certificate Processing</h3>
                      <p className="text-gray-600 mb-4">Your registration certificate is being generated.</p>
                      <p className="text-sm text-gray-500">It will be available for download shortly.</p>
                    </div>
                  )}
                  
                  <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-gray-800 mb-3">What's Next?</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-gray-600">You will receive confirmation via {verificationType}</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-gray-600">Keep your reference ID for future inquiries</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-gray-600">Our team will contact you for verification</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Kanagala Charitable Trust</h3>
                <p className="text-gray-300 text-sm">Building Stronger Family Communities</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm">© 2025 Kanagala Charitable Trust. All rights reserved.</p>
              <p className="text-gray-400 text-xs mt-2">Secure Registration System • Privacy Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        
        .form-group {
          position: relative;
        }
        
        .form-group label {
          transition: all 0.3s ease;
        }
        
        .form-group input:focus ~ label,
        .form-group select:focus ~ label {
          color: #10b981;
        }
      `}</style>
    </div>
  );
}