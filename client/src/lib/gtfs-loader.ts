import Papa from 'papaparse';
import { Agency, Calendar, GTFSData, Route, Stop, StopTime, Trip, Shape } from './gtfs-types';

export class GTFSLoader {
  private static instance: GTFSLoader;
  private data: GTFSData | null = null;
  private loadingPromise: Promise<GTFSData> | null = null;

  private constructor() {}

  public static getInstance(): GTFSLoader {
    if (!GTFSLoader.instance) {
      GTFSLoader.instance = new GTFSLoader();
    }
    return GTFSLoader.instance;
  }

  public async loadData(): Promise<GTFSData> {
    if (this.data) return this.data;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.fetchAndParse();
    return this.loadingPromise;
  }

  private async fetchAndParse(): Promise<GTFSData> {
    try {
      const [agency, routes, stops, trips, stopTimes, calendar, shapes] = await Promise.all([
        this.parseFile<Agency>('/gtfs/agency.txt'),
        this.parseFile<Route>('/gtfs/routes.txt'),
        this.parseFile<Stop>('/gtfs/stops.txt'),
        this.parseFile<Trip>('/gtfs/trips.txt'),
        this.parseFile<StopTime>('/gtfs/stop_times.txt'),
        this.parseFile<Calendar>('/gtfs/calendar.txt'),
        this.parseFile<Shape>('/gtfs/shapes.txt'),
      ]);

      this.data = { agency, routes, stops, trips, stopTimes, calendar, shapes };
      return this.data;
    } catch (error) {
      console.error('Error loading GTFS data:', error);
      throw error;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async parseFile<T>(filepath: string): Promise<T[]> {
    try {
      const response = await fetch(filepath);
      if (!response.ok) {
        console.error(`Failed to fetch ${filepath}:`, response.statusText);
        return [];
      }

      const text = await response.text();
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: false, // Keep as strings to avoid parsing issues
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as T[]),
          error: (error: Error) => reject(error),
        });
      });
    } catch (error) {
      console.error(`Error parsing ${filepath}:`, error);
      return [];
    }
  }
}
