import { AlarmState, MessageType, User } from "@prisma/client";
import { prismaClient } from "../../prisma/prismaClient";

// services
import { sendNotificationAsync } from "./notificationService";
import { getMessage } from "../constants/messages";

// constants
import {
  DELTA_PERCENTAGE,
  CLEAR_THRESHOLD_COUNT,
  SENSORS,
  SENSOR_URL,
} from "../constants/constants";
import { logger } from "~/logger";

// interface for result
interface AlertCheckResult {
  userId: string;
  prevState: AlarmState;
  newState: AlarmState;
  currentValue: number;
  threshold: number;
  metric: "level" | "flowrate";
}

/**
 * Checks all db users' alerts based on the provided level and flowrate.
 *
 * @param {number} level - The current water level.
 * @param {number} flowrate - The current water flow rate.
 *
 * @returns {Promise<AlertCheckResult[]>} - A promise that resolves to an array of AlertCheckResult objects,
 * where each object contains the user ID, previous state, new state, current value,
 * threshold, and metric type for users whose alert state needs to be changed.
 */
export async function checkAllUserAlerts(
  level: number,
  flowrate: number
): Promise<AlertCheckResult[]> {
  const users = await prismaClient.user.findMany(); // all users
  const results: AlertCheckResult[] = []; // array to store results (users where alertState have to be changed)

  // iterate thru all users
  for (const user of users) {
    const currentValue = user.metric === "level" ? level : flowrate;
    const result = await checkUserAlert(user, currentValue);

    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Checks the alert state of a user based on the current value of a metric (level or flowrate).
 *
 * @param {User} user - The user object to check the alert for.
 * @param {number} currentValue - The current value of the metric (level or flowrate) for the user.
 *
 * @returns {Promise<AlertCheckResult | null>} - A promise that resolves to an AlertCheckResult object
 * if the user's alert state has changed, or null if there are no changes to the user's alert state.
 */
export async function checkUserAlert(
  user: User,
  currentValue: number
): Promise<AlertCheckResult | null> {
  const threshold = user.value.toNumber();
  let consecutiveNormalCount = user.consecutiveNormalCount ?? 0;

  const prevState: AlarmState = user.alarmState;
  let newState: AlarmState = prevState;

  switch (prevState) {
    // case one: user is on normal state
    case "normal":
      // check if the current value is above the threshold
      if (currentValue >= threshold) {
        newState = "initialAlarm";
      } else {
        consecutiveNormalCount = 0; // reset consecutive normal coun
      }
      break;

    // case two: user is on initial alarm state (was warned before)
    case "initialAlarm":
      // check if the current value is above the threshold with a delta percentage, if so trugger escalation alarm
      if (currentValue >= threshold * (1 + DELTA_PERCENTAGE / 100)) {
        newState = "escalationAlarm";
        consecutiveNormalCount = 0; // reset consecutive normal count
      } else if (currentValue < threshold) {
        consecutiveNormalCount++;
        if (consecutiveNormalCount >= CLEAR_THRESHOLD_COUNT) {
          newState = "normal";
          consecutiveNormalCount = 0; // reset consecutive normal count
        }
      } else {
        consecutiveNormalCount = 0; // reset consecutive normal count
      }
      break;

    // case three: user is on escalation alarm state (was warned twice before)
    case "escalationAlarm":
      if (currentValue < threshold) {
        consecutiveNormalCount++;
        if (consecutiveNormalCount >= CLEAR_THRESHOLD_COUNT) {
          newState = "normal";
          consecutiveNormalCount = 0;
        }
      } else {
        consecutiveNormalCount = 0;
      }
      break;
  }

  const stateChanged = newState !== prevState;
  const counterChanged = consecutiveNormalCount !== user.consecutiveNormalCount;

  // no changes, return null
  if (!stateChanged && !counterChanged) return null;

  // update user in the database
  await prismaClient.user.update({
    where: { id: user.id },
    data: {
      alarmState: newState,
      consecutiveNormalCount: consecutiveNormalCount,
    },
  });

  return {
    userId: user.id,
    prevState: prevState,
    newState: newState,
    currentValue: currentValue,
    threshold: threshold,
    metric: user.metric as "level" | "flowrate",
  };
}

export async function processAlertResults(
  results: AlertCheckResult[]
): Promise<void> {
  for (const result of results) {
    const user = await prismaClient.user.findUnique({
      where: { id: result.userId },
    });

    if (!user) {
      logger.warn({ userId: result.userId }, "User not found");
      continue;
    }

    // get message based on new state
    const message = getMessage(user.language, result.newState);

    const success = await sendNotificationAsync({
      type: MessageType[result.newState as keyof typeof MessageType],
      title: message.title,
      message: message.body(result.metric, result.currentValue),
      deviceId: user.deviceId.toString(),
      userId: user.id.toString(),
      isCritical: result.newState !== "normal",
      url: SENSOR_URL,
      urlTitle: message.urlTitle,
    });

    if (success) {
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          alarmState: result.newState,
          consecutiveNormalCount: 0,
          lastWarnedAt: new Date(),
        },
      });
    } else {
      logger.error(
        { userId: user.id, newState: result.newState },
        "Failed to send notification"
      );
    }
  }
}

export async function warnAllUsersServiceUnavailable(): Promise<void> {
  const users = await prismaClient.user.findMany();

  for (const user of users) {
    const message = getMessage(user.language, "serviceUnavailable");

    sendNotificationAsync({
      type: "serviceUnavailable" as MessageType,
      title: message.title,
      message: message.body,
      deviceId: user.deviceId.toString(),
      userId: user.id.toString(),
      isCritical: false,
    });
  }
}

export async function warnAllUsersServiceAvailable(): Promise<void> {
  const users = await prismaClient.user.findMany();

  for (const user of users) {
    const message = getMessage(user.language, "serviceAvailable");

    sendNotificationAsync({
      type: "serviceAvailable" as MessageType,
      title: message.title,
      message: message.body,
      deviceId: user.deviceId.toString(),
      userId: user.id.toString(),
      isCritical: false,
    });
  }
}
