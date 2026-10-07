import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  MapPin,
  Camera,
  AlertTriangle,
  Sparkles,
  Navigation,
  Check,
  Send,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';
import { IncidentCategory, IncidentSeverity, AgencyType } from '../types';

interface ReportModalProps {
  currentUser: User | null;
  pickedLocation: { lat: number; lng: number } | null;
  onStartPickLocation: () => void;
  onSubmitReport: (data: {
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
  }) => Promise<void>;
  onClose: () => void;
  onLogin: () => void;
}

const PALEMBANG_SAMPLE_IMAGES = [
  { label: 'Begal / Razia Polisi', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kecelakaan Jalan', url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80' },
  { label: 'Macet Palembang', url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Banjir / Genangan', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kebakaran Rumah', url: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Event / Keramaian', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  currentUser,
  pickedLocation,
  onStartPickLocation,
  onSubmitReport,
  onClose,
  onLogin,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('kecelakaan');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [agency, setAgency] = useState<AgencyType>('POLRESTABES');
  const [reporterName, setReporterName] = useState(currentUser?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [aiPreview, setAiPreview] = useState<{
    urgency?: string;
    recommendedAgency?: string;
    safetyTips?: string;
  } | null>(null);
  const [checkingAi, setCheckingAi] = useState(false);

  // Active coordinates priority: GPS > picked on map > default Palembang center
  const lat = gpsLocation?.lat ?? pickedLocation?.lat ?? -2.990934;
  const lng = gpsLocation?.lng ?? pickedLocation?.lng ?? 104.756554;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setGpsLocation({ lat: userLat, lng: userLng });
        if (!address) {
          setAddress(`Lokasi GPS Saya (${userLat.toFixed(5)}, ${userLng.toFixed(5)})`);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        // If outside Palembang or permissions denied, prompt map picking
        alert('Tidak dapat mendeteksi GPS otomatis. Silakan gunakan tombol "Pilih Titik di Peta" untuk menentukan lokasi di Palembang.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCheckAi = async () => {
    if (!title || !description) {
      alert('Mohon isi judul dan deskripsi kejadian terlebih dahulu.');
      return;
    }
    setCheckingAi(true);
    try {
      const res = await fetch('/api/ai-curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          address: address || 'Kota Palembang',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiPreview(data);
        if (data.recommendedAgency) {
          setAgency(data.recommendedAgency as AgencyType);
        }
      }
    } catch (err) {
      console.warn('AI check error:', err);
    } finally {
      setCheckingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) {
      alert('Harap lengkapi judul, patokan alamat, dan deskripsi kejadian.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReport({
        title: title.trim(),
        category,
        severity,
        description: description.trim(),
        address: address.trim(),
        latitude: lat,
        longitude: lng,
        imageUrl: imageUrl.trim() || undefined,
        agency,
        reporterName: reporterName.trim() || (currentUser?.displayName || 'Warga Palembang'),
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Gagal mengirim laporan. Pastikan koneksi internet stabil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold border border-red-500/30">
              📢
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Lapor Kejadian Kota Palembang
              </h2>
              <p className="text-[11px] text-slate-400">
                Laporan Anda akan dikurasi dan disiagakan ke instansi berwenang
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth prompt if guest */}
        {!currentUser && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <span>Masuk dengan Google agar laporan Anda terverifikasi sebagai warga terpercaya.</span>
            <button
              type="button"
              onClick={onLogin}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition"
            >
              Masuk Sekarang
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Category selection */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              1. Pilih Kategori Kejadian / Event <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'begal', label: 'Begal / Kriminal', icon: '🚨' },
                { id: 'kecelakaan', label: 'Kecelakaan', icon: '💥' },
                { id: 'macet', label: 'Macet Parah', icon: '🚗' },
                { id: 'banjir', label: 'Banjir / Genangan', icon: '🌊' },
                { id: 'kebakaran', label: 'Kebakaran', icon: '🔥' },
                { id: 'demo', label: 'Demo / Aksi', icon: '📢' },
                { id: 'event', label: 'Event / Kegiatan', icon: '🎉' },
                { id: 'lainnya', label: 'Lainnya', icon: '📍' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as IncidentCategory)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                    category === c.id
                      ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              2. Judul Kejadian Singkat & Jelas <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Titik Begal Motor di Jembatan Musi IV / Genangan Air di Depan PTC"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
            />
          </div>

          {/* Location Pinning */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/70 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>3. Lokasi & Titik Kejadian</span> <span className="text-red-400">*</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg font-bold flex items-center gap-1 text-[11px] transition"
                >
                  <Navigation className="w-3 h-3 text-blue-400" />
                  <span>{isLocating ? 'Mencari GPS...' : 'Gunakan GPS Saya'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onStartPickLocation();
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 text-[11px] transition"
                >
                  <span>📍 Pilih di Peta</span>
                </button>
              </div>
            </div>

            <input
              type="text"
              required
              placeholder="Patokan: Jl. Kolonel Atmo dekat Pasar Cinde / Bawah Flyover Jakabaring"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span>
                Koordinat: <strong>{lat.toFixed(5)}, {lng.toFixed(5)}</strong>
              </span>
              <span className="text-emerald-400 font-semibold">
                {gpsLocation ? '✓ Lokasi Terkini GPS' : pickedLocation ? '✓ Dipilih pada Peta' : 'Default Pusat Kota'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              4. Kronologi & Keterangan Rinci <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan detail kejadian, waktu terjadinya, ciri pelaku, tingkat keparahan, atau dampak kemacetan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Photo URL or Presets */}
          <div>
            <label className="font-bold text-slate-300 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Foto / Dokumentasi Bukti (URL / Pilih Gambar)</span>
              </span>
            </label>

            <input
              type="url"
              placeholder="Tempel tautan foto (https://...) atau pilih dari sampel di bawah"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 mb-2"
            />

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] text-slate-400 whitespace-nowrap">Pilihan Foto Cepat:</span>
              {PALEMBANG_SAMPLE_IMAGES.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setImageUrl(img.url)}
                  className={`text-[10px] px-2 py-1 rounded-md border whitespace-nowrap transition ${
                    imageUrl === img.url
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Agency & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Instansi Terkait Penanganan:
              </label>
              <select
                value={agency}
                onChange={(e) => setAgency(e.target.value as AgencyType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="POLRESTABES">POLRESTABES (Kriminal / Begal / Lakalantas)</option>
                <option value="DAMKAR">DAMKAR Palembang (Kebakaran / Evakuasi)</option>
                <option value="DISHUB">DISHUB (Macet / Rekayasa Jalan)</option>
                <option value="SAR">BASARNAS / SAR (Banjir / Musibah Sungai Musi)</option>
                <option value="BMKG">BMKG (Cuaca Ekstrem / Asap Karhutla)</option>
                <option value="UMUM">PEMKOT & Instansi Umum</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Tingkat Urgensi / Keparahan:
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="low">Rendah (Info ringan / event)</option>
                <option value="medium">Sedang (Genangan air / macet)</option>
                <option value="high">Tinggi (Kecelakaan / macet total)</option>
                <option value="critical">Kritis / Darurat (Begal / Kebakaran besar)</option>
              </select>
            </div>
          </div>

          {/* AI Pre-check Assistant */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-[11px]">
                <strong className="text-amber-300 block">AI Triage Validator:</strong>
                <span className="text-slate-400">
                  Periksa rekomendasi darurat dan validitas laporan sebelum kirim.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckAi}
              disabled={checkingAi}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-xs whitespace-nowrap transition"
            >
              {checkingAi ? 'Menganalisis...' : 'Cek dengan AI'}
            </button>
          </div>

          {aiPreview && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Rekomendasi Urgensi AI:</span>
                <span className="font-bold text-amber-400">{aiPreview.urgency}</span>
              </div>
              {aiPreview.safetyTips && (
                <div className="text-slate-300">
                  <span className="text-slate-400">Tips Petugas: </span>
                  {aiPreview.safetyTips}
                </div>
              )}
            </div>
          )}

          {/* Reporter Name */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Nama Pelapor / Kontak:
            </label>
            <input
              type="text"
              placeholder="Nama Anda atau alias (e.g. Ridho - Warga Plaju)"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Laporan Warga'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
