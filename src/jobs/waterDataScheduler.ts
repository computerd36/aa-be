import cron from "node-cron";
import { fetchWaterData } from "../services/waterDataService";
import { appState, SaihEbroSensorData } from "../state/appState";
import { parseLocalDateTime } from "~/utils/time";
import {
  ERROR_THRESHOLD,
  SENSORS,
  AGE_THRESHOLD,
  INITIAL_BACKOFF_MS,
  MAX_FETCH_RETRIES,
} from "~/constants/constants";
import {
  checkAllUserAlerts,
  processAlertResults,
  warnAllUsersServiceAvailable,
  warnAllUsersServiceUnavailable,
} from "~/services/alarmService";

/**
 * Updates the water data by fetching it from the SAIH Ebro API and processing it
 * according to the defined sensors. It handles retries on failure, checks for stale data,
 * and manages user alerts based on the fetched data.
 *
 * @returns {Promise<void>} A promise that resolves when the water data has been updated and alerts processed.
 * @throws {Error} If there is an error fetching the water data or processing alerts.
 */
async function updateWaterData(): Promise<void> {
  if (appState.isFetching) return;
  appState.isFetching = true;

  try {
    // maps sensor metrics to their IDs
    const metricMap = SENSORS.reduce<Record<"level" | "flowrate", string>>(
      (acc, { metric, id }) => {
        if (metric === "level" || metric === "flowrate") {
          acc[metric] = id;
        }
        return acc;
      },
      { level: "", flowrate: "" }
    );
    const senalParam = [metricMap.level, metricMap.flowrate].join(",");

    // fetching of the water data with retires if it fails
    let data: SaihEbroSensorData[] | null = null;
    let backoff = INITIAL_BACKOFF_MS;

    for (let attempt = 1; attempt <= MAX_FETCH_RETRIES; attempt++) {
      try {
        data = await fetchWaterData(senalParam);
        break;
      } catch (err) {
        console.error(`Fetch attempt ${attempt} failed:`, err);
        appState.errorCount++;

        if (attempt === MAX_FETCH_RETRIES) {
          console.error("Max fetch retries reached; aborting update.");
          return;
        }
        // wait before next attempt
        await new Promise((r) => setTimeout(r, backoff));
        backoff *= 2;
      }
    }

    const lvlData = data!.find((d) => d.senal === metricMap.level);
    const flwData = data!.find((d) => d.senal === metricMap.flowrate);

    // further validation to be type safe
    if (
      !lvlData ||
      !flwData ||
      !Number.isFinite(lvlData.valor) ||
      !Number.isFinite(flwData.valor)
    ) {
      console.error("Invalid sensor data:", { lvlData, flwData });
      appState.errorCount++;
      return;
    }

    // date validation and parsing
    const parsedDate = parseLocalDateTime(lvlData.fecha);
    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
      console.error("Invalid fecha timestamp:", lvlData.fecha);
      appState.errorCount++;
      return;
    }

    // updating app state, resettinh error count
    appState.currentWaterData = {
      waterLevel: lvlData.valor,
      flowRate: flwData.valor,
      lastFetched: new Date(),
      lastUpdated: parsedDate,
    };
    appState.errorCount = 0;

    // processing all user alerts
    const alerts = await checkAllUserAlerts(lvlData.valor, flwData.valor);
    // if alerts are found, process them
    if (alerts.length) {
      await processAlertResults(alerts);
    }
  } catch (err) {
    console.error("Unexpected error in updateWaterData:", err);
    appState.errorCount++;
  } finally {
    const currentWaterData = appState.currentWaterData;
    const staleCutoff = new Date(Date.now() - AGE_THRESHOLD); // date which is x houres ago (according to AGE_THRESHOLD)
    const isStale =
      !currentWaterData || currentWaterData.lastUpdated < staleCutoff; // check if no data or data is stale

    if (appState.errorCount >= ERROR_THRESHOLD || isStale) {
      if (!appState.isUnavailable) {
        await warnAllUsersServiceUnavailable();
        appState.isUnavailable = true;
      }
    } else {
      if (appState.isUnavailable) {
        await warnAllUsersServiceAvailable();
        appState.isUnavailable = false;
      }
    }

    appState.isFetching = false;

    // log for successful update
    console.log("Water data updated successfully:", {
      waterLevel: currentWaterData!.waterLevel,
      flowRate: currentWaterData!.flowRate,
      lastFetched: currentWaterData!.lastFetched,
      lastUpdated: currentWaterData!.lastUpdated,
      errorCount: appState.errorCount,
      isUnavailable: appState.isUnavailable,
    });
  }
}

// Run the update immediately on startup
updateWaterData();

// schedule the update on every full 5 minutes of the hour
cron.schedule("*/5 * * * *", updateWaterData);
