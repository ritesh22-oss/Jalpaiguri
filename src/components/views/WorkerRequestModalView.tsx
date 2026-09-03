import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Wrench,
  Send,
  AlertCircle
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const WorkerRequestModalView: React.FC = () => {
  const { goBack, navigate, activeParams } = useNav();
  const { workers, requestWorkerService } = useApp();
  const { user } = useAuth();

  const workerId = activeParams?.workerId || 'w-1';
  const worker = workers.find((w) => w.id === workerId) || workers[0];

  const [serviceDate, setServiceDate] = useState('Tomorrow (Morning 9:00 AM - 12:00 PM)');
  const [problemDescription, setProblemDescription] = useState('');
  const [address, setAddress] = useState(user?.location || 'Kadamtala, Jalpaiguri, WB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      alert('Please describe what needs repair or servicing');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      if (requestWorkerService) {
        requestWorkerService({
          workerId: worker.id,
          workerName: worker.name,
          serviceCategory: worker.category || 'General Service',
          description: problemDescription,
          location: address,
          preferredDate: serviceDate,
          preferredTime: 'Morning / Afternoon'
        });
      }
      setIsSubmitting(false);
      setIsDone(true);
    }, 600);
  };

  if (isDone) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] p-6 flex flex-col justify-between max-w-md mx-auto select-none transition-colors">
        <div className="pt-16 text-center space-y-4">
          <div className="w-20 h-20 bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-400 border border-transparent dark:border-emerald-800/40 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
            Booking Request Sent!
          </h2>
          <p className="text-sm text-[#55685F] dark:text-[#A2B3AA] leading-relaxed max-w-[280px] mx-auto">
            {worker.name} has received your direct service request and will confirm the schedule via phone or SMS.
          </p>
        </div>

        <div className="space-y-3 pb-6">
          <button
            onClick={() => navigate('chat', { recipientId: worker.id, recipientName: worker.name, profession: worker.profession })}
            className="w-full py-4 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-[#084D3A] cursor-pointer"
          >
            Message {worker.name}
          </button>
          <button
            onClick={() => navigate('home')}
            className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-sm hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[#11241C] dark:text-white">
          Request Service
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Worker Mini Card */}
        <div className="bg-white dark:bg-[#17231E] rounded-3xl p-4 border border-[#E8E4DA] dark:border-white/10 shadow-xs flex items-center gap-3.5 transition-colors">
          <img
            src={worker.avatarUrl}
            alt={worker.name}
            className="w-12 h-12 rounded-2xl object-cover border border-[#E8E4DA] dark:border-white/10"
          />
          <div>
            <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">{worker.name}</h3>
            <p className="text-xs font-semibold text-[#063B2C] dark:text-emerald-400">{worker.profession}</p>
            <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] mt-0.5">{worker.startingPrice}</p>
          </div>
        </div>

        {/* Date & Slot */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase">
            Preferred Time Slot
          </label>
          <select
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="w-full bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl p-3.5 text-xs font-bold text-[#11241C] dark:text-white focus:outline-none"
          >
            <option value="Today (Within 2 hours)">Today (Urgent - Within 2 hours)</option>
            <option value="Tomorrow (Morning 9:00 AM - 12:00 PM)">Tomorrow (Morning 9:00 AM - 12:00 PM)</option>
            <option value="Tomorrow (Afternoon 2:00 PM - 5:00 PM)">Tomorrow (Afternoon 2:00 PM - 5:00 PM)</option>
            <option value="This Weekend (Flexible)">This Weekend (Flexible)</option>
          </select>
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase">
            Describe the Issue or Job
          </label>
          <textarea
            rows={4}
            required
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="e.g. Main switch tripping repeatedly, ceiling fan making noise in bedroom..."
            className="w-full bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl p-3.5 text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500 resize-none"
          ></textarea>
        </div>

        {/* Service Address */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase">
            Your Service Address in Jalpaiguri
          </label>
          <div className="flex items-center gap-2 bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl p-3">
            <MapPin className="w-4 h-4 text-[#063B2C] dark:text-emerald-400 shrink-0" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs font-bold text-[#11241C] dark:text-white bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Confirming with Provider…' : 'Submit Service Request'}
        </button>
      </form>
    </div>
  );
};
