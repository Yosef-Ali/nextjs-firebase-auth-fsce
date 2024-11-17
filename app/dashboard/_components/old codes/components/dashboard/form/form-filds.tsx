import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import * as z from "zod";

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description: string;
  type: "input" | "textarea";
  placeholder: string;
  rows?: number; // Optional property for Textarea
  // ... other props
};

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  type,
  placeholder,
  rows,
}: FormFieldProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <FormItem className="mb-4">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        {type === "input" ? (
          <Input placeholder={placeholder} {...field} />
        ) : (
          <Textarea placeholder={placeholder} {...field} rows={rows} />
        )}
      </FormControl>
      <FormDescription className="text-sm">{description}</FormDescription>
      {error && <FormMessage className="text-sm">{error.message}</FormMessage>}
    </FormItem>
  );
};

export default FormField;