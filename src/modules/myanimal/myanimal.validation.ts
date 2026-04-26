import { z } from "zod";
import { MyanimalStatus } from "./myanimal.interface";

export const createMyanimalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  status: z.enum([MyanimalStatus.ACTIVE, MyanimalStatus.INACTIVE]).optional(),
});

export const updateMyanimalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().min(1, "Description is required").max(1000).optional(),
  status: z.enum([MyanimalStatus.ACTIVE, MyanimalStatus.INACTIVE]).optional(),
});

