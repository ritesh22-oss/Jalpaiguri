import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  PlusSquare,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
  Users,
  Wrench,
  X
} from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { AdminBrandLogo } from '../common/BrandLogo';
import { CMSManager } from '../admin/CMSManager';
import { AdminAnalyticsPanel } from '../admin/AdminAnalyticsPanel';
import { JALPAIGURI_EXPLORE_PLACES } from '../../data/jalpaiguriPlaces';
import { logAdminAction } from '../../utils/adminAudit';

type Section =
  | 'Dashboard'
  | 'CMS'
  | 'Place Photos'
  | 'Place Thumbnails'
  | 'Users'
  | 'Workers'
  | 'Shops'
  | 'Doctors'
  | 'Reports'
  | 'Alerts'
  | 'Analytics'
  | 'Settings';

type Row = Record<string, any> & { id: string };

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
}

const sections: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'CMS', label: 'Content Manager (CMS)', icon: <FileSpreadsheet className="w-5 h-5" /> },
  { id: 'Place Photos', label: 'Place Photos', icon: <Camera className="w-5 h-5" /> },
  { id: 'Place Thumbnails', label: 'Place Thumbnails', icon: <ImagePlus className="w-5 h-5" /> },
  { id: 'Users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'Workers', label: 'Workers Queue', icon: <Wrench className="w-5 h-5" /> },
  { id: 'Shops', label: 'Shops Queue', icon: <Store className="w-5 h-5" /> },
  { id: 'Doctors', label: 'Doctors Queue', icon: <PlusSquare className="w-5 h-5" /> },
  { id: 'Reports', label: 'Reports', icon: <FileSpreadsheet className="w-5 h-5" /> },
  { id: 'Alerts', label: 'Alerts', icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'Analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'Settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
];

const toSection = (input: unknown): Section => {
  const normalized = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
  if (!normalized || normalized === 'dashboard') return 'Dashboard';
  if (normalized === 'cms' || normalized === 'content manager' || normalized === 'content manager cms') return 'CMS';
  if (normalized === 'place photos' || normalized === 'photos') return 'Place Photos';
  if (normalized === 'place thumbnails' || normalized === 'thumbnails') return 'Place Thumbnails';
  if (normalized === 'users') return 'Users';
  if (normalized === 'workers' || normalized === 'workers queue') return 'Workers';
  if (normalized === 'shops' || normalized === 'shops queue') return 'Shops';
  if (normalized === 'doctors' || normalized === 'doctors queue') return 'Doctors';
  if (normalized === 'reports' || normalized === 'civic reports') return 'Reports';
  if (normalized === 'alerts') return 'Alerts';
  if (normalized === 'analytics') return 'Analytics';
  if (normalized === 'settings') return 'Settings';
  return sections.find((s) => s.id.toLowerCase() === normalized)?.id || 'Dashboard';
};

const slug = (input: Section) => input.toLowerCase().replace(/\s+/g, '-');

const dateText = (input: any) => {
  if (!input) return '—';
  const d = typeof input?.toDate === 'function' ? input.toDate() : new Date(input);
  return !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : '—';
};

const dateTimeText = (input: any) => {
  if (!input) return '—';
  const d = typeof input?.toDate === 'function' ? input.toDate() : new Date(input);
  return !Number.isNaN(d.getTime()) ? d.toLocaleString() : '—';
};

const classForStatus = (value: string) =>
  /approved|verified|published|resolved|active/i.test(value)
    ? 'bg-emerald-100 text-emerald-800'
    : /rejected|closed|critical|suspended|disabled/i.test(value)
    ? 'bg-rose-100 text-rose-800'
    : 'bg-amber-100 text-amber-800';

const Shell = ({
  title,
  description,
  children,
  action
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-[#11241C]">{title}</h1>
        <p className="mt-1 text-xs font-medium text-[#55685F]">{description}</p>
      </div>
      {action}
    </div>
    {children}
  </>
);

const Badge = ({ children }: { children: string }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${classForStatus(children)}`}>
    {children}
  </span>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="p-12 text-center text-xs text-slate-500">{children}</div>
);

const DataTable = ({
  headers,
  children,
  empty
}: {
  headers: string[];
  children: React.ReactNode;
  empty: string;
}) => {
  const rows = React.Children.toArray(children);
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E8E4DA] bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="bg-[#FAF8F5] text-[#55685F] border-b border-[#F0ECE1]">
            <tr>
              {headers.map((h) => (
                <th className="p-3.5 font-bold" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_td]:p-3.5 [&_tr]:border-t [&_tr]:border-[#F0ECE1] [&_tr:hover]:bg-[#FAF8F5]/50">
            {rows}
          </tbody>
        </table>
      </div>
      {!rows.length && <Empty>{empty}</Empty>}
    </div>
  );
};

const Button = ({
  children,
  onClick,
  kind = 'primary',
  disabled = false,
  type = 'button'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: 'primary' | 'success' | 'danger' | 'plain' | 'warning';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
      kind === 'primary'
        ? 'bg-[#007AFF] text-white hover:bg-blue-700'
        : kind === 'success'
        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
        : kind === 'danger'
        ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
        : kind === 'warning'
        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`}
  >
    {children}
  </button>
);

export const AdminDashboardView: React.FC = () => {
  const { navigate, params } = useNav();
  const { firebaseUser } = useAuth();
  const {
    workers,
    shops,
    civicReports,
    localAlerts,
    doctors,
    bloodDonors,
    rentals,
    jobs,
    adminVerificationQueue,
    placePhotoSubmissions,
    refreshData
  } = useApp();
  const guard = useAdminGuard();

  const [section, setSection] = useState<Section>(() => toSection(params.section));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local admin collections
  const [users, setUsers] = useState<Row[]>([]);
  const [thumbnails, setThumbnails] = useState<Row[]>([]);
  const [auditLogs, setAuditLogs] = useState<Row[]>([]);
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    digest: true,
    autoSyncApprovedPhotos: true,
    requireRejectReason: false,
    queueAlerts: true,
    emergencyReportAlerts: true,
    appNoticeBanner: '',
    supportHelpline: '1800-345-0000',
    maintenanceMode: false
  });

  // UI feedback & busy state
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [workerFilter, setWorkerFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [shopFilter, setShopFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected' | 'Suspended'>('All');
  const [doctorFilter, setDoctorFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('All');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('All');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('All');
  const [alertCategoryFilter, setAlertCategoryFilter] = useState<string>('All');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('All');
  const [photoFilter, setPhotoFilter] = useState<'All' | 'pending' | 'approved' | 'rejected'>('All');

  // Detail Modals
  const [selectedUser, setSelectedUser] = useState<Row | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Row | null>(null);
  const [selectedShop, setSelectedShop] = useState<Row | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Row | null>(null);
  const [selectedReport, setSelectedReport] = useState<Row | null>(null);
  const [reportResponseDraft, setReportResponseDraft] = useState('');
  const [reportStatusDraft, setReportStatusDraft] = useState('Submitted');
  const [selectedAlert, setSelectedAlert] = useState<Row | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Row | null>(null);

  // Place Thumbnails & Place Photos upload states
  const [selectedPlace, setSelectedPlace] = useState(JALPAIGURI_EXPLORE_PLACES[0]?.placeId || '');
  const [placeSearch, setPlaceSearch] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [newPhotoPlaceId, setNewPhotoPlaceId] = useState(JALPAIGURI_EXPLORE_PLACES[0]?.placeId || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoApproveNow, setNewPhotoApproveNow] = useState(true);

  // Alerts creation state
  const [newAlert, setNewAlert] = useState({
    title: '',
    category: 'Community',
    area: '',
    description: '',
    severity: 'medium'
  });
  const [alertFormOpen, setAlertFormOpen] = useState(false);

  useEffect(() => {
    setSection(toSection(params.section));
  }, [params.section]);

  useEffect(() => {
    setPage(0);
  }, [section, searchQuery, userStatusFilter, userRoleFilter]);

  useEffect(() => {
    if (!firebaseUser) {
      setHasAdminClaim(false);
      return;
    }
    firebaseUser
      .getIdTokenResult()
      .then((res) => setHasAdminClaim(res.claims.admin === true))
      .catch(() => setHasAdminClaim(false));
  }, [firebaseUser]);

  useEffect(() => {
    if (!guard.isAuthorized || !db) return;
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => setUsers(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (e) => setError(`Users could not load: ${e.message}`)
    );
    const unsubThumbs = onSnapshot(
      collection(db, 'place_thumbnails'),
      (snap) => setThumbnails(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (e) => setError(`Thumbnails could not load: ${e.message}`)
    );
    const unsubSettings = onSnapshot(
      doc(db, 'admin_settings', 'console'),
      (snap) => {
        if (snap.exists()) {
          setSettings((old) => ({ ...old, ...snap.data() }));
        }
      },
      (e) => setError(`Settings could not load: ${e.message}`)
    );
    const auditQ = firestoreQuery(collection(db, 'admin_audit_logs'), orderBy('createdAt', 'desc'), limit(40));
    const unsubAudit = onSnapshot(
      auditQ,
      (snap) => setAuditLogs(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (e) => {
        console.warn('Audit logs listener warning:', e.message);
      }
    );

    return () => {
      unsubUsers();
      unsubThumbs();
      unsubSettings();
      unsubAudit();
    };
  }, [guard.isAuthorized]);

  const choose = (next: Section) => {
    setSection(next);
    setSearchQuery('');
    setSidebarOpen(false);
    navigate('admin-dashboard', { section: slug(next) });
  };

  const run = async (
    operation: () => Promise<void>,
    message: string,
    audit?: { action: string; targetCollection?: string; targetId?: string; summary?: string }
  ) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await guard.requireAdminAction(async () => {
        await operation();
        if (audit) {
          await logAdminAction({
            action: audit.action,
            section,
            targetCollection: audit.targetCollection,
            targetId: audit.targetId,
            summary: audit.summary || message
          });
        }
      }, 'Only an authorized municipal administrator can perform this action.');
      setNotice(message);
    } catch (e: any) {
      setError(e?.message || 'The operation failed.');
    } finally {
      setBusy(false);
    }
  };

  const change = (
    name: string,
    id: string,
    data: Record<string, any>,
    message: string,
    auditAction?: string
  ) =>
    run(
      () => updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() }),
      message,
      { action: auditAction || `Update ${name}`, targetCollection: name, targetId: id, summary: message }
    );

  const askConfirm = (cfg: ConfirmState) => setConfirmState(cfg);

  const remove = (name: string, id: string, label: string) => {
    askConfirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to permanently delete ${label}? This action cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      danger: true,
      onConfirm: () =>
        run(
          () => deleteDoc(doc(db, name, id)),
          `${label} deleted.`,
          { action: `Delete from ${name}`, targetCollection: name, targetId: id, summary: `Deleted ${label}` }
        )
    });
  };

  const find = <T extends Row>(items: T[], keys: string[]) =>
    items.filter(
      (item) =>
        !searchQuery ||
        keys.some((key) => String(item[key] || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Unified Workers list (combines admin_verifications and workers collection cleanly)
  const unifiedWorkers = useMemo(() => {
    const map = new Map<string, Row>();
    (workers as Row[]).forEach((w) => {
      map.set(w.id, {
        ...w,
        workerDocId: w.id,
        verificationDocId: null,
        status: w.status || (w.verified ? 'Approved' : 'Pending')
      });
    });
    (adminVerificationQueue as Row[]).forEach((q) => {
      const workerKey = q.workerId || q.id;
      const existingWorker = map.get(workerKey);
      if (existingWorker) {
        map.set(workerKey, {
          ...existingWorker,
          ...q,
          id: workerKey,
          workerDocId: workerKey,
          verificationDocId: q.id
        });
      } else {
        map.set(q.id, {
          ...q,
          workerDocId: q.workerId || null,
          verificationDocId: q.id
        });
      }
    });
    return Array.from(map.values());
  }, [workers, adminVerificationQueue]);

  // Place Thumbnails helpers
  const filteredPlaces = useMemo(
    () =>
      JALPAIGURI_EXPLORE_PLACES.filter(
        (p) =>
          !placeSearch.trim() ||
          p.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(placeSearch.toLowerCase())
      ),
    [placeSearch]
  );

  const place = JALPAIGURI_EXPLORE_PLACES.find((item) => item.placeId === selectedPlace);
  const savedThumbs = thumbnails.find((item) => item.placeId === selectedPlace || item.id === selectedPlace);
  const images: string[] = Array.isArray(savedThumbs?.images)
    ? savedThumbs.images
    : savedThumbs?.imageUrl
    ? [savedThumbs.imageUrl]
    : [];

  const saveImages = (next: string[], successMsg = 'Thumbnails saved.') =>
    run(
      async () => {
        if (!place) throw new Error('Select a place first.');
        const clean = next.filter(Boolean).slice(0, 4);
        await setDoc(
          doc(db, 'place_thumbnails', selectedPlace),
          {
            placeId: selectedPlace,
            placeName: place.name,
            images: clean,
            imageUrl: clean[0] || null,
            updatedAt: serverTimestamp(),
            updatedBy: firebaseUser?.uid || null
          },
          { merge: true }
        );
      },
      successMsg,
      { action: 'Update Place Thumbnails', targetCollection: 'place_thumbnails', targetId: selectedPlace }
    );

  const addImageUrl = () => {
    const trimmed = thumbnailUrl.trim();
    if (!trimmed) {
      setError('Please enter a valid image URL.');
      return;
    }
    if (images.length >= 4) {
      setError('Maximum 4 thumbnails allowed per place.');
      return;
    }
    void saveImages([...images, trimmed], 'Thumbnail URL added.');
    setThumbnailUrl('');
  };

  const uploadThumbnailFile = async (file?: File, replaceIndex?: number) => {
    if (!file || !place) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be under 5MB.');
      return;
    }
    setUploading(true);
    setError('');
    setNotice('');
    try {
      await guard.requireAdminAction(async () => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const path = `place-thumbnails/${selectedPlace}/${Date.now()}-${safeName}`;
        const upload = await uploadBytes(ref(storage, path), file, { contentType: file.type });
        const url = await getDownloadURL(upload.ref);
        let nextImages: string[];
        if (typeof replaceIndex === 'number') {
          nextImages = images.map((img, i) => (i === replaceIndex ? url : img));
        } else {
          nextImages = [...images, url].slice(0, 4);
        }
        await setDoc(
          doc(db, 'place_thumbnails', selectedPlace),
          {
            placeId: selectedPlace,
            placeName: place.name,
            images: nextImages,
            imageUrl: nextImages[0] || null,
            updatedAt: serverTimestamp(),
            updatedBy: firebaseUser?.uid || null
          },
          { merge: true }
        );
        await logAdminAction({
          action: typeof replaceIndex === 'number' ? 'Replace Place Thumbnail' : 'Upload Place Thumbnail',
          section: 'Place Thumbnails',
          targetCollection: 'place_thumbnails',
          targetId: selectedPlace,
          summary: `${typeof replaceIndex === 'number' ? 'Replaced' : 'Uploaded'} thumbnail for ${place.name}`
        });
      }, 'Only an authorized municipal administrator can upload media.');
      setNotice(typeof replaceIndex === 'number' ? 'Thumbnail replaced.' : 'Thumbnail uploaded.');
    } catch (e: any) {
      setError(e?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Place Photos Upload & Approval
  const handleUploadPlacePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPlace = JALPAIGURI_EXPLORE_PLACES.find((p) => p.placeId === newPhotoPlaceId);
    if (!targetPlace) {
      setError('Please select a valid place.');
      return;
    }
    if (!newPhotoFile && !newPhotoUrl.trim()) {
      setError('Select an image file or provide an image URL.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await guard.requireAdminAction(async () => {
        let finalUrl = newPhotoUrl.trim();
        let fileSize = 0;
        let fileType = 'url';
        if (newPhotoFile) {
          if (newPhotoFile.size > 5 * 1024 * 1024) {
            throw new Error('File must be smaller than 5MB.');
          }
          const safeName = newPhotoFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
          const storagePath = `place-photos/${targetPlace.placeId}/${Date.now()}-${safeName}`;
          const snap = await uploadBytes(ref(storage, storagePath), newPhotoFile, {
            contentType: newPhotoFile.type
          });
          finalUrl = await getDownloadURL(snap.ref);
          fileSize = newPhotoFile.size;
          fileType = newPhotoFile.type;
        }
        const photoId = `photo-admin-${Date.now()}`;
        const status = newPhotoApproveNow ? 'approved' : 'pending';
        await setDoc(doc(db, 'place_photos', photoId), {
          id: photoId,
          placeId: targetPlace.placeId,
          placeName: targetPlace.name,
          category: targetPlace.category,
          imageUrl: finalUrl,
          uploadedBy: 'Municipal Admin',
          uploaderId: firebaseUser?.uid || 'admin',
          fileSize,
          fileType,
          timestamp: new Date().toISOString(),
          status,
          createdAt: serverTimestamp()
        });

        if (newPhotoApproveNow && settings.autoSyncApprovedPhotos) {
          const existingThumbs = thumbnails.find((t) => t.placeId === targetPlace.placeId || t.id === targetPlace.placeId);
          const currentImgs: string[] = Array.isArray(existingThumbs?.images)
            ? existingThumbs.images
            : existingThumbs?.imageUrl
            ? [existingThumbs.imageUrl]
            : [];
          const merged = Array.from(new Set([finalUrl, ...currentImgs])).slice(0, 4);
          await setDoc(
            doc(db, 'place_thumbnails', targetPlace.placeId),
            {
              placeId: targetPlace.placeId,
              placeName: targetPlace.name,
              images: merged,
              imageUrl: merged[0],
              updatedAt: serverTimestamp(),
              updatedBy: firebaseUser?.uid || null
            },
            { merge: true }
          );
        }

        await logAdminAction({
          action: 'Upload Place Photo',
          section: 'Place Photos',
          targetCollection: 'place_photos',
          targetId: photoId,
          summary: `Uploaded photo for ${targetPlace.name} (${status})`
        });
      });
      setNewPhotoFile(null);
      setNewPhotoUrl('');
      setPhotoUploadOpen(false);
      setNotice('Place photo uploaded successfully.');
    } catch (e: any) {
      setError(e?.message || 'Failed to upload place photo.');
    } finally {
      setBusy(false);
    }
  };

  const approvePlacePhoto = (photo: Row) =>
    run(
      async () => {
        await updateDoc(doc(db, 'place_photos', photo.id), {
          status: 'approved',
          reviewedAt: serverTimestamp(),
          reviewedBy: firebaseUser?.uid || null
        });
        if (photo.placeId && photo.imageUrl) {
          const existingThumbs = thumbnails.find((t) => t.placeId === photo.placeId || t.id === photo.placeId);
          const currentImgs: string[] = Array.isArray(existingThumbs?.images)
            ? existingThumbs.images
            : existingThumbs?.imageUrl
            ? [existingThumbs.imageUrl]
            : [];
          const merged = Array.from(new Set([...currentImgs, photo.imageUrl])).slice(0, 4);
          await setDoc(
            doc(db, 'place_thumbnails', photo.placeId),
            {
              placeId: photo.placeId,
              placeName: photo.placeName || 'Jalpaiguri Place',
              images: merged,
              imageUrl: merged[0] || photo.imageUrl,
              approvedAt: new Date().toISOString(),
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );
        }
      },
      'Photo approved and synced to place gallery.',
      { action: 'Approve Place Photo', targetCollection: 'place_photos', targetId: photo.id }
    );

  // Worker Moderation (updates both admin_verifications and workers collection)
  const moderateWorker = (workerRow: Row, decision: 'Approved' | 'Rejected') =>
    run(
      async () => {
        const isApproved = decision === 'Approved';
        const verifId = workerRow.verificationDocId || workerRow.id;
        const workerId = workerRow.workerDocId || workerRow.workerId || workerRow.id;

        if (verifId) {
          await setDoc(
            doc(db, 'admin_verifications', verifId),
            {
              id: verifId,
              name: workerRow.name || 'Worker',
              profession: workerRow.profession || workerRow.category || 'Tradesperson',
              status: decision,
              reviewedAt: serverTimestamp(),
              reviewedBy: firebaseUser?.uid || null
            },
            { merge: true }
          );
        }
        if (workerId && workers.some((w) => w.id === workerId)) {
          await updateDoc(doc(db, 'workers', workerId), {
            verified: isApproved,
            status: decision,
            reviewedAt: serverTimestamp(),
            reviewedBy: firebaseUser?.uid || null
          });
        }
      },
      `Worker ${decision.toLowerCase()}.`,
      {
        action: `${decision === 'Approved' ? 'Approve' : 'Reject'} Worker`,
        targetCollection: 'workers',
        targetId: workerRow.id,
        summary: `${decision} worker "${workerRow.name || workerRow.id}"`
      }
    );

  // Alerts publish (fixed missing invocation!)
  const publishAlert = () =>
    run(
      async () => {
        if (!newAlert.title.trim() || !newAlert.area.trim() || !newAlert.description.trim()) {
          throw new Error('Title, affected area, and public notice description are required.');
        }
        const id = `alert-${Date.now()}`;
        await setDoc(doc(db, 'local_alerts', id), {
          ...newAlert,
          id,
          userId: firebaseUser?.uid || 'admin',
          isOfficial: true,
          confirmedCount: 0,
          deliveryStatus: 'Published',
          timeAgo: 'Just now',
          lat: 26.5435,
          lng: 88.7196,
          createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp()
        });
        setNewAlert({ title: '', category: 'Community', area: '', description: '', severity: 'medium' });
        setAlertFormOpen(false);
      },
      'Official alert published across Jalpaiguri.',
      { action: 'Publish Official Alert', targetCollection: 'local_alerts', summary: `Published "${newAlert.title}"` }
    );

  const saveReportReview = () => {
    if (!selectedReport) return;
    const isTerminal = /resolved|closed/i.test(reportStatusDraft);
    void run(
      async () => {
        const patch: Record<string, any> = {
          status: reportStatusDraft,
          officialResponse: reportResponseDraft.trim(),
          assignedAdministrator: firebaseUser?.uid || 'municipal-admin',
          updatedAt: serverTimestamp()
        };
        if (isTerminal) {
          patch.resolvedAt = new Date().toISOString();
        }
        await updateDoc(doc(db, 'civic_reports', selectedReport.id), patch);
        setSelectedReport((prev) => (prev ? { ...prev, ...patch } : null));
      },
      'Report status & official response saved.',
      {
        action: 'Update Civic Report',
        targetCollection: 'civic_reports',
        targetId: selectedReport.id,
        summary: `Set report ${selectedReport.id} to ${reportStatusDraft}`
      }
    );
  };

  const saveSettings = () =>
    run(
      () =>
        setDoc(
          doc(db, 'admin_settings', 'console'),
          {
            ...settings,
            updatedAt: serverTimestamp(),
            updatedBy: firebaseUser?.uid || null
          },
          { merge: true }
        ),
      'Admin preferences and configuration saved.',
      { action: 'Update Admin Settings', targetCollection: 'admin_settings', targetId: 'console' }
    );

  // Loading & Unauthorized Gates
  if (guard.isLoading) {
    return (
      <div className="min-h-full bg-[#0756D9] flex flex-col items-center justify-center gap-3 text-white p-6">
        <Loader2 className="w-9 h-9 animate-spin" />
        <p className="text-sm font-semibold">Verifying municipal credentials…</p>
      </div>
    );
  }

  if (!guard.isAuthorized) {
    return (
      <div className="min-h-full bg-[#007AFF] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full rounded-3xl bg-[#042A1F] p-7 text-center shadow-2xl space-y-4">
          <ShieldAlert className="mx-auto w-10 h-10 text-rose-300" />
          <h1 className="text-2xl font-black">Municipal Admin Access</h1>
          <p className="text-sm text-blue-100">This console is restricted to authorized administrators.</p>
          {(guard.error || guard.denialReason || error) && (
            <p className="rounded-xl bg-rose-950/60 p-3 text-xs text-rose-200">
              {guard.error || guard.denialReason || error}
            </p>
          )}
          <div className="pt-1 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={async () => {
                guard.clearError();
                const result = await guard.loginAsAdmin();
                if (!result.success) setError(result.message || 'Sign-in was not completed.');
              }}
              className="w-full rounded-xl bg-[#007AFF] hover:bg-blue-700 py-3 text-xs font-extrabold text-white cursor-pointer"
            >
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="w-full py-2 text-xs font-bold text-blue-100 hover:text-white cursor-pointer"
            >
              Return to citizen portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SECTION RENDERERS ---

  const dashboardPage = () => {
    const activeUsersCount = users.filter((u) => u.status !== 'suspended' && u.status !== 'disabled').length;
    const verifiedShopsCount = shops.filter((s: any) => s.isVerified || /verified/i.test(s.status || '')).length;
    const pendingShopsCount = shops.filter((s: any) => !s.isVerified && !/rejected|suspended/i.test(s.status || '')).length;
    const pendingWorkersCount = unifiedWorkers.filter((w) => !/approved|rejected/i.test(w.status || '')).length;
    const pendingDoctorsCount = doctors.filter((d: any) => !d.verified && !/rejected/i.test(d.verificationStatus || '')).length;
    const pendingReportsCount = civicReports.filter((r: any) => !/resolved|closed/i.test(r.status || '')).length;
    const emergencyReportsCount = civicReports.filter((r: any) =>
      /emergency|safety|flood|fire|accident|urgent/i.test(`${r.category || ''} ${r.description || ''}`)
    ).length;

    const cards: Array<{ label: string; count: number; sub: string; target: Section; accent?: string }> = [
      { label: 'Total Registered Users', count: users.length, sub: `${activeUsersCount} active accounts`, target: 'Users' },
      { label: 'Active Users', count: activeUsersCount, sub: `${users.length - activeUsersCount} suspended`, target: 'Users', accent: 'text-emerald-700' },
      { label: 'Registered Shops', count: shops.length, sub: `${verifiedShopsCount} verified live`, target: 'Shops' },
      { label: 'Pending Worker Apps', count: pendingWorkersCount, sub: `${unifiedWorkers.length} total workers`, target: 'Workers', accent: 'text-amber-700' },
      { label: 'Pending Shop Approvals', count: pendingShopsCount, sub: 'Awaiting review', target: 'Shops', accent: 'text-amber-700' },
      { label: 'Pending Doctor Regs', count: pendingDoctorsCount, sub: `${doctors.length} total listed`, target: 'Doctors', accent: 'text-blue-700' },
      { label: 'Pending Civic Reports', count: pendingReportsCount, sub: `${civicReports.length} total filed`, target: 'Reports', accent: 'text-rose-700' },
      { label: 'Emergency Reports', count: emergencyReportsCount, sub: 'Safety & urgent priority', target: 'Reports', accent: 'text-rose-700' }
    ];

    const recentActivities: Row[] =
      auditLogs.length > 0
        ? auditLogs.slice(0, 6)
        : (civicReports.slice(0, 6) as Row[]).map((r) => ({
            id: r.id,
            action: r.category || 'Civic Report',
            summary: `${r.location || 'Jalpaiguri'} — ${r.status || 'Submitted'}`,
            createdAt: r.reportedAt || r.createdAt
          }));

    return (
      <Shell
        title="Admin Dashboard"
        description="Live Firestore municipal overview, moderation workload, and recent activity."
        action={
          <Button kind="plain" onClick={() => navigate('admin-notifications')}>
            <Bell className="w-3.5 h-3.5" /> Admin Notifications
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => choose(c.target)}
              className="rounded-2xl border border-[#E8E4DA] bg-white p-4 text-left hover:border-[#007AFF] hover:shadow-sm transition-all cursor-pointer"
            >
              <span className="text-[11px] font-bold text-[#55685F] block">{c.label}</span>
              <b className={`mt-1.5 block text-2xl font-black ${c.accent || 'text-[#11241C]'}`}>{c.count}</b>
              <span className="mt-1 block text-[10px] font-medium text-slate-500">{c.sub}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="overflow-hidden rounded-3xl border border-[#E8E4DA] bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] px-5 py-4">
              <h2 className="font-extrabold text-sm text-[#11241C]">Recent Activities</h2>
              <button type="button" onClick={() => choose('Settings')} className="text-[11px] font-bold text-[#007AFF] cursor-pointer">
                View Audit Log
              </button>
            </div>
            {recentActivities.length === 0 ? (
              <Empty>No recent activities recorded yet.</Empty>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="border-b border-[#F4F1EA] last:border-b-0 px-5 py-3 text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <b className="text-[#11241C] block truncate">{act.action || act.category || 'Activity'}</b>
                    <span className="text-[11px] text-slate-500 block truncate">{act.summary || act.location || '—'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{dateText(act.createdAt)}</span>
                </div>
              ))
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-[#E8E4DA] bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] px-5 py-4">
              <h2 className="font-extrabold text-sm text-[#11241C]">Latest Administrative Updates</h2>
              <button type="button" onClick={() => choose('Alerts')} className="text-[11px] font-bold text-[#007AFF] cursor-pointer">
                Manage Alerts
              </button>
            </div>
            {localAlerts.length === 0 ? (
              <Empty>No administrative alerts published yet.</Empty>
            ) : (
              localAlerts.slice(0, 6).map((a: any) => (
                <div key={a.id} className="border-b border-[#F4F1EA] last:border-b-0 px-5 py-3 text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <b className="text-[#11241C] block truncate">{a.title || 'Alert'}</b>
                    <span className="text-[11px] text-slate-500 block truncate">{a.area || 'Jalpaiguri'} · {a.category || 'Notice'}</span>
                  </div>
                  <Badge>{a.severity || 'medium'}</Badge>
                </div>
              ))
            )}
          </section>
        </div>
      </Shell>
    );
  };

  const photosPage = () => {
    const filtered = find(placePhotoSubmissions as Row[], ['placeName', 'category', 'status', 'uploadedBy']).filter(
      (p) => photoFilter === 'All' || (p.status || 'pending').toLowerCase() === photoFilter
    );

    return (
      <Shell
        title="Place Photos"
        description="Upload, preview, approve, or reject community and admin place photos."
        action={
          <Button onClick={() => setPhotoUploadOpen(!photoUploadOpen)}>
            <Plus className="w-4 h-4" /> Upload Place Photo
          </Button>
        }
      >
        {photoUploadOpen && (
          <form onSubmit={handleUploadPlacePhoto} className="rounded-3xl border border-[#E8E4DA] bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#11241C]">Upload New Place Photo</h2>
              <button type="button" onClick={() => setPhotoUploadOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-[#55685F] mb-1">Select Place</label>
                <select
                  className="field"
                  value={newPhotoPlaceId}
                  onChange={(e) => setNewPhotoPlaceId(e.target.value)}
                >
                  {JALPAIGURI_EXPLORE_PLACES.map((p) => (
                    <option key={p.placeId} value={p.placeId}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#55685F] mb-1">Image URL (optional if uploading file)</label>
                <input
                  type="url"
                  className="field"
                  placeholder="https://..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#007AFF] px-4 py-2.5 text-xs font-bold text-[#007AFF] cursor-pointer hover:bg-blue-50">
                <Upload className="w-4 h-4" />
                <span>{newPhotoFile ? newPhotoFile.name : 'Choose Image File (Firebase Storage)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
                />
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-[#11241C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPhotoApproveNow}
                  onChange={(e) => setNewPhotoApproveNow(e.target.checked)}
                />
                Approve &amp; sync to Place Thumbnails immediately
              </label>
              <Button type="submit" disabled={busy}>
                {busy ? 'Uploading…' : 'Save Photo'}
              </Button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setPhotoFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize cursor-pointer ${
                photoFilter === status
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white border border-[#E8E4DA] text-[#55685F] hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <DataTable
          headers={['Preview', 'Place & Metadata', 'Submitted', 'Status', 'Actions']}
          empty="No place-photo submissions match this filter."
        >
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>
                {p.imageUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        url: p.imageUrl,
                        title: p.placeName || 'Place Photo',
                        subtitle: `${p.category || ''} · ${dateTimeText(p.timestamp || p.createdAt)}`
                      })
                    }
                    className="cursor-pointer group relative block"
                    title="Click to preview full image"
                  >
                    <img className="w-16 h-12 object-cover rounded-xl border border-[#E8E4DA]" src={p.imageUrl} alt={p.placeName || 'Place'} />
                  </button>
                ) : (
                  <div className="w-16 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Camera className="w-4 h-4" />
                  </div>
                )}
              </td>
              <td>
                <b className="text-[#11241C]">{p.placeName || 'Unnamed Place'}</b>
                <div className="text-[10px] text-slate-500">
                  {p.category || 'General'} · Source: {p.uploadedBy || 'Citizen'}
                  {p.fileSize ? ` · ${Math.round(p.fileSize / 1024)} KB` : ''}
                </div>
              </td>
              <td>{dateText(p.timestamp || p.createdAt)}</td>
              <td>
                <Badge>{p.status || 'pending'}</Badge>
              </td>
              <td>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button kind="plain" onClick={() => setSelectedPhoto(p)}>
                    <Eye className="w-3.5 h-3.5" /> Details
                  </Button>
                  <Button disabled={busy} kind="success" onClick={() => void approvePlacePhoto(p)}>
                    Approve
                  </Button>
                  <Button
                    disabled={busy}
                    kind="danger"
                    onClick={() =>
                      void change(
                        'place_photos',
                        p.id,
                        { status: 'rejected', reviewedAt: serverTimestamp() },
                        'Photo rejected.',
                        'Reject Place Photo'
                      )
                    }
                  >
                    Reject
                  </Button>
                  <Button disabled={busy} kind="plain" onClick={() => remove('place_photos', p.id, 'this photo submission')}>
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Shell>
    );
  };

  const thumbsPage = () => (
    <Shell title="Place Thumbnails" description="Curate, upload, preview, replace, or remove up to four Firebase Storage thumbnails per place.">
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-3xl border border-[#E8E4DA] bg-white p-4 flex flex-col gap-3 max-h-[640px]">
          <div className="flex items-center gap-2 rounded-xl border border-[#D2CEBE] bg-[#FAF8F5] px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={placeSearch}
              onChange={(e) => setPlaceSearch(e.target.value)}
              placeholder="Filter places..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
          <div className="space-y-1 overflow-y-auto flex-1">
            {filteredPlaces.map((item) => {
              const tDoc = thumbnails.find((t) => t.placeId === item.placeId || t.id === item.placeId);
              const count = Array.isArray(tDoc?.images) ? tDoc.images.length : tDoc?.imageUrl ? 1 : 0;
              return (
                <button
                  key={item.placeId}
                  type="button"
                  onClick={() => setSelectedPlace(item.placeId)}
                  className={`w-full rounded-xl p-3 text-left text-xs font-bold flex items-center justify-between gap-2 cursor-pointer ${
                    item.placeId === selectedPlace ? 'bg-blue-50 text-[#007AFF]' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block truncate">{item.name}</span>
                    <span className="block text-[10px] font-normal text-slate-500">{item.category}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {count}/4
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#E8E4DA] bg-white p-5 lg:col-span-2">
          <div>
            <h2 className="font-extrabold text-base text-[#11241C]">{place?.name || 'Select a place'}</h2>
            <p className="text-xs text-slate-500">{place?.formattedAddress}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-[#FAF8F5] group"
              >
                {images[index] ? (
                  <>
                    <img
                      src={images[index]}
                      alt={`Thumbnail ${index + 1}`}
                      onClick={() =>
                        setPreviewImage({
                          url: images[index],
                          title: `${place?.name || 'Place'} — Slot ${index + 1}`
                        })
                      }
                      className="h-full w-full object-cover cursor-pointer"
                    />
                    <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                      <label
                        title="Replace image"
                        className="rounded-lg bg-white/95 px-2 py-1 text-[10px] font-bold text-[#007AFF] shadow-xs cursor-pointer hover:bg-white"
                      >
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void uploadThumbnailFile(e.target.files?.[0], index)}
                        />
                      </label>
                      <button
                        type="button"
                        title="Remove thumbnail"
                        onClick={() =>
                          askConfirm({
                            title: 'Remove Thumbnail',
                            message: `Remove image in Slot ${index + 1} for ${place?.name}?`,
                            confirmLabel: 'Remove',
                            danger: true,
                            onConfirm: () => saveImages(images.filter((_, i) => i !== index), 'Thumbnail removed.')
                          })
                        }
                        className="rounded-lg bg-white/95 p-1.5 text-rose-600 shadow-xs cursor-pointer hover:bg-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] font-bold text-slate-400">
                    Slot {index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>

          {images.length < 4 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Paste thumbnail image URL (https://...)"
                  className="field flex-1"
                />
                <Button disabled={busy} onClick={addImageUrl}>
                  Add URL
                </Button>
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#007AFF] bg-blue-50/40 p-4 text-xs font-bold text-[#007AFF] hover:bg-blue-50">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading to Firebase Storage…' : 'Upload Image File to Next Available Slot'}</span>
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => void uploadThumbnailFile(e.target.files?.[0])}
                />
              </label>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );

  const usersPage = () => {
    const filtered = find(users, ['name', 'phone', 'location', 'id', 'role']).filter((u) => {
      const accountStatus = u.status === 'suspended' ? 'Suspended' : 'Active';
      if (userStatusFilter !== 'All' && accountStatus !== userStatusFilter) return false;
      if (userRoleFilter !== 'All' && (u.role || 'citizen') !== userRoleFilter) return false;
      return true;
    });
    const size = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    const safePage = Math.min(page, totalPages - 1);
    const rows = filtered.slice(safePage * size, (safePage + 1) * size);

    const toggleUserStatus = (u: Row) => {
      const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
      askConfirm({
        title: nextStatus === 'suspended' ? 'Suspend User Account' : 'Activate User Account',
        message: `Are you sure you want to mark "${u.name || 'this user'}" as ${nextStatus}?`,
        confirmLabel: nextStatus === 'suspended' ? 'Suspend Account' : 'Activate Account',
        danger: nextStatus === 'suspended',
        onConfirm: () =>
          run(
            () =>
              updateDoc(doc(db, 'users', u.id), {
                status: nextStatus,
                updatedAt: serverTimestamp(),
                updatedBy: firebaseUser?.uid || null
              }),
            `User account marked ${nextStatus}.`,
            {
              action: nextStatus === 'suspended' ? 'Suspend User' : 'Activate User',
              targetCollection: 'users',
              targetId: u.id,
              summary: `Changed account status of ${u.name || u.id} to ${nextStatus}`
            }
          )
      });
    };

    return (
      <Shell title="Users" description="Registered citizen & provider profiles. Personal email addresses are strictly hidden for PII protection.">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {(['All', 'Active', 'Suspended'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setUserStatusFilter(st)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                  userStatusFilter === st
                    ? 'bg-[#007AFF] text-white'
                    : 'bg-white border border-[#E8E4DA] text-[#55685F]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="rounded-xl border border-[#D2CEBE] bg-white px-3 py-1.5 text-xs font-bold text-[#11241C]"
          >
            <option value="All">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="worker">Worker</option>
            <option value="shop_owner">Shop Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="rounded-3xl border border-[#E8E4DA] bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#F0ECE1] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{filtered.length} matching profiles</span>
            <span>Admin role custom-claim updates require Firebase Admin SDK</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#55685F] border-b border-[#F0ECE1]">
                <tr>
                  <th className="p-3.5 font-bold">Profile</th>
                  <th className="p-3.5 font-bold">Phone &amp; Location</th>
                  <th className="p-3.5 font-bold">Role</th>
                  <th className="p-3.5 font-bold">Registered</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_td]:p-3.5 [&_tr]:border-t [&_tr]:border-[#F0ECE1]">
                {rows.map((u) => {
                  const accountStatus = u.status === 'suspended' ? 'Suspended' : 'Active';
                  return (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]/50">
                      <td>
                        <b className="text-[#11241C]">{u.name || 'Unnamed profile'}</b>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {u.id.slice(0, 12)}…</div>
                      </td>
                      <td>
                        <div>{u.phone || '—'}</div>
                        <div className="text-[10px] text-slate-500">{u.location || 'Jalpaiguri'}</div>
                      </td>
                      <td>
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold capitalize text-slate-700">
                          {u.role || 'citizen'}
                        </span>
                      </td>
                      <td>{dateText(u.createdAt)}</td>
                      <td>
                        <Badge>{accountStatus}</Badge>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button kind="plain" onClick={() => setSelectedUser(u)}>
                            <Eye className="w-3.5 h-3.5" /> Details
                          </Button>
                          <Button
                            disabled={busy || u.role === 'admin'}
                            kind={accountStatus === 'Active' ? 'danger' : 'success'}
                            onClick={() => toggleUserStatus(u)}
                          >
                            {accountStatus === 'Active' ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!rows.length && <Empty>No matching user profiles.</Empty>}
          </div>
          <div className="flex justify-between items-center gap-2 p-3.5 border-t border-[#F0ECE1] text-xs">
            <span className="text-slate-500">
              Showing {filtered.length === 0 ? 0 : safePage * size + 1}–{Math.min((safePage + 1) * size, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage(Math.max(0, safePage - 1))}
                className="p-1.5 rounded-lg border border-[#E8E4DA] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold">
                Page {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={(safePage + 1) * size >= filtered.length}
                onClick={() => setPage(safePage + 1)}
                className="p-1.5 rounded-lg border border-[#E8E4DA] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  };

  const workersPage = () => {
    const filtered = find(unifiedWorkers, ['name', 'profession', 'category', 'serviceArea', 'status']).filter((w) => {
      if (workerFilter === 'All') return true;
      const st = String(w.status || (w.verified ? 'Approved' : 'Pending'));
      if (workerFilter === 'Pending') return !/approved|rejected/i.test(st);
      if (workerFilter === 'Approved') return /approved|verified/i.test(st);
      return /rejected/i.test(st);
    });

    return (
      <Shell title="Workers Queue" description="Verify tradespeople applications and inspect worker credentials.">
        <div className="flex flex-wrap gap-2">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setWorkerFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                workerFilter === st ? 'bg-[#007AFF] text-white' : 'bg-white border border-[#E8E4DA] text-[#55685F]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <DataTable
          headers={['Applicant', 'Profession & Area', 'Submitted', 'Status', 'Actions']}
          empty="No worker applications match this filter."
        >
          {filtered.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="flex items-center gap-2.5">
                  {item.avatarUrl && (
                    <img src={item.avatarUrl} alt={item.name} className="w-9 h-9 rounded-xl object-cover border border-[#E8E4DA]" />
                  )}
                  <div>
                    <b className="text-[#11241C]">{item.name || 'Unnamed Worker'}</b>
                    <div className="text-[10px] text-slate-500">{item.phone || '—'}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="font-semibold">{item.profession || item.category || '—'}</div>
                <div className="text-[10px] text-slate-500">{item.serviceArea || item.locality || 'Jalpaiguri'}</div>
              </td>
              <td>{dateText(item.date || item.createdAt)}</td>
              <td>
                <Badge>{item.status || (item.verified ? 'Approved' : 'Pending')}</Badge>
              </td>
              <td>
                <div className="flex flex-wrap gap-1.5">
                  <Button kind="plain" onClick={() => setSelectedWorker(item)}>
                    <Eye className="w-3.5 h-3.5" /> Details
                  </Button>
                  <Button disabled={busy} kind="success" onClick={() => void moderateWorker(item, 'Approved')}>
                    Approve
                  </Button>
                  <Button
                    disabled={busy}
                    kind="danger"
                    onClick={() =>
                      askConfirm({
                        title: 'Reject Worker Application',
                        message: `Reject worker application from ${item.name || 'this applicant'}?`,
                        confirmLabel: 'Reject',
                        danger: true,
                        onConfirm: () => moderateWorker(item, 'Rejected')
                      })
                    }
                  >
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Shell>
    );
  };

  const shopsPage = () => {
    const filtered = find(shops as Row[], ['name', 'ownerName', 'locality', 'category', 'status']).filter((s) => {
      if (shopFilter === 'All') return true;
      const st = String(s.status || (s.isVerified ? 'verified' : 'pending')).toLowerCase();
      if (shopFilter === 'Pending') return st === 'pending' || (!s.isVerified && !/rejected|suspended/i.test(st));
      if (shopFilter === 'Verified') return st === 'verified' || s.isVerified === true;
      return st === shopFilter.toLowerCase();
    });

    return (
      <Shell title="Shops Queue" description="Inspect merchant submissions, shop photos, and approve or suspend storefronts.">
        <div className="flex flex-wrap gap-2">
          {(['All', 'Pending', 'Verified', 'Rejected', 'Suspended'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setShopFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                shopFilter === st ? 'bg-[#007AFF] text-white' : 'bg-white border border-[#E8E4DA] text-[#55685F]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <DataTable
          headers={['Shop', 'Owner / Locality', 'Submitted', 'Status', 'Actions']}
          empty="No shop registrations match this filter."
        >
          {filtered.map((s) => (
            <tr key={s.id}>
              <td>
                <div className="flex items-center gap-2.5">
                  {s.photoUrl && (
                    <img src={s.photoUrl} alt={s.name} className="w-10 h-9 rounded-xl object-cover border border-[#E8E4DA]" />
                  )}
                  <div>
                    <b className="text-[#11241C]">{s.name}</b>
                    <div className="text-[10px] text-slate-500">{s.category}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{s.ownerName || '—'}</div>
                <div className="text-[10px] text-slate-500">{s.locality || '—'}</div>
              </td>
              <td>{dateText(s.createdAt)}</td>
              <td>
                <Badge>{s.status || (s.isVerified ? 'Verified' : 'Pending')}</Badge>
              </td>
              <td>
                <div className="flex flex-wrap gap-1.5">
                  <Button kind="plain" onClick={() => setSelectedShop(s)}>
                    <Eye className="w-3.5 h-3.5" /> Details
                  </Button>
                  <Button
                    disabled={busy}
                    kind="success"
                    onClick={() =>
                      void change(
                        'shops',
                        s.id,
                        { status: 'verified', isVerified: true, verifiedAt: serverTimestamp() },
                        `Shop "${s.name}" approved.`,
                        'Approve Shop'
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    disabled={busy}
                    kind="danger"
                    onClick={() =>
                      askConfirm({
                        title: 'Reject Shop Listing',
                        message: `Reject "${s.name}" from appearing as verified?`,
                        confirmLabel: 'Reject Shop',
                        danger: true,
                        onConfirm: () =>
                          change(
                            'shops',
                            s.id,
                            { status: 'rejected', isVerified: false, reviewedAt: serverTimestamp() },
                            `Shop "${s.name}" rejected.`,
                            'Reject Shop'
                          )
                      })
                    }
                  >
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Shell>
    );
  };

  const doctorsPage = () => {
    const filtered = find(doctors as Row[], ['name', 'specialty', 'qualifications', 'clinic', 'clinicName', 'address']).filter((d) => {
      if (doctorFilter === 'All') return true;
      const st = String(d.verificationStatus || d.status || (d.verified ? 'Verified' : 'Pending')).toLowerCase();
      return st === doctorFilter.toLowerCase();
    });

    return (
      <Shell
        title="Doctors Queue"
        description="Verify medical credentials, clinic details, and practitioner registrations."
        action={
          <Button onClick={() => choose('CMS')}>
            <Plus className="w-4 h-4" /> Add / Edit in CMS
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {(['All', 'Pending', 'Verified', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setDoctorFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                doctorFilter === st ? 'bg-[#007AFF] text-white' : 'bg-white border border-[#E8E4DA] text-[#55685F]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <DataTable
          headers={['Professional', 'Qualifications & Clinic', 'Registration', 'Status', 'Actions']}
          empty="No doctor registrations match this filter."
        >
          {filtered.map((d) => (
            <tr key={d.id}>
              <td>
                <b className="text-[#11241C]">{d.name}</b>
                <div className="text-[10px] text-slate-500">{d.specialty}</div>
              </td>
              <td>
                <div>{d.qualifications || d.description || 'Not provided'}</div>
                <div className="text-[10px] text-slate-500">{d.clinic || d.clinicName || d.medicalCentre || '—'}</div>
              </td>
              <td>{dateText(d.createdAt)}</td>
              <td>
                <Badge>{d.verificationStatus || d.status || (d.verified ? 'Verified' : 'Pending')}</Badge>
              </td>
              <td>
                <div className="flex flex-wrap gap-1.5">
                  <Button kind="plain" onClick={() => setSelectedDoctor(d)}>
                    <Eye className="w-3.5 h-3.5" /> Details
                  </Button>
                  <Button
                    disabled={busy}
                    kind="success"
                    onClick={() =>
                      void change(
                        'doctors',
                        d.id,
                        { verified: true, verificationStatus: 'Verified', reviewedAt: serverTimestamp() },
                        `Doctor "${d.name}" approved.`,
                        'Approve Doctor'
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    disabled={busy}
                    kind="danger"
                    onClick={() =>
                      askConfirm({
                        title: 'Reject Doctor Registration',
                        message: `Reject registration for ${d.name}?`,
                        confirmLabel: 'Reject',
                        danger: true,
                        onConfirm: () =>
                          change(
                            'doctors',
                            d.id,
                            { verified: false, verificationStatus: 'Rejected', reviewedAt: serverTimestamp() },
                            `Doctor "${d.name}" rejected.`,
                            'Reject Doctor'
                          )
                      })
                    }
                  >
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Shell>
    );
  };

  const reportsPage = () => {
    const categories = ['All', ...Array.from(new Set(civicReports.map((r: any) => String(r.category || 'Other'))))];
    const filtered = find(civicReports as Row[], ['category', 'location', 'description', 'status']).filter((r) => {
      if (reportStatusFilter !== 'All' && (r.status || 'Submitted') !== reportStatusFilter) return false;
      if (reportCategoryFilter !== 'All' && (r.category || 'Other') !== reportCategoryFilter) return false;
      return true;
    });

    return (
      <Shell title="Reports" description="Manage civic complaints, inspect attached evidence, and issue official responses.">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Submitted', 'In Review', 'In Progress', 'Resolved', 'Closed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setReportStatusFilter(st)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer ${
                  reportStatusFilter === st ? 'bg-[#007AFF] text-white' : 'bg-white border border-[#E8E4DA] text-[#55685F]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <select
            value={reportCategoryFilter}
            onChange={(e) => setReportCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#D2CEBE] bg-white px-3 py-1.5 text-xs font-bold text-[#11241C]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          headers={['Report', 'Location', 'Submitted', 'Status', 'Actions']}
          empty="No civic reports match this filter."
        >
          {filtered.map((r) => (
            <tr key={r.id}>
              <td>
                <b className="text-[#11241C]">{r.category}</b>
                <div className="max-w-72 truncate text-[10px] text-slate-500">{r.description}</div>
              </td>
              <td>{r.location || '—'}</td>
              <td>{dateText(r.reportedAt || r.createdAt)}</td>
              <td>
                <Badge>{r.status || 'Submitted'}</Badge>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Button
                    kind="plain"
                    onClick={() => {
                      setSelectedReport(r);
                      setReportStatusDraft(r.status || 'Submitted');
                      setReportResponseDraft(r.officialResponse || '');
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </Button>
                  <select
                    value={r.status || 'Submitted'}
                    onChange={(e) =>
                      void change(
                        'civic_reports',
                        r.id,
                        {
                          status: e.target.value,
                          assignedAdministrator: firebaseUser?.uid || 'municipal-admin',
                          ...(/resolved|closed/i.test(e.target.value) ? { resolvedAt: new Date().toISOString() } : {})
                        },
                        `Report status updated to ${e.target.value}.`,
                        'Update Civic Report Status'
                      )
                    }
                    className="rounded-lg border border-[#D2CEBE] bg-white p-1.5 text-xs font-bold"
                  >
                    <option>Submitted</option>
                    <option>In Review</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Shell>
    );
  };

  const alertsPage = () => {
    const filtered = find(localAlerts as Row[], ['title', 'category', 'area', 'severity', 'description']).filter((a) => {
      if (alertCategoryFilter !== 'All' && (a.category || '') !== alertCategoryFilter) return false;
      if (alertSeverityFilter !== 'All' && String(a.severity || 'medium').toLowerCase() !== alertSeverityFilter) return false;
      return true;
    });

    return (
      <Shell
        title="Alerts"
        description="Publish authorized emergency, safety, and government notices and manage alert history."
        action={
          <Button onClick={() => setAlertFormOpen(!alertFormOpen)}>
            <Plus className="w-4 h-4" /> {alertFormOpen ? 'Close Form' : 'Publish Alert'}
          </Button>
        }
      >
        {alertFormOpen && (
          <div className="grid gap-3 rounded-3xl border border-[#E8E4DA] bg-white p-5 sm:grid-cols-2 shadow-xs">
            <input
              className="field"
              value={newAlert.title}
              onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
              placeholder="Alert title *"
            />
            <input
              className="field"
              value={newAlert.area}
              onChange={(e) => setNewAlert({ ...newAlert, area: e.target.value })}
              placeholder="Affected area (e.g. Kadamtala, Ward 12) *"
            />
            <select
              className="field"
              value={newAlert.category}
              onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
            >
              <option>Community</option>
              <option>Emergency</option>
              <option>Flood</option>
              <option>Road Closure</option>
              <option>Electricity</option>
              <option>Waterlogging</option>
              <option>Government Notice</option>
            </select>
            <select
              className="field"
              value={newAlert.severity}
              onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <textarea
              className="field min-h-24 sm:col-span-2"
              value={newAlert.description}
              onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
              placeholder="Public notice details and safety instructions *"
            />
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button kind="plain" onClick={() => setAlertFormOpen(false)}>
                Cancel
              </Button>
              <Button disabled={busy} onClick={() => void publishAlert()}>
                Publish official alert
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={alertCategoryFilter}
            onChange={(e) => setAlertCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#D2CEBE] bg-white px-3 py-1.5 text-xs font-bold text-[#11241C]"
          >
            <option value="All">All Categories</option>
            <option value="Community">Community</option>
            <option value="Emergency">Emergency</option>
            <option value="Flood">Flood</option>
            <option value="Road Closure">Road Closure</option>
            <option value="Electricity">Electricity</option>
            <option value="Waterlogging">Waterlogging</option>
            <option value="Government Notice">Government Notice</option>
          </select>
          <select
            value={alertSeverityFilter}
            onChange={(e) => setAlertSeverityFilter(e.target.value)}
            className="rounded-xl border border-[#D2CEBE] bg-white px-3 py-1.5 text-xs font-bold text-[#11241C]"
          >
            <option value="All">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <DataTable
          headers={['Alert', 'Area', 'Severity', 'Delivery', 'Actions']}
          empty="No alerts match this filter."
        >
          {filtered.map((a) => (
            <tr key={a.id}>
              <td>
                <b className="text-[#11241C]">{a.title}</b>
                <div className="text-[10px] text-slate-500">
                  {a.category} {a.isOfficial ? '· Official' : ''}
                </div>
              </td>
              <td>{a.area}</td>
              <td>
                <Badge>{a.severity || 'medium'}</Badge>
              </td>
              <td>{a.deliveryStatus || 'Published'}</td>
              <td>
                <div className="flex gap-1.5">
                  <Button kind="plain" onClick={() => setSelectedAlert(a)}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                  <Button disabled={busy} kind="danger" onClick={() => remove('local_alerts', a.id, `alert "${a.title}"`)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Shell>
    );
  };

  const analyticsPage = () => (
    <Shell title="Analytics" description="Database-derived statistics and monthly trends; zero demonstration or mock metrics.">
      <AdminAnalyticsPanel
        users={users}
        shops={shops as Row[]}
        workers={workers as Row[]}
        verificationQueue={adminVerificationQueue as Row[]}
        doctors={doctors as Row[]}
        civicReports={civicReports as Row[]}
        localAlerts={localAlerts as Row[]}
        bloodDonors={bloodDonors as Row[]}
        rentals={rentals as Row[]}
        jobs={jobs as Row[]}
      />
    </Shell>
  );

  const settingsPage = () => (
    <Shell title="Settings" description="Admin preferences, application configuration, security info, and action audit logs.">
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-5 rounded-3xl border border-[#E8E4DA] bg-white p-6 shadow-xs">
          <h2 className="text-sm font-extrabold text-[#11241C] border-b border-[#F0ECE1] pb-2">
            Notification &amp; Moderation Preferences
          </h2>

          <label className="flex items-center justify-between gap-4 text-xs font-bold text-[#11241C] cursor-pointer">
            <span>Receive moderation notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-xs font-bold text-[#11241C] cursor-pointer">
            <span>Daily administrative digest</span>
            <input
              type="checkbox"
              checked={settings.digest}
              onChange={(e) => setSettings({ ...settings, digest: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-xs font-bold text-[#11241C] cursor-pointer">
            <span>Auto-sync approved place photos to thumbnails</span>
            <input
              type="checkbox"
              checked={settings.autoSyncApprovedPhotos}
              onChange={(e) => setSettings({ ...settings, autoSyncApprovedPhotos: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-xs font-bold text-[#11241C] cursor-pointer">
            <span>Priority emergency report alerts</span>
            <input
              type="checkbox"
              checked={settings.emergencyReportAlerts}
              onChange={(e) => setSettings({ ...settings, emergencyReportAlerts: e.target.checked })}
            />
          </label>

          <h2 className="text-sm font-extrabold text-[#11241C] border-b border-[#F0ECE1] pb-2 pt-2">
            Application Configuration
          </h2>
          <div>
            <label className="block text-[11px] font-bold text-[#55685F] mb-1">Public Notice Banner (optional)</label>
            <input
              type="text"
              className="field"
              value={settings.appNoticeBanner}
              onChange={(e) => setSettings({ ...settings, appNoticeBanner: e.target.value })}
              placeholder="e.g. Municipal Monsoon Helpline Active 24x7"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#55685F] mb-1">Municipal Helpline Number</label>
            <input
              type="text"
              className="field"
              value={settings.supportHelpline}
              onChange={(e) => setSettings({ ...settings, supportHelpline: e.target.value })}
            />
          </div>

          <Button disabled={busy} onClick={() => void saveSettings()}>
            Save preferences &amp; configuration
          </Button>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-[#E8E4DA] bg-white p-6 space-y-3 shadow-xs">
            <h2 className="text-sm font-extrabold text-[#11241C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#007AFF]" />
              <span>Security &amp; Authorization Status</span>
            </h2>
            <div className="text-xs space-y-2 text-[#55685F]">
              <div className="flex justify-between py-1 border-b border-[#F4F1EA]">
                <span>Active Admin Identity</span>
                <strong className="text-[#11241C]">{guard.currentEmail || 'Authorized Admin'}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F4F1EA]">
                <span>Firebase Custom Claim</span>
                <Badge>{hasAdminClaim ? 'Active Claim' : 'Verified Email Auth'}</Badge>
              </div>
              <div className="flex justify-between py-1">
                <span>Firestore Enforcement</span>
                <Badge>Active Rules</Badge>
              </div>
            </div>
            <p className="rounded-xl bg-blue-50 p-3.5 text-[11px] text-blue-900">
              Roles and permissions are enforced server-side by Firebase Authentication and Firestore Security Rules. Citizen accounts cannot elevate privileges.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E8E4DA] bg-white overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#F0ECE1] flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#11241C]">Recent Admin Audit Log</h2>
              <span className="text-[11px] text-slate-500">{auditLogs.length} entries</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-[#F4F1EA]">
              {auditLogs.length === 0 ? (
                <Empty>No administrative actions logged yet.</Empty>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="px-5 py-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <b className="text-[#11241C]">{log.action}</b>
                      <span className="text-[10px] text-slate-400">{dateTimeText(log.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{log.summary || `${log.section} · ${log.targetId || ''}`}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );

  const pages: Record<Section, () => React.ReactNode> = {
    Dashboard: dashboardPage,
    CMS: () => (
      <Shell title="Content Manager (CMS)" description="Create, edit, preview, and publish homepage, city info, notices, and directory collections.">
        <CMSManager />
      </Shell>
    ),
    'Place Photos': photosPage,
    'Place Thumbnails': thumbsPage,
    Users: usersPage,
    Workers: workersPage,
    Shops: shopsPage,
    Doctors: doctorsPage,
    Reports: reportsPage,
    Alerts: alertsPage,
    Analytics: analyticsPage,
    Settings: settingsPage
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#FAF8F5] relative">
      {/* Mobile Sidebar Backdrop (only mounted when open so it can never block clicks) */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between border-r border-[#E8E4DA] bg-white p-4 transition-transform duration-200 md:static md:h-full md:translate-x-0 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex items-center justify-between border-b border-[#F0ECE1] px-2 pb-4 shrink-0">
            <AdminBrandLogo collapsed={collapsed} />
            <button
              type="button"
              aria-label="Close sidebar"
              className="p-1 rounded-lg hover:bg-slate-100 md:hidden cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-3 space-y-1 overflow-y-auto flex-1 pr-1">
            {sections.map((item) => {
              const active = section === item.id;
              return (
                <button
                  type="button"
                  title={collapsed ? item.label : undefined}
                  key={item.id}
                  onClick={() => choose(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors cursor-pointer ${
                    active ? 'bg-[#007AFF] text-white shadow-xs' : 'text-[#55685F] hover:bg-[#FAF8F5]'
                  } ${collapsed ? 'md:justify-center' : ''}`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => navigate('home')}
          className="mt-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 px-3 py-2.5 text-xs font-bold text-emerald-800 cursor-pointer shrink-0"
        >
          {collapsed ? '←' : 'Return to citizen portal'}
        </button>
      </aside>

      {/* Main Scrollable Content Area */}
      <main className="min-w-0 flex-1 h-full overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-[#E8E4DA] bg-white px-4 py-3 sm:px-6 shrink-0">
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => (window.innerWidth < 768 ? setSidebarOpen(!sidebarOpen) : setCollapsed(!collapsed))}
            className="rounded-xl p-2 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5 text-[#11241C]" />
          </button>

          <div className="flex flex-1 items-center gap-2 rounded-full border border-[#D2CEBE] bg-[#FAF8F5] px-3 py-2">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${section}…`}
              className="w-full bg-transparent text-xs font-medium outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            title="Admin Notifications"
            onClick={() => navigate('admin-notifications')}
            className="rounded-xl p-2 hover:bg-slate-100 cursor-pointer text-[#11241C]"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Refresh data"
            onClick={async () => {
              await refreshData();
              setNotice('Live Firestore collections synced.');
            }}
            className="rounded-xl p-2 hover:bg-slate-100 cursor-pointer text-[#11241C]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Sign out"
            onClick={async () => {
              await guard.logoutAdmin();
              navigate('auth');
            }}
            className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="max-w-7xl w-full mx-auto space-y-6 p-4 sm:p-6 pb-16">
          {(notice || error) && (
            <div
              className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-semibold ${
                error ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span className="flex items-center gap-2">
                {error ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {error || notice}
              </span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setNotice('');
                }}
                className="p-1 hover:opacity-70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {pages[section]()}
        </div>
      </main>

      {/* --- IN-APP MODALS --- */}

      {/* 1. In-app Confirmation Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DA] space-y-4">
            <h3 className="text-base font-extrabold text-[#11241C]">{confirmState.title}</h3>
            <p className="text-xs text-[#55685F] leading-relaxed">{confirmState.message}</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const fn = confirmState.onConfirm;
                  setConfirmState(null);
                  await fn();
                }}
                className={`py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer ${
                  confirmState.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#007AFF] hover:bg-blue-700'
                }`}
              >
                {confirmState.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full-Size Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-5 py-3.5 border-b border-[#F0ECE1] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#11241C]">{previewImage.title}</h3>
                {previewImage.subtitle && <p className="text-[11px] text-slate-500">{previewImage.subtitle}</p>}
              </div>
              <button type="button" onClick={() => setPreviewImage(null)} className="p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="bg-slate-950 flex items-center justify-center max-h-[75vh]">
              <img src={previewImage.url} alt={previewImage.title} className="max-h-[75vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* 3. User Details Modal (Strictly Non-PII Email Safe) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E8E4DA] overflow-hidden">
            <header className="px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#11241C]">{selectedUser.name || 'User Profile'}</h3>
                <p className="text-[11px] text-slate-500 font-mono">UID: {selectedUser.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="p-1 rounded-full hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                <b>{selectedUser.phone || '—'}</b>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Role</span>
                <b className="capitalize">{selectedUser.role || 'citizen'}</b>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5] col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Location &amp; Locality</span>
                <b>{selectedUser.location || '—'}</b>
                {selectedUser.pincode && <span className="text-slate-500 ml-1">({selectedUser.pincode})</span>}
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Language / Blood Group</span>
                <b>{selectedUser.language || 'English'} · {selectedUser.bloodGroup || '—'}</b>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered</span>
                <b>{dateTimeText(selectedUser.createdAt)}</b>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5] col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Status</span>
                  <Badge>{selectedUser.status === 'suspended' ? 'Suspended' : 'Active'}</Badge>
                </div>
                <span className="text-[10px] text-slate-500">Email hidden for privacy</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Worker Details Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E8E4DA] overflow-hidden max-h-[90vh] overflow-y-auto">
            <header className="px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedWorker.avatarUrl && (
                  <img src={selectedWorker.avatarUrl} alt={selectedWorker.name} className="w-11 h-11 rounded-2xl object-cover" />
                )}
                <div>
                  <h3 className="text-base font-extrabold text-[#11241C]">{selectedWorker.name || 'Worker Details'}</h3>
                  <p className="text-xs text-[#007AFF] font-bold">{selectedWorker.profession || selectedWorker.category}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedWorker(null)} className="p-1 rounded-full hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Authorized Contact</span>
                  <b>{selectedWorker.phone || '—'}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Experience</span>
                  <b>{selectedWorker.experienceYears ? `${selectedWorker.experienceYears} years` : '—'}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5] col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Service Area</span>
                  <b>{selectedWorker.serviceArea || selectedWorker.locality || 'Jalpaiguri'}</b>
                </div>
              </div>
              {Array.isArray(selectedWorker.skills) && selectedWorker.skills.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWorker.skills.map((sk: string) => (
                      <span key={sk} className="rounded-full bg-blue-50 text-[#007AFF] px-2.5 py-1 text-[11px] font-bold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description &amp; Verification History</span>
                <p className="text-slate-700 leading-relaxed">{selectedWorker.description || 'No description provided.'}</p>
                <p className="text-[10px] text-slate-500 mt-2">
                  Submitted: {dateTimeText(selectedWorker.date || selectedWorker.createdAt)} · Last Reviewed: {dateTimeText(selectedWorker.reviewedAt)}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  kind="danger"
                  disabled={busy}
                  onClick={() => {
                    const row = selectedWorker;
                    setSelectedWorker(null);
                    void moderateWorker(row, 'Rejected');
                  }}
                >
                  Reject
                </Button>
                <Button
                  kind="success"
                  disabled={busy}
                  onClick={() => {
                    const row = selectedWorker;
                    setSelectedWorker(null);
                    void moderateWorker(row, 'Approved');
                  }}
                >
                  Approve Worker
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Shop Details Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#E8E4DA] overflow-hidden max-h-[90vh] overflow-y-auto">
            <header className="px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#11241C]">{selectedShop.name}</h3>
                <p className="text-xs text-slate-500">{selectedShop.category} · {selectedShop.locality}</p>
              </div>
              <button type="button" onClick={() => setSelectedShop(null)} className="p-1 rounded-full hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 space-y-4 text-xs">
              {(selectedShop.photoUrl || (Array.isArray(selectedShop.photos) && selectedShop.photos.length > 0)) && (
                <div className="flex gap-2 overflow-x-auto">
                  {(Array.isArray(selectedShop.photos) && selectedShop.photos.length > 0
                    ? selectedShop.photos
                    : [selectedShop.photoUrl]
                  ).map((url: string, idx: number) => (
                    <img key={idx} src={url} alt={`Shop ${idx + 1}`} className="w-28 h-24 rounded-2xl object-cover border border-[#E8E4DA] shrink-0" />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Owner</span>
                  <b>{selectedShop.ownerName || '—'}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
                  <b>{selectedShop.phone || selectedShop.whatsappNumber || '—'}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5] col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Address &amp; Pincode</span>
                  <b>{selectedShop.address || '—'} {selectedShop.pincode ? `(${selectedShop.pincode})` : ''}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5] col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Business Info</span>
                  <p className="mt-1 text-slate-700">{selectedShop.description || 'No description provided.'}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  kind="warning"
                  disabled={busy}
                  onClick={() => {
                    const id = selectedShop.id;
                    const nm = selectedShop.name;
                    setSelectedShop(null);
                    void change('shops', id, { status: 'suspended', isVerified: false }, `Shop "${nm}" suspended.`, 'Suspend Shop');
                  }}
                >
                  Suspend
                </Button>
                <Button
                  kind="danger"
                  disabled={busy}
                  onClick={() => {
                    const id = selectedShop.id;
                    const nm = selectedShop.name;
                    setSelectedShop(null);
                    void change('shops', id, { status: 'rejected', isVerified: false }, `Shop "${nm}" rejected.`, 'Reject Shop');
                  }}
                >
                  Reject
                </Button>
                <Button
                  kind="success"
                  disabled={busy}
                  onClick={() => {
                    const id = selectedShop.id;
                    const nm = selectedShop.name;
                    setSelectedShop(null);
                    void change('shops', id, { status: 'verified', isVerified: true, verifiedAt: serverTimestamp() }, `Shop "${nm}" approved.`, 'Approve Shop');
                  }}
                >
                  Approve Shop
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E8E4DA] overflow-hidden">
            <header className="px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#11241C]">{selectedDoctor.name}</h3>
                <p className="text-xs text-[#007AFF] font-bold">{selectedDoctor.specialty}</p>
              </div>
              <button type="button" onClick={() => setSelectedDoctor(null)} className="p-1 rounded-full hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinic / Hospital</span>
                  <b>{selectedDoctor.clinic || selectedDoctor.clinicName || selectedDoctor.medicalCentre || '—'}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                  <b>{selectedDoctor.phone || '—'}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Visiting Hours</span>
                  <b>{selectedDoctor.timing || selectedDoctor.visitingHours || '—'}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee</span>
                  <b>{selectedDoctor.fee || (selectedDoctor.fees ? `₹${selectedDoctor.fees}` : '—')}</b>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF8F5] col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Qualifications &amp; Address</span>
                  <b>{selectedDoctor.qualifications || selectedDoctor.description || 'Not provided'}</b>
                  <p className="text-slate-500 mt-1">{selectedDoctor.address || selectedDoctor.locality || 'Jalpaiguri'}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  kind="danger"
                  disabled={busy}
                  onClick={() => {
                    const d = selectedDoctor;
                    setSelectedDoctor(null);
                    void change('doctors', d.id, { verified: false, verificationStatus: 'Rejected' }, `Doctor "${d.name}" rejected.`, 'Reject Doctor');
                  }}
                >
                  Reject
                </Button>
                <Button
                  kind="success"
                  disabled={busy}
                  onClick={() => {
                    const d = selectedDoctor;
                    setSelectedDoctor(null);
                    void change('doctors', d.id, { verified: true, verificationStatus: 'Verified' }, `Doctor "${d.name}" approved.`, 'Approve Doctor');
                  }}
                >
                  Approve Doctor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Civic Report Inspection & Official Response Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#E8E4DA] overflow-hidden max-h-[90vh] overflow-y-auto">
            <header className="px-6 py-4 border-b border-[#F0ECE1] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#11241C]">{selectedReport.category} Report</h3>
                <p className="text-xs text-slate-500">{selectedReport.location} · {dateTimeText(selectedReport.reportedAt || selectedReport.createdAt)}</p>
              </div>
              <button type="button" onClick={() => setSelectedReport(null)} className="p-1 rounded-full hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 space-y-4 text-xs">
              {selectedReport.photoUrl && (
                <img src={selectedReport.photoUrl} alt="Civic report evidence" className="w-full max-h-56 object-cover rounded-2xl border border-[#E8E4DA]" />
              )}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Citizen Description</span>
                <p className="text-slate-800 leading-relaxed">{selectedReport.description}</p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Upvotes: {selectedReport.upvotes || 0} · Reporter ID: {selectedReport.userId?.slice(0, 10) || '—'}
                </div>
              </div>
              <div className="grid gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#55685F] mb-1">Report Status</label>
                  <select
                    value={reportStatusDraft}
                    onChange={(e) => setReportStatusDraft(e.target.value)}
                    className="field"
                  >
                    <option>Submitted</option>
                    <option>In Review</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#55685F] mb-1">Official Municipal Response</label>
                  <textarea
                    rows={3}
                    value={reportResponseDraft}
                    onChange={(e) => setReportResponseDraft(e.target.value)}
                    placeholder="Enter action taken or official response visible to citizens..."
                    className="field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button kind="plain" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                <Button disabled={busy} onClick={saveReportReview}>
                  Save Official Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Alert & Place Photo Details Modals */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E8E4DA] p-6 space-y-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-[#11241C]">{selectedAlert.title}</h3>
                <p className="text-slate-500">{selectedAlert.category} · {selectedAlert.area}</p>
              </div>
              <button type="button" onClick={() => setSelectedAlert(null)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <Badge>{selectedAlert.severity || 'medium'}</Badge>
              <Badge>{selectedAlert.deliveryStatus || 'Published'}</Badge>
            </div>
            <p className="p-3.5 rounded-2xl bg-[#FAF8F5] text-slate-700 leading-relaxed">{selectedAlert.description}</p>
            <div className="text-[11px] text-slate-500">
              Published: {dateTimeText(selectedAlert.createdAt)} · Confirmations: {selectedAlert.confirmedCount || 0}
            </div>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E8E4DA] overflow-hidden text-xs">
            <header className="px-5 py-3.5 border-b border-[#F0ECE1] flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#11241C]">{selectedPhoto.placeName}</h3>
              <button type="button" onClick={() => setSelectedPhoto(null)} className="p-1 rounded-full hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </header>
            {selectedPhoto.imageUrl && (
              <img src={selectedPhoto.imageUrl} alt={selectedPhoto.placeName} className="w-full h-56 object-cover" />
            )}
            <div className="p-5 space-y-2">
              <div>Category: <b>{selectedPhoto.category || '—'}</b></div>
              <div>Submitted By: <b>{selectedPhoto.uploadedBy || 'Citizen'}</b></div>
              <div>Date: <b>{dateTimeText(selectedPhoto.timestamp || selectedPhoto.createdAt)}</b></div>
              <div>Status: <Badge>{selectedPhoto.status || 'pending'}</Badge></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
