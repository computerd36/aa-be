import axios from "axios";
import https from "https";
import { env } from "../env";

// envs
const baseURL = env.SAIHEBRO_API_BASE_URL;
const apikey = env.SAIHEBRO_API_KEY;

if (!baseURL || !apikey) {
  throw new Error(
    "Missing required SAIHEBRO API configuration in environment variables."
  );
}

// this is not optimal - TODO: check with SAIH Ebro if they could fix their certificate chain
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const saihebroClient = axios.create({
  baseURL: baseURL,
  params: {
    apikey: apikey,
  },
  httpsAgent: httpsAgent,
});

saihebroClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error from SAIHEBRO API:", error);
    return Promise.reject(error);
  }
);

export default saihebroClient;
