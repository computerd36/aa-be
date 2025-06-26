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

export class AlertService {
  // checks all users for alert conditions based on the provided level and flowrate
  static async checkAllUserAlerts(
    level: number,
    flowrate: number
  ): Promise<AlertCheckResult[]> {
    const users = await prismaClient.user.findMany(); // all users
    const results: AlertCheckResult[] = []; // array to store results (users where alertState have to be changed)

    // iterate thru all users
    for (const user of users) {
      const currentValue = user.metric === "level" ? level : flowrate;
      const result = await this.checkUserAlert(user, currentValue);

      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  // TODO: has to check individal users if alert conditions are met, if so return AlertCheckResult if not return null
  static async checkUserAlert(
    user: User,
    currentValue: number
  ): Promise<AlertCheckResult | null> {
    return null;
  }

  // TODO: process the results of the alert checks and send notifications via notificationService if needed
  static async proccessAlertResults(
    results: AlertCheckResult[]
  ): Promise<void> {}
}
