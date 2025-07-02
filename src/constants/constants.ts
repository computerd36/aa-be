// lanugage
export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "es", "ca"];

// alarm constants
export const DELTA_PERCENTAGE = 0.05; // 5% delta for escalation
export const CLEAR_TRESHHOlD_COUNT = 48; // 48 real new maesruements to clear the alarm (one measurement every 15 minutes = 12 hours)

// water sensors ( cuurrently max 2, first level and first flowrate will be used for the alarm system)
export const SENSORS = [
  {
    id: "A153C01NRIO1",
    name: "NIVEL ALGAS EN HORTA DE S.JUAN",
    description: "Water level in meters",
    unit: "m",
    metric: "level",
  },
  {
    id: "A153C65QRIO1",
    name: "CAUDAL EN HORTA DE S.JUAN",
    description: "Flow rate in cubic meters per second",
    unit: "m³/s",
    metric: "flowrate",
  },
];

// pushsafer constants
export const PUSHSAFER_STATUS_FRESH_FOR = 45_000; // 45 seconds in ms
