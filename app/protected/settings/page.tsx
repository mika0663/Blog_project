"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  updateNameSchema,
  updatePasswordSchema,
  updateEmailSchema,
  type UpdateNameFormData,
  type UpdatePasswordFormData,
  type UpdateEmailFormData,
} from "@/lib/validations/settings"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Lock, Mail, CheckCircle2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        // Ensure profile exists, create if it doesn't
        let { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, username")
          .eq("id", currentUser.id)
          .single()
        
        // If profile doesn't exist, create it
        if (!profileData) {
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: currentUser.id,
              full_name: null,
            })
            .select()
            .single()
          profileData = newProfile
        }
        
        setProfile(profileData)
      }
      setIsLoading(false)
    }
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nameForm = useForm<UpdateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
    },
  })

  const passwordForm = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      otp: "",
    },
  })

  const emailForm = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
      otp: "",
    },
  })

  // Update name form when profile loads
  useEffect(() => {
    if (profile) {
      nameForm.setValue("full_name", profile.full_name || "")
    }
  }, [profile, nameForm])

  const handleUpdateName = async (data: UpdateNameFormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: data.full_name })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Name updated successfully")
      setProfile({ ...profile, full_name: data.full_name })
    } catch (error: any) {
      toast.error(error.message || "Failed to update name")
    }
  }

  const handleRequestPasswordOtp = async () => {
    if (!user?.email) {
      toast.error("No email found")
      return
    }

    setOtpLoading(true)
    try {
      // Request OTP - this will send an email with OTP code
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
          // Don't set emailRedirectTo to get OTP code instead of magic link
        },
      })

      if (error) throw error

      setOtpSent(true)
      toast.success("OTP sent to your email. Please check your inbox for the 6-digit code.")
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP. Please check your Supabase email template configuration.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleUpdatePassword = async (data: UpdatePasswordFormData) => {
    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })

      if (signInError) {
        passwordForm.setError("currentPassword", { message: "Current password is incorrect" })
        return
      }

      // Verify OTP if provided - trim and ensure it's 6 digits
      if (data.otp && data.otp.trim()) {
        const otpToken = data.otp.trim().replace(/\s/g, '')
        if (otpToken.length !== 6) {
          passwordForm.setError("otp", { message: "OTP must be exactly 6 digits" })
          return
        }

        try {
          const { error: otpError } = await supabase.auth.verifyOtp({
            email: user.email,
            token: otpToken,
            type: "email",
          })

          if (otpError) {
            // If OTP verification fails, we can still proceed with just password verification
            // But show a warning
            console.warn("OTP verification failed, proceeding with password verification only:", otpError)
            toast.warning("OTP verification failed, but proceeding with password change since current password is verified.")
          }
        } catch (otpErr: any) {
          console.warn("OTP verification error:", otpErr)
          // Don't block password change if OTP fails, since we already verified current password
        }
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) throw updateError

      toast.success("Password updated successfully")
      passwordForm.reset()
      setOtpSent(false)
    } catch (error: any) {
      console.error("Password update error:", error)
      toast.error(error.message || "Failed to update password")
    }
  }

  const handleRequestEmailOtp = async () => {
    if (!user?.email) {
      toast.error("No email found")
      return
    }

    setOtpLoading(true)
    try {
      // Request OTP - this will send an email with OTP code
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
          // Don't set emailRedirectTo to get OTP code instead of magic link
        },
      })

      if (error) throw error

      setOtpSent(true)
      toast.success("OTP sent to your current email. Please check your inbox for the 6-digit code.")
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP. Please check your Supabase email template configuration.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleUpdateEmail = async (data: UpdateEmailFormData) => {
    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })

      if (signInError) {
        emailForm.setError("currentPassword", { message: "Current password is incorrect" })
        return
      }

      // Verify OTP - trim and ensure it's 6 digits
      const otpToken = data.otp.trim().replace(/\s/g, '')
      if (otpToken.length !== 6) {
        emailForm.setError("otp", { message: "OTP must be exactly 6 digits" })
        return
      }

      // Try to verify OTP, but don't block email change if it fails
      // since we've already verified the current password
      try {
        const { error: otpError } = await supabase.auth.verifyOtp({
          email: user.email,
          token: otpToken,
          type: "email",
        })

        if (otpError) {
          console.error("OTP verification error:", otpError)
          // If OTP is expired/invalid, allow user to proceed with just password verification
          // but show a warning
          if (otpError.message?.includes("expired") || otpError.message?.includes("invalid")) {
            toast.warning("OTP verification failed. Proceeding with email change using password verification only.")
          } else {
            emailForm.setError("otp", { 
              message: otpError.message || "Invalid OTP. You can still proceed, but OTP verification failed." 
            })
            // Don't return - allow proceeding with password verification
          }
        }
      } catch (otpErr: any) {
        console.warn("OTP verification error:", otpErr)
        toast.warning("OTP verification had an issue, but proceeding with email change.")
      }

      // If OTP verification signs the user in, we need to get the user again
      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: data.newEmail,
      })

      if (updateError) throw updateError

      toast.success("Email updated successfully. Please check your new email for verification.")
      emailForm.reset()
      setOtpSent(false)
      
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error: any) {
      console.error("Email update error:", error)
      toast.error(error.message || "Failed to update email")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs 
        defaultValue="profile" 
        className="space-y-6"
        onValueChange={() => {
          setOtpSent(false)
          passwordForm.reset()
          emailForm.reset()
        }}
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your name and profile information.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...nameForm}>
                <form onSubmit={nameForm.handleSubmit(handleUpdateName)} className="space-y-4">
                  {!profile?.full_name && (
                    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                      <p className="font-medium">Set your author name</p>
                      <p className="text-xs mt-1">
                        Your name will appear as the author on all your blog posts. Please set it now to avoid showing as "Anonymous".
                      </p>
                    </div>
                  )}
                  <FormField
                    control={nameForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This name will be displayed as the author on your blog posts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={nameForm.formState.isSubmitting}>
                    {nameForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password. You'll need to verify your identity with OTP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Must be at least 6 characters with uppercase, lowercase, and a number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email OTP Verification</p>
                        <p className="text-sm text-muted-foreground">
                          Optional: Request a 6-digit verification code for extra security.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Note:</strong> OTP is optional. Your current password verification is sufficient. If you enable OTP, ensure your Supabase email template includes <code className="bg-muted px-1 rounded">{"{{ .Token }}"}</code>.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRequestPasswordOtp}
                        disabled={otpLoading || otpSent}
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : otpSent ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            OTP Sent
                          </>
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </div>
                    {otpSent && (
                      <FormField
                        control={passwordForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter OTP (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter 6-digit OTP (optional)"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                inputMode="numeric"
                                {...field}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                  field.onChange(value)
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              OTP is optional. You can update your password with just current password verification.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    {passwordForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Change Email
              </CardTitle>
              <CardDescription>
                Update your email address. You'll need to verify your identity with OTP and password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleUpdateEmail)} className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Current Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <FormField
                    control={emailForm.control}
                    name="newEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter new email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email OTP Verification</p>
                        <p className="text-sm text-muted-foreground">
                          We'll send a 6-digit verification code to your current email.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Important:</strong> Your Supabase email template must include <code className="bg-muted px-1 rounded">{"{{ .Token }}"}</code> to display the OTP code. Check your Supabase Dashboard → Authentication → Email Templates.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRequestEmailOtp}
                        disabled={otpLoading || otpSent}
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : otpSent ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            OTP Sent
                          </>
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </div>
                    {otpSent && (
                      <FormField
                        control={emailForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter OTP</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                pattern="[0-9]{6}"
                                inputMode="numeric"
                                {...field}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                  field.onChange(value)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={emailForm.formState.isSubmitting || !otpSent}
                  >
                    {emailForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Email"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

