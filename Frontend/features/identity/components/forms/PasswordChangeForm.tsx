"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  Save,
} from "lucide-react";

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSuccess,
  onCancel,
  className = "",
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const newPassword = watch("newPassword", "");

  // Mock password change service
  const changePassword = async (data: PasswordChangeFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock validation
    if (data.currentPassword === "wrongpassword") {
      throw new Error("Current password is incorrect");
    }

    if (data.newPassword === data.currentPassword) {
      throw new Error("New password must be different from current password");
    }

    // Mock success
    return { success: true };
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const levels = [
      { score: 0, label: "", color: "bg-gray-300" },
      { score: 1, label: "Very Weak", color: "bg-red-500" },
      { score: 2, label: "Weak", color: "bg-orange-500" },
      { score: 3, label: "Fair", color: "bg-yellow-500" },
      { score: 4, label: "Good", color: "bg-blue-500" },
      { score: 5, label: "Strong", color: "bg-green-500" },
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await changePassword(data);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-fuchsia-500/20 rounded-full blur-xl" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Change Password
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Update your account password for better security
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
          {/* Current Password */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Current Password
            </label>
            <div className="relative">
              <input
                {...register("currentPassword")}
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter your current password"
                className="w-full px-4 py-4 pr-12 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              New Password
            </label>
            <div className="relative">
              <input
                {...register("newPassword")}
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter your new password"
                className="w-full px-4 py-4 pr-12 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full ${
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : "bg-gray-200 dark:bg-gray-600"
                      } transition-colors duration-300`}
                    />
                  ))}
                </div>
                {passwordStrength.label && (
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Strength: {passwordStrength.label}
                  </p>
                )}
              </div>
            )}

            {errors.newPassword && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                className="w-full px-4 py-4 pr-12 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
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
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Password Security Tips
            </h4>
            <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                />
                At least 8 characters long
              </div>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                />
                Include uppercase letters
              </div>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                />
                Include lowercase letters
              </div>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                />
                Include numbers
              </div>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${/[^a-zA-Z\d]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                />
                Include special characters
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-200/30">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 px-6 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
          <CheckCircle className="w-4 h-4 text-purple-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Password changes take effect immediately across all devices
          </span>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
