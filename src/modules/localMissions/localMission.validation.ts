import { z } from "zod";
import { LocalMissionStatus } from "./localMission.interface";

const pointsSchema = z.coerce.number().min(0, "Points cannot be negative").optional();

export const createLocalMissionSchema = z
  .object({
    title: z.string().min(1, "Local mission title is required"),
    description: z.string().min(1, "Local mission description is required"),
    address: z.string().min(1, "Local mission address is required"),
    duration: z.string().min(1, "Local mission duration is required"),
    points: pointsSchema,
    image: z.any().optional(),
  })
  .strict();

export const updateLocalMissionSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
    address: z.string().min(1, "Address cannot be empty").optional(),
    duration: z.string().min(1, "Duration cannot be empty").optional(),
    points: pointsSchema,
    status: z.enum(Object.values(LocalMissionStatus) as [string, ...string[]]).optional(),
    image: z.any().optional(),
  })
  .strict();

export const localMissionValidation = {
  createLocalMissionSchema,
  updateLocalMissionSchema,
};
