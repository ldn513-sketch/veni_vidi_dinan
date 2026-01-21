import { Stop } from "@/lib/gtfs-types";
import { getNextDepartures, NextDeparture } from "@/lib/schedule-utils";
import { Loader2, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useGTFS } from "@/contexts/GTFSContext";
import { getLineColor } from "@/lib/line-colors";
import TransitMap from "@/components/TransitMap";

// Helper function to get display color (official GTFS colors)
function getDisplayLineColor(routeShortName: string): string {
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
  return colorMap[routeShortName] || '#0CC0DF';
}


export default function Home() {
  const { data, isLoading, error } = useGTFS();
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [departures, setDepartures] = useState<NextDeparture[]>([]);

  useEffect(() => {
    if (data && selectedStop) {
      const deps = getNextDepartures(data, selectedStop.stop_id);
      setDepartures(deps);
      
      // Refresh every minute
      const interval = setInterval(() => {
        setDepartures(getNextDepartures(data, selectedStop.stop_id));
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [data, selectedStop]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Chargement du réseau DINAMO...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="max-w-md p-6 bg-destructive/10 rounded-lg text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <TransitMap onStopClick={setSelectedStop} />
      </div>

      {/* Floating UI Layer */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="bg-background/80 backdrop-blur-md border border-border/50 shadow-lg rounded-2xl p-4 max-w-md mx-auto pointer-events-auto">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="text-2xl">🚌</span> Veni Vidi Dinan
          </h1>
        </div>
      </div>

      {/* Stop Details Drawer (Placeholder) */}
      {selectedStop && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pointer-events-none flex justify-center">
          <div className="bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-6 w-full max-w-lg pointer-events-auto animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedStop.stop_name}</h2>
                <p className="text-muted-foreground text-sm">Arrêt #{selectedStop.stop_id}</p>
              </div>
              <button 
                onClick={() => setSelectedStop(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {departures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Aucun passage prévu prochainement.</p>
                </div>
              ) : (
                departures.map((dep, idx) => {
                  // Import getLineColor to get the correct color
                  const displayColor = dep.routeColor && dep.routeColor !== '00A99E' ? `#${dep.routeColor}` : getDisplayLineColor(dep.routeShortName);
                  
                  return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card/50 rounded-xl border border-border/50 hover:bg-card/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
                        style={{ backgroundColor: displayColor }}
                      >
                        {dep.routeShortName}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight">{dep.headsign}</p>
                        <p className="text-xs text-muted-foreground">{dep.routeLongName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">
                        {dep.minutesUntil <= 0 ? 'Maintenant' : `${dep.minutesUntil} min`}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {dep.departureTime}
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
