import { Card, CardHeader } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  getCommandLogById,
  type CommandLog,
} from "../services/commandLogService";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CheckCircle, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  commandSchema,
  type CommandSchema,
} from "@/models/command/commandSchema";
import { toast } from "sonner";
import SatCard from "./satCard";
import CommandDataFields from "./CommandDataFields";
import type { SatelliteData } from "./satCard";
import { getDestinationOptions, formatAsHex } from "../Utils/commandCatalog.util";
import { getDestinationButtonClass } from "../Utils/destinationStyles.util";
import {
  buildDataPayload,
  isStringDataField,
  normalizeRequiredFields,
  parseNumericValue,
} from "../Utils/commandForm.util";
import { getCommandCatalog } from "../services/commandCatalogService";
import { sendCommand } from "../services/sendCommandService";
import type {
  CommandCatalogItem,
  DestinationOption,
} from "../types/commandCatalog.types";
import type {
  SendCommandPayload,
  SendCommandResponse,
} from "../types/command.types";


const defaultSatellite: SatelliteData = {
  name: "EGSA Satellite-02",
  code: "EGSA-SAT-02",
  visibilityStatus: "IN VISIBILITY ZONE",
  visibilityRemaining: "12:34",
  communicationStatus: "active",
};

function toPayload(values: CommandSchema): SendCommandPayload {
  return {
    command_id: Number(values.commandId.trim()),
    dest_address: Number(values.destAddress.trim()),
    data: {},
  };
}

interface Props {
  onCommandSent: (log: CommandLog) => void;
}

