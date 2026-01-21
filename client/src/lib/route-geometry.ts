/**
 * Service to compute route geometries using GTFS shapes.txt
 * This provides accurate route tracing based on official data
 */

import { GTFSData, Shape, Trip } from './gtfs-types';

export interface RoutePoint {
  lat: number;
  lon: number;
}

/**
 * Get shape points for a specific trip
 */
export function getShapeForTrip(data: GTFSData, tripId: string): [number, number][] {
  const trip = data.trips.find(t => t.trip_id === tripId);
  if (!trip || !trip.shape_id || !data.shapes) return [];

  const shapePoints = data.shapes
    .filter(s => s.shape_id === trip.shape_id)
    .sort((a, b) => (Number(a.shape_pt_sequence) || 0) - (Number(b.shape_pt_sequence) || 0));

  return shapePoints.map(s => [Number(s.shape_pt_lat), Number(s.shape_pt_lon)]);
}

/**
 * Get all unique shapes for a route (one shape per direction)
 */
export function getShapesForRoute(data: GTFSData, routeId: string): Array<{ color: string; positions: [number, number][] }> {
  const routeTrips = data.trips.filter(t => t.route_id === routeId);
  const route = data.routes.find(r => r.route_id === routeId);
  
  if (!route || !data.shapes) return [];

  // Group trips by shape_id to avoid duplicates
  const shapeIds = new Set<string>();
  routeTrips.forEach(trip => {
    if (trip.shape_id) shapeIds.add(trip.shape_id);
  });

  const shapes: Array<{ color: string; positions: [number, number][] }> = [];

  shapeIds.forEach(shapeId => {
    const shapePoints = data.shapes!
      .filter(s => s.shape_id === shapeId)
      .sort((a, b) => (Number(a.shape_pt_sequence) || 0) - (Number(b.shape_pt_sequence) || 0));

    if (shapePoints.length > 0) {
      const positions: [number, number][] = shapePoints.map(s => [
        Number(s.shape_pt_lat),
        Number(s.shape_pt_lon)
      ]);

      shapes.push({
        color: `#${route.route_color || '000000'}`,
        positions
      });
    }
  });

  return shapes;
}

/**
 * Compute geometry for entire route using shapes
 */
export async function computeRouteShape(stops: RoutePoint[]): Promise<[number, number][]> {
  // This function is kept for compatibility but now just returns interpolated points
  // The real shapes are handled by getShapesForRoute
  if (stops.length < 2) return [];
  
  const allPoints: [number, number][] = [];
  
  for (let i = 0; i < stops.length; i++) {
    allPoints.push([stops[i].lat, stops[i].lon]);
  }
  
  return allPoints;
}
