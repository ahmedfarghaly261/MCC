import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { commandSchema, type CommandSchema } from "@/types/forms/commandSchema";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { FileText, CheckCircle, Send } from "lucide-react";
import SatCard from "./components/satCard";
import SatelliteHistoryPanel from "./components/SatelliteHistoryPanel";

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

export default function CreateCommand() {
  const form = useForm<CommandSchema>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      commandType: "",
      priority: "normal",
      parameters: "",
    },
  });

  function onSubmit(data: CommandSchema) {
    toast("Command sent successfully!", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-[#0B1220] p-4 text-sm text-gray-300">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
    });
  }

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
    <div className="min-h-screen bg-background text-white">
      <div className="px-8 py-10">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Command</h1>
            <p className="text-gray-400 text-sm">
              Create and validate commands before sending to satellites
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="bg-card border border-gray-700 rounded-xl mt-8 max-w-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white">
              Command Details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              id="create-command-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FieldGroup>
                {/* Target Satellite (Auto-Linked) — static info card */}
                <SatCard />

                {/* Command Type */}
                <Controller<CommandSchema, "commandType">
                  name="commandType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-sm font-semibold text-gray-300">
                        Command Type <span className="text-red-400">*</span>
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                <Controller<CommandSchema, "priority">
                  name="priority"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-sm font-semibold text-gray-300">
                        Priority
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                <Controller<CommandSchema, "parameters">
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
                        Enter parameters in key=value format, separated by
                        commas
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
              className="flex-1 h-11 border-teal-500/40 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:text-teal-300"
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
        <br />

        <SatelliteHistoryPanel
          satelliteName="EGSA Satellite-02"
          telemetry={[
            {
              time: "10:45:23",
              label: "Battery",
              value: "78%",
              status: "normal",
            },
            {
              time: "10:45:18",
              label: "Temperature",
              value: "23°C",
              status: "normal",
            },
            {
              time: "10:45:15",
              label: "Signal",
              value: "92%",
              status: "normal",
            },
          ]}
          commands={[
            {
              time: "10:40:12",
              command: "TELEMETRY_COLLECT",
              status: "success",
            },
            {
              time: "10:35:45",
              command: "BATTERY_OPTIMIZE",
              status: "success",
            },
            { time: "10:30:22", command: "IMAGE_CAPTURE", status: "pending" },
          ]}
        />
      </div>
    </div>
  );
}
