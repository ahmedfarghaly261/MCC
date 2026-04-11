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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

import { CheckCircle, Send } from "lucide-react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  commandSchema,
  type CommandSchema,
} from "@/types/command/commandSchema";
import { toast } from "sonner";
import SatCard from "./satCard";
import type { SatelliteData } from "./satCard";

const COMMAND_TYPES = [
  { value: "telemetry_request", label: "Telemetry Request" },
  { value: "telemetry_command", label: "Tele Command" },
  { value: "payload_control", label: "Payload Control" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const defaultSatellite: SatelliteData = {
  name: "EGSA Satellite-02",
  code: "EGSA-SAT-02",
  visibilityStatus: "IN VISIBILITY ZONE",
  visibilityRemaining: "12:34",
  communicationStatus: "active",
};

function CommandForm() {
  const form = useForm<CommandSchema>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      commandType: "",
      priority: "normal",
      parameters: "",
    },
  });
  const onsubmit: SubmitHandler<CommandSchema> = (data) => {
    // console.log(data);
    toast.success("Command sent successfully!", {
      position: "bottom-right",
    });
  };
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

              {/* Command Type */}
              <Controller
                name="commandType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Command Type <span className="text-red-400">*</span>
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full bg-[#0B1220] border-gray-600 text-gray-300 h-10">
                        <SelectValue placeholder="Select command type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A2333] border-gray-600">
                        {COMMAND_TYPES.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="text-gray-300 focus:bg-blue-500/20 focus:text-white"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Priority */}
              <Controller
                name="priority"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Priority
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full bg-[#0B1220] border-gray-600 text-gray-300 h-10">
                        <SelectValue placeholder="Select priority..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A2333] border-gray-600">
                        {PRIORITIES.map((p) => (
                          <SelectItem
                            key={p.value}
                            value={p.value}
                            className="text-gray-300 focus:bg-blue-500/20 focus:text-white"
                          >
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Parameters */}
              <Controller
                name="parameters"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold text-gray-300">
                      Parameters (Optional)
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        value={field.value ?? ""}
                        id="create-command-parameters"
                        placeholder="key1=value1, key2=value2"
                        rows={4}
                        className="min-h-24 resize-none bg-[#0B1220] border-gray-600 text-gray-300 placeholder:text-gray-500"
                      />
                    </InputGroup>
                    <FieldDescription className="text-gray-500 text-xs">
                      Enter parameters in key=value format, separated by commas
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
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate & Simulate
          </Button>
          <Button
            type="submit"
            form="create-command-form"
            className="flex-1 h-11 border border-teal-500/40 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:text-teal-300"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Command
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

export default CommandForm;
