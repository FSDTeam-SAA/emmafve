import { Document } from "mongoose";

export interface IPointConfig extends Document {
  pointsPerReport: number;
  pointsPerMission: number;
  pointsPerDonation: number;
  validityMonths: number;
  monthlyCeiling: number;
  isDoublePointsActive: boolean;
  isPointsOnDonationsActive: boolean;
  isValidityDurationActive: boolean;
  isMonthlyCeilingActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePointConfigPayload {
  pointsPerReport?: number;
  pointsPerMission?: number;
  pointsPerDonation?: number;
  validityMonths?: number;
  monthlyCeiling?: number;
  isDoublePointsActive?: boolean;
  isPointsOnDonationsActive?: boolean;
  isValidityDurationActive?: boolean;
  isMonthlyCeilingActive?: boolean;
}
