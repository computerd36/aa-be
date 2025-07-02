import { AlarmState, User } from "@prisma/client";
import { prismaClient } from "../../prisma/prismaClient";

// services
import { sendNotification } from "./notificationService";
import { getMessage } from "../constants/messages";

// constants
import {
  DELTA_PERCENTAGE,
  CLEAR_TRESHHOlD_COUNT,
} from "../constants/constants";

// interface for result
interface AlertCheckResult {
  userId: string;
  prevState: AlarmState;
  newState: AlarmState;
  currentValue: number;
  thresshold: number;
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
 * thresshold, and metric type for users whose alert state needs to be changed.
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

// TODO: has to check individal users if alert conditions are met, if so return AlertCheckResult if not return null
export async function checkUserAlert(
  user: User,
  currentValue: number
): Promise<AlertCheckResult | null> {
  const thresshold = user.value.toNumber();
  let consecutiveNormalCount = user.consecutiveNormalCount ?? 0;

  const prevState: AlarmState = user.alarmState;
  let newState: AlarmState = prevState;

  switch (prevState) {
    // case one: user is on normal state
    case "normal":
      // check if the current value is above the thresshold
      if (currentValue >= thresshold) {
        newState = "initialAlarm";
      } else {
        consecutiveNormalCount = 0; // reset consecutive normal coun
      }
      break;

    // case two: user is on initial alarm state (was warned before)
    case "initialAlarm":
      // check if the current value is above the thresshold with a delta percentage, if so trugger escalation alarm
      if (currentValue >= thresshold * (1 + DELTA_PERCENTAGE / 100)) {
        newState = "escalationAlarm";
        consecutiveNormalCount = 0; // reset consecutive normal count
      } else if (currentValue < thresshold) {
        consecutiveNormalCount++;
        if (consecutiveNormalCount >= CLEAR_TRESHHOlD_COUNT) {
          newState = "normal";
          consecutiveNormalCount = 0; // reset consecutive normal count
        }
      } else {
        consecutiveNormalCount = 0; // reset consecutive normal count
      }
      break;

    // case three: user is on escalation alarm state (was warned twice before)
    case "escalationAlarm":
      if (currentValue < thresshold) {
        consecutiveNormalCount++;
        if (consecutiveNormalCount >= CLEAR_TRESHHOlD_COUNT) {
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
    where: { deviceId: user.deviceId },
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
    thresshold: thresshold,
    metric: user.metric as "level" | "flowrate",
  };
}

export async function proccessAlertResults(
  results: AlertCheckResult[]
): Promise<void> {
  for (const result of results) {
    const user = await prismaClient.user.findUnique({
      where: { id: result.userId },
    });

    if (!user) {
      console.warn(`User with ID ${result.userId} not found.`);
      continue;
    }

    // get message based on new state
    const message = getMessage(user.language, result.newState);

    // send notification to the user
    sendNotification(
      message.title,
      message.body(result.metric, result.currentValue),
      user.deviceId.toString(),
      result.newState === "initialAlarm" ||
        result.newState === "escalationAlarm"
        ? true
        : false
    );
  }
}
