"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserPlus, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export default function Page() {
  const router = useRouter()
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const isLoading = form.formState.isSubmitting
  const password = form.watch("password")
  const confirmPassword = form.watch("confirmPassword")

  const handleSignUp = async (data: SignUpFormData) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/vogue-background.jpg')",
          filter: "grayscale(100%) contrast(1.1)",
        }}
      />
      {/* Overlay for readability */}
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
              <UserPlus className="h-8 w-8 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight">Join Editorial</h1>
              <p className="text-muted-foreground">
                Start your writing journey today. Create an account and begin sharing your stories with the world.
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
              <CardDescription>Sign up to start creating and publishing your stories</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                            placeholder="At least 6 characters"
                            className="h-11"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        {password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-1"
                          >
                            <div className="flex items-center gap-2 text-xs">
                              {password.length >= 6 ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                              )}
                              <span className={password.length >= 6 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                At least 6 characters
                              </span>
                            </div>
                          </motion.div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Re-enter your password"
                            className="h-11"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        {confirmPassword && password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex items-center gap-2 text-xs"
                          >
                            {password === confirmPassword ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span className="text-green-600 dark:text-green-400">Passwords match</span>
                              </>
                            ) : (
                              <>
                                <div className="h-3 w-3 rounded-full border-2 border-destructive" />
                                <span className="text-destructive">Passwords do not match</span>
                              </>
                            )}
                          </motion.div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.formState.errors.root && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                    >
                      {form.formState.errors.root.message}
                    </motion.div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base" 
                    disabled={isLoading || !form.formState.isValid}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                        />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    Sign in instead
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
              <span>Publish your stories instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Reach a global audience</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Track your writing analytics</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
