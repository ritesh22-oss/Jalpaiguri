export interface BusRoute {
  id: string;
  operator: string;
  transportType: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  operatingDays: string[];
  mainStops: string[];
  fare?: string;
  frequency?: string;
  notes?: string;
  verified: boolean;
  source: string;
  lastVerified: string;
}

export interface TrainService {
  id: string;
  trainNumber: string;
  trainName: string;
  trainType: string;
  stationName: string;
  stationCode: 'JPE' | 'JPG' | 'RQJ';
  origin: string;
  destination: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  operatingDays: string[];
  direction: 'Arriving' | 'Departing';
  routeStops: string[];
  verified: boolean;
  source: string;
  lastVerified: string;
}

export interface Corridor {
  id: string;
  origin: string;
  destination: string;
  transportTypes: string[];
  serviceWindow: string;
  frequency: string;
  journeyDuration: string;
  fare?: string;
  notes?: string;
}
