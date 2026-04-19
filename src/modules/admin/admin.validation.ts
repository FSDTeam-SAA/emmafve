import { z } from "zod";

export const updateAdminConfigSchema = z.object({
  pointsPerPhysicalDonation: z.number().min(0).optional(),
  pointsPerLocalMission: z.number().min(0).optional(),
  pointsPerStoryApproval: z.number().min(0).optional(),
  pointsPerReportResolved: z.number().min(0).optional(),
  crowdfundingTotal: z.number().min(0).optional(),
  crowdfundingGoal: z.number().min(0).optional(),
}).strict();
