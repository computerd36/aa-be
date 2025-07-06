import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWaterData } from "./waterDataService";

import saihebroClient from "../api/saihebroClient";
import { SaihEbroSensorData } from "~/state/appState";

// mock of saih ebro axios client
vi.mock("../api/saihebroClient", () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

describe("fetchWaterData()", () => {
  const mockSaihebroCient = saihebroClient.get as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with parsed data when API returns a valid array", async () => {
    const fakePayload: SaihEbroSensorData[] = [
      {
        senal: "S1",
        fecha: "2025-07-06 12:00:00",
        valor: 1.23,
        unidades: "m",
        descripcion: "d",
        tendencia: "derecha",
      },
      {
        senal: "S2",
        fecha: "2025-07-06 12:00:00",
        valor: 4.56,
        unidades: "m³/s",
        descripcion: "d2",
        tendencia: "derecha",
      },
    ];
    mockSaihebroCient.mockResolvedValue({ data: fakePayload });

    const result = await fetchWaterData("S1,S2");
    expect(result).toEqual(fakePayload);
    expect(mockSaihebroCient).toHaveBeenCalledWith("", {
      params: { senal: "S1,S2" },
    });
  });

  it("throws if response.data is not an array", async () => {
    mockSaihebroCient.mockResolvedValue({ data: { foo: "bar" } });
    await expect(fetchWaterData("X")).rejects.toThrow(
      "Unexpected API response: not an array"
    );
  });

  it("throws if any item is malformed", async () => {
    const bad = [
      {
        senal: "S1",
        fecha: "2025-07-06 12:00:00",
        valor: 1.23,
        unidades: "m",
        descripcion: "d",
        tendencia: "up",
      },
      // missing `valor` as number
      {
        senal: "S2",
        fecha: "2025-07-06 12:00:00",
        valor: "oops",
        unidades: "m³/s",
        descripcion: "d2",
        tendencia: "down",
      },
    ] as any;
    mockSaihebroCient.mockResolvedValue({ data: bad });
    await expect(fetchWaterData("S1,S2")).rejects.toThrow(
      /Malformed sensor data/
    );
  });

  it("forwards network errors", async () => {
    const err = new Error("network said nope");
    mockSaihebroCient.mockRejectedValue(err);
    await expect(fetchWaterData("ANY")).rejects.toBe(err);
  });
});
