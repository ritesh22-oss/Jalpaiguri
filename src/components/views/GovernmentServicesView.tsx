import React from 'react';
import {
  ArrowLeft,
  Landmark,
  FileText,
  ExternalLink,
  Phone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';

export const GovernmentServicesView: React.FC = () => {
  const { goBack } = useNav();

  const services = [
    {
      title: 'Jalpaiguri Municipality Property Tax',
      dept: 'Revenue & Tax Department',
      desc: 'Online assessment, municipal holding tax payment, and receipt download.',
      linkText: 'Pay Tax Online'
    },
    {
      title: 'Trade License & Renewals',
      dept: 'Commerce & Industry Cell',
      desc: 'Apply for new shop/business trade certificates or renew existing ward licenses.',
      linkText: 'Apply License'
    },
    {
      title: 'Birth & Death Certificates',
      dept: 'Health & Vital Statistics',
      desc: 'Official registration certificates issued under Jalpaiguri Municipal jurisdiction.',
      linkText: 'Check Status'
    },
    {
      title: 'Duare Sarkar Schemes',
      dept: 'Govt. of West Bengal Outreach',
      desc: 'Lakshmir Bhandar, Swasthya Sathi, Krishak Bandhu registration camp dates.',
      linkText: 'View Camp Dates'
    },
    {
      title: 'Ration & Food Supplies',
      dept: 'Food & Supplies Department',
      desc: 'NFSA / RKSY card linking, e-ration card download, and dealer locator.',
      linkText: 'Check Entitlement'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-[#E8E4DA]/50">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-[#11241C] tracking-tight">
          Civic & Municipal Services
        </h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-[#063B2C] text-white rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#A7D7B9]" />
            <h2 className="font-extrabold text-sm tracking-tight">Jalpaiguri Municipality Portal</h2>
          </div>
          <p className="text-xs text-[#D2EBE0] leading-relaxed">
            Direct access to official civic portals, citizen welfare schemes, and grievance registration.
          </p>
        </div>

        <div className="space-y-3">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs space-y-2.5"
            >
              <div>
                <span className="text-[10px] font-bold text-[#063B2C] uppercase tracking-wider">
                  {srv.dept}
                </span>
                <h3 className="font-extrabold text-sm text-[#11241C] mt-0.5">
                  {srv.title}
                </h3>
              </div>

              <p className="text-xs text-[#55685F] leading-relaxed">
                {srv.desc}
              </p>

              <div className="pt-2 border-t border-[#F0ECE1] flex justify-end">
                <button
                  onClick={() => alert(`Redirecting to official Jalpaiguri Municipal service portal for ${srv.title}...`)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D2CEBE] text-[#063B2C] font-bold text-xs flex items-center gap-1.5 hover:bg-[#E6F4EA] cursor-pointer"
                >
                  <span>{srv.linkText}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
