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
import CommandForm from "./components/commandForm";

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
        <CommandForm />
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
