import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function analyzeIncidentReport(payload: {
  title: string;
  category: string;
  description: string;
  address: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    // Intelligent fallback heuristic if API key is not yet set
    return {
      urgency: payload.category === 'begal' || payload.category === 'kebakaran' ? 'DARURAT' : 'SEDANG',
      recommendedAgency: payload.category === 'begal' ? 'POLRESTABES' : payload.category === 'kebakaran' ? 'DAMKAR' : payload.category === 'banjir' ? 'SAR' : 'DISHUB',
      credibilityScore: 88,
      recommendedAction: `Verifikasi segera laporan di ${payload.address}. Koordinasikan dengan unit patroli terkait.`,
      alternativeRoute: 'Hindari jalur terdampak dan gunakan jalan protokol alternatif.',
      safetyTips: 'Masyarakat diimbau tetap waspada dan tidak berkerumun di titik kejadian.',
    };
  }

  try {
    // Low-latency response using gemini-3.1-flash-lite
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Kamu adalah sistem AI Kurasi Cepat dan Tanggap Darurat Kota Palembang ("Palembang Siaga").
Analisa laporan kejadian warga Kota Palembang berikut:
Judul: ${payload.title}
Kategori: ${payload.category}
Lokasi: ${payload.address}
Deskripsi: ${payload.description}

Berikan respons JSON murni tanpa markdown dengan schema:
{
  "urgency": "RENDAH" | "SEDANG" | "TINGGI" | "DARURAT",
  "recommendedAgency": "DAMKAR" | "POLRESTABES" | "BMKG" | "DISHUB" | "SAR" | "UMUM",
  "credibilityScore": number (0-100),
  "recommendedAction": string (tindakan kurator/petugas Palembang),
  "alternativeRoute": string (jalur alternatif bagi pengendara wong kito),
  "safetyTips": string (himbauan keselamatan untuk warga Palembang)
}`,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini analyze error:', err);
    return {
      urgency: 'SEDANG',
      recommendedAgency: 'POLRESTABES',
      credibilityScore: 75,
      recommendedAction: 'Menunggu konfirmasi saksi mata tambahan.',
      alternativeRoute: 'Patuhi rambu dan instruksi petugas di lapangan.',
      safetyTips: 'Hubungi Palembang Siaga 112 jika keadaan darurat bertambah buruk.',
    };
  }
}

export async function generateCityNews(payload: {
  title: string;
  category: string;
  notes: string;
  locationName: string;
  agency: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      title: payload.title,
      summary: `Rilis resmi seputar ${payload.title} di wilayah ${payload.locationName}.`,
      content: `Pemerintah Kota Palembang bersama instansi ${payload.agency} menyampaikan informasi resmi terkait kegiatan di kawasan ${payload.locationName}. Warga diharapkan memperhatikan rambu dan petunjuk di lokasi.\n\nCatatan penting: ${payload.notes}`,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Buatkan rilis berita atau artikel pengumuman resmi instansi untuk portal Peta Kota Palembang.
Judul / Topik: ${payload.title}
Kategori: ${payload.category}
Instansi: ${payload.agency}
Lokasi di Palembang: ${payload.locationName}
Poin-poin penting: ${payload.notes}

Gunakan gaya bahasa berita jurnalistik dan bahasa Indonesia yang baik, ramah bagi warga Palembang ("wong kito").
Keluarkan JSON murni tanpa markdown:
{
  "title": string,
  "summary": string (1-2 kalimat ringkas untuk kartu berita),
  "content": string (artikel 2-3 paragraf informatif)
}`,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Gemini news generate error:', err);
    return {
      title: payload.title,
      summary: `Pengumuman resmi terkait ${payload.title} di ${payload.locationName}.`,
      content: `Instansi ${payload.agency} mengimbau seluruh masyarakat Kota Palembang untuk menyimak informasi terbaru mengenai agenda ini di kawasan ${payload.locationName}.\n\n${payload.notes}`,
    };
  }
}
