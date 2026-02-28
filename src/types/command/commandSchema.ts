import * as z from "zod";

export const commandSchema = z.object({
  commandType: z
    .string()
    .min(1, "Command type is required."),
  priority: z
    .string()
    .optional(),
  parameters: z
    .string()
    .optional(),
});

export type CommandSchema = z.infer<typeof commandSchema>;
