export interface MessageTemplates {
  welcome: {
    title: string;
    body: (
      name: string,
      deviceId: number,
      language: string,
      value: string,
      metric: "level" | "flowrate"
    ) => string;
  };
  serviceUnavailable: {
    title: string;
    body: string;
  };
  serviceAvailable: {
    title: string;
    body: string;
  };
  initialAlarm: {
    title: string;
    body: (alertType: "flowrate" | "level", currentValue: number) => string;
  };
  escalationAlarm: {
    title: string;
    body: (alertType: "flowrate" | "level", currentValue: number) => string;
  };
  normal: {
    title: string;
    body: (alertType: "flowrate" | "level", currentValue: number) => string;
  };
}

const messages: Record<string, MessageTemplates> = {
  en: {
    welcome: {
      title: "Welcome to AlertAigua!",
      body: (name, deviceId, language, value, metric) =>
        `Hello ${name}, your device has been successfully registered with AlertAigua and you will be notified if the ${metric} exceeds ${value} ${
          metric === "level" ? "m" : "m³/s"
        }. Your device ID is ${deviceId}, and your preferred language is set to ${language}.`,
    },
    serviceUnavailable: {
      title: "Service Temporarily Unavailable",
      body: "AlertAigua service is currently experiencing issues with data collection. Please be aware that monitoring may be interrupted.",
    },
    serviceAvailable: {
      title: "Service Restored",
      body: "AlertAigua service has been restored and is now monitoring your water system normally.",
    },
    initialAlarm: {
      title: "FLOOD WARNING! - IMMEDIATE ACTION REQUIRED",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `Critical water flow rate detected! Current flow rate: ${currentValue}. Please check your water system immediately.`
          : `Critical water level detected! Current level: ${currentValue}. Please check your water system immediately.`,
    },
    escalationAlarm: {
      title: "FLOOD WARNING! - IMMEDIATE ACTION REQUIRED",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `Critical water flow rate detected! Current flow rate: ${currentValue}. Please check your water system immediately.`
          : `Critical water level detected! Current level: ${currentValue}. Please check your water system immediately.`,
    },
    normal: {
      title: "FLOOD WARNING CLEARED",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `Water flow rate is back to normal. Current flow rate: ${currentValue}.`
          : `Water level is back to normal. Current level: ${currentValue}.`,
    },
  },
  es: {
    welcome: {
      title: "¡Bienvenido a AlertAigua!",
      body: (name, deviceId, language, value, metric) =>
        `Hola ${name}, su dispositivo se ha registrado correctamente en AlertAigua y se le notificará si la ${metric} supera ${value} ${
          metric === "level" ? "m" : "m³/s"
        }. El ID de tu dispositivo es ${deviceId} y tu idioma preferido es ${language}.`,
    },
    serviceUnavailable: {
      title: "Servicio temporalmente no disponible",
      body: "El servicio AlertAigua está experimentando problemas con la recopilación de datos. Ten en cuenta que el monitoreo puede estar interrumpido.",
    },
    serviceAvailable: {
      title: "Servicio restaurado",
      body: "El servicio AlertAigua ha sido restaurado y ahora está monitoreando tu sistema de agua normalmente.",
    },
    initialAlarm: {
      title: "¡ALERTA DE INUNDACIÓN! - SE REQUIERE ACCIÓN INMEDIATA",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `¡Se ha detectado un flujo de agua crítico! Flujo actual: ${currentValue}. Por favor, verifica tu sistema de agua inmediatamente.`
          : `¡Se ha detectado un nivel de agua crítico! Nivel actual: ${currentValue}. Por favor, verifica tu sistema de agua inmediatamente.`,
    },
    escalationAlarm: {
      title: "¡ALERTA DE INUNDACIÓN! - SE REQUIERE ACCIÓN INMEDIATA",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `¡Se ha detectado un flujo de agua crítico! Flujo actual: ${currentValue}. Por favor, verifica tu sistema de agua inmediatamente.`
          : `¡Se ha detectado un nivel de agua crítico! Nivel actual: ${currentValue}. Por favor, verifica tu sistema de agua inmediatamente.`,
    },
    normal: {
      title: "ALERTA DE INUNDACIÓN DESACTIVADA",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `El flujo de agua ha vuelto a la normalidad. Flujo actual: ${currentValue}.`
          : `El nivel de agua ha vuelto a la normalidad. Nivel actual: ${currentValue}.`,
    },
  },
  ca: {
    welcome: {
      title: "Benvingut a AlertAigua!",
      body: (name, deviceId, language, value, metric) =>
        `Hola ${name}, el teu dispositiu s'ha registrat correctament a AlertAigua i se't notificarà si la ${metric} supera ${value} ${
          metric === "level" ? "m" : "m³/s"
        }. L'ID del teu dispositiu és ${deviceId} i el teu idioma preferit està configurat a ${language}.`,
    },
    serviceUnavailable: {
      title: "Servei temporalment no disponible",
      body: "El servei AlertAigua està experimentant problemes amb la recol·lecció de dades. Tingues en compte que el monitoratge pot estar interromput.",
    },
    serviceAvailable: {
      title: "Servei restaurat",
      body: "El servei AlertAigua ha estat restaurat i ara està monitoritzant el teu sistema d'aigua normalment.",
    },
    initialAlarm: {
      title: "ALERTA D'INUNDACIÓ! - ACCIÓ IMMEDIATA REQUERIDA",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `S'ha detectat un flux d'aigua crític! Flux actual: ${currentValue}. Si us plau, comprova el teu sistema d'aigua immediatament.`
          : `S'ha detectat un nivell d'aigua crític! Nivell actual: ${currentValue}. Si us plau, comprova el teu sistema d'aigua immediatament.`,
    },
    escalationAlarm: {
      title: "ALERTA D'INUNDACIÓ! - ACCIÓ IMMEDIATA REQUERIDA",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `S'ha detectat un flux d'aigua crític! Flux actual: ${currentValue}. Si us plau, comprova el teu sistema d'aigua immediatament.`
          : `S'ha detectat un nivell d'aigua crític! Nivell actual: ${currentValue}. Si us plau, comprova el teu sistema d'aigua immediatament.`,
    },
    normal: {
      title: "ALERTA D'INUNDACIÓ DESACTIVADA",
      body: (alertType, currentValue) =>
        alertType === "flowrate"
          ? `El flux d'aigua ha tornat a la normalitat. Flux actual: ${currentValue}.`
          : `El nivell d'aigua ha tornat a la normalitat. Nivell actual: ${currentValue}.`,
    },
  },
};

export function getMessage<T extends keyof MessageTemplates>(
  language: string,
  messageType: T
): MessageTemplates[T] {
  const lang = messages[language] || messages["en"]; // fallback english
  return lang[messageType];
}

export type MessageType = keyof MessageTemplates;
export type AlertType = "flowrate" | "level";
