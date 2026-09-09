import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, type Control } from "react-hook-form";
import type { CommandSchema } from "@/models/command/commandSchema";
import { powerLineOptions } from "../enums/powerLine";
import { modeOptions } from "../enums/satelliteMode";
import { formatFieldLabel } from "../Utils/commandForm.util";

interface Props {
  control: Control<CommandSchema>;
  requiredDataFields: string[];
}

export default function CommandDataFields({
  control,
  requiredDataFields,
}: Props) {
  if (requiredDataFields.length === 0) {
    return (
      <Controller
        name="data"
        control={control}
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
    );
  }

  return (
    <>
      <Field>
        <FieldLabel className="text-sm font-semibold text-gray-300">
          Required Data Fields
        </FieldLabel>
        <FieldDescription className="text-gray-500 text-xs">
          Provide integer values in the order shown.
        </FieldDescription>
      </Field>

      {requiredDataFields.map((fieldName) => {
        const isPowerLineField = fieldName === "pwrl_id";
        const isModeField = fieldName === "mode_id";

        return (
          <Controller
            key={fieldName}
            name={`dataFields.${fieldName}`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm font-semibold text-gray-300">
                  {formatFieldLabel(fieldName)}{" "}
                  <span className="text-red-400">*</span>
                </FieldLabel>

                {isPowerLineField ? (
                  <Select
                    value={
                      typeof field.value === "string"
                        ? field.value
                        : ""
                    }
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-11 bg-[#0B1220] border-gray-600 text-gray-300">
                      <SelectValue placeholder="Select power line" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1220] border-gray-600 text-gray-200">
                      {powerLineOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label} ({option.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : isModeField ? (
                  <Select
                    value={
                      typeof field.value === "string"
                        ? field.value
                        : ""
                    }
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-11 bg-[#0B1220] border-gray-600 text-gray-300">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1220] border-gray-600 text-gray-200">
                      {modeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label} ({option.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    {...field}
                    value={
                      typeof field.value === "string"
                        ? field.value
                        : ""
                    }
                    placeholder="0"
                    className="h-11 bg-[#0B1220] border-gray-600 text-gray-300 placeholder:text-gray-500"
                  />
                )}

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        );
      })}
    </>
  );
}
