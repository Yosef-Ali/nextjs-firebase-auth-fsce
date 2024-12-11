import * as z from "zod";

export const ProgramOfficeFormSchema = z.object({
  type: z.enum(["Program", "Partner"]),
  region: z.string().min(1, "Region is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.string().email("Invalid email address"),
  beneficiaries: z.string().min(1, "Beneficiaries is required"),
  programs: z.array(z.string().min(1, "Program name is required")),
});

export type ProgramOfficeFormValues = z.infer<typeof ProgramOfficeFormSchema>;
