import axios from "axios";
import { AlertAiguaStatus, StatusType } from "../resources";
import { appState } from "~/state/appState";
import { PUSHSAFER_STATUS_FRESH_FOR } from "~/constants/constants";

/**
 * Gets the current status of the AlertAigua system, including the status of
 * AlertAigua, Pushsafer, and SAIH Ebro.
 *
 * @returns {Promise<AlertAiguaStatus>} A promise that resolves to the current status of the AlertAigua system.
 */
export async function getStatus(): Promise<AlertAiguaStatus> {
  let status: AlertAiguaStatus = {
    alertaigua: "error",
    pushsafer: {
      api: "error",
      iosApp: "error",
      androidApp: "error",
    },
    saihebro: "error",
  };

  status.alertaigua = getAAStatus();
  status.pushsafer = await getPushsaferStatus();
  status.saihebro = getSaihEbroStatus();

  return {
    alertaigua: status.alertaigua,
    pushsafer: {
      api: status.pushsafer.api,
      iosApp: status.pushsafer.iosApp,
      androidApp: status.pushsafer.androidApp,
    },
    saihebro: status.saihebro,
  };
}

function getAAStatus(): StatusType {
  // TODO: add "warning" StatusType
  if (
    appState &&
    appState.currentWaterData.flowRate &&
    appState.currentWaterData.waterLevel &&
    appState.currentWaterData.lastUpdated &&
    appState.currentWaterData.lastFetched &&
    appState.errorCount < 5 &&
    appState.currentWaterData.lastUpdated.getTime() >
      Date.now() - 45 * 60 * 1000 &&
    appState.currentWaterData.lastFetched.getTime() >
      Date.now() - 15 * 60 * 1000
  ) {
    return "ok";
  }

  return "error";
}

function getSaihEbroStatus(): StatusType {
  // Placeholder for SAIH Ebro status logic
  // This should be replaced with actual logic to check the SAIH Ebro API status
  return "ok";
}

// ------ Pushsafer Cached Status Check ------

// current cached object
let cachedPushsaferStatus: {
  value: AlertAiguaStatus["pushsafer"];
  fetchedAt: number;
} | null = null;

// promise for in-flight requests while fetching the status
let inFlight: Promise<AlertAiguaStatus["pushsafer"]> | null = null;

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

export async function getPushsaferStatus(): Promise<
  AlertAiguaStatus["pushsafer"]
> {
  const currentDate = Date.now();

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

      cachedPushsaferStatus = { value: result, fetchedAt: Date.now() };
      return result;
    } catch (err) {
      return { api: "error", iosApp: "error", androidApp: "error" } as const;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
