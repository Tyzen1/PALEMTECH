import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { CityNews } from '../types';

interface NewsListModalProps {
  newsList: CityNews[];
  onSelectNewsOnMap: (news: CityNews) => void;
  onOpenAdminCreate?: () => void;
  isAdmin?: boolean;
}

export const NewsListModal: React.FC<NewsListModalProps> = ({
  newsList,
  onSelectNewsOnMap,
  onOpenAdminCreate,
  isAdmin,
}) => {
  const [selectedNews, setSelectedNews] = useState<CityNews | null>(newsList[0] || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = newsList.filter((n) => {
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Warta & Agenda Wong Kito
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Berita Resmi & Event Kota Palembang
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rilis resmi instansi Pemkot, Polrestabes, BMKG, Dishub, dan agenda festival budaya
          </p>
        </div>

        {isAdmin && onOpenAdminCreate && (
          <button
            onClick={onOpenAdminCreate}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Buat Berita / Event Baru</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: 'Semua Berita' },
          { id: 'event', label: '🎉 Event & Festival' },
          { id: 'himbauan', label: '🛡️ Himbauan Polrestabes' },
          { id: 'lingkungan', label: '💨 Cuaca & Asap BMKG' },
          { id: 'lalulintas', label: '🚗 Rekayasa Lalulintas' },
          { id: 'darurat', label: '🚨 Info Darurat' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
              filterCategory === c.id
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 2-Column News Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News List Column */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              Tidak ada berita untuk kategori ini.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex gap-3 text-left ${
                  selectedNews?.id === item.id
                    ? 'bg-slate-800/90 border-amber-500/80 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {item.imageUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-950 border border-slate-800">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {item.agency || 'Pemkot Palembang'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{item.summary}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected News Reader Column */}
        <div className="lg:col-span-7">
          {selectedNews ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 sticky top-24">
              {selectedNews.imageUrl && (
                <div className="rounded-xl overflow-hidden h-56 sm:h-64 w-full bg-slate-950 border border-slate-800">
                  <img
                    src={selectedNews.imageUrl}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedNews.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Rilis: <strong>{selectedNews.agency || 'Pemkot Palembang'}</strong>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white leading-snug mb-3">
                  {selectedNews.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1 text-amber-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedNews.locationName || 'Kota Palembang'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(selectedNews.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                  </div>
                  <div>
                    Penulis: <span className="text-slate-200">{selectedNews.authorName}</span>
                  </div>
                </div>
              </div>

              {/* Summary lead */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs italic text-amber-200/90 leading-relaxed">
                {selectedNews.summary}
              </div>

              {/* Full Content */}
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-3">
                {selectedNews.content}
              </div>

              {/* Action Jump to Map */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectNewsOnMap(selectedNews)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Lihat Lokasi di Peta Kota</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Pilih salah satu berita di sebelah kiri untuk membaca ulasan lengkap.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
