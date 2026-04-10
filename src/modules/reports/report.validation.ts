import { z } from "zod";
import { ReportStatus, AnimalSpecies, AnimalAge, AnimalGender, YesNoUnknown } from "./report.interface";

const locationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must contain exactly [longitude, latitude]"),
  address: z.string().min(1, "Address is required"),
});

export const createReportSchema = z
  .object({
  title: z.string().min(1, "Title is required"),
  species: z.enum(Object.values(AnimalSpecies) as [string, ...string[]]),
  breed: z.string().min(1, "Breed is required"),
  gender: z.enum(Object.values(AnimalGender) as [string, ...string[]]),
  age: z.enum(Object.values(AnimalAge) as [string, ...string[]]),
  status: z.enum(Object.values(ReportStatus) as [string, ...string[]]),
  eventDate: z.string().datetime({ message: "Invalid ISO datetime format" }),
  description: z.string().min(1, "Description is required"),
  hasMicrochip: z.enum(Object.values(YesNoUnknown) as [string, ...string[]]),
  hasTattoo: z.enum(Object.values(YesNoUnknown) as [string, ...string[]]),
  hasCollarOrHarness: z.enum(Object.values(YesNoUnknown) as [string, ...string[]]),
  contactPhone: z.string().optional(),
  isPhoneVisible: z.preprocess(
    (val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : val),
    z.boolean()
  ).default(false),
  contactEmail: z.string().email("Invalid email").optional(),
  isEmailVisible: z.preprocess(
    (val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : val),
    z.boolean({
      message: "Accept only boolean value",
    })
  )
  .optional()
  .default(false),
  location: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  }, locationSchema),
})
.strict();

export const updateReportSchema = createReportSchema.partial().strict();
