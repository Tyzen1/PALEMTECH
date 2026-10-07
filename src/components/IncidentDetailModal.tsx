import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Flame,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  Share2,
  Navigation,
  Sparkles,
  Building2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { IncidentReport, ReportComment } from '../types';

interface IncidentDetailModalProps {
  incident: IncidentReport | null;
  currentUser: User | null;
  isAdmin: boolean;
  comments: ReportComment[];
  onClose: () => void;
  onUpvote: (id: string) => void;
  onAddComment: (reportId: string, comment: string) => void;
  onUpdateStatus?: (id: string, status: 'verified' | 'rejected' | 'resolved', notes?: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  currentUser,
  isAdmin,
  comments,
  onClose,
  onUpvote,
  onAddComment,
  onUpdateStatus,
}) => {
  const [newComment, setNewComment] = useState('');
  const [curatorNotesInput, setCuratorNotesInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{
    alternativeRoute?: string;
    safetyTips?: string;
    recommendedAction?: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!incident) return;
    setCuratorNotesInput(incident.curatorNotes || '');

    // Fetch AI triage & safety recommendations
    const fetchAiAdvice = async () => {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/ai-curate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: incident.title,
            category: incident.category,
            description: incident.description,
            address: incident.address,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiAdvice(data);
        }
      } catch (err) {
        console.warn('AI analysis skipped:', err);
      } finally {
        setLoadingAi(false);
      }
    };

    fetchAiAdvice();
  }, [incident]);

  if (!incident) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(incident.id, newComment.trim());
    setNewComment('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: incident.title,
        text: `Pantauan Kejadian Palembang Siaga: ${incident.title} di ${incident.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Laporan {incident.category}
            </span>
            {incident.status === 'verified' && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            )}
            {incident.status === 'resolved' && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-900/50 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Selesai Ditangani
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Bagikan kejadian"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Cover Photo / Incident Documentation */}
          {incident.imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-800 h-56 sm:h-72 w-full bg-slate-950">
              <img
                src={incident.imageUrl}
                alt={incident.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur text-[10px] text-slate-300 px-2 py-1 rounded-md border border-slate-800">
                📷 Dokumentasi Warga / Petugas
              </div>
            </div>
          )}

          {/* Title & Metadata */}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug mb-2">
              {incident.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 text-amber-400">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-semibold">{incident.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(incident.createdAt)}</span>
              </div>
              <div className="text-slate-400">
                Oleh: <strong className="text-slate-200">{incident.reporterName}</strong>
              </div>
            </div>
          </div>

          {/* Description & Citizen Narration */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Kronologi & Laporan Kejadian:
            </h4>
            <p className="text-slate-200 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {incident.description}
            </p>
          </div>

          {/* Agency Response Box (Damkar / Polrestabes / BMKG / SAR / Dishub) */}
          <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/40 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Instansi Terkait Penanganan:
                </span>
                <span className="font-bold text-white text-sm">
                  {incident.agency === 'POLRESTABES' && 'Kepolisian Polrestabes Palembang'}
                  {incident.agency === 'DAMKAR' && 'Dinas Pemadam Kebakaran & Penyelamatan Palembang'}
                  {incident.agency === 'BMKG' && 'Stasiun Meteorologi BMKG SMB II'}
                  {incident.agency === 'DISHUB' && 'Dinas Perhubungan & TMC Satlantas'}
                  {incident.agency === 'SAR' && 'Kantor Pencarian & Pertolongan (SAR) Palembang'}
                  {incident.agency === 'UMUM' && 'Pemkot Palembang & Pihak Terkait'}
                </span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${incident.latitude},${incident.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg flex items-center gap-1.5 transition ml-auto sm:ml-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Rute Google Maps</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          {/* AI Safety Advice / Gemini Intelligence Box */}
          <div className="bg-amber-950/30 border border-amber-600/30 p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Rekomendasi Pintar AI Palembang Siaga:</span>
            </div>
            {loadingAi ? (
              <div className="text-slate-400 italic">Menganalisis dampak lalulintas & keamanan...</div>
            ) : aiAdvice ? (
              <div className="space-y-1.5 text-slate-300">
                {aiAdvice.alternativeRoute && (
                  <div>
                    <strong className="text-amber-200">🚗 Rute Alternatif: </strong>
                    <span>{aiAdvice.alternativeRoute}</span>
                  </div>
                )}
                {aiAdvice.safetyTips && (
                  <div>
                    <strong className="text-amber-200">🛡️ Himbauan Keamanan: </strong>
                    <span>{aiAdvice.safetyTips}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">
                Hindari titik kejadian dan utamakan keselamatan saat melintas di koridor ini.
              </p>
            )}
          </div>

          {/* Curator / Admin Notes */}
          {incident.curatorNotes && (
            <div className="bg-blue-950/30 border border-blue-500/30 p-3 rounded-xl text-xs text-blue-200">
              <strong className="block text-blue-400 font-bold mb-1">
                📌 Catatan Petugas / Kurator:
              </strong>
              {incident.curatorNotes}
            </div>
          )}

          {/* Citizen Confirmation Upvote Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => onUpvote(incident.id)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl font-bold text-xs border border-amber-500/40 transition active:scale-95"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Konfirmasi Benar Terjadi ({incident.upvotes})</span>
            </button>

            <span className="text-xs text-slate-400">
              {incident.upvotes} warga telah mengonfirmasi laporan ini
            </span>
          </div>

          {/* Admin Moderation Actions */}
          {isAdmin && onUpdateStatus && (
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Panel Kurasi Admin (Instansi / Moderator):</span>
              </div>
              <input
                type="text"
                placeholder="Tambahkan catatan petugas/tindak lanjut..."
                value={curatorNotesInput}
                onChange={(e) => setCuratorNotesInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => onUpdateStatus(incident.id, 'verified', curatorNotesInput)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verifikasi & Tampilkan</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(incident.id, 'resolved', curatorNotesInput)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Tandai Selesai / Ditangani</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(incident.id, 'rejected', curatorNotesInput)}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow transition ml-auto"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tolak (Hoaks/Spam)</span>
                </button>
              </div>
            </div>
          )}

          {/* Citizen Comments & Witness Eye Reports */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Kesaksian Warga & Komentar ({comments.length})</span>
            </h3>

            {/* Comments List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Belum ada kesaksian warga tambahan. Jadilah yang pertama memberikan update terkini.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <strong className="text-amber-300">{c.authorName}</strong>
                      <span className="text-[10px]">{formatTime(c.createdAt)}</span>
                    </div>
                    <p className="text-slate-200">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Beri kesaksian atau info tambahan lokasi..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                >
                  Kirim
                </button>
              </form>
            ) : (
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 text-xs text-center text-slate-400">
                Silakan masuk dengan akun Google untuk menambahkan kesaksian atau info saksi mata.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
