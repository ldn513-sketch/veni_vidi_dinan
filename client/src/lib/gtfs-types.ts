export interface Agency {
  agency_id: string;
  agency_name: string;
  agency_url?: string;
  agency_timezone?: string;
  agency_lang?: string;
}

export interface Route {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type?: number | string;
  route_color?: string;
  route_text_color?: string;
}

export interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  location_type?: number;
}

export interface Trip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id?: number | string;
  shape_id?: string;
}

export interface StopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number | string;
}

export interface Calendar {
  service_id: string;
  monday: number | string;
  tuesday: number | string;
  wednesday: number | string;
  thursday: number | string;
  friday: number | string;
  saturday: number | string;
  sunday: number | string;
  start_date: string;
  end_date: string;
}

export interface Shape {
  shape_id: string;
  shape_pt_lat: number | string;
  shape_pt_lon: number | string;
  shape_pt_sequence: number | string;
  shape_dist_traveled?: number | string;
}

export interface GTFSData {
  agency: Agency[];
  routes: Route[];
  stops: Stop[];
  trips: Trip[];
  stopTimes: StopTime[];
  calendar: Calendar[];
  shapes?: Shape[];
}
