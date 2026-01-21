/**
 * Custom line colors for DINAMO transit network
 * Uses GTFS colors if available, otherwise falls back to custom colors
 */

// Official GTFS colors from the data
export const lineColorOverrides: Record<string, string> = {
  '1': '654897', // Mauve (official)
  '2': 'F07E31', // Orange (official)
  '3': 'E7343F', // Red (official)
  '4': '00995A', // Green (official)
  '5': 'F0B324', // Yellow (official)
  '6': 'F89BCF', // Pink (official)
  '7': 'AD8271', // Brown (official)
  '8': '7ED957', // Light Green (official)
  '9': '0CC0DF', // Cyan (official)
};

export function getLineColor(routeShortName: string, gtfsColor?: string): string {
  // If GTFS color is available, use it (prioritize GTFS data)
  if (gtfsColor && gtfsColor.length === 6 && gtfsColor !== '000000') {
    return gtfsColor;
  }
  
  // Otherwise use official color from overrides
  return lineColorOverrides[routeShortName] || '0CC0DF';
}
