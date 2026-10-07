export type IncidentCategory =
  | 'begal'
  | 'kecelakaan'
  | 'macet'
  | 'banjir'
  | 'demo'
  | 'kebakaran'
  | 'event'
  | 'lainnya';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'pending' | 'verified' | 'rejected' | 'resolved';

export type AgencyType = 'DAMKAR' | 'POLRESTABES' | 'BMKG' | 'DISHUB' | 'SAR' | 'UMUM';

export interface IncidentReport {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  reporterName: string;
  reporterUid: string;
  reporterEmail?: string;
  agency: AgencyType;
  status: IncidentStatus;
  upvotes: number;
  isOfficial?: boolean;
  curatorNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CityNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'event' | 'darurat' | 'lalulintas' | 'lingkungan' | 'himbauan';
  imageUrl?: string;
  authorName: string;
  authorUid: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  agency?: string;
  createdAt: string;
}

export interface AirQualityStation {
  id: string;
  stationName: string;
  district: string;
  aqi: number;
  pm25: number;
  status: 'BAIK' | 'SEDANG' | 'TIDAK_SEHAT' | 'SANGAT_TIDAK_SEHAT' | 'BERBAHAYA';
  temperature: number;
  weather: string;
  humidity: number;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorUid: string;
  authorName: string;
  comment: string;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  shortNumber: string;
  phone: string;
  description: string;
  agency: AgencyType;
  icon: string;
}
