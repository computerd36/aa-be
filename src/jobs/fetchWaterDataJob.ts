import saihebroClient from "../api/saihebroClient";

/*
 *
 *
 *
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
