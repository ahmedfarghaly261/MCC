import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { CalendarClock, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { atcCommandSchema, type AtcCommandSchema } from "../utils/Atccommand.schema";
import { buildAtcPayload } from "../utils/Atccommand.util";
import { scheduleAtcCommand } from "../services/Atccommand.service";
import { getCommandCatalog } from "@/pages/command/sendCommand/services/commandCatalogService";
import { getDestinationOptions, formatAsHex } from "@/pages/command/sendCommand/Utils/commandCatalog.util";
import { getDestinationButtonClass } from "@/pages/command/sendCommand/Utils/destinationStyles.util";
import { powerLineOptions } from "@/pages/command/sendCommand/enums/powerLine";
import { modeOptions } from "@/pages/command/sendCommand/enums/satelliteMode";

import type { CommandCatalogItem, DestinationOption } from "@/pages/command/sendCommand/types/commandCatalog.types";
import type { AtcCommandResponse } from "../types/Atccommand.types";

interface Props {
  onSuccess: (result: AtcCommandResponse) => void;
  onFormChange: (
    values: Partial<AtcCommandSchema>,
    commandName?: string,
    destLabel?: string,
  ) => void;
}

const OPTIONAL_DATA_FIELDS: {
  name: keyof AtcCommandSchema;
  label: string;
  type: "text" | "integer" | "powerLine" | "mode";
  description?: string;
}[] = [
  { name: "pwrlId",         label: "Power Line ID",        type: "powerLine",  description: "pwrl_id — string or null" },
  { name: "imageId",        label: "Image ID",              type: "integer",    description: "image_id — integer or null" },
  { name: "timerValue",     label: "Timer Value",           type: "integer",    description: "timer_value — integer or null" },
  { name: "modeId",         label: "Mode ID",               type: "mode",       description: "mode_id — string or null" },
  { name: "sequenceNumber", label: "Sequence Number",       type: "integer",    description: "sequence_number — integer or null" },
  { name: "windowSize",     label: "Window Size",           type: "integer",    description: "window_size — integer or null" },
  { name: "tlmFrameSeqNo",  label: "TLM Frame Seq No",      type: "integer",    description: "tlm_frame_seq_no — integer or null" },
];

export default function AtcCommandForm({ onSuccess, onFormChange }: Props) {
  const [commands, setCommands] = useState<CommandCatalogItem[]>([]);
  const [commandsLoading, setCommandsLoading] = useState(true);

  const form = useForm<AtcCommandSchema>({
    resolver: zodResolver(atcCommandSchema),
    defaultValues: {
      commandId:      "",
      destAddress:    "",
      executeAt:      "",
      pwrlId:         "",
      imageId:        "",
      timerValue:     "",
      modeId:         "",
      sequenceNumber: "",
      windowSize:     "",
      tlmFrameSeqNo:  "",
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const selectedCommandId  = form.watch("commandId");
  const selectedDestAddress = form.watch("destAddress");

  const selectedCommand = useMemo(
    () => commands.find((c) => String(c.id) === selectedCommandId),
    [commands, selectedCommandId],
  );

  const destinationOptions = useMemo<DestinationOption[]>(
    () => getDestinationOptions(selectedCommand),
    [selectedCommand],
  );

  const selectedDestLabel = useMemo(() => {
    if (!selectedDestAddress) return undefined;
    const parsed = parseInt(selectedDestAddress, 10);
    return destinationOptions.find((o) => o.value === parsed)?.label;
  }, [destinationOptions, selectedDestAddress]);

  // Notify parent of form value changes for the summary sidebar
  useEffect(() => {
    onFormChange(
      watchedValues as Partial<AtcCommandSchema>,
      selectedCommand?.name,
      selectedDestLabel,
    );
  }, [watchedValues, selectedCommand, selectedDestLabel, onFormChange]);

  // Clear dest address when command changes and previously selected is no longer allowed
  useEffect(() => {
    if (!selectedDestAddress) return;
    const parsed = parseInt(selectedDestAddress, 10);
    const stillAllowed = destinationOptions.some((o) => o.value === parsed);
    if (!stillAllowed) {
      form.setValue("destAddress", "", { shouldValidate: true });
    }
  }, [destinationOptions, form, selectedDestAddress]);

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        setCommandsLoading(true);
        const result = await getCommandCatalog();
        setCommands(result);
      } finally {
        setCommandsLoading(false);
      }
    };
    void fetchCommands();
  }, []);

  const onSubmit: SubmitHandler<AtcCommandSchema> = async (values) => {
    try {
      const payload = buildAtcPayload(values);
      const result = await scheduleAtcCommand(payload);
      onSuccess(result);
      toast.success("ATC scheduled successfully!", { position: "bottom-right" });
      form.reset();
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Schedule ATC API error", {
          status:   error.response?.status,
          url:      error.config?.url,
          response: error.response?.data,
        });
      } else {
        console.error("Schedule ATC unexpected error", error);
      }

      const message = isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : error instanceof Error
        ? error.message
        : "Failed to schedule ATC command.";

      toast.error(message, { position: "bottom-right" });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="bg-card border border-gray-700 rounded-xl w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          ATC Details
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form id="atc-command-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>

            {/* ── Command ID ── */}
            <Controller
              name="commandId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-semibold text-gray-300">
                    Command ID <span className="text-red-400">*</span>
                  </FieldLabel>

                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("destAddress", "", { shouldValidate: true });
                    }}
                    disabled={commandsLoading || commands.length === 0}
                  >
                    <SelectTrigger className="w-full h-11 bg-[#0B1220] border-blue-500/60 text-white">
                      <SelectValue
                        placeholder={
                          commandsLoading ? "Loading commands..." : "Select command"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1220] border-blue-500/40 text-white">
                      {commands.map((cmd) => (
                        <SelectItem key={cmd.id} value={String(cmd.id)}>
                          {`${formatAsHex(cmd.cmd_id)} — ${cmd.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!commandsLoading && commands.length === 0 && (
                    <FieldDescription className="text-red-300 text-xs">
                      No commands available from Command Dictionary API.
                    </FieldDescription>
                  )}

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ── Destination Address ── */}
            <Controller
              name="destAddress"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-semibold text-gray-300">
                    Destination Address <span className="text-red-400">*</span>
                  </FieldLabel>

                  <div className="flex flex-wrap gap-3">
                    {destinationOptions.map((dest) => {
                      const isSelected = String(dest.value) === field.value;
                      return (
                        <Button
                          key={dest.key}
                          type="button"
                          variant="outline"
                          className={`h-11 rounded-xl border text-base tracking-wide ${getDestinationButtonClass(
                            dest.label,
                            isSelected,
                          )}`}
                          onClick={() => field.onChange(String(dest.value))}
                        >
                          <span className="font-semibold">{dest.label}</span>
                          <span className="text-sm font-mono opacity-80">
                            {dest.code}
                          </span>
                        </Button>
                      );
                    })}
                  </div>

                  {!selectedCommandId && (
                    <FieldDescription className="text-gray-500 text-xs">
                      Select a command first to show valid destinations.
                    </FieldDescription>
                  )}

                  {selectedCommandId && destinationOptions.length === 0 && (
                    <FieldDescription className="text-yellow-300 text-xs">
                      No allowed destinations provided for this command.
                    </FieldDescription>
                  )}

                  {/* Hidden input for validation */}
                  <Input
                    {...field}
                    value={selectedDestAddress ?? ""}
                    readOnly
                    tabIndex={-1}
                    className="sr-only"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ── Execute At ── */}
            <Controller
              name="executeAt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm font-semibold text-gray-300">
                    Execute At <span className="text-red-400">*</span>
                  </FieldLabel>

                  <Input
                    {...field}
                    type="datetime-local"
                    className="h-11 bg-[#0B1220] border-blue-500/60 text-white"
                  />

                  <FieldDescription className="text-gray-500 text-xs">
                    Absolute UTC time when this command should execute.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Separator className="border-slate-700/60 my-1" />

            {/* ── Optional Data Fields ── */}
            <Field>
              <FieldLabel className="text-sm font-semibold text-gray-300">
                Data Fields{" "}
                <span className="text-gray-500 font-normal">(Optional)</span>
              </FieldLabel>
              <FieldDescription className="text-gray-500 text-xs">
                Leave blank any fields that are not required for this command.
              </FieldDescription>
            </Field>

            {OPTIONAL_DATA_FIELDS.map(({ name, label, type, description }) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-medium text-gray-400">
                      {label}
                    </FieldLabel>

                    {type === "powerLine" ? (
                      <Select
                        value={typeof field.value === "string" ? field.value : ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full h-11 bg-[#0B1220] border-gray-600 text-gray-300">
                          <SelectValue placeholder="Select power line" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1220] border-gray-600 text-gray-200">
                          {powerLineOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label} ({o.value})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : type === "mode" ? (
                      <Select
                        value={typeof field.value === "string" ? field.value : ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full h-11 bg-[#0B1220] border-gray-600 text-gray-300">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1220] border-gray-600 text-gray-200">
                          {modeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label} ({o.value})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        {...field}
                        value={typeof field.value === "string" ? field.value : ""}
                        placeholder="0"
                        className="h-11 bg-[#0B1220] border-gray-600 text-gray-300 placeholder:text-gray-500"
                      />
                    )}

                    {description && !fieldState.invalid && (
                      <FieldDescription className="text-gray-600 text-xs">
                        {description}
                      </FieldDescription>
                    )}

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}

          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Button
          type="submit"
          form="atc-command-form"
          className="w-full h-11 border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
          disabled={isSubmitting}
        >
          <CalendarClock className="w-4 h-4 mr-2" />
          {isSubmitting ? "Scheduling..." : "Schedule ATC"}
          {!isSubmitting && <Send className="w-4 h-4 ml-2 opacity-60" />}
        </Button>
      </CardFooter>
    </Card>
  );
}