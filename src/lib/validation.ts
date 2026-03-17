import { z } from "zod";

export const CheckoutCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  deliveryNotes: z.string().optional().default(""),
});

export const OneTimeCheckoutSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customer: CheckoutCustomerSchema,
});

export const SubscriptionCheckoutSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional().default("WEEKLY"),
  customer: CheckoutCustomerSchema,
});

export const XenditWebhookSchema = z.object({
  event: z.string().optional(),
  type: z.string().optional(),
  external_id: z.string().optional(),
  status: z.string().optional(),
  id: z.string().optional(),
  plan_id: z.string().optional(),
  reference_id: z.string().optional(),
  data: z.unknown().optional(),
}).passthrough(); // Allow additional fields for webhook payloads
