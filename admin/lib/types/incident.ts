// Incident Types matching API response structure
import { Station } from './station';

export interface IncidentLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  locationUrl: string;
  locationName: string;
}

export interface IncidentUser {
  _id: string;
  id: string;
  name: string;
  phone: string;
}

export interface IncidentStation {
  _id: string;
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  phone_number?: string | null;
}

export type IncidentType = 'fire' | 'medical' | 'rescue' | 'flood' | 'hazardous' | 'other';
export type IncidentStatus = 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type DamageLevel = 'none' | 'minimal' | 'moderate' | 'major' | 'severe';

export interface Incident {
  _id: string;
  id: string;
  incidentType: IncidentType;
  incidentName: string;
  location: IncidentLocation;
  station: IncidentStation | null;
  userId: IncidentUser;
  status: IncidentStatus;
  priority: IncidentPriority;
  description?: string;
  estimatedCasualties: number;
  estimatedDamage: DamageLevel;
  assignedPersonnel: string[];
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
  responseTimeMinutes: number | null;
  __v: number;
}

export interface IncidentResponse {
  success: boolean;
  data: Incident[];
  total: number;
}

