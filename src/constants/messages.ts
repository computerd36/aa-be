import { DELTA_PERCENTAGE, CLEAR_THRESHOLD_COUNT } from "./constants";

const CLEAR_HOURS = Math.round((CLEAR_THRESHOLD_COUNT * 5) / 60); // Convert 5-min intervals to hours

export interface MessageTemplates {
  welcome: {
    title: string;
    body: (
      name: string,
      deviceId: string,
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
    urlTitle: string;
  };
  escalationAlarm: {
    title: string;
    body: (alertType: "flowrate" | "level", currentValue: number) => string;
    urlTitle: string;
  };
  normal: {
    title: string;
    body: (alertType: "flowrate" | "level", currentValue: number) => string;
    urlTitle: string;
  };
}

const messages: Record<string, MessageTemplates> = {
  en: {
    welcome: {
      title: "Welcome to AlertAigua!",
      body: (name, _deviceId, _language, value, metric) =>
        metric === "level"
          ? `Hello ${name}! Your device is now registered. You will receive an alert when the water level exceeds ${value} m. Stay safe!`
          : `Hello ${name}! Your device is now registered. You will receive an alert when the flow rate exceeds ${value} m³/s. Stay safe!`,
    },
    serviceUnavailable: {
      title: "⚠️ Monitoring Interrupted",
      body: `AlertAigua is currently unable to retrieve sensor data. You will NOT receive flood warnings until this is resolved. Please monitor conditions manually. We will notify you when service is restored.`,
    },
    serviceAvailable: {
      title: "✓ Monitoring Restored",
      body: "AlertAigua is back online and actively monitoring water levels. You will receive alerts as normal.",
    },
    initialAlarm: {
      title: "⚠️ FLOOD WARNING",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `Water level has exceeded your threshold! Current level: ${currentValue} m. Please be vigilant and take necessary precautions. If the level rises by another ${DELTA_PERCENTAGE}%, you will receive an escalation warning. Once levels stabilize below your threshold for ${CLEAR_HOURS} hours, we will notify you. Tap to view live data.`
          : `Flow rate has exceeded your threshold! Current rate: ${currentValue} m³/s. Please be vigilant and take necessary precautions. If the rate increases by another ${DELTA_PERCENTAGE}%, you will receive an escalation warning. Once rates stabilize below your threshold for ${CLEAR_HOURS} hours, we will notify you. Tap to view live data.`,
      urlTitle: "View Live Sensor Data",
    },
    escalationAlarm: {
      title: "🚨 FLOOD WARNING - ESCALATION",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `Water level continues to rise! Current level: ${currentValue} m. This is ${DELTA_PERCENTAGE}% above your initial warning threshold. Take immediate precautions. You will be notified when levels return to normal. Tap to view live data.`
          : `Flow rate continues to increase! Current rate: ${currentValue} m³/s. This is ${DELTA_PERCENTAGE}% above your initial warning threshold. Take immediate precautions. You will be notified when rates return to normal. Tap to view live data.`,
      urlTitle: "View Live Sensor Data",
    },
    normal: {
      title: "✓ Flood Warning Cleared",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `Water level has returned to safe levels and remained stable for ${CLEAR_HOURS} hours. Current level: ${currentValue} m. The warning is now cleared.`
          : `Flow rate has returned to safe levels and remained stable for ${CLEAR_HOURS} hours. Current rate: ${currentValue} m³/s. The warning is now cleared.`,
      urlTitle: "View Live Sensor Data",
    },
  },
  es: {
    welcome: {
      title: "¡Bienvenido a AlertAigua!",
      body: (name, _deviceId, _language, value, metric) =>
        metric === "level"
          ? `¡Hola ${name}! Tu dispositivo está registrado. Recibirás una alerta cuando el nivel del agua supere ${value} m. ¡Cuídate!`
          : `¡Hola ${name}! Tu dispositivo está registrado. Recibirás una alerta cuando el caudal supere ${value} m³/s. ¡Cuídate!`,
    },
    serviceUnavailable: {
      title: "⚠️ Monitoreo Interrumpido",
      body: `AlertAigua no puede obtener datos del sensor actualmente. NO recibirás alertas de inundación hasta que se resuelva. Por favor, monitorea las condiciones manualmente. Te notificaremos cuando se restablezca el servicio.`,
    },
    serviceAvailable: {
      title: "✓ Monitoreo Restablecido",
      body: "AlertAigua está de nuevo en línea y monitoreando activamente los niveles de agua. Recibirás alertas con normalidad.",
    },
    initialAlarm: {
      title: "⚠️ ALERTA DE INUNDACIÓN",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `¡El nivel del agua ha superado tu umbral! Nivel actual: ${currentValue} m. Por favor, mantente alerta y toma las precauciones necesarias. Si el nivel sube otro ${DELTA_PERCENTAGE}%, recibirás una alerta de escalamiento. Cuando los niveles se estabilicen por debajo de tu umbral durante ${CLEAR_HOURS} horas, te notificaremos. Toca para ver datos en vivo.`
          : `¡El caudal ha superado tu umbral! Caudal actual: ${currentValue} m³/s. Por favor, mantente alerta y toma las precauciones necesarias. Si el caudal aumenta otro ${DELTA_PERCENTAGE}%, recibirás una alerta de escalamiento. Cuando los caudales se estabilicen por debajo de tu umbral durante ${CLEAR_HOURS} horas, te notificaremos. Toca para ver datos en vivo.`,
      urlTitle: "Ver Datos del Sensor en Vivo",
    },
    escalationAlarm: {
      title: "🚨 ALERTA DE INUNDACIÓN - ESCALAMIENTO",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `¡El nivel del agua sigue subiendo! Nivel actual: ${currentValue} m. Esto es ${DELTA_PERCENTAGE}% por encima de tu umbral de alerta inicial. Toma precauciones inmediatas. Te notificaremos cuando los niveles vuelvan a la normalidad. Toca para ver datos en vivo.`
          : `¡El caudal sigue aumentando! Caudal actual: ${currentValue} m³/s. Esto es ${DELTA_PERCENTAGE}% por encima de tu umbral de alerta inicial. Toma precauciones inmediatas. Te notificaremos cuando los caudales vuelvan a la normalidad. Toca para ver datos en vivo.`,
      urlTitle: "Ver Datos del Sensor en Vivo",
    },
    normal: {
      title: "✓ Alerta de Inundación Desactivada",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `El nivel del agua ha vuelto a niveles seguros y se ha mantenido estable durante ${CLEAR_HOURS} horas. Nivel actual: ${currentValue} m. La alerta ha sido desactivada.`
          : `El caudal ha vuelto a niveles seguros y se ha mantenido estable durante ${CLEAR_HOURS} horas. Caudal actual: ${currentValue} m³/s. La alerta ha sido desactivada.`,
      urlTitle: "Ver Datos del Sensor en Vivo",
    },
  },
  ca: {
    welcome: {
      title: "Benvingut a AlertAigua!",
      body: (name, _deviceId, _language, value, metric) =>
        metric === "level"
          ? `Hola ${name}! El teu dispositiu està registrat. Rebràs una alerta quan el nivell de l'aigua superi ${value} m. Cuida't!`
          : `Hola ${name}! El teu dispositiu està registrat. Rebràs una alerta quan el cabal superi ${value} m³/s. Cuida't!`,
    },
    serviceUnavailable: {
      title: "⚠️ Monitoratge Interromput",
      body: `AlertAigua no pot obtenir dades del sensor actualment. NO rebràs alertes d'inundació fins que es resolgui. Si us plau, monitora les condicions manualment. Et notificarem quan es restableixi el servei.`,
    },
    serviceAvailable: {
      title: "✓ Monitoratge Restablert",
      body: "AlertAigua torna a estar en línia i monitoritza activament els nivells d'aigua. Rebràs alertes amb normalitat.",
    },
    initialAlarm: {
      title: "⚠️ ALERTA D'INUNDACIÓ",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `El nivell de l'aigua ha superat el teu llindar! Nivell actual: ${currentValue} m. Si us plau, estigues alerta i pren les precaucions necessàries. Si el nivell puja un altre ${DELTA_PERCENTAGE}%, rebràs un avís d'escalament. Quan els nivells s'estabilitzin per sota del teu llindar durant ${CLEAR_HOURS} hores, t'avisarem. Toca per veure dades en directe.`
          : `El cabal ha superat el teu llindar! Cabal actual: ${currentValue} m³/s. Si us plau, estigues alerta i pren les precaucions necessàries. Si el cabal augmenta un altre ${DELTA_PERCENTAGE}%, rebràs un avís d'escalament. Quan els cabals s'estabilitzin per sota del teu llindar durant ${CLEAR_HOURS} hores, t'avisarem. Toca per veure dades en directe.`,
      urlTitle: "Veure Dades del Sensor en Directe",
    },
    escalationAlarm: {
      title: "🚨 ALERTA D'INUNDACIÓ - ESCALAMENT",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `El nivell de l'aigua continua pujant! Nivell actual: ${currentValue} m. Això és ${DELTA_PERCENTAGE}% per sobre del teu llindar d'alerta inicial. Pren precaucions immediates. T'avisarem quan els nivells tornin a la normalitat. Toca per veure dades en directe.`
          : `El cabal continua augmentant! Cabal actual: ${currentValue} m³/s. Això és ${DELTA_PERCENTAGE}% per sobre del teu llindar d'alerta inicial. Pren precaucions immediates. T'avisarem quan els cabals tornin a la normalitat. Toca per veure dades en directe.`,
      urlTitle: "Veure Dades del Sensor en Directe",
    },
    normal: {
      title: "✓ Alerta d'Inundació Desactivada",
      body: (alertType, currentValue) =>
        alertType === "level"
          ? `El nivell de l'aigua ha tornat a nivells segurs i s'ha mantingut estable durant ${CLEAR_HOURS} hores. Nivell actual: ${currentValue} m. L'alerta ha estat desactivada.`
          : `El cabal ha tornat a nivells segurs i s'ha mantingut estable durant ${CLEAR_HOURS} hores. Cabal actual: ${currentValue} m³/s. L'alerta ha estat desactivada.`,
      urlTitle: "Veure Dades del Sensor en Directe",
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
