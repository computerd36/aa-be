// src/jobs/waterDataCron.ts
import cron from "node-cron";
import { fetchWaterData } from "./fetchWaterDataJob";
import { appState, SaihEbroSensorData } from "../state/appState";
import { parseLocalDateTime } from "~/utils/time";

/**
 * Calls the `fetchWaterData` function to retrieve water data from the SAIH Ebro API
 */
async function updateWaterData() {
  try {
    console.log("Fetching water data...");
    const senales = "A153C01NRIO1,A153C65QRIO1";
    const waterData = await fetchWaterData(senales);

    // Assuming waterData is an array of measurements,
    // map them to water level and flow rate.
    const waterLevelData: SaihEbroSensorData = waterData.find(
      (d: SaihEbroSensorData) => d.senal === "A153C01NRIO1"
    );
    const flowRateData: SaihEbroSensorData = waterData.find(
      (d: SaihEbroSensorData) => d.senal === "A153C65QRIO1"
    );

    if (waterLevelData && flowRateData) {
      appState.currentWaterData = {
        waterLevel: waterLevelData.valor,
        flowRate: flowRateData.valor,
        lastUpdated: parseLocalDateTime(waterLevelData.fecha),
        lastFetched: new Date(),
      };
      console.log("Updated waterLevel:", appState.currentWaterData.waterLevel);
      console.log("Updated flowRate:", appState.currentWaterData.flowRate);
      console.log(
        "Updated lastUpdated:",
        appState.currentWaterData.lastUpdated
      );
      console.log(
        "Updated lastFetched:",
        appState.currentWaterData.lastFetched
      );
    } else {
      console.warn("Incomplete sensor data:", waterData);
    }
  } catch (error) {
    console.error("Error fetching water data:", error);
  }
}

// Run the update immediately on startup
updateWaterData();

// Then schedule the job to run every 5 minutes
cron.schedule("*/5 * * * *", updateWaterData);
