"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authSchema, registerSchema, type AuthFormData, type RegisterFormData } from "@/lib/types/auth"
import { useAuthStore } from "@/lib/stores/auth"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Toaster } from "react-hot-toast"
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus, Shield, Users, AlertTriangle, Clock } from "lucide-react"

const AuthPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const { login, register, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const router = useRouter()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AuthFormData | RegisterFormData>({
    resolver: zodResolver(isRegisterMode ? registerSchema : authSchema),
  })

  const onSubmit = async (data: AuthFormData | RegisterFormData) => {
    try {
      clearError()
      if (isRegisterMode) {
        await register(data as RegisterFormData)
        toast.success("Account created successfully!")
        router.push("/dashboard")
      } else {
        await login(data as AuthFormData)
        toast.success("Login successful!")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed")
    }
  }

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    reset()
    clearError()
  }

  const password = watch("password")

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Column - Image/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 to-red-700">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">GNFS Portal</h1>
                <p className="text-red-100 text-sm">Ghana National Fire Service</p>
              </div>
            </div>

            <div className="space-y-6 text-white">
              <div>
                <h2 className="text-3xl font-bold mb-4">Secure Access Portal</h2>
                <p className="text-red-100 text-lg leading-relaxed">
                  Manage operations, track incidents, and coordinate personnel with our unified platform.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-red-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-red-100">Role-based access control for all stations</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-red-100">Real-time incident tracking and management</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-red-100">Optimized for fast, reliable operations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-red-100 text-sm">
            <p className="font-semibold mb-2">Demo Credentials Available</p>
            <p>Use the demo accounts below to explore the system</p>
          </div>
        </div>

        {/* Right Column - Form and Credentials */}
        <div className="flex flex-col overflow-y-auto">
          {/* Form Section */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {isRegisterMode ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isRegisterMode ? "Sign up to access the GNFS portal" : "Sign in to your account to continue"}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-red-600 transition-colors" />
                    <input
                      {...registerForm("email")}
                      type="email"
                      id="email"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-red-600 transition-colors" />
                    <input
                      {...registerForm("password")}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field (Register only) */}
                {isRegisterMode && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        {...registerForm("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {"confirmPassword" in errors && errors.confirmPassword && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Role Selection (Register only) */}
                {isRegisterMode && (
                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select Your Role
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        {...registerForm("role")}
                        id="role"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all duration-200 appearance-none"
                      >
                        <option value="">Choose your role</option>
                        <option value="SuperAdmin">Super Admin</option>
                        <option value="Admin">Station Admin</option>
                        <option value="Operations">Operations</option>
                        <option value="Safety">Safety Officer</option>
                        <option value="PR">Public Relations</option>
                      </select>
                    </div>
                    {"role" in errors && errors.role && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {isRegisterMode ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                      {isRegisterMode ? "Create Account" : "Sign In"}
                    </>
                  )}
                </button>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {isRegisterMode ? "Already have an account?" : "Don't have an account?"}
                  </p>
                  <button
                    onClick={toggleMode}
                    type="button"
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold text-sm transition-colors"
                  >
                    {isRegisterMode ? "Sign In Instead" : "Create Account Instead"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Demo Credentials Section */}
          {!isRegisterMode && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-6 lg:p-12 bg-gray-50 dark:bg-gray-900/50">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Demo Credentials</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Click any credential to auto-fill the form
                </p>

                <div className="space-y-3">
                  {/* SuperAdmin */}
                  <button
                    type="button"
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-700 transition-colors text-left"
                    onClick={() => {
                      const emailInput = document.getElementById("email") as HTMLInputElement
                      const passwordInput = document.getElementById("password") as HTMLInputElement
                      if (emailInput && passwordInput) {
                        emailInput.value = "superadmin@gnfs.gov.gh"
                        passwordInput.value = "password123"
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Super Admin</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">superadmin@gnfs.gov.gh</div>
                      </div>
                    </div>
                  </button>

                  {/* Admin */}
                  <button
                    type="button"
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-left"
                    onClick={() => {
                      const emailInput = document.getElementById("email") as HTMLInputElement
                      const passwordInput = document.getElementById("password") as HTMLInputElement
                      if (emailInput && passwordInput) {
                        emailInput.value = "admin@gnfs.gov.gh"
                        passwordInput.value = "password123"
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Station Admin</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@gnfs.gov.gh</div>
                      </div>
                    </div>
                  </button>

                  {/* Operations */}
                  <button
                    type="button"
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-700 transition-colors text-left"
                    onClick={() => {
                      const emailInput = document.getElementById("email") as HTMLInputElement
                      const passwordInput = document.getElementById("password") as HTMLInputElement
                      if (emailInput && passwordInput) {
                        emailInput.value = "operations@gnfs.gov.gh"
                        passwordInput.value = "password123"
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Operations</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">operations@gnfs.gov.gh</div>
                      </div>
                    </div>
                  </button>

                  {/* Watchroom */}
                  <button
                    type="button"
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors text-left"
                    onClick={() => {
                      const emailInput = document.getElementById("email") as HTMLInputElement
                      const passwordInput = document.getElementById("password") as HTMLInputElement
                      if (emailInput && passwordInput) {
                        emailInput.value = "watchroom@gnfs.gov.gh"
                        passwordInput.value = "password123"
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Watchroom</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">watchroom@gnfs.gov.gh</div>
                      </div>
                    </div>
                  </button>

                  {/* Crew */}
                  <button
                    type="button"
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-teal-300 dark:hover:border-teal-700 transition-colors text-left"
                    onClick={() => {
                      const emailInput = document.getElementById("email") as HTMLInputElement
                      const passwordInput = document.getElementById("password") as HTMLInputElement
                      if (emailInput && passwordInput) {
                        emailInput.value = "crew@gnfs.gov.gh"
                        passwordInput.value = "password123"
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Crew</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">crew@gnfs.gov.gh</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default AuthPage