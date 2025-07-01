// no custom types yet, all interfaces stored in state/appState.ts

import { SUPPORTED_LANGUAGES } from "./constants/constants";

export type PushsaferNameObject = {
  name: string;
  language: (typeof SUPPORTED_LANGUAGES)[number];
  metric: "level" | "flowrate";
  value: number;
};

type StatusType = "ok" | "warning" | "error";

export type AlertAiguaStatus = {
  alertaigua: StatusType;
  pushsafer: {
    api: StatusType;
    iosApp: StatusType;
    androidApp: StatusType;
  };
  saihebro: StatusType;
};
