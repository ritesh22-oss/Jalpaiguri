import React, { useMemo } from 'react';

type Row = Record<string, any> & { id: string };

interface AdminAnalyticsPanelProps {
  users: Row[];
  shops: Row[];
  workers: Row[];
  verificationQueue: Row[];
  doctors: Row[];
  civicReports: Row[];
  localAlerts: Row[];
  bloodDonors: Row[];
  rentals: Row[];
  jobs: Row[];
}

function parseTimestamp(input: any): Date | null {
  if (!input) return null;
  if (typeof input?.toDate === 'function') {
    const d = input.toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const AdminAnalyticsPanel: React.FC<AdminAnalyticsPanelProps> = ({
  users,
  shops,
  workers,
  verificationQueue,
  doctors,
  civicReports,
  localAlerts,
  bloodDonors,
  rentals,
  jobs
}) => {
  const summary = useMemo(() => {
    const totalEntities =
      users.length +
      shops.length +
      workers.length +
      doctors.length +
      civicReports.length +
      localAlerts.length +
      bloodDonors.length +
      rentals.length +
      jobs.length;

    const verifiedShops = shops.filter((s) => s.isVerified || /verified/i.test(s.status || '')).length;
    const resolvedReports = civicReports.filter((r) => /resolved|closed/i.test(r.status || '')).length;
    const approvedWorkers = verificationQueue.filter((w) => /approved/i.test(w.status || '')).length +
      workers.filter((w) => w.verified && !verificationQueue.some((q) => q.id === w.id || q.workerId === w.id)).length;
    const totalModerationPool = shops.length + doctors.length + Math.max(workers.length, verificationQueue.length);
    const totalApprovedPool =
      verifiedShops + doctors.filter((d) => d.verified).length + approvedWorkers;

    const approvalRate = totalModerationPool > 0 ? Math.round((totalApprovedPool / totalModerationPool) * 100) : 0;
    const resolutionRate = civicReports.length > 0 ? Math.round((resolvedReports / civicReports.length) * 100) : 0;

    return {
      totalEntities,
      verifiedShops,
      resolvedReports,
      approvalRate,
      resolutionRate
    };
  }, [users, shops, workers, verificationQueue, doctors, civicReports, localAlerts, bloodDonors, rentals, jobs]);

  const distributionData: Array<{ label: string; count: number; color: string }> = useMemo(
    () => [
      { label: 'Users', count: users.length, color: 'bg-[#007AFF]' },
      { label: 'Shops', count: shops.length, color: 'bg-emerald-600' },
      { label: 'Workers', count: Math.max(workers.length, verificationQueue.length), color: 'bg-indigo-600' },
      { label: 'Doctors', count: doctors.length, color: 'bg-rose-600' },
      { label: 'Civic Reports', count: civicReports.length, color: 'bg-amber-600' },
      { label: 'Local Alerts', count: localAlerts.length, color: 'bg-orange-600' },
      { label: 'Blood Donors', count: bloodDonors.length, color: 'bg-red-600' },
      { label: 'Rentals', count: rentals.length, color: 'bg-teal-600' },
      { label: 'Jobs', count: jobs.length, color: 'bg-sky-600' }
    ],
    [users.length, shops.length, workers.length, verificationQueue.length, doctors.length, civicReports.length, localAlerts.length, bloodDonors.length, rentals.length, jobs.length]
  );

  const maxDistribution = Math.max(1, ...distributionData.map((d) => d.count));

  const monthlyTrends = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; users: number; shops: number; reports: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      buckets.push({ key, label, users: 0, shops: 0, reports: 0 });
    }
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));

    users.forEach((u) => {
      const d = parseTimestamp(u.createdAt);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const b = bucketMap.get(key);
      if (b) b.users += 1;
    });
    shops.forEach((s) => {
      const d = parseTimestamp(s.createdAt);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const b = bucketMap.get(key);
      if (b) b.shops += 1;
    });
    civicReports.forEach((r) => {
      const d = parseTimestamp(r.reportedAt || r.createdAt);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const b = bucketMap.get(key);
      if (b) b.reports += 1;
    });

    return buckets;
  }, [users, shops, civicReports]);

  const maxMonthly = Math.max(
    1,
    ...monthlyTrends.map((m) => Math.max(m.users, m.shops, m.reports, m.users + m.shops + m.reports))
  );

  const reportCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    civicReports.forEach((r) => {
      const cat = String(r.category || 'Other').trim() || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [civicReports]);

  const maxCategory = Math.max(1, ...reportCategories.map(([, c]) => c));

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E8E4DA] bg-white p-4">
          <span className="text-xs font-bold text-[#55685F]">Total Tracked Records</span>
          <b className="mt-2 block text-2xl text-[#11241C]">{summary.totalEntities}</b>
          <span className="text-[11px] text-slate-500">Across 9 live collections</span>
        </div>
        <div className="rounded-2xl border border-[#E8E4DA] bg-white p-4">
          <span className="text-xs font-bold text-[#55685F]">Moderation Approval Rate</span>
          <b className="mt-2 block text-2xl text-[#007AFF]">{summary.approvalRate}%</b>
          <span className="text-[11px] text-slate-500">Shops, workers & doctors</span>
        </div>
        <div className="rounded-2xl border border-[#E8E4DA] bg-white p-4">
          <span className="text-xs font-bold text-[#55685F]">Civic Report Resolution</span>
          <b className="mt-2 block text-2xl text-emerald-700">{summary.resolutionRate}%</b>
          <span className="text-[11px] text-slate-500">
            {summary.resolvedReports} of {civicReports.length} resolved
          </span>
        </div>
        <div className="rounded-2xl border border-[#E8E4DA] bg-white p-4">
          <span className="text-xs font-bold text-[#55685F]">Official Alerts Active</span>
          <b className="mt-2 block text-2xl text-amber-700">
            {localAlerts.filter((a) => a.isOfficial).length}
          </b>
          <span className="text-[11px] text-slate-500">{localAlerts.length} total alerts</span>
        </div>
      </div>

      {/* Monthly Activity Chart + Collection Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-[#E8E4DA] bg-white p-6 space-y-4">
          <div>
            <h2 className="font-extrabold text-sm text-[#11241C]">6-Month Registration & Report Trends</h2>
            <p className="text-[11px] text-[#55685F]">Computed from Firestore creation timestamps</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 text-[#007AFF]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#007AFF]" /> Users
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" /> Shops
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Reports
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 pt-2 items-end h-44 border-b border-[#F0ECE1] pb-2">
            {monthlyTrends.map((bucket) => {
              const total = bucket.users + bucket.shops + bucket.reports;
              const uPct = Math.round((bucket.users / maxMonthly) * 100);
              const sPct = Math.round((bucket.shops / maxMonthly) * 100);
              const rPct = Math.round((bucket.reports / maxMonthly) * 100);
              return (
                <div key={bucket.key} className="flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">{total}</span>
                  <div className="w-full max-w-[36px] flex items-end justify-center gap-0.5 h-28">
                    <div
                      title={`Users: ${bucket.users}`}
                      className="w-2.5 bg-[#007AFF] rounded-t"
                      style={{ height: `${Math.max(bucket.users > 0 ? 12 : 4, uPct)}%` }}
                    />
                    <div
                      title={`Shops: ${bucket.shops}`}
                      className="w-2.5 bg-emerald-600 rounded-t"
                      style={{ height: `${Math.max(bucket.shops > 0 ? 12 : 4, sPct)}%` }}
                    />
                    <div
                      title={`Reports: ${bucket.reports}`}
                      className="w-2.5 bg-amber-500 rounded-t"
                      style={{ height: `${Math.max(bucket.reports > 0 ? 12 : 4, rPct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#55685F]">{bucket.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E8E4DA] bg-white p-6 space-y-4">
          <div>
            <h2 className="font-extrabold text-sm text-[#11241C]">Service & Directory Distribution</h2>
            <p className="text-[11px] text-[#55685F]">Live document counts per Firestore collection</p>
          </div>
          <div className="space-y-3">
            {distributionData.map(({ label, count, color }) => (
              <div className="grid grid-cols-[100px_1fr_42px] items-center gap-3 text-xs" key={label}>
                <span className="font-bold text-[#11241C] truncate">{label}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${(count / maxDistribution) * 100}%` }}
                  />
                </div>
                <b className="text-right text-[#11241C]">{count}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Civic Reports Breakdown */}
      <section className="rounded-3xl border border-[#E8E4DA] bg-white p-6 space-y-4">
        <div>
          <h2 className="font-extrabold text-sm text-[#11241C]">Civic Reports by Category</h2>
          <p className="text-[11px] text-[#55685F]">Top issue categories submitted by Jalpaiguri citizens</p>
        </div>
        {reportCategories.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No civic reports recorded yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reportCategories.map(([category, count]) => (
              <div key={category} className="rounded-2xl border border-[#F0ECE1] bg-[#FAF8F5] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#11241C]">{category}</span>
                  <span className="font-extrabold text-[#007AFF]">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#007AFF]"
                    style={{ width: `${(count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
