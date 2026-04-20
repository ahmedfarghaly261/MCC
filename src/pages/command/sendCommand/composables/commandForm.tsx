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
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

import { CheckCircle, Send } from "lucide-react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  commandSchema,
  type CommandSchema,
} from "@/models/command/commandSchema";
import { toast } from "sonner";
import SatCard from "./satCard";
import type { SatelliteData } from "./satCard";
import { sendCommand } from "../services/sendCommandService";
import type { SendCommandPayload } from "../types/command.types";

const defaultSatellite: SatelliteData = {
  name: "EGSA Satellite-02",
  code: "EGSA-SAT-02",
  visibilityStatus: "IN VISIBILITY ZONE",
  visibilityRemaining: "12:34",
  communicationStatus: "active",
};

function parseDataField(value?: string): number[] {
  if (!value || value.trim().length === 0) {
    return [];
  }

  return value.split(",").map((item) => Number(item.trim()));
}

function toPayload(values: CommandSchema): SendCommandPayload {
  return {
    command_id: Number(values.commandId.trim()),
    dest_address: Number(values.destAddress.trim()),
    data: parseDataField(values.data),
  };
}

function CommandForm() {
  const form = useForm<CommandSchema>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      commandId: "",
      destAddress: "",
      data: "",
    },
  });
  const onsubmit: SubmitHandler<CommandSchema> = async (values) => {
    try {
      const payload = toPayload(values);
      await sendCommand(payload);

      toast.success("Command dispatched successfully!", {
        position: "bottom-right",
      });

      form.reset();
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("Send command API error", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          response: error.response?.data,
        });
      } else {
        console.error("Send command unexpected error", error);
      }

      const message =
        isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : "Failed to send command. Please try again.";

      toast.error(message, {
        position: "bottom-right",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  function onValidate() {
    form.trigger().then((isValid: boolean) => {
      if (isValid) {
        toast.success("Command validated successfully! Simulation passed.", {
          position: "bottom-right",
        });
      }
    });
  }

  return (
    <>
      {/* Main Form Card */}
      <Card className="bg-card border border-gray-700 rounded-xl w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            Command Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form id="create-command-form" onSubmit={form.handleSubmit(onsubmit)}>
            <FieldGroup>
              {/* Target Satellite (Auto-Linked) — static info card */}
              <SatCard satellite={defaultSatellite} />

              {/* Command ID */}
              <Controller
                name="commandId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Command ID <span className="text-red-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="create-command-id"
                      type="number"
                      placeholder="Enter command ID"
                      className="w-full bg-[#0B1220] border-gray-600 text-gray-300"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Destination Address */}
              <Controller
                name="destAddress"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Destination Address <span className="text-red-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="create-command-dest-address"
                      type="number"
                      placeholder="Enter destination address"
                      className="w-full bg-[#0B1220] border-gray-600 text-gray-300"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Data */}
              <Controller
                name="data"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Data (Optional)
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        value={field.value ?? ""}
                        id="create-command-data"
                        placeholder="1, 2, 3"
                        rows={3}
                        className="min-h-24 resize-none bg-[#0B1220] border-gray-600 text-gray-300 placeholder:text-gray-500"
                      />
                    </InputGroup>
                    <FieldDescription className="text-gray-500 text-xs">
                      Enter comma-separated integers, e.g. 0 or 1, 2, 3. Leave empty to send an empty array.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
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
            {isSubmitting ? "Sending..." : "Send Command"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

export default CommandForm;
