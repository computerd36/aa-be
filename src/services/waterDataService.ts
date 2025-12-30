import { SaihEbroSensorData } from "~/state/appState";
import saihebroClient from "../api/saihebroClient";

/**
 * Fetches water data from the SAIH Ebro API for a given sign identifier (senal).
 *
 * @param {string} senal - The signal identifier to fetch water data.
 * @return {Promise<SaihEbroSensorData>} A promise that resolves to the water data for the given signal.
 * @throws {Error} If there is an error fetching the water data.
 *
 */
export async function fetchWaterData(
  senal: string
): Promise<SaihEbroSensorData[]> {
  const response = await saihebroClient.get<SaihEbroSensorData[]>("", {
    params: { senal },
  });

  const data = response.data;
  if (!Array.isArray(data)) {
    throw new TypeError("Unexpected API response: not an array");
  }

  for (const item of data) {
    if (
      typeof item.senal !== "string" ||
      typeof item.fecha !== "string" ||
      typeof item.valor !== "number"
    ) {
      throw new TypeError(`Malformed sensor data: ${JSON.stringify(item)}`);
    }
  }

  return data;
}
