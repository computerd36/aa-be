import { describe, it, expect } from "vitest";
import { getMessage, MessageTemplates } from "./messages";
import { DELTA_PERCENTAGE, CLEAR_THRESHOLD_COUNT } from "./constants";

const CLEAR_HOURS = Math.round((CLEAR_THRESHOLD_COUNT * 5) / 60);

describe("getMessage", () => {
  describe("language selection", () => {
    it("returns English messages for 'en' language", () => {
      const message = getMessage("en", "welcome");
      expect(message.title).toBe("Welcome to AlertAigua!");
    });

    it("returns Spanish messages for 'es' language", () => {
      const message = getMessage("es", "welcome");
      expect(message.title).toBe("¡Bienvenido a AlertAigua!");
    });

    it("returns Catalan messages for 'ca' language", () => {
      const message = getMessage("ca", "welcome");
      expect(message.title).toBe("Benvingut a AlertAigua!");
    });

    it("falls back to English for unsupported language", () => {
      const message = getMessage("fr", "welcome");
      expect(message.title).toBe("Welcome to AlertAigua!");
    });

    it("falls back to English for empty language string", () => {
      const message = getMessage("", "welcome");
      expect(message.title).toBe("Welcome to AlertAigua!");
    });
  });

  describe("welcome message", () => {
    it("generates correct body for level metric", () => {
      const message = getMessage("en", "welcome");
      const body = message.body("Alice", "device123", "en", "1.5", "level");

      expect(body).toContain("Hello Alice!");
      expect(body).toContain("water level exceeds 1.5 m");
      expect(body).toContain("Stay safe!");
    });

    it("generates correct body for flowrate metric", () => {
      const message = getMessage("en", "welcome");
      const body = message.body("Bob", "device456", "en", "2.0", "flowrate");

      expect(body).toContain("Hello Bob!");
      expect(body).toContain("flow rate exceeds 2.0 m³/s");
    });

    it("generates Spanish welcome for level metric", () => {
      const message = getMessage("es", "welcome");
      const body = message.body("Carlos", "device789", "es", "1.0", "level");

      expect(body).toContain("¡Hola Carlos!");
      expect(body).toContain("nivel del agua supere 1.0 m");
    });

    it("generates Catalan welcome for flowrate metric", () => {
      const message = getMessage("ca", "welcome");
      const body = message.body("Pere", "device000", "ca", "3.5", "flowrate");

      expect(body).toContain("Hola Pere!");
      expect(body).toContain("cabal superi 3.5 m³/s");
    });
  });

  describe("serviceUnavailable message", () => {
    it("returns correct English service unavailable message", () => {
      const message = getMessage("en", "serviceUnavailable");

      expect(message.title).toBe("⚠️ Monitoring Interrupted");
      expect(message.body).toContain("unable to retrieve sensor data");
      expect(message.body).toContain("NOT receive flood warnings");
    });

    it("returns correct Spanish service unavailable message", () => {
      const message = getMessage("es", "serviceUnavailable");

      expect(message.title).toBe("⚠️ Monitoreo Interrumpido");
      expect(message.body).toContain("NO recibirás alertas");
    });

    it("returns correct Catalan service unavailable message", () => {
      const message = getMessage("ca", "serviceUnavailable");

      expect(message.title).toBe("⚠️ Monitoratge Interromput");
      expect(message.body).toContain("NO rebràs alertes");
    });
  });

  describe("serviceAvailable message", () => {
    it("returns correct English service available message", () => {
      const message = getMessage("en", "serviceAvailable");

      expect(message.title).toBe("✓ Monitoring Restored");
      expect(message.body).toContain("back online");
    });

    it("returns correct Spanish service available message", () => {
      const message = getMessage("es", "serviceAvailable");

      expect(message.title).toBe("✓ Monitoreo Restablecido");
    });

    it("returns correct Catalan service available message", () => {
      const message = getMessage("ca", "serviceAvailable");

      expect(message.title).toBe("✓ Monitoratge Restablert");
    });
  });

  describe("initialAlarm message", () => {
    it("returns correct English initial alarm for level", () => {
      const message = getMessage("en", "initialAlarm");
      const body = message.body("level", 2.5);

      expect(message.title).toBe("⚠️ FLOOD WARNING");
      expect(body).toContain("Water level has exceeded");
      expect(body).toContain("Current level: 2.5 m");
      expect(body).toContain(`${DELTA_PERCENTAGE}%`);
      expect(body).toContain(`${CLEAR_HOURS} hours`);
      expect(message.urlTitle).toBe("View Live Sensor Data");
    });

    it("returns correct English initial alarm for flowrate", () => {
      const message = getMessage("en", "initialAlarm");
      const body = message.body("flowrate", 15.3);

      expect(body).toContain("Flow rate has exceeded");
      expect(body).toContain("Current rate: 15.3 m³/s");
    });

    it("returns correct Spanish initial alarm for level", () => {
      const message = getMessage("es", "initialAlarm");
      const body = message.body("level", 1.8);

      expect(message.title).toBe("⚠️ ALERTA DE INUNDACIÓN");
      expect(body).toContain("Nivel actual: 1.8 m");
      expect(message.urlTitle).toBe("Ver Datos del Sensor en Vivo");
    });

    it("returns correct Catalan initial alarm for flowrate", () => {
      const message = getMessage("ca", "initialAlarm");
      const body = message.body("flowrate", 12.0);

      expect(message.title).toBe("⚠️ ALERTA D'INUNDACIÓ");
      expect(body).toContain("Cabal actual: 12 m³/s");
    });
  });

  describe("escalationAlarm message", () => {
    it("returns correct English escalation alarm for level", () => {
      const message = getMessage("en", "escalationAlarm");
      const body = message.body("level", 3.2);

      expect(message.title).toBe("🚨 FLOOD WARNING - ESCALATION");
      expect(body).toContain("continues to rise");
      expect(body).toContain("Current level: 3.2 m");
      expect(body).toContain(`${DELTA_PERCENTAGE}% above`);
    });

    it("returns correct English escalation alarm for flowrate", () => {
      const message = getMessage("en", "escalationAlarm");
      const body = message.body("flowrate", 20.5);

      expect(body).toContain("continues to increase");
      expect(body).toContain("Current rate: 20.5 m³/s");
    });

    it("returns correct Spanish escalation alarm", () => {
      const message = getMessage("es", "escalationAlarm");

      expect(message.title).toBe("🚨 ALERTA DE INUNDACIÓN - ESCALAMIENTO");
    });

    it("returns correct Catalan escalation alarm", () => {
      const message = getMessage("ca", "escalationAlarm");

      expect(message.title).toBe("🚨 ALERTA D'INUNDACIÓ - ESCALAMENT");
    });
  });

  describe("normal (alarm cleared) message", () => {
    it("returns correct English normal message for level", () => {
      const message = getMessage("en", "normal");
      const body = message.body("level", 0.8);

      expect(message.title).toBe("✓ Flood Warning Cleared");
      expect(body).toContain("returned to safe levels");
      expect(body).toContain(`stable for ${CLEAR_HOURS} hours`);
      expect(body).toContain("Current level: 0.8 m");
    });

    it("returns correct English normal message for flowrate", () => {
      const message = getMessage("en", "normal");
      const body = message.body("flowrate", 5.0);

      expect(body).toContain("Flow rate has returned");
      expect(body).toContain("Current rate: 5 m³/s");
    });

    it("returns correct Spanish normal message", () => {
      const message = getMessage("es", "normal");

      expect(message.title).toBe("✓ Alerta de Inundación Desactivada");
    });

    it("returns correct Catalan normal message", () => {
      const message = getMessage("ca", "normal");

      expect(message.title).toBe("✓ Alerta d'Inundació Desactivada");
    });
  });

  describe("message type structure", () => {
    const languages = ["en", "es", "ca"];
    const messageTypes: (keyof MessageTemplates)[] = [
      "welcome",
      "serviceUnavailable",
      "serviceAvailable",
      "initialAlarm",
      "escalationAlarm",
      "normal",
    ];

    it.each(languages)("all message types exist for %s language", (lang) => {
      for (const type of messageTypes) {
        const message = getMessage(lang, type);
        expect(message).toBeDefined();
        expect(message.title).toBeDefined();
        expect(typeof message.title).toBe("string");
      }
    });

    it.each(languages)(
      "alarm messages have urlTitle for %s language",
      (lang) => {
        const alarmTypes = [
          "initialAlarm",
          "escalationAlarm",
          "normal",
        ] as const;

        for (const type of alarmTypes) {
          const message = getMessage(lang, type) as { urlTitle: string };
          expect(message.urlTitle).toBeDefined();
          expect(typeof message.urlTitle).toBe("string");
          expect(message.urlTitle.length).toBeGreaterThan(0);
        }
      }
    );
  });
});
