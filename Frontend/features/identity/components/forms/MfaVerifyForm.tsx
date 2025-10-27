"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Shield,
  Key,
  Smartphone,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const mfaVerifySchema = z.object({
  verificationCode: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits"),
});

type MfaVerifyFormData = z.infer<typeof mfaVerifySchema>;

interface MfaVerifyFormProps {
  onSuccess?: (verified: boolean) => void;
  onCancel?: () => void;
  allowBackupCodes?: boolean;
  className?: string;
}

export const MfaVerifyForm: React.FC<MfaVerifyFormProps> = ({
  onSuccess,
  onCancel,
  allowBackupCodes = true,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const maxAttempts = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<MfaVerifyFormData>({
    resolver: zodResolver(mfaVerifySchema),
  });

  const verificationCode = watch("verificationCode", "");

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const mockVerifyMfa = async (code: string): Promise<boolean> => {
    // Mock verification - replace with actual MFA service
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate different scenarios
    if (code === "123456" || code === "backup1") {
      return true;
    }

    if (code === "000000") {
      throw new Error("Invalid verification code");
    }

    // Random success for demo
    return Math.random() > 0.3;
  };

  const onSubmit = async (data: MfaVerifyFormData) => {
    if (cooldown > 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const verified = await mockVerifyMfa(data.verificationCode);

      if (verified) {
        onSuccess?.(true);
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= maxAttempts) {
        setCooldown(30); // 30 second cooldown
        setError("Too many failed attempts. Please wait 30 seconds.");
        reset();
      } else {
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setError(null);
    reset();
  };

  const handleRefresh = () => {
    setError(null);
    setAttempts(0);
    setCooldown(0);
    reset();
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Two-Factor Authentication
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {useBackupCode
              ? "Enter your backup recovery code"
              : "Enter the 6-digit code from your authenticator app"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
          {/* Verification Code Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              {useBackupCode ? (
                <Key className="w-4 h-4 mr-2" />
              ) : (
                <Smartphone className="w-4 h-4 mr-2" />
              )}
              {useBackupCode ? "Backup Code" : "Verification Code"}
            </label>
            <input
              {...register("verificationCode")}
              type="text"
              placeholder={useBackupCode ? "Enter backup code" : "000000"}
              maxLength={useBackupCode ? 16 : 6}
              disabled={cooldown > 0}
              className="w-full px-6 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-mono text-2xl text-center tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.verificationCode && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.verificationCode.message}
              </p>
            )}
          </div>

          {/* Code Length Indicator */}
          {!useBackupCode && verificationCode && (
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5, 6].map((position) => (
                <div
                  key={position}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    position <= verificationCode.length
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-200/30">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Attempts Warning */}
          {attempts > 0 && attempts < maxAttempts && !cooldown && (
            <div className="p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200/30">
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {maxAttempts - attempts} attempts remaining
              </p>
            </div>
          )}

          {/* Cooldown Display */}
          {cooldown > 0 && (
            <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200/30">
              <p className="text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Please wait {cooldown} seconds before trying again
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isLoading ||
              verificationCode.length < (useBackupCode ? 1 : 6) ||
              cooldown > 0
            }
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : cooldown > 0 ? (
              `Wait ${cooldown}s`
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Verify {useBackupCode ? "Backup Code" : "Code"}
              </>
            )}
          </button>

          {/* Alternative Options */}
          <div className="space-y-4">
            {allowBackupCodes && (
              <button
                type="button"
                onClick={handleToggleBackupCode}
                className="w-full py-3 px-6 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40 flex items-center justify-center"
              >
                {useBackupCode ? (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Use Authenticator Code
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Use Backup Code
                  </>
                )}
              </button>
            )}

            {/* Refresh/Reset Button */}
            {(attempts > 0 || cooldown > 0) && (
              <button
                type="button"
                onClick={handleRefresh}
                className="w-full py-3 px-6 bg-slate-100/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 font-medium rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
            )}

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-6 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30 backdrop-blur-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {useBackupCode
                ? "Each backup code can only be used once"
                : "Open your authenticator app to get the current code"}
            </span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-indigo-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Your account is protected by two-factor authentication
          </span>
        </div>
      </div>
    </div>
  );
};

export default MfaVerifyForm;
