import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Wrench,
  PlusSquare,
  FileSpreadsheet,
  AlertTriangle,
  BarChart3,
  Settings,
  Search,
  Bell,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Loader2,
  TrendingUp,
  Clock,
  LogOut,
  Store
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';
import { useAdminGuard } from '../../hooks/useAdminGuard';

export const AdminDashboardView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { user, firebaseUser } = useAuth();
  const { adminVerificationQueue, approveWorkerVerification, civicReports, localAlerts, workers } = useApp();
  const {
    isAuthorized,
    isLoading: authLoading,
    currentEmail,
    denialReason,
    error: guardError,
    loginAsAdmin,
    logoutAdmin,
    requireAdminAction,
    clearError
  } = useAdminGuard();

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Users' | 'Workers' | 'Shops' | 'Doctors' | 'Reports' | 'Alerts' | 'Analytics' | 'Settings'>('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [localError, setLocalError] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [adminShops, setAdminShops] = useState<any[]>([]);

  // Load shops for moderation
  const loadShops = async () => {
    try {
      const res = await fetch('/api/shops');
      if (res.ok) {
        const data = await res.json();
        setAdminShops(data);
      }
    } catch (e) {
      console.warn('Failed to load shops for admin', e);
    }
  };

  React.useEffect(() => {
    loadShops();
  }, []);

  const handleApproveShop = async (shopId: string) => {
    try {
      setIsProcessingAction(true);
      await requireAdminAction(async () => {
        const res = await fetch(`/api/admin/shops/${shopId}/verify`, { method: 'POST' });
        if (res.ok) {
          setAdminShops(prev => prev.map(s => s.id === shopId ? { ...s, isVerified: true, status: 'verified' } : s));
        }
      }, 'Access Denied: Only municipal administrator can verify shops.');
    } catch (err: any) {
      setLocalError(err.message || 'Verification failed.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectShop = async (shopId: string) => {
    try {
      setIsProcessingAction(true);
      await requireAdminAction(async () => {
        const res = await fetch(`/api/admin/shops/${shopId}/reject`, { method: 'POST' });
        if (res.ok) {
          setAdminShops(prev => prev.map(s => s.id === shopId ? { ...s, isVerified: false, status: 'rejected' } : s));
        }
      }, 'Access Denied: Only municipal administrator can reject shops.');
    } catch (err: any) {
      setLocalError(err.message || 'Rejection failed.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setLocalError('');
    clearError();
    const res = await loginAsAdmin();
    if (!res.success) {
      setLocalError(res.message || 'Access Denied: Municipal administrator credentials required.');
    }
  };

  const handleApproveWorker = async (id: string) => {
    try {
      setIsProcessingAction(true);
      await requireAdminAction(async () => {
        await approveWorkerVerification(id);
      }, 'Access Denied: Only the designated municipal administrator can approve worker credentials.');
    } catch (err: any) {
      setLocalError(err.message || 'Administrative operation blocked.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const displayError = localError || guardError;

  // STRICT ACCESS BARRIER: Only authorized municipal administrators authenticated via Google can view Admin Dashboard
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#063B2C] text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="max-w-md w-full bg-[#042A1F] border border-[#0F5A43] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Restricted Administration Zone</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mb-2">
            Municipal Admin Access
          </h1>

          <p className="text-xs text-emerald-200/80 leading-relaxed mb-6">
            Access to the Jalpaiguri Municipal Administration Console is restricted exclusively to authorized city administration personnel authenticated via Google SSO.
          </p>

          {currentEmail ? (
            <div className="w-full bg-rose-950/40 border border-rose-900/60 rounded-2xl p-3.5 mb-6 text-left">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                Connected Account
              </span>
              <p className="text-xs text-rose-200 font-medium break-all mt-0.5">
                {currentEmail}
              </p>
              <span className="text-[10px] text-rose-300/90 mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                <span>Account not registered with municipal admin permissions.</span>
              </span>
            </div>
          ) : (
            <div className="w-full bg-[#06382A] border border-[#0F5A43] rounded-2xl p-3.5 mb-6 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Official Sign-In Required
              </span>
              <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                Please authenticate using your municipal administration Google account to proceed.
              </p>
            </div>
          )}

          {displayError && (
            <div className="w-full bg-rose-500/20 border border-rose-500/40 rounded-xl p-2.5 mb-4 text-xs text-rose-200 text-left">
              {displayError}
            </div>
          )}

          <div className="w-full space-y-3">
            <button
              id="btn-admin-barrier-google-login"
              onClick={handleAdminGoogleLogin}
              disabled={authLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-emerald-50 active:scale-98 text-[#063B2C] font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70"
            >
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#063B2C]" />
                  <span>Verifying Google Auth...</span>
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in as Admin with Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('home')}
              className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/10 active:scale-98 text-emerald-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Citizen Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'Users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'Workers', label: 'Workers', icon: <Wrench className="w-5 h-5" /> },
    { id: 'Shops', label: 'Shops & Merchants', icon: <Store className="w-5 h-5" /> },
    { id: 'Doctors', label: 'Doctors', icon: <PlusSquare className="w-5 h-5" /> },
    { id: 'Reports', label: 'Reports', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'Alerts', label: 'Alerts', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'Analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row select-none">
      {/* Left Sidebar matching Screenshot 5 */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E8E4DA] flex flex-col justify-between p-4 shrink-0 shadow-xs">
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between pb-6 pt-2 px-2 border-b border-[#F0ECE1]">
            <div className="flex items-center gap-2.5">
              <JalpaiguriLogo size="sm" showText={false} />
              <span className="font-extrabold text-base text-[#11241C] tracking-tight">
                Jalpaiguri Connect
              </span>
            </div>
            <button
              onClick={() => navigate('home')}
              className="md:hidden text-xs font-bold text-[#063B2C] bg-[#E6F4EA] px-2 py-1 rounded-lg"
            >
              App View
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mt-6">
            {sidebarLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#063B2C] text-white shadow-xs'
                      : 'text-[#55685F] hover:bg-[#FAF8F5] hover:text-[#11241C]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#55685F]'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Settings & Back to Consumer App */}
        <div className="pt-4 border-t border-[#F0ECE1] space-y-2">
          <button
            onClick={() => setActiveTab('Settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'Settings'
                ? 'bg-[#063B2C] text-white'
                : 'text-[#55685F] hover:bg-[#FAF8F5]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#E6F4EA] text-[#063B2C] text-xs font-bold hover:bg-[#D5EADB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Mobile App</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar matching Screenshot 5 */}
        <header className="bg-white border-b border-[#E8E4DA] px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
          {/* Search Input */}
          <div className="flex-1 max-w-lg bg-[#FAF8F5] border border-[#D2CEBE] rounded-full px-4 py-2 flex items-center gap-2.5 shadow-inner">
            <Search className="w-4 h-4 text-[#55685F]" />
            <input
              type="text"
              placeholder="Search workers, users, or reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-[#11241C] placeholder:text-[#8C9B93] focus:outline-none bg-transparent"
            />
          </div>

          {/* Right Header Items: Notification & Admin Avatar */}
          <div className="flex items-center gap-4 relative">
            <button className="relative p-2 text-[#11241C] hover:bg-[#FAF8F5] rounded-full cursor-pointer transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D9383A] rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center gap-2.5 pl-2 border-l border-[#E8E4DA] cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img
                  src={firebaseUser?.photoURL || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"}
                  alt="Admin User"
                  className="w-8 h-8 rounded-full object-cover border border-[#D2CEBE]"
                />
                <span className="text-xs font-bold text-[#11241C] hidden sm:inline max-w-[130px] truncate">
                  {user?.name || 'Administrator'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#55685F]" />
              </button>

              {isAdminMenuOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-[#E8E4DA] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-[#F0ECE1]">
                    <p className="text-xs font-black text-[#11241C] truncate">
                      {user?.name || 'Administrator'}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      Municipal Authority
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      navigate('home');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
                    <span>Citizen Portal View</span>
                  </button>

                  <button
                    onClick={async () => {
                      setIsAdminMenuOpen(false);
                      await logoutAdmin();
                      navigate('auth');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-[#F0ECE1]"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body Content matching Screenshot 5 */}
        <div className="p-6 space-y-6 max-w-6xl">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-xs font-semibold text-[#55685F] mt-0.5">
              Overview and recent pending tasks.
            </p>
          </div>

          {/* Main Grid: Verification Queue (Left) & Metric Cards (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verification Queue Table (2 Columns wide) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E4DA] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#F0ECE1] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('Dashboard')}
                    className={`text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
                      activeTab !== 'Shops' ? 'bg-[#063B2C] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Workers Queue ({adminVerificationQueue.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('Shops')}
                    className={`text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${
                      activeTab === 'Shops' ? 'bg-[#063B2C] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Shops Moderation ({adminShops.length})
                  </button>
                </div>

                <span className="text-[11px] font-bold text-gray-400">
                  Municipal Verification Console
                </span>
              </div>

              {activeTab === 'Shops' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#F0ECE1] text-[#55685F] font-bold">
                      <tr>
                        <th className="py-3 px-4">Shop Name</th>
                        <th className="py-3 px-4">Category & Locality</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {adminShops.map((shop) => (
                        <tr key={shop.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-[#11241C] block">{shop.name}</span>
                              <span className="text-[10px] text-gray-500">Owner: {shop.ownerName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-gray-700 block">{shop.category}</span>
                            <span className="text-[10px] text-[#55685F]">{shop.locality} (PIN: {shop.pincode})</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                            {shop.phone || shop.ownerPhone}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              shop.isVerified
                                ? 'bg-[#E6F4EA] text-[#063B2C]'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${shop.isVerified ? 'bg-[#063B2C]' : 'bg-amber-600'}`}></span>
                              <span>{shop.isVerified ? 'Verified' : 'Pending'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {!shop.isVerified ? (
                                <button
                                  onClick={() => handleApproveShop(shop.id)}
                                  disabled={isProcessingAction}
                                  className="px-2.5 py-1 rounded-lg bg-[#063B2C] text-white font-bold text-[11px] hover:bg-[#084D3A] cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  Verify
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRejectShop(shop.id)}
                                  disabled={isProcessingAction}
                                  className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] hover:bg-rose-200 cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#F0ECE1] text-[#55685F] font-bold">
                      <tr>
                        <th className="py-3 px-4">Provider Name</th>
                        <th className="py-3 px-4">Profession</th>
                        <th className="py-3 px-4">Submission Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {adminVerificationQueue.map((item) => {
                        const initials = item.name.split(' ').map(n => n[0]).join('');
                        return (
                          <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#334155] font-extrabold text-[10px] flex items-center justify-center">
                                  {initials}
                                </div>
                                <span className="font-bold text-[#11241C]">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-[#55685F] font-semibold">{item.profession}</td>
                            <td className="py-3.5 px-4 text-[#55685F] font-medium">{item.date}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'Approved'
                                  ? 'bg-[#E6F4EA] text-[#063B2C]'
                                  : 'bg-[#EFECE6] text-[#55685F]'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Approved' ? 'bg-[#063B2C]' : 'bg-[#73827B]'}`}></span>
                                <span>{item.status}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => alert(`Reviewing documents for ${item.name}`)}
                                  className="px-2.5 py-1 rounded-lg bg-[#C8EADB] text-[#063B2C] font-bold text-[11px] hover:bg-[#B5E2CE] cursor-pointer"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => handleApproveWorker(item.id)}
                                  disabled={isProcessingAction}
                                  className="px-2.5 py-1 rounded-lg bg-[#063B2C] text-white font-bold text-[11px] hover:bg-[#084D3A] cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Metric Cards */}
            <div className="space-y-4">
              {/* Card 0: Local Shops Registered */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center shadow-xs shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#55685F] block">
                    Registered Shops
                  </span>
                  <h3 className="text-xl font-extrabold text-[#11241C] tracking-tight">
                    {adminShops.length}
                  </h3>
                  <span className="text-[11px] font-bold text-[#063B2C] flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{adminShops.filter(s => s.isVerified).length} verified merchants</span>
                  </span>
                </div>
              </div>
              {/* Card 1: Total Active Users */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#063B2C] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#55685F] block">
                    Total Active Users
                  </span>
                  <h3 className="text-xl font-extrabold text-[#11241C] tracking-tight">
                    12,450
                  </h3>
                  <span className="text-[11px] font-bold text-[#063B2C] flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+5.2% this week</span>
                  </span>
                </div>
              </div>

              {/* Card 2: Pending Civic Reports */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E2EAE6] text-[#063B2C] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[#063B2C]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#55685F] block">
                    Pending Civic Reports
                  </span>
                  <h3 className="text-xl font-extrabold text-[#11241C] tracking-tight">
                    42
                  </h3>
                  <span className="text-[11px] font-medium text-[#55685F]">
                    Requires attention
                  </span>
                </div>
              </div>

              {/* Card 3: Recent Emergencies */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8E4DA] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFEBEA] text-[#D9383A] flex items-center justify-center shrink-0">
                  <span className="text-2xl font-black leading-none">*</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#55685F] block">
                    Recent Emergencies
                  </span>
                  <h3 className="text-xl font-extrabold text-[#11241C] tracking-tight">
                    3
                  </h3>
                  <span className="text-[11px] font-medium text-[#D9383A]">
                    In the last 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
