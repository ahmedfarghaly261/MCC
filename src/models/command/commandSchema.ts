import * as z from "zod";

const integerString = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .refine((value) => /^-?\d+$/.test(value), "Value must be an integer.");

export const commandSchema = z.object({
  commandId: integerString,
  destAddress: integerString,
  data: z
    .string()
    .trim()
    .optional(),
}).refine(
  (value) => !value.data || /^-?\d+(\s*,\s*-?\d+)*$/.test(value.data),
  {
    path: ["data"],
    message: "Data must be comma-separated integers, e.g. 1, 2, 3.",
  },
);

export type CommandSchema = z.infer<typeof commandSchema>;
