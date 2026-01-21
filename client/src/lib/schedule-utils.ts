import { GTFSData } from './gtfs-types';

export interface NextDeparture {
  routeId: string;
  routeShortName: string;
  routeLongName: string;
  routeColor: string | undefined;
  headsign: string;
  arrivalTime: string;
  departureTime: string;
  minutesUntil: number;
}

export function getNextDepartures(
  data: GTFSData,
  stopId: string,
  limitPerRoute: number = 2
): NextDeparture[] {
  const now = new Date();
  const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...

  // 0. Identify all stop IDs that share the same name
  const targetStop = data.stops.find(s => s.stop_id === stopId);
  if (!targetStop) return [];

  // Find all stops with the exact same name (case insensitive)
  const siblingStopIds = data.stops
    .filter(s => s.stop_name.toLowerCase() === targetStop.stop_name.toLowerCase())
    .map(s => s.stop_id);

  console.log(`Grouping stops for "${targetStop.stop_name}":`, siblingStopIds);

  // 1. Find active service IDs for today
  const activeServiceIds = new Set<string>();
  const todayStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  console.log(`Checking calendar for date: ${todayStr}, day: ${currentDay}`);
  data.calendar.forEach(cal => {
    if (todayStr >= cal.start_date && todayStr <= cal.end_date) {
      let isActive = false;
      // Convert to number for comparison
      const monday = Number(cal.monday);
      const tuesday = Number(cal.tuesday);
      const wednesday = Number(cal.wednesday);
      const thursday = Number(cal.thursday);
      const friday = Number(cal.friday);
      const saturday = Number(cal.saturday);
      const sunday = Number(cal.sunday);
      
      switch (currentDay) {
        case 1: isActive = monday === 1; break;
        case 2: isActive = tuesday === 1; break;
        case 3: isActive = wednesday === 1; break;
        case 4: isActive = thursday === 1; break;
        case 5: isActive = friday === 1; break;
        case 6: isActive = saturday === 1; break;
        case 0: isActive = sunday === 1; break;
      }
      if (isActive) activeServiceIds.add(cal.service_id);
    }
  });
  console.log(`Active service IDs: ${activeServiceIds.size}`, Array.from(activeServiceIds));

  // 2. Find all stop times for ALL sibling stops
  const relevantStopTimes = data.stopTimes.filter(st => siblingStopIds.includes(st.stop_id));
  console.log(`Found ${relevantStopTimes.length} stop times for stop group "${targetStop.stop_name}"`);

  // 3. Filter by active trips and future times
  const departures: NextDeparture[] = [];
  const seenDepartures = new Set<string>(); // For deduplication

  relevantStopTimes.forEach(st => {
    const trip = data.trips.find(t => t.trip_id === st.trip_id);
    if (!trip || !activeServiceIds.has(trip.service_id)) return;

    // Simple time comparison (HH:MM:SS or HH:MM)
    // Handle times > 24:00 (GTFS convention)
    let timeStr = st.departure_time;
    if (timeStr.length === 8) timeStr = timeStr.slice(0, 5); // HH:MM

    // Calculate minutes until
    const [h, m] = timeStr.split(':').map(Number);
    const [curH, curM] = currentTimeStr.split(':').map(Number);
    
    let minutesUntil = (h * 60 + m) - (curH * 60 + curM);
    
    // If time is tomorrow (e.g. 25:00), add 24h
    if (h >= 24) minutesUntil += 24 * 60;

    // Only future departures (or very recent ones, e.g. -2 min)
    if (minutesUntil >= -2) {
      const route = data.routes.find(r => r.route_id === trip.route_id);
      if (route) {
        // Improve headsign: if it says "Direction X", try to find the last stop name
        let headsign = trip.trip_headsign || 'Unknown';
        if (headsign.startsWith("Direction")) {
          // Find the last stop of this trip
          const tripStops = data.stopTimes
            .filter(t => t.trip_id === trip.trip_id)
            .sort((a, b) => (Number(b.stop_sequence) || 0) - (Number(a.stop_sequence) || 0)); // Reverse sort to get last first
          
          if (tripStops.length > 0) {
            const lastStopId = tripStops[0].stop_id;
            const lastStop = data.stops.find(s => s.stop_id === lastStopId);
            if (lastStop) {
              headsign = lastStop.stop_name;
            }
          }
        }

        // Fix for Line 1 "Mairie" terminus
        if (route.route_short_name === '1' && headsign === 'Mairie') {
          headsign = 'Mairie de Quévert';
        }

        // Create a unique key for deduplication: Route + Headsign + Time
        const uniqueKey = `${route.route_short_name}_${headsign}_${st.departure_time.slice(0, 5)}`;
        
        if (!seenDepartures.has(uniqueKey)) {
          seenDepartures.add(uniqueKey);
          departures.push({
            routeId: route.route_id,
            routeShortName: route.route_short_name,
            routeLongName: route.route_long_name,
            routeColor: route.route_color || '',
            headsign: headsign || 'Unknown',
            arrivalTime: st.arrival_time.slice(0, 5),
            departureTime: st.departure_time.slice(0, 5),
            minutesUntil
          });
        }
      }
    }
  });

  // 4. Sort by time
  departures.sort((a, b) => a.minutesUntil - b.minutesUntil);

  // 5. Group by route and direction (headsign), take top N
  const grouped = new Map<string, NextDeparture[]>();
  departures.forEach(dep => {
    const key = `${dep.routeShortName}_${dep.headsign}`;
    if (!grouped.has(key)) grouped.set(key, []);
    const group = grouped.get(key)!;
    if (group.length < limitPerRoute) group.push(dep);
  });

  // 6. Flatten and sort
  const result = Array.from(grouped.values()).flat();
  result.sort((a, b) => a.minutesUntil - b.minutesUntil);

  return result;
}

/**
 * Improve headsign by looking up the last stop name
 */
export function improveHeadsign(headsign: string | undefined, data: GTFSData, tripId: string): string {
  if (!headsign || !headsign.startsWith("Direction")) {
    return headsign || 'Unknown';
  }

  // Find the last stop of this trip
  const tripStops = data.stopTimes
    .filter(t => t.trip_id === tripId)
    .sort((a, b) => (Number(b.stop_sequence) || 0) - (Number(a.stop_sequence) || 0));
  
  if (tripStops.length > 0) {
    const lastStopId = tripStops[0].stop_id;
    const lastStop = data.stops.find(s => s.stop_id === lastStopId);
    if (lastStop) {
      return lastStop.stop_name;
    }
  }

  return headsign;
}
