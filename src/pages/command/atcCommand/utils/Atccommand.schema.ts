import * as z from "zod";

const integerString = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .refine((v) => /^-?\d+$/.test(v) || /^0x[0-9a-fA-F]+$/.test(v), {
    message: "Value must be an integer or hex (0xE1).",
  });

const optionalIntegerString = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) =>
      !v ||
      /^-?\d+$/.test(v) ||
      /^0x[0-9a-fA-F]+$/.test(v),
    { message: "Value must be an integer or hex (0xE1)." },
  );

export const atcCommandSchema = z.object({
  commandId:   integerString,
  destAddress: integerString,
  executeAt:   z
    .string()
    .trim()
    .min(1, "Execution time is required."),

  // Optional data fields
  pwrlId:         z.string().trim().optional(),
  imageId:        optionalIntegerString,
  timerValue:     optionalIntegerString,
  modeId:         z.string().trim().optional(),
  sequenceNumber: optionalIntegerString,
  windowSize:     optionalIntegerString,
  tlmFrameSeqNo:  optionalIntegerString,
});

export type AtcCommandSchema = z.infer<typeof atcCommandSchema>;