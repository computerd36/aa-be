import axios from "axios";
import { AlertAiguaStatus, StatusType } from "../resources";
import { appState } from "~/state/appState";
import {
  AGE_THRESHOLD,
  ERROR_THRESHOLD,
  PUSHSAFER_STATUS_FRESH_FOR,
} from "~/constants/constants";
import { nowTimestamp } from "~/utils/time";

/**
 * Gets the current status of the AlertAigua system, including the status of
 * AlertAigua, Pushsafer, and SAIH Ebro.
 *
 * @returns {Promise<AlertAiguaStatus>} A promise that resolves to the current status of the AlertAigua system.
 */
export async function getStatus(): Promise<AlertAiguaStatus> {
  let status: AlertAiguaStatus = {
    saihebro_api: "ok",
    saihebro_station: "ok",
    pushsafer_api: "ok",
    pushsafer_iosApp: "ok",
    pushsafer_androidApp: "ok",
  };

  const pushsaferStatus = await getPushsaferStatus();

  status.saihebro_api = getSaihEbroAPIStatus();
  status.saihebro_station = getSaihEbroStationStatus();
  status.pushsafer_api = pushsaferStatus.api;
  status.pushsafer_iosApp = pushsaferStatus.iosApp;
  status.pushsafer_androidApp = pushsaferStatus.androidApp;

  return status;
}

function getSaihEbroAPIStatus(): StatusType {
  const isError = appState.errorCount > ERROR_THRESHOLD;

  if (isError) {
    return "error";
  } else {
    return "ok";
  }
}

function getSaihEbroStationStatus(): StatusType {
  const currentWaterData = appState.currentWaterData;
  const staleCutoff = new Date(nowTimestamp() - AGE_THRESHOLD); // date which is x hours ago (according to AGE_THRESHOLD)
  const isStale =
    !currentWaterData || currentWaterData.lastUpdated < staleCutoff;

  if (isStale) {
    return "error";
  } else {
    return "ok";
  }
}

// ------ Pushsafer Cached Status Check ------

// current cached object
let cachedPushsaferStatus: {
  value: {
    api: StatusType;
    iosApp: StatusType;
    androidApp: StatusType;
  };
  fetchedAt: number;
} | null = null;

// promise for in-flight requests while fetching the status
let inFlight: Promise<{
  api: StatusType;
  iosApp: StatusType;
  androidApp: StatusType;
}> | null = null;

// map function to convert Pushsafer status (Atlassian status state) to AlertAiguaStatus format
const mapAtlassianStatus = (status: string): StatusType => {
  switch (status) {
    case "operational":
      return "ok";
    case "degraded_performance":
    case "under_maintenance":
      return "warning";
    default:
      return "error";
  }
};

export async function getPushsaferStatus(): Promise<{
  api: StatusType;
  iosApp: StatusType;
  androidApp: StatusType;
}> {
  const currentDate = nowTimestamp();

  if (
    cachedPushsaferStatus &&
    currentDate - cachedPushsaferStatus.fetchedAt < PUSHSAFER_STATUS_FRESH_FOR
  ) {
    return cachedPushsaferStatus.value;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const { data } = await axios.get(
        "https://pushsafer.statuspage.io/api/v2/summary.json",
        { timeout: 5_000 }
      );

      const components = data.components as Array<{
        name: string;
        status: string;
      }>;

      const find = (regex: RegExp) =>
        mapAtlassianStatus(
          components.find((c) => regex.test(c.name))?.status ?? "major_outage"
        );

      const result = {
        api: find(/api/i),
        iosApp: find(/ios/i),
        androidApp: find(/android/i),
      } as const;

      cachedPushsaferStatus = { value: result, fetchedAt: nowTimestamp() };
      return result;
    } catch (err) {
      return { api: "error", iosApp: "error", androidApp: "error" } as const;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
