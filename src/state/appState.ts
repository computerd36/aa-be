/**
 * Represents the 1:1 interface of the json real-time sensor measurement fetched from SAIH Ebro API with spanish identifiers.
 */
export interface SaihEbroSensorData {
  senal: string; // Sensor identifier (e.g., "A153C01NRIO1")
  fecha: string; // Timestamp of the measurement in "YYYY-MM-DD HH:MM:SS"
  valor: number; // Measured value (e.g., water level in meters or flow rate in m³/s)
  unidades: string; // Unit of measurement (e.g., "m" for water level, "m³/s" for flow rate)
  descripcion: string; // Description of the measurements sensor (e.g., "NIVEL ALGAS EN HORTA DE S.JUAN")
  tendencia: string; // Trend of the measurement (e.g., "derecha")
}

/*
 * Represents how we save the Waterdata for our usage, stripped and translated
 */
export interface WaterData {
  waterLevel: number; // Waterlevel in m
  flowRate: number; // Flowrate in m^3/s
  lastFetched: Date; // Date object that tells when the data was captured initially in the sensor
  lastUpdated: Date; // Date object that tells when the data was last updated from the API
}

interface AppState {
  currentWaterData: WaterData | null;
  errorCount: number;
  isUnavailable: boolean;
}

export const appState: AppState = {
  currentWaterData: null,
  errorCount: 0,
  isUnavailable: false,
};
