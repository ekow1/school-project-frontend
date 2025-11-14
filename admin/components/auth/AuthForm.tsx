"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { User, Lock, LogIn, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { authSchema, type AuthFormData } from "@/lib/types/auth";
import { resolveDashboardPath } from "@/lib/constants/roles";
import {
  useFirePersonnelAuthStore,
  selectFirePersonnelUser,
  selectFirePersonnelIsLoading,
  selectFirePersonnelError,
} from "@/lib/stores/firePersonnelAuth";
import { useRouter } from "next/navigation";

const AuthForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const login = useFirePersonnelAuthStore((state) => state.login);
  const clearError = useFirePersonnelAuthStore((state) => state.clearError);
  const loading = useFirePersonnelAuthStore(selectFirePersonnelIsLoading);
  const error = useFirePersonnelAuthStore(selectFirePersonnelError);
  const user = useFirePersonnelAuthStore(selectFirePersonnelUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    clearError();
    return clearError;
  }, [clearError]);

  // Redirect after successful login
  useEffect(() => {
    if (user && !loading) {
      const dashboardPath = resolveDashboardPath(user.role) || "/dashboard";
      router.replace(dashboardPath);
    }
  }, [user, loading, router]);

  const onSubmit = async (data: AuthFormData) => {
    try {
      clearError();
      await login(data);
      toast.success("Login successful!");
      reset();
    } catch (err) {
      // Error is already set in the store, toast will show it
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Service Number Field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Service Number
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Enter your service number"
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Enter your password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
};

export default AuthForm;

