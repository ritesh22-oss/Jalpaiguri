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
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';

export const AdminDashboardView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { adminVerificationQueue, approveWorkerVerification, civicReports, localAlerts, workers } = useApp();
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Users' | 'Workers' | 'Doctors' | 'Reports' | 'Alerts' | 'Analytics' | 'Settings'>('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarLinks = [
    { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'Users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'Workers', label: 'Workers', icon: <Wrench className="w-5 h-5" /> },
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
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#11241C] hover:bg-[#FAF8F5] rounded-full cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D9383A] rounded-full"></span>
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#E8E4DA] cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                alt="Admin User"
                className="w-8 h-8 rounded-full object-cover border border-[#D2CEBE]"
              />
              <span className="text-xs font-bold text-[#11241C] hidden sm:inline">
                Admin User
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#55685F]" />
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

          {/* Main Grid: Verification Queue (Left) & 3 Stats Cards (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verification Queue Table (2 Columns wide) */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E4DA] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#F0ECE1] flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#11241C]">
                  Verification Queue
                </h2>
                <button
                  onClick={() => setActiveTab('Workers')}
                  className="text-xs font-bold text-[#11241C] hover:text-[#063B2C] flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

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
                                onClick={() => approveWorkerVerification(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#063B2C] text-white font-bold text-[11px] hover:bg-[#084D3A] cursor-pointer"
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
            </div>

            {/* 3 Right Metric Cards matching Screenshot 5 */}
            <div className="space-y-4">
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
