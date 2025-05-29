// src/jobs/waterDataCron.ts
import cron from "node-cron";
import { fetchWaterData } from "./fetchWaterDataJob";
import { appState, SaihEbroSensorData } from "../state/appState";

/**
 * Calls the
 *
 * @remarks
 * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
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
        timestamp: waterLevelData.fecha,
        lastUpdated: new Date(),
      };
      console.log("Updated appState:", appState.currentWaterData);
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
