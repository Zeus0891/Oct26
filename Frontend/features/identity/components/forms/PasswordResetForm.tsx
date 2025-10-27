"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePasswordReset } from "../../hooks/usePasswordReset";

// Schema for email step
const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

// Schema for password reset step
const passwordResetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetFormProps {
  token?: string; // If provided, go directly to reset step
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  token,
  onSuccess,
  onCancel,
  className = "",
}) => {
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [resetToken, setResetToken] = useState<string>(token || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    resetRequested,
    resetCompleted,
    isLoading,
    isOperating,
    error,
    clearState,
  } = usePasswordReset();

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  // Password reset form
  const passwordForm = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  // Handle token validation if provided
  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  // Check reset status
  useEffect(() => {
    if (resetRequested && step === "email") {
      // Show success message for email step
    }
    if (resetCompleted) {
      setStep("success");
    }
  }, [resetRequested, resetCompleted, step]);

  const validateToken = async () => {
    if (resetToken) {
      const isValid = await validateResetToken(resetToken);
      if (isValid) {
        setStep("reset");
      }
    }
  };

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      await requestPasswordReset(data.email);
    } catch (err) {
      console.error("Password reset request failed:", err);
    }
  };

  const onPasswordSubmit = async (data: PasswordResetFormData) => {
    try {
      await resetPassword(resetToken, data.newPassword, data.confirmPassword);
      onSuccess?.();
    } catch (err) {
      console.error("Password reset failed:", err);
    }
  };

  const handleBackToLogin = () => {
    clearState();
    onCancel?.();
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center">
            {step === "success" ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : (
              <Lock className="w-10 h-10 text-white" />
            )}
          </div>

          {step === "email" && (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Reset Password
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Enter your email to receive reset instructions
              </p>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Create New Password
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Enter your new secure password
              </p>
            </>
          )}

          {step === "success" && (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Password Reset Complete
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Your password has been successfully updated
              </p>
            </>
          )}
        </div>

        {/* Email Step */}
        {step === "email" && (
          <div className="space-y-6 relative">
            {!resetRequested ? (
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    {...emailForm.register("email")}
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-red-500 text-sm flex items-center font-medium">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-200/30">
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="p-6 bg-green-50/50 dark:bg-green-900/20 rounded-2xl border border-green-200/30 dark:border-green-800/30">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    We have sent password reset instructions to your email
                    address.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full py-3 px-6 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Password Reset Step */}
        {step === "reset" && (
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-6 relative"
          >
            {/* New Password */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                New Password
              </label>
              <div className="relative">
                <input
                  {...passwordForm.register("newPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full px-4 py-4 pr-12 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-sm flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...passwordForm.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-4 pr-12 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-200/30">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isOperating}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
            >
              {isOperating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="text-center space-y-6 relative">
            <div className="p-6 bg-green-50/50 dark:bg-green-900/20 rounded-2xl border border-green-200/30 dark:border-green-800/30">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">
                Password Reset Successfully!
              </h3>
              <p className="text-green-600 dark:text-green-400 mb-6">
                You can now sign in with your new password.
              </p>

              <button
                onClick={handleBackToLogin}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Continue to Login
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      {step !== "success" && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Secure password reset with email verification
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetForm;
