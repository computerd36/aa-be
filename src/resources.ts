// no custom types yet, all interfaces stored in state/appState.ts

import { SUPPORTED_LANGUAGES } from "./constants/constants";

export type PushsaferNameObject = {
  name: string;
  language: (typeof SUPPORTED_LANGUAGES)[number];
  metric: "level" | "flowrate";
  value: number;
};

export type StatusType = "ok" | "warning" | "error";

export interface AlertAiguaStatus {
  pushsafer_api: StatusType;
  pushsafer_iosApp: StatusType;
  pushsafer_androidApp: StatusType;
  saihebro_api: StatusType;
  saihebro_station: StatusType;
}
