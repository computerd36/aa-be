import saihebroClient from "../api/saihebroClient";

/**
 * Fetches water data from the SAIH Ebro API for a given sign identifier (senal).
 *
 * @param {string} senal - The signal identifier to fetch water data.
 * @return {Promise<SaihEbroSensorData>} A promise that resolves to the water data for the given signal.
 * @throws {Error} If there is an error fetching the water data.
 *
 */
export async function fetchWaterData(senal: string) {
  try {
    const response = await saihebroClient.get("", {
      params: {
        senal: senal,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching water data:", error);
    throw error;
  }
}