export default function CommandForm({
  onCommandSent,
}: Props) {
  const [commands, setCommands] = useState<CommandCatalogItem[]>([]);
  const [commandsLoading, setCommandsLoading] = useState(true);

  const form = useForm<CommandSchema>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      commandId: "",
      destAddress: "",
      data: "",
      dataFields: {},
    },
  });

  const selectedCommandId = form.watch("commandId");
  const selectedDestAddress = form.watch("destAddress");

  const selectedCommand = useMemo(
    () =>
      commands.find(
        (command) =>
          String(command.cmd_id) === selectedCommandId,
      ),
    [commands, selectedCommandId],
  );

  const destinationOptions = useMemo<
    DestinationOption[]
  >(
    () => getDestinationOptions(selectedCommand),
    [selectedCommand],
  );

  const requiredDataFields = useMemo(() => {
    const fields =
      selectedCommand?.required_data_fields ?? [];

    return normalizeRequiredFields(fields);
  }, [selectedCommand]);

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        setCommandsLoading(true);
        const result =
          await getCommandCatalog();
        setCommands(result);
      } finally {
        setCommandsLoading(false);
      }
    };

    void fetchCommands();
  }, []);

  useEffect(() => {
    if (!selectedDestAddress) {
      return;
    }

    const isAllowed =
      destinationOptions.some(
        (option) =>
          String(option.value) ===
          selectedDestAddress,
      );

    if (!isAllowed) {
      form.setValue(
        "destAddress",
        "",
        {
          shouldValidate: true,
        },
      );
    }
  }, [
    destinationOptions,
    form,
    selectedDestAddress,
  ]);

  useEffect(() => {
    const nextFields: Record<string, string> = {};
    requiredDataFields.forEach((field) => {
      nextFields[field] = "";
    });

    form.setValue("dataFields", nextFields, {
      shouldValidate: false,
    });

    if (requiredDataFields.length > 0) {
      form.setValue("data", "", {
        shouldValidate: false,
      });
    }

    form.clearErrors("dataFields");
  }, [form, requiredDataFields]);

  const validateRequiredFields = (
    fields: string[],
    values: Record<string, unknown>,
  ) => {
    let isValid = true;

    fields.forEach((field) => {
      const rawValue = values[field];
      const raw =
        typeof rawValue === "string"
          ? rawValue.trim()
          : typeof rawValue === "number"
          ? String(rawValue)
          : "";

      if (!raw) {
        form.setError(`dataFields.${field}` as const, {
          type: "manual",
          message: "This field is required.",
        });
        isValid = false;
        return;
      }

      if (isStringDataField(field)) {
        return;
      }

      if (!raw || parseNumericValue(raw) === null) {
        form.setError(`dataFields.${field}` as const, {
          type: "manual",
          message: "Value must be an integer or hex (0xE1).",
        });
        isValid = false;
      }
    });

    return isValid;
  };

  const onsubmit: SubmitHandler<
    CommandSchema
  > = async (values) => {
    try {
      if (
        requiredDataFields.length > 0 &&
        !validateRequiredFields(
          requiredDataFields,
          values.dataFields ?? {},
        )
      ) {
        return;
      }

      const payload: SendCommandPayload = {
        ...toPayload(values),
        data: buildDataPayload(
          values,
          requiredDataFields,
        ),
      };

      const response =
        (await sendCommand(
          payload,
        )) as SendCommandResponse;

      const log =
        await getCommandLogById(
          response.log_id,
        );

      onCommandSent(log);

      toast.success(
        "Command dispatched successfully!",
        {
          position: "bottom-right",
        },
      );

      form.reset();
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(
          "Send command API error",
          {
            status:
              error.response?.status,
            statusText:
              error.response
                ?.statusText,
            url:
              error.config?.url,
            method:
              error.config?.method,
            response:
              error.response
                ?.data,
          },
        );
      } else {
        console.error(
          "Send command unexpected error",
          error,
        );
      }

      const message =
        isAxiosError(error)
          ? error.response?.data
              ?.message ??
            error.message
          : error instanceof Error
          ? error.message
          : "Failed to send command. Please try again.";

      toast.error(message, {
        position: "bottom-right",
      });
    }
  };

  const isSubmitting =
    form.formState.isSubmitting;

  function onValidate() {
    form
      .trigger()
      .then((isValid: boolean) => {
        if (isValid) {
          toast.success(
            "Command validated successfully! Simulation passed.",
            {
              position:
                "bottom-right",
            },
          );
        }
      });
  }

  return (
    <>
      <Card className="bg-card border border-gray-700 rounded-xl w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Command Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            id="create-command-form"
            onSubmit={form.handleSubmit(
              onsubmit,
            )}
          >
            <FieldGroup>

              <SatCard
                satellite={
                  defaultSatellite
                }
              />

              {/* Command ID */}
              <Controller
                name="commandId"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Command ID{" "}
                      <span className="text-red-400">
                        *
                      </span>
                    </FieldLabel>

                    <Select
                      value={
                        field.value ?? ""
                      }
                      onValueChange={(
                        value,
                      ) => {
                        field.onChange(
                          value,
                        );

                        form.setValue(
                          "destAddress",
                          "",
                          {
                            shouldValidate:
                              true,
                          },
                        );
                      }}
                      disabled={
                        commandsLoading ||
                        commands.length ===
                          0
                      }
                    >
                      <SelectTrigger
                        id="create-command-id"
                        className="w-full h-11 bg-[#0B1220] border-blue-500/60 text-white"
                      >
                        <SelectValue
                          placeholder={
                            commandsLoading
                              ? "Loading commands..."
                              : "Select command"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent className="bg-[#0B1220] border-blue-500/40 text-white">
                        {commands.map(
                          (
                            command,
                          ) => (
                            <SelectItem
                              key={
                                command.id
                              }
                              value={String(
                                command.cmd_id,
                              )}
                            >
                              {`${formatAsHex(
                                command.cmd_id,
                              )} - ${command.name}`}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    {!commandsLoading &&
                      commands.length ===
                        0 && (
                        <FieldDescription className="text-red-300 text-xs">
                          No commands available from Command Dictionary API.
                        </FieldDescription>
                      )}

                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              {/* Destination Address */}
              <Controller
                name="destAddress"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Destination Address{" "}
                      <span className="text-red-400">
                        *
                      </span>
                    </FieldLabel>

                    <div className="flex flex-wrap gap-3">
                      {destinationOptions.map(
                        (
                          destination,
                        ) => {
                          const isSelected =
                            String(
                              destination.value,
                            ) ===
                            field.value;

                          return (
                            <Button
                              key={
                                destination.key
                              }
                              type="button"
                              variant="outline"
                              className={`h-11 rounded-xl border text-base tracking-wide ${getDestinationButtonClass(
                                destination.label,
                                isSelected,
                              )}`}
                              onClick={() =>
                                field.onChange(
                                  String(
                                    destination.value,
                                  ),
                                )
                              }
                            >
                              <span className="font-semibold">
                                {
                                  destination.label
                                }
                              </span>
                              <span className="text-sm font-mono opacity-80">
                                {
                                  destination.code
                                }
                              </span>
                            </Button>
                          );
                        },
                      )}
                    </div>

                    {!selectedCommandId && (
                      <FieldDescription className="text-gray-500 text-xs">
                        Select a command first to show valid destinations.
                      </FieldDescription>
                    )}

                    {selectedCommandId &&
                      destinationOptions.length ===
                        0 && (
                        <FieldDescription className="text-yellow-300 text-xs">
                          No allowed destinations were provided for this command.
                        </FieldDescription>
                      )}

                    <Input
                      {...field}
                      value={
                        selectedDestAddress ??
                        ""
                      }
                      readOnly
                      tabIndex={-1}
                      id="create-command-dest-address"
                      className="sr-only"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <CommandDataFields
                control={form.control}
                requiredDataFields={requiredDataFields}
              />

            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="pt-2 pb-6 gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
            onClick={onValidate}
            disabled={isSubmitting}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate & Simulate
          </Button>

          <Button
            type="submit"
            form="create-command-form"
            className="flex-1 h-11 border border-teal-500/40 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:text-teal-300"
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting
              ? "Sending..."
              : "Send Command"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}