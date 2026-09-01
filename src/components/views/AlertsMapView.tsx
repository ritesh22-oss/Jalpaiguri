import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Waves,
  X,
  CheckCircle2,
  RefreshCw,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  Compass,
  Layers,
  Plus
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';

export const AlertsMapView: React.FC = () => {
  const { navigate } = useNav();
  const { localAlerts, confirmLocalAlert, selectedAlertId, setSelectedAlertId, addLocalAlert } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All Alerts');
  const [searchArea, setSearchArea] = useState<string>('');
  const [showAddAlert, setShowAddAlert] = useState<boolean>(false);
  const [newAlertTitle, setNewAlertTitle] = useState<string>('');
  const [newAlertArea, setNewAlertArea] = useState<string>('Paharpur, Jalpaiguri');
  const [newAlertCategory, setNewAlertCategory] = useState<'Waterlogging' | 'Road Closure' | 'Flood' | 'Emergency'>('Waterlogging');

  const selectedAlert = localAlerts.find((a) => a.id === selectedAlertId) || localAlerts[0];

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle.trim()) return;
    addLocalAlert({
      title: newAlertTitle,
      category: newAlertCategory,
      area: newAlertArea,
      severity: 'medium',
      description: `Reported by citizen in ${newAlertArea}`,
      lat: 26.53,
      lng: 88.73,
      userConfirmed: true
    });
    setShowAddAlert(false);
    setNewAlertTitle('');
  };

  return (
    <div className="relative min-h-screen bg-[#E3EDF3] pb-24 max-w-md mx-auto overflow-hidden select-none">
      {/* Top Search & Filter Bar over Map matching Screenshot 9 */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 space-y-2.5 bg-gradient-to-b from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-transparent pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 bg-white/95 backdrop-blur-md border border-[#D2CEBE] rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-sm">
            <Search className="w-4 h-4 text-[#55685F]" />
            <input
              type="text"
              placeholder="Search Jalpaiguri area..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              className="w-full text-xs font-semibold text-[#11241C] placeholder:text-[#8C9B93] focus:outline-none bg-transparent"
            />
          </div>

          <button
            onClick={() => setShowAddAlert(true)}
            className="w-12 h-12 bg-[#063B2C] text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
            title="Post Local Alert"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Category Pills (All Alerts, Waterlogging, Road Closure) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['All Alerts', 'Waterlogging', 'Road Closure'].map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                  isSelected
                    ? 'bg-[#063B2C] text-white border border-[#063B2C]'
                    : 'bg-white/95 text-[#11241C] border border-[#D2CEBE] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Styled Interactive SVG Map of Jalpaiguri matching Screenshot 9 */}
      <div className="relative w-full h-[68vh] min-h-[480px] bg-[#D8E6DE] overflow-hidden">
        {/* SVG Topographical vector representation of Jalpaiguri town & Teesta River */}
        <svg
          viewBox="0 0 400 650"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Land */}
          <rect width="400" height="650" fill="#E4EFE8" />

          {/* Teesta River curved blue ribbon */}
          <path
            d="M260 0 C280 120 320 200 340 350 C360 480 320 580 350 650"
            stroke="#9AC7E8"
            strokeWidth="38"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M260 0 C280 120 320 200 340 350 C360 480 320 580 350 650"
            stroke="#B5D7F2"
            strokeWidth="24"
            fill="none"
            strokeLinecap="round"
          />

          {/* NH-27 & Town Roads */}
          <path d="M0 240 Q180 230 400 210" stroke="#F6D878" strokeWidth="8" fill="none" />
          <path d="M0 240 Q180 230 400 210" stroke="#E6A817" strokeWidth="3" fill="none" />

          <path d="M120 100 Q150 300 180 650" stroke="#FFFFFF" strokeWidth="6" fill="none" />
          <path d="M40 380 Q200 360 380 400" stroke="#FFFFFF" strokeWidth="5" fill="none" />
          <path d="M80 500 Q220 520 360 490" stroke="#FFFFFF" strokeWidth="4" fill="none" />

          {/* Locality text annotations matching screenshot 9 */}
          <text x="215" y="165" fill="#3D5048" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Paharpur</text>
          <text x="215" y="177" fill="#6A7F77" fontSize="9" fontFamily="sans-serif">পাহাড়পুর</text>

          <text x="145" y="320" fill="#3D5048" fontSize="10" fontWeight="bold" fontFamily="sans-serif">SILPASAMITI PARA</text>
          <text x="145" y="332" fill="#6A7F77" fontSize="9" fontFamily="sans-serif">শিল্পসমিতি পাড়া</text>

          <text x="150" y="375" fill="#1C3529" fontSize="12" fontWeight="800" fontFamily="sans-serif">Jalpaiguri</text>
          <text x="150" y="390" fill="#3D5048" fontSize="10" fontWeight="bold" fontFamily="sans-serif">জলপাইগুড়ি</text>

          <text x="160" y="425" fill="#3D5048" fontSize="9" fontWeight="bold" fontFamily="sans-serif">ADARPARA</text>
          <text x="160" y="437" fill="#6A7F77" fontSize="8" fontFamily="sans-serif">আদাড়পাড়া</text>

          <text x="150" y="475" fill="#3D5048" fontSize="9" fontWeight="bold" fontFamily="sans-serif">PANDAPARA</text>
          <text x="150" y="487" fill="#6A7F77" fontSize="8" fontFamily="sans-serif">পান্ডাপাড়া</text>

          <text x="50" y="605" fill="#1C3529" fontSize="13" fontWeight="800" fontFamily="sans-serif">Kharia</text>

          <text x="320" y="320" fill="#2C699A" fontSize="9" fontWeight="bold" transform="rotate(75 320 320)">Teesta River</text>

          {/* NH-27 badge */}
          <rect x="200" y="218" width="22" height="15" rx="3" fill="#F4C430" stroke="#B8860B" strokeWidth="1" />
          <text x="203" y="229" fill="#111" fontSize="8" fontWeight="bold">27</text>
        </svg>

        {/* Interactive Map Marker 1: Waterlogging in Paharpur matching image 9 */}
        <div
          onClick={() => setSelectedAlertId('alt-1')}
          className="absolute top-[230px] left-[180px] -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-[#0E4A6F] border-2 border-white shadow-lg flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <Waves className="w-6 h-6" />
            </div>
            {/* Ripple wave */}
            <span className="absolute -inset-2 rounded-full border-2 border-[#0E4A6F]/40 animate-ping-slow pointer-events-none"></span>
          </div>
        </div>

        {/* Interactive Map Marker 2: Road Closure near Teesta Bridge matching image 9 */}
        <div
          onClick={() => setSelectedAlertId('alt-2')}
          className="absolute top-[190px] right-[105px] cursor-pointer group z-20"
        >
          <div className="w-8 h-8 rounded-full bg-[#D9383A] border-2 border-white shadow-md flex items-center justify-center text-white">
            <div className="w-3.5 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Education pin near Silpasamiti */}
        <div className="absolute top-[255px] left-[130px] w-7 h-7 rounded-full bg-[#8E9FA5] border-2 border-white flex items-center justify-center text-white text-xs">
          🎓
        </div>
      </div>

      {/* Bottom Alert Card Sheet matching Screenshot 9 */}
      {selectedAlert && (
        <div className="fixed bottom-14 left-0 right-0 z-30 max-w-md mx-auto p-3">
          <div className="bg-white rounded-3xl p-4 shadow-2xl border border-[#E8E4DA] space-y-3 animate-in slide-in-from-bottom duration-300">
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-[#D2CEBE] rounded-full mx-auto -mt-1 mb-1"></div>

            {/* Main Alert Info Row with X close button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0E4A6F] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#11241C] leading-tight">
                    {selectedAlert.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#55685F] mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#55685F]" />
                    <span>Reported {selectedAlert.timeAgo}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAlertId(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#55685F] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* "3 people confirmed this" Banner matching Screenshot 9 */}
            <div className="bg-[#FAF2EC] border border-[#F3E2D5] rounded-2xl p-3 flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#11241C]" />
              <span className="text-xs font-bold text-[#11241C]">
                {selectedAlert.confirmedCount} people confirmed this
              </span>
            </div>

            {/* 2 Action Buttons matching Screenshot 9 */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Confirm Report Button (Dark Green #063B2C) */}
              <button
                type="button"
                onClick={() => confirmLocalAlert(selectedAlert.id)}
                className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedAlert.userConfirmed
                    ? 'bg-[#063B2C] text-white ring-2 ring-[#A7D7B9]'
                    : 'bg-[#063B2C] hover:bg-[#084D3A] text-white shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedAlert.userConfirmed ? 'Confirmed ✓' : 'Confirm Report'}</span>
              </button>

              {/* Update Status Button (Light Gray/Sage) */}
              <button
                type="button"
                onClick={() => {
                  const update = prompt('Enter real-time road or water status:', 'Water receding slowly');
                  if (update) alert('Status update posted to Jalpaiguri citizens!');
                }}
                className="py-3 px-3 rounded-2xl bg-[#DCEBE2] hover:bg-[#CFE2D6] text-[#063B2C] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-[#11241C]">Post Local Road Alert</h3>
              <button onClick={() => setShowAddAlert(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#11241C]">Issue Category</label>
                <select
                  value={newAlertCategory}
                  onChange={(e) => setNewAlertCategory(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="Waterlogging">Waterlogging</option>
                  <option value="Road Closure">Road Closure</option>
                  <option value="Flood">Flood Alert</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#11241C]">Location / Landmark</label>
                <input
                  type="text"
                  required
                  value={newAlertArea}
                  onChange={(e) => setNewAlertArea(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#11241C]">Short Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tree fallen on road"
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#063B2C] text-white rounded-xl font-bold text-xs shadow-md"
              >
                Publish Alert
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
