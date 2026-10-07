/**
 * ==============================================================================
 * KONTROL UTAMA & PENGALIHAN PORTAL (ROUTING WEBSITE)
 * File: src/App.tsx
 * ==============================================================================
 * 
 * ARSITEKTUR PEMISAHAN WEBSITE:
 * 1. WEBSITE WARGA / USER BIASA (`src/citizen/CitizenPortal.tsx`):
 *    - Tampilan ramah publik untuk masyarakat umum Kota Palembang.
 *    - Peta kejadian langsung, pelaporan interaktif (Lapor Kejadian Wong Kito),
 *      agenda warta kota, sensor ISPU asap BMKG, dan hotline darurat 112.
 * 
 * 2. WEBSITE ADMIN & PETUGAS INSTANSI (`src/admin/AdminPortal.tsx`):
 *    - Dashboard Pusat Komando Siaga untuk verifikator & kurator instansi.
 *    - Antrean kurasi insiden (verifikasi / tolak hoaks / selesaikan kasus),
 *      pembuat rilis berita resmi dengan AI Gemini, pembaruan sensor ISPU,
 *      dan statistik metrik respon kota.
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  query,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  IncidentReport,
  CityNews,
  AirQualityStation,
  ReportComment,
  IncidentCategory,
  IncidentSeverity,
  AgencyType,
} from './types';
import {
  INITIAL_INCIDENTS,
  INITIAL_NEWS,
  INITIAL_AIR_QUALITY,
} from './data/seedData';
import { CitizenPortal } from './citizen/CitizenPortal';
import { AdminPortal } from './admin/AdminPortal';

export default function App() {
  // Mode Portal yang sedang dibuka: 'citizen' (Website Warga) atau 'admin' (Website Admin)
  const [currentPortal, setCurrentPortal] = useState<'citizen' | 'admin'>(() => {
    // Deteksi jika user membuka via hash atau query string "?portal=admin"
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'citizen';
  });

  // State Pengguna & Hak Akses Admin
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(false);

  // Basis data aplikasi yang disinkronkan dengan Firebase Firestore
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [newsList, setNewsList] = useState<CityNews[]>(INITIAL_NEWS);
  const [airQualityStations, setAirQualityStations] = useState<AirQualityStation[]>(INITIAL_AIR_QUALITY);
  const [comments, setComments] = useState<ReportComment[]>([]);

  // State untuk Website Warga
  const [citizenActiveTab, setCitizenActiveTab] = useState<'map' | 'news' | 'ispu' | 'hotlines'>('map');
  const [citizenCategory, setCitizenCategory] = useState<string>('all');
  const [showAqiLayer, setShowAqiLayer] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPickingLocation, setIsPickingLocation] = useState<boolean>(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Penentuan hak akses Admin (Email terdaftar: alexjun2306@gmail.com atau Mode Uji Petugas)
  const isAdmin = Boolean(
    isDemoAdmin ||
    currentUser?.email === 'alexjun2306@gmail.com'
  );

  // 1. Sinkronisasi Status Autentikasi Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sinkronisasi Data Laporan Insiden dari Firestore
  useEffect(() => {
    const path = 'incidents';
    try {
      const q = query(collection(db, path));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: IncidentReport[] = [];
            snapshot.forEach((docSnap) => {
              fetched.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            const existingIds = new Set(fetched.map((f) => f.id));
            const merged = [
              ...fetched,
              ...INITIAL_INCIDENTS.filter((item) => !existingIds.has(item.id)),
            ];
            setIncidents(merged);
          }
        },
        (error) => {
          console.warn('Firestore incidents listener note:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore init warning:', err);
    }
  }, []);

  // 3. Sinkronisasi Data Berita Resmi dari Firestore
  useEffect(() => {
    const path = 'news';
    try {
      const q = query(collection(db, path));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: CityNews[] = [];
            snapshot.forEach((docSnap) => {
              fetched.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            const existingIds = new Set(fetched.map((f) => f.id));
            const merged = [
              ...fetched,
              ...INITIAL_NEWS.filter((item) => !existingIds.has(item.id)),
            ];
            setNewsList(merged);
          }
        },
        (error) => {
          console.warn('Firestore news listener note:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore news init warning:', err);
    }
  }, []);

  // 4. Sinkronisasi Komentar Kesaksian Warga
  useEffect(() => {
    const path = 'comments';
    try {
      const q = query(collection(db, path));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: ReportComment[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          setComments(fetched);
        },
        (error) => {
          console.warn('Firestore comments listener note:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore comments init warning:', err);
    }
  }, []);

  // Handler Login Google
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google popup fallback:', err);
      // Fallback dev simulai login
      const simulatedUser = {
        uid: 'user_alexjun_admin',
        displayName: 'Alex Jun (Admin Palembang)',
        email: 'alexjun2306@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      } as unknown as User;
      setCurrentUser(simulatedUser);
      setIsDemoAdmin(true);
    }
  };

  // Handler Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
    setCurrentUser(null);
    setIsDemoAdmin(false);
  };

  // Upvote / Konfirmasi Kejadian oleh Warga
  const handleUpvote = async (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === incidentId ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
    try {
      const targetDoc = doc(db, 'incidents', incidentId);
      const inc = incidents.find((i) => i.id === incidentId);
      if (inc) {
        await updateDoc(targetDoc, { upvotes: inc.upvotes + 1 });
      }
    } catch (err) {
      // Fallback lokal
    }
  };

  // Tambah Komentar Saksi Mata
  const handleAddComment = async (reportId: string, commentText: string) => {
    const newComm: ReportComment = {
      id: `comm-${Date.now()}`,
      reportId,
      authorUid: currentUser?.uid || 'guest_citizen',
      authorName: currentUser?.displayName || 'Warga Palembang',
      comment: commentText,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [newComm, ...prev]);
    try {
      await addDoc(collection(db, 'comments'), newComm);
    } catch (err) {
      console.warn('Comment saved locally:', err);
    }
  };

  // Pengiriman Laporan Baru oleh Warga
  const handleSubmitReport = async (data: {
    title: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    agency: AgencyType;
    reporterName: string;
  }) => {
    const newReport: IncidentReport = {
      id: `rep-${Date.now()}`,
      title: data.title,
      category: data.category,
      severity: data.severity,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrl: data.imageUrl,
      reporterName: data.reporterName,
      reporterUid: currentUser?.uid || 'guest_reporter',
      reporterEmail: currentUser?.email || undefined,
      agency: data.agency,
      status: isAdmin ? 'verified' : 'pending',
      upvotes: 1,
      isOfficial: isAdmin,
      createdAt: new Date().toISOString(),
    };

    setIncidents((prev) => [newReport, ...prev]);
    setPickedLocation(null);
    setIsPickingLocation(false);

    try {
      await addDoc(collection(db, 'incidents'), newReport);
    } catch (err) {
      console.warn('Report saved in session:', err);
    }

    alert(
      isAdmin
        ? 'Laporan langsung terbit di peta karena dibuat oleh Petugas/Admin!'
        : 'Laporan Anda berhasil dikirim! Menunggu verifikasi kurasi dari admin/petugas instansi.'
    );
  };

  // Aksi Kurasi Admin: Verifikasi, Tolak, Selesai
  const handleUpdateStatus = async (
    id: string,
    status: 'verified' | 'rejected' | 'resolved',
    notes?: string
  ) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, curatorNotes: notes || item.curatorNotes } : item
      )
    );

    try {
      const docRef = doc(db, 'incidents', id);
      await updateDoc(docRef, { status, curatorNotes: notes || '' });
    } catch (err) {
      console.warn('Status update updated in session:', err);
    }
  };

  // Publikasi Berita / Agenda Resmi oleh Admin
  const handleCreateNews = async (newsData: {
    title: string;
    summary: string;
    content: string;
    category: 'event' | 'darurat' | 'lalulintas' | 'lingkungan' | 'himbauan';
    imageUrl?: string;
    locationName?: string;
    agency: string;
    pinOnMap: boolean;
  }) => {
    const newNewsItem: CityNews = {
      id: `news-${Date.now()}`,
      title: newsData.title,
      summary: newsData.summary,
      content: newsData.content,
      category: newsData.category,
      imageUrl: newsData.imageUrl,
      authorName: currentUser?.displayName || 'Admin Humas Palembang',
      authorUid: currentUser?.uid || 'admin_uid',
      locationName: newsData.locationName,
      agency: newsData.agency,
      createdAt: new Date().toISOString(),
    };

    setNewsList((prev) => [newNewsItem, ...prev]);

    if (newsData.pinOnMap) {
      const newPin: IncidentReport = {
        id: `inc-event-${Date.now()}`,
        title: newsData.title,
        category: newsData.category === 'event' ? 'event' : 'lainnya',
        severity: 'low',
        description: newsData.content,
        address: newsData.locationName || 'Kota Palembang',
        latitude: -2.9912,
        longitude: 104.7595,
        imageUrl: newsData.imageUrl,
        reporterName: newsData.agency,
        reporterUid: currentUser?.uid || 'admin',
        agency: 'UMUM',
        status: 'verified',
        upvotes: 5,
        isOfficial: true,
        curatorNotes: 'Event / rilis resmi instansi Pemkot Palembang.',
        createdAt: new Date().toISOString(),
      };
      setIncidents((prev) => [newPin, ...prev]);
    }

    try {
      await addDoc(collection(db, 'news'), newNewsItem);
    } catch (err) {
      console.warn('News saved locally:', err);
    }
  };

  // Update data Stasiun ISPU & Cuaca BMKG oleh Petugas
  const handleUpdateStationAqi = (
    stationId: string,
    newAqi: number,
    status: string,
    weather: string
  ) => {
    setAirQualityStations((prev) =>
      prev.map((st) =>
        st.id === stationId
          ? {
              ...st,
              aqi: newAqi,
              status: status as any,
              weather,
              updatedAt: 'Baru saja diupdate oleh Petugas',
            }
          : st
      )
    );
  };

  // PENGALIHAN PORTAL (ROUTING RENDER)
  if (currentPortal === 'admin') {
    return (
      <AdminPortal
        currentUser={currentUser}
        isAdmin={isAdmin}
        incidents={incidents}
        newsList={newsList}
        airQualityStations={airQualityStations}
        comments={comments}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onActivateDemoAdmin={() => setIsDemoAdmin(true)}
        onSwitchToCitizen={() => setCurrentPortal('citizen')}
        onUpdateStatus={handleUpdateStatus}
        onCreateNews={handleCreateNews}
        onUpdateStationAqi={handleUpdateStationAqi}
      />
    );
  }

  return (
    <CitizenPortal
      currentUser={currentUser}
      incidents={incidents}
      newsList={newsList}
      airQualityStations={airQualityStations}
      comments={comments}
      activeTab={citizenActiveTab}
      setActiveTab={setCitizenActiveTab}
      selectedCategory={citizenCategory}
      setSelectedCategory={setCitizenCategory}
      showAqiLayer={showAqiLayer}
      setShowAqiLayer={setShowAqiLayer}
      selectedIncident={selectedIncident}
      setSelectedIncident={setSelectedIncident}
      isReportModalOpen={isReportModalOpen}
      setIsReportModalOpen={setIsReportModalOpen}
      isPickingLocation={isPickingLocation}
      setIsPickingLocation={setIsPickingLocation}
      pickedLocation={pickedLocation}
      setPickedLocation={setPickedLocation}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onUpvote={handleUpvote}
      onAddComment={handleAddComment}
      onSubmitReport={handleSubmitReport}
      onSwitchToAdmin={() => setCurrentPortal('admin')}
    />
  );
}
