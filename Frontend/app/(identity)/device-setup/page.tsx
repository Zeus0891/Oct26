"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { DeviceRegistrationForm } from "@/features/identity/components/forms";
import {
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Info,
} from "lucide-react";

export default function DeviceSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const isRequired = searchParams.get("required") === "true";
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);

    toast.success("Device registered successfully! 📱", {
      style: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
      },
      duration: 4000,
    });

    // Redirect after success
    setTimeout(() => {
      router.push(redirect);
    }, 2500);
  };

  const handleCancel = () => {
    if (isRequired) {
      router.push("/login");
    } else {
      router.push(redirect);
    }
  };

  const handleSkip = () => {
    if (!isRequired) {
      router.push(redirect);
    }
  };

  if (isRegistered) {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0f172a,-12px_-12px_24px_#334155] flex items-center justify-center animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Device Registered!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            This device has been successfully added to your trusted devices
          </p>
        </div>

        <div className="bg-cyan-50/50 dark:bg-cyan-900/20 rounded-2xl p-6 border border-cyan-200/30 dark:border-cyan-800/30">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-cyan-500 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2">
                Enhanced Security Active
              </h3>
              <ul className="text-sm text-cyan-600 dark:text-cyan-400 space-y-1">
                <li>• This device is now recognized and trusted</li>
                <li>• Reduced authentication friction for future logins</li>
                <li>• Monitor device activity in your security settings</li>
                <li>• Receive alerts for unrecognized device access</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          Redirecting to your dashboard...
        </div>

        <div className="w-8 h-8 mx-auto">
          <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 border border-white/40 dark:border-slate-700/40"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isRequired ? "Back to Login" : "Cancel"}
        </button>

        <div className="inline-flex items-center px-4 py-2 bg-cyan-50/50 dark:bg-cyan-900/20 rounded-full border border-cyan-200/30 dark:border-cyan-800/30">
          <Smartphone className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mr-2" />
          <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
            Device Registration
          </span>
        </div>
      </div>

      {/* Required Notice */}
      {isRequired && (
        <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200/30 dark:border-amber-800/30">
          <div className="flex items-start space-x-4">
            <Info className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                Device Registration Required
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Your organization requires device registration for enhanced
                security. This helps protect against unauthorized access and
                ensures compliance with security policies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-cyan-500" />
          Why register this device?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: "🔒",
              title: "Enhanced Security",
              description:
                "Device fingerprinting helps detect unauthorized access attempts",
            },
            {
              icon: "⚡",
              title: "Faster Login",
              description:
                "Skip additional verification steps on trusted devices",
            },
            {
              icon: "📊",
              title: "Activity Monitoring",
              description:
                "Track and monitor account access across all your devices",
            },
            {
              icon: "🚨",
              title: "Breach Alerts",
              description:
                "Get notified immediately of suspicious login attempts",
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-[2px_2px_4px_#e2e8f0,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/40 dark:border-slate-700/40"
            >
              <div className="text-2xl">{benefit.icon}</div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {benefit.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Registration Form */}
      <DeviceRegistrationForm
        onSuccess={handleRegistrationSuccess}
        onCancel={handleCancel}
        className="w-full"
      />

      {/* Actions */}
      {!isRequired && (
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors underline"
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-center space-y-4">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Device information is encrypted and used solely for security purposes.{" "}
          <Link
            href="/privacy#device-data"
            className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
          >
            Learn more about device data
          </Link>
        </div>

        <div className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-slate-800/40 rounded-xl shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] dark:shadow-[2px_2px_4px_#0f172a,-2px_-2px_4px_#334155] border border-white/30 dark:border-slate-700/30">
          <Shield className="w-3 h-3 text-green-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            GDPR Compliant • SOC 2 Certified • End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
