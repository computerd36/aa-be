import cron from "node-cron";
import { Mutex } from "async-mutex";
import { fetchWaterData } from "../services/waterDataService";
import { appState, SaihEbroSensorData } from "../state/appState";
import { parseSaihDateTime, now, nowTimestamp } from "~/utils/time";
import { logger } from "~/logger";
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

const fetchMutex = new Mutex();

type MetricMap = Record<"level" | "flowrate", string>;

function buildMetricMap(): MetricMap {
  return SENSORS.reduce<MetricMap>(
    (acc, { metric, id }) => {
      if (metric === "level" || metric === "flowrate") {
        acc[metric] = id;
      }
      return acc;
    },
    { level: "", flowrate: "" }
  );
}

async function fetchWithRetry(
  senalParam: string
): Promise<SaihEbroSensorData[] | null> {
  let backoff = INITIAL_BACKOFF_MS;

  for (let attempt = 1; attempt <= MAX_FETCH_RETRIES; attempt++) {
    try {
      return await fetchWaterData(senalParam);
    } catch (err) {
      logger.error({ err, attempt }, "Fetch attempt failed");

      if (attempt === MAX_FETCH_RETRIES) {
        logger.error("Max fetch retries reached; aborting update");
        return null;
      }

      await new Promise((r) => setTimeout(r, backoff));
      backoff *= 2;
    }
  }

  return null;
}

function validateSensorData(
  data: SaihEbroSensorData[],
  metricMap: MetricMap
): { lvlData: SaihEbroSensorData; flwData: SaihEbroSensorData } | null {
  const lvlData = data.find((d) => d.senal === metricMap.level);
  const flwData = data.find((d) => d.senal === metricMap.flowrate);

  if (
    !lvlData ||
    !flwData ||
    !Number.isFinite(lvlData.valor) ||
    !Number.isFinite(flwData.valor)
  ) {
    logger.error({ lvlData, flwData }, "Invalid sensor data");
    return null;
  }

  return { lvlData, flwData };
}

function parseTimestamp(fecha: string): Date | null {
  const parsedDate = parseSaihDateTime(fecha);

  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
    logger.error({ fecha }, "Invalid fecha timestamp");
    return null;
  }

  return parsedDate;
}

function isDataStale(): boolean {
  const { currentWaterData } = appState;
  if (!currentWaterData) return true;

  const staleCutoff = new Date(nowTimestamp() - AGE_THRESHOLD);
  return currentWaterData.lastUpdated < staleCutoff;
}

async function updateServiceAvailability(): Promise<void> {
  const shouldBeUnavailable =
    appState.errorCount >= ERROR_THRESHOLD || isDataStale();

  if (shouldBeUnavailable && !appState.isUnavailable) {
    try {
      await warnAllUsersServiceUnavailable();
    } catch (err) {
      logger.error({ err }, "Error while warning users of unavailability");
    }
    appState.isUnavailable = true;
  } else if (!shouldBeUnavailable && appState.isUnavailable) {
    try {
      await warnAllUsersServiceAvailable();
    } catch (err) {
      logger.error({ err }, "Error while warning users of availability");
    }
    appState.isUnavailable = false;
  }
}

async function updateWaterData(): Promise<void> {
  if (fetchMutex.isLocked()) {
    logger.info("Previous fetch still in progress, skipping");
    return;
  }

  await fetchMutex.runExclusive(async () => {
    let success = false;

    try {
      const metricMap = buildMetricMap();

      if (!metricMap.level || !metricMap.flowrate) {
        throw new Error("Required sensors are not defined in SENSORS constant");
      }

      const senalParam = [metricMap.level, metricMap.flowrate].join(",");
      const data = await fetchWithRetry(senalParam);

      if (!data) {
        appState.errorCount++;
        return;
      }

      const sensorData = validateSensorData(data, metricMap);
      if (!sensorData) {
        appState.errorCount++;
        return;
      }

      const parsedDate = parseTimestamp(sensorData.lvlData.fecha);
      if (!parsedDate) {
        appState.errorCount++;
        return;
      }

      appState.currentWaterData = {
        waterLevel: sensorData.lvlData.valor,
        flowRate: sensorData.flwData.valor,
        lastFetched: now(),
        lastUpdated: parsedDate,
      };
      appState.errorCount = 0;

      const alerts = await checkAllUserAlerts(
        sensorData.lvlData.valor,
        sensorData.flwData.valor
      );

      if (alerts.length) {
        await processAlertResults(alerts);
      }

      success = true;
    } catch (err) {
      logger.error({ err }, "Unexpected error in updateWaterData");
      appState.errorCount++;
    } finally {
      await updateServiceAvailability();

      if (success) {
        logger.info(
          {
            waterLevel: appState.currentWaterData?.waterLevel,
            flowRate: appState.currentWaterData?.flowRate,
            lastFetched: appState.currentWaterData?.lastFetched,
            lastUpdated: appState.currentWaterData?.lastUpdated,
            errorCount: appState.errorCount,
            isUnavailable: appState.isUnavailable,
          },
          "Water data updated successfully"
        );
      }
    }
  });
}

updateWaterData();

// every 5 minutes (every 0:05, 0:10, etc)
cron.schedule("*/5 * * * *", () => {
  updateWaterData().catch((err) => logger.error({ err }, "Cron job failed"));
});
