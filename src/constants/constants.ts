// lanugage
export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "es", "ca"];

// alarm constants
export const DELTA_PERCENTAGE = 0.05; // 5% delta for escalation
export const CLEAR_TRESHHOlD_COUNT = 48; // 48 real new maesruements to clear the alarm (one measurement every 15 minutes = 12 hours)
export const ERROR_THRESHOLD = 10; // number of errors before we start warning users
export const AGE_THRESHOLD = 3_600_000; // 1 hour in ms, used to check if the data is fresh enough, if not we warn users
// calculate INITIAL_BACKOFF_MS * 2 ^ 5 to get the maximum backoff time, stay within 1 minute
export const INITIAL_BACKOFF_MS = 1_000; // initial backoff time in ms for retries (will be doubled on each retry)
export const MAX_FETCH_RETRIES = 5; // maximum number of retries to fetch data from the API

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
