"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, Mail, Lock, ArrowRight, Sparkles, KeyRound } from "lucide-react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, otpLoginSchema, type LoginFormData, type OtpLoginFormData } from "@/lib/validations/auth"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"

export default function Page() {
  const router = useRouter()
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password")
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  const passwordForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const otpForm = useForm<OtpLoginFormData>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  })

  const isPasswordLoading = passwordForm.formState.isSubmitting
  const isOtpLoading = otpForm.formState.isSubmitting

  const handlePasswordLogin = async (data: LoginFormData) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      router.push("/protected")
    } catch (error: unknown) {
      passwordForm.setError("root", {
        message: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleRequestOtp = async () => {
    const email = otpForm.getValues("email")
    if (!email) {
      otpForm.setError("email", { message: "Email is required" })
      return
    }

    const supabase = createClient()
    setOtpLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) throw error

      setOtpSent(true)
      toast.success("OTP sent to your email. Please check your inbox for the 8-digit code.")
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again."
      )
    } finally {
      setOtpLoading(false)
    }
  }

  const handleOtpLogin = async (data: OtpLoginFormData) => {
    const supabase = createClient()

    try {
      const otpToken = data.otp.trim().replace(/\s/g, "")
      if (otpToken.length !== 8) {
        otpForm.setError("otp", { message: "OTP must be exactly 8 digits" })
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        email: data.email,
        token: otpToken,
        type: "email",
      })

      if (error) throw error

      toast.success("Login successful!")
      router.push("/protected")
    } catch (error: unknown) {
      otpForm.setError("root", {
        message: error instanceof Error ? error.message : "Invalid OTP. Please try again.",
      })
    }
  }

  const handleModeChange = (mode: "password" | "otp") => {
    setLoginMode(mode)
    setOtpSent(false)
    otpForm.reset()
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-background/85 backdrop-blur-sm" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-8"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            >
              <LogIn className="h-8 w-8 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to continue your journey with Editorial. Access your dashboard and start creating.
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
              <CardDescription>Choose your preferred login method</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={loginMode} onValueChange={(value) => handleModeChange(value as "password" | "otp")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </TabsTrigger>
                  <TabsTrigger value="otp" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Email OTP
                  </TabsTrigger>
                </TabsList>

                {/* Password Login */}
                <TabsContent value="password" className="mt-4">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="h-11"
                                disabled={isPasswordLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="h-11"
                                disabled={isPasswordLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {passwordForm.formState.errors.root && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                        >
                          {passwordForm.formState.errors.root.message}
                        </motion.div>
                      )}
                      <Button type="submit" className="w-full h-11 text-base" disabled={isPasswordLoading}>
                        {isPasswordLoading ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                            />
                            Signing in...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* OTP Login */}
                <TabsContent value="otp" className="mt-4">
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(handleOtpLogin)} className="space-y-4">
                      <FormField
                        control={otpForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="h-11"
                                disabled={isOtpLoading || otpSent}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {!otpSent ? (
                        <Button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={otpLoading || !otpForm.watch("email")}
                          className="w-full h-11 text-base"
                          variant="outline"
                        >
                          {otpLoading ? (
                            <span className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                              />
                              Sending OTP...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Send OTP Code
                              <Mail className="h-4 w-4" />
                            </span>
                          )}
                        </Button>
                      ) : (
                        <>
                          <FormField
                            control={otpForm.control}
                            name="otp"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <KeyRound className="h-4 w-4" />
                                  Enter OTP Code
                                </FormLabel>
                                <FormControl>
                                  <InputOTP
                                    maxLength={8}
                                    disabled={isOtpLoading}
                                    {...field}
                                  >
                                    <InputOTPGroup>
                                      <InputOTPSlot index={0} />
                                      <InputOTPSlot index={1} />
                                      <InputOTPSlot index={2} />
                                      <InputOTPSlot index={3} />
                                      <InputOTPSlot index={4} />
                                      <InputOTPSlot index={5} />
                                      <InputOTPSlot index={6} />
                                      <InputOTPSlot index={7} />
                                    </InputOTPGroup>
                                  </InputOTP>
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Check your email for the 8-digit code
                                </p>
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setOtpSent(false)
                                otpForm.setValue("otp", "")
                              }}
                              className="flex-1"
                              disabled={isOtpLoading}
                            >
                              Change Email
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleRequestOtp}
                              className="flex-1"
                              disabled={otpLoading || isOtpLoading}
                            >
                              {otpLoading ? "Resending..." : "Resend OTP"}
                            </Button>
                          </div>
                          {otpForm.formState.errors.root && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                            >
                              {otpForm.formState.errors.root.message}
                            </motion.div>
                          )}
                          <Button type="submit" className="w-full h-11 text-base" disabled={isOtpLoading}>
                            {isOtpLoading ? (
                              <span className="flex items-center gap-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                                />
                                Verifying...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Verify & Sign In
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </>
                      )}
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Create one now
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 gap-3 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Access your personalized dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Create and manage your stories</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Track your writing progress</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
