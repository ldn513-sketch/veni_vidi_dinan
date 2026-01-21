import { Stop } from '@/lib/gtfs-types';
import { GTFSData } from '@/lib/gtfs-types';
import { useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface StopMarkerProps {
  stop: Stop;
  data: GTFSData;
  onStopClick: (stop: Stop) => void;
}

export default function StopMarker({ stop, data, onStopClick }: StopMarkerProps) {
  // Find all lines that serve this stop
  const lines = useMemo(() => {
    const lineSet = new Set<string>();
    
    data.stopTimes.forEach(st => {
      if (st.stop_id === stop.stop_id) {
        const trip = data.trips.find(t => t.trip_id === st.trip_id);
        if (trip) {
          const route = data.routes.find(r => r.route_id === trip.route_id);
          if (route) {
            lineSet.add(route.route_short_name);
          }
        }
      }
    });
    
    return Array.from(lineSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [stop, data]);

  // Get color for a line (official GTFS colors)
  const getLineColor = (lineNum: string): string => {
    const colorMap: Record<string, string> = {
      '1': '#654897', // Mauve (official)
      '2': '#F07E31', // Orange (official)
      '3': '#E7343F', // Red (official)
      '4': '#00995A', // Green (official)
      '5': '#F0B324', // Yellow (official)
      '6': '#F89BCF', // Pink (official)
      '7': '#AD8271', // Brown (official)
      '8': '#7ED957', // Light Green (official)
      '9': '#0CC0DF', // Cyan (official)
    };
    return colorMap[lineNum] || '#0CC0DF';
  };

  // Create custom HTML for the marker with line numbers
  const markerHtml = `
    <div style="
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 4px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      width: fit-content;
      max-width: 100px;
    ">
      ${lines.map(line => `
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
          color: white;
          background-color: ${getLineColor(line)};
        ">
          ${line}
        </div>
      `).join('')}
    </div>
  `;

  const customIcon = L.divIcon({
    html: markerHtml,
    className: 'custom-stop-marker',
    iconSize: [100, 30],
    iconAnchor: [50, 15],
    popupAnchor: [0, -15],
  });

  return (
    <CircleMarker
      center={[stop.stop_lat, stop.stop_lon]}
      radius={8}
      pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 0.8, weight: 2 }}
      eventHandlers={{
        click: () => onStopClick(stop),
      }}
    >
      <Popup>
        <div className="font-sans">
          <h3 className="font-bold text-sm mb-2">{stop.stop_name}</h3>
          <div className="flex flex-wrap gap-1">
            {lines.map(line => (
              <span
                key={line}
                className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white font-semibold"
                style={{ backgroundColor: getLineColor(line) }}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
