import * as z from "zod";

const integerString = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .refine((value) => /^-?\d+$/.test(value), "Value must be an integer.");

const optionalIntegerString = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) =>
      !value ||
      /^-?\d+$/.test(value) ||
      /^0x[0-9a-fA-F]+$/.test(value),
    "Value must be an integer or hex (0xE1).",
  );

export const commandSchema = z.object({
  commandId: integerString,
  destAddress: integerString,
  data: z
    .string()
    .trim()
    .optional(),
  dataFields: z
    .record(z.string(), optionalIntegerString)
    .optional(),
}).refine(
  (value) => !value.data || /^-?\d+(\s*,\s*-?\d+)*$/.test(value.data),
  {
    path: ["data"],
    message: "Data must be comma-separated integers, e.g. 1, 2, 3.",
  },
);

export type CommandSchema = z.infer<typeof commandSchema>;
