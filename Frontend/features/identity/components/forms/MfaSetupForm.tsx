"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  QrCode,
  Smartphone,
  Shield,
  Key,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useMfa } from "../../hooks/useMfa";

const mfaSetupSchema = z.object({
  verificationCode: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits"),
});

type MfaSetupFormData = z.infer<typeof mfaSetupSchema>;

interface MfaSetupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const MfaSetupForm: React.FC<MfaSetupFormProps> = ({
  onSuccess,
  onCancel,
  className = "",
}) => {
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { setupMfa, verifyMfaSetup, error } = useMfa();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MfaSetupFormData>({
    resolver: zodResolver(mfaSetupSchema),
  });

  const verificationCode = watch("verificationCode", "");

  useEffect(() => {
    initMfaSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initMfaSetup = async () => {
    try {
      setIsLoading(true);
      const result = await setupMfa();
      if (result) {
        setQrCode(
          ((result as Record<string, unknown>)?.qrCodeUrl as string) || null
        );
        setSecret(
          ((result as Record<string, unknown>)?.secret as string) || ""
        );
      }
    } catch (err) {
      console.error("Failed to setup MFA:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onSubmit = async (data: MfaSetupFormData) => {
    try {
      setIsLoading(true);
      await verifyMfaSetup(data.verificationCode);
      onSuccess?.();
    } catch (err) {
      console.error("MFA verification failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSecret = (secret: string) => {
    return secret.match(/.{1,4}/g)?.join(" ") || secret;
  };

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-xl" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Enable Two-Factor Authentication
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Add an extra layer of security to your account
          </p>
        </div>

        {step === "setup" && (
          <div className="space-y-6 relative">
            {/* Steps */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg">
                    1
                  </div>
                  <div className="flex-1 h-1 mx-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                  Scan QR Code
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold">
                    2
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2">
                  Verify Code
                </p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan with your authenticator app
                </h3>

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : qrCode ? (
                  <div className="bg-white p-4 rounded-2xl shadow-[4px_4px_8px_#e2e8f0,-4px_-4px_8px_#ffffff] inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="py-16 text-slate-500 dark:text-slate-400">
                    Failed to generate QR code
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry */}
            {secret && (
              <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Cannot scan? Enter this key manually
                </h4>
                <div className="flex items-center space-x-3">
                  <code className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-[inset_2px_2px_4px_#e2e8f0,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                    {formatSecret(secret)}
                  </code>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] transition-all duration-300 transform hover:scale-105"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Recommended Apps
              </h4>
              <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <div>• Google Authenticator</div>
                <div>• Microsoft Authenticator</div>
                <div>• Authy</div>
                <div>• 1Password</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-6 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep("verify")}
                disabled={!qrCode}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 relative"
          >
            {/* Steps */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg">
                    ✓
                  </div>
                  <div className="flex-1 h-1 mx-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                  QR Scanned
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-bold shadow-lg">
                    2
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                  Verify Code
                </p>
              </div>
            </div>

            {/* Verification Code */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Enter 6-digit code from your app
              </label>
              <input
                {...register("verificationCode")}
                type="text"
                placeholder="000000"
                maxLength={6}
                className="w-full px-6 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-mono text-2xl text-center tracking-widest"
              />
              {errors.verificationCode && (
                <p className="text-red-500 text-sm flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.verificationCode.message}
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

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setStep("setup")}
                className="flex-1 py-3 px-6 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Enable MFA
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Your account will be protected by military-grade encryption
          </span>
        </div>
      </div>
    </div>
  );
};

export default MfaSetupForm;
