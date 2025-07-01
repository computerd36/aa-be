import axios from "axios";
import { AlertAiguaStatus } from "../resources";
import { appState } from "~/state/appState";

export async function getStatus(): Promise<AlertAiguaStatus> {
  let status: AlertAiguaStatus;

  status.aa_status = getAAStatus();
  status.pushsafer_status = await getPushsaferStatus();
  status.saihebro_status = getSaihEbroStatus();

  return {
    aa_status: status.aa_status,
    pushsafer_status: status.pushsafer_status,
    saihebro_status: "ok",
  };
}

export function getAAStatus(): "ok" | "error" {
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

export async function getPushsaferStatus(): Promise<
  AlertAiguaStatus["pushsafer_status"]
> {
  try {
    const response = await axios.get(
      "https://pushsafer.statuspage.io/api/v2/summary.json",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const status = response.data.status.indicator;

    return {
      api: status === "none" ? "ok" : "error",
      iosApp: status === "none" ? "ok" : "error",
      androidApp: status === "none" ? "ok" : "error",
    };
  } catch (error) {
    console.error("Error fetching Pushsafer status:", error);
    return {
      api: "error",
      iosApp: "error",
      androidApp: "error",
    };
  }
}

export function getSaihEbroStatus(): "ok" | "error" {
  // Placeholder for SAIH Ebro status logic
  // This should be replaced with actual logic to check the SAIH Ebro API status
  return "ok";
}
