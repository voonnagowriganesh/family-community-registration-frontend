import React, { useState } from 'react';
import FamilyRegistration from './FamilyRegistration';
import AdminPanel from './AdminPanel';
import { Shield, Users, Home, Heart } from 'lucide-react';
import logo from './assets/logo.jpg';

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showModeToggle, setShowModeToggle] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-amber-50">
      {/* Header with Mode Toggle - UPDATED with heart symbol */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 text-white py-6 shadow-xl relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                  <img
                    src={logo}
                    alt="Kanagala Charitable Trust"
                    className="w-12 h-12 object-contain rounded-full"
                  />
                </div>
                {/* HEART SYMBOL RESTORED */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Kanagala Charitable Trust</h1>
                <p className="text-green-100 text-sm mt-1">
                  {isAdminMode ? 'Admin Dashboard' : 'Family Community Registration'}
                </p>
              </div>
            </div>
            
            {/* Mode Toggle Container */}
            <div className="relative">
              <button
                onClick={() => setShowModeToggle(!showModeToggle)}
                className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                {isAdminMode ? (
                  <>
                    <Shield className="w-5 h-5 text-amber-300" />
                    <span className="text-sm">Admin Mode</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 text-green-200" />
                    <span className="text-sm">Registration Mode</span>
                  </>
                )}
              </button>
              
              {/* Mode Toggle Dropdown */}
              {showModeToggle && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModeToggle(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slide-down">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-600">Switch Application Mode</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsAdminMode(false);
                        setShowModeToggle(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-all ${
                        !isAdminMode ? 'bg-green-50 border-l-4 border-green-500' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !isAdminMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Home className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">Registration Portal</p>
                        <p className="text-sm text-gray-500">For family registrations</p>
                      </div>
                      {!isAdminMode && (
                        <div className="ml-auto w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsAdminMode(true);
                        setShowModeToggle(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-all ${
                        isAdminMode ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isAdminMode ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">Admin Dashboard</p>
                        <p className="text-sm text-gray-500">Manage registrations</p>
                      </div>
                      {isAdminMode && (
                        <div className="ml-auto w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                    
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500">
                        {isAdminMode 
                          ? 'Currently viewing admin dashboard' 
                          : 'Currently viewing registration portal'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mode Indicator Bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          isAdminMode ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
        }`}></div>
      </div>

      {/* Render the appropriate component */}
      {isAdminMode ? <AdminPanel /> : <FamilyRegistration />}

      {/* Footer */}
      <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-8 h-8 object-contain rounded-full" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Kanagala Charitable Trust</h3>
                <p className="text-gray-300 text-xs">Building Stronger Family Communities</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-xs">© 2025 Kanagala Charitable Trust. All rights reserved.</p>
              <p className="text-gray-400 text-xs mt-1">Secure Registration System • Privacy Protected</p>
              <div className="mt-2 flex items-center justify-center md:justify-end gap-2">
                <div className={`px-2 py-1 rounded text-xs ${
                  isAdminMode 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {isAdminMode ? 'Admin Mode' : 'Registration Mode'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation style */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}