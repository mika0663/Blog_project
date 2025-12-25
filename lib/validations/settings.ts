import { z } from "zod"

// Update name schema
export const updateNameSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
})

export type UpdateNameFormData = z.infer<typeof updateNameSchema>

// Update password schema
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    otp: z.string().optional(), // Make OTP optional since current password verification is sufficient
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>

// Update email schema
export const updateEmailSchema = z.object({
  newEmail: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
  otp: z.string().min(6, "OTP is required").max(6, "OTP must be 6 digits"),
})

export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>

// OTP request schema
export const requestOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type RequestOtpFormData = z.infer<typeof requestOtpSchema>

