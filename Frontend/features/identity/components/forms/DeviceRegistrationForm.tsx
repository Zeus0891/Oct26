"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Smartphone,
  Monitor,
  Tablet,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Fingerprint,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useDevices } from "../../hooks/useDevices";

const deviceRegistrationSchema = z.object({
  name: z
    .string()
    .min(1, "Device name is required")
    .max(50, "Max 50 characters"),
  type: z.enum(["web", "mobile", "desktop", "tablet"], {
    message: "Please select a device type",
  }),
  trusted: z.boolean().optional(),
});

type DeviceRegistrationFormData = z.infer<typeof deviceRegistrationSchema>;

interface DeviceInfo {
  userAgent: string;
  platform: string;
  fingerprint: string;
  ipAddress?: string;
  location?: string;
}

interface DeviceRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const DeviceRegistrationForm: React.FC<DeviceRegistrationFormProps> = ({
  onSuccess,
  onCancel,
  className = "",
}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const { registerDevice, isOperating, error } = useDevices();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DeviceRegistrationFormData>({
    resolver: zodResolver(deviceRegistrationSchema),
    defaultValues: {
      trusted: false,
    },
  });

  // Analyze device information
  useEffect(() => {
    const getBrowserName = (): string => {
      const ua = navigator.userAgent;

      if (ua.includes("Chrome")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari")) return "Safari";
      if (ua.includes("Edge")) return "Edge";

      return "Browser";
    };

    const getOSName = (platform: string): string => {
      if (platform.includes("Win")) return "Windows";
      if (platform.includes("Mac")) return "macOS";
      if (platform.includes("Linux")) return "Linux";
      if (platform.includes("iPhone") || platform.includes("iPad"))
        return "iOS";
      if (platform.includes("Android")) return "Android";

      return platform;
    };

    const generateDeviceName = (platform: string): string => {
      const browserName = getBrowserName();
      const osName = getOSName(platform);

      return `${browserName} on ${osName}`;
    };

    const analyzeDevice = async () => {
      setIsAnalyzing(true);

      try {
        // Get device information
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;

        // Generate device fingerprint (simplified)
        const fingerprint = await generateDeviceFingerprint();

        // Try to get IP and location (mock data for demo)
        const ipAddress = await getMockIPAddress();
        const location = await getMockLocation();

        // Detect device type
        const detectedType = detectDeviceType(userAgent);

        // Generate default name
        const defaultName = generateDeviceName(platform);

        const info: DeviceInfo = {
          userAgent,
          platform,
          fingerprint,
          ipAddress,
          location,
        };

        setDeviceInfo(info);
        setValue("type", detectedType);
        setValue("name", defaultName);
      } catch (err) {
        console.error("Failed to analyze device:", err);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeDevice();
  }, [setValue]);

  const generateDeviceFingerprint = async (): Promise<string> => {
    // Mock fingerprint generation
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || "0",
    ];

    return btoa(components.join("|")).substring(0, 32);
  };

  const getMockIPAddress = async (): Promise<string> => {
    // Mock IP address
    return `192.168.1.${Math.floor(Math.random() * 255)}`;
  };

  const getMockLocation = async (): Promise<string> => {
    // Mock location
    const locations = ["New York, US", "London, UK", "Tokyo, JP", "Sydney, AU"];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const detectDeviceType = (
    userAgent: string
  ): "web" | "mobile" | "desktop" | "tablet" => {
    const ua = userAgent.toLowerCase();

    if (ua.includes("mobile")) return "mobile";
    if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
    if (ua.includes("electron")) return "desktop";

    return "web";
  };

  const onSubmit = async (data: DeviceRegistrationFormData) => {
    if (!deviceInfo) return;

    try {
      const request = {
        deviceName: data.name,
        requestVerification: !data.trusted,
        capabilities: {
          isMobile: data.type === "mobile",
          isTablet: data.type === "tablet",
          isDesktop: data.type === "desktop",
          isWeb: data.type === "web",
          hasFingerprint: Boolean(deviceInfo.fingerprint),
          isTrusted: data.trusted || false,
          hasUserAgent: Boolean(deviceInfo.userAgent),
          hasLocation: Boolean(deviceInfo.location),
        },
      };

      await registerDevice(request);
      onSuccess?.();
    } catch (err) {
      console.error("Device registration failed:", err);
    }
  };

  if (isAnalyzing) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center">
              <Fingerprint className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
              Analyzing Device
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Gathering device information for security...
            </p>
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Register Device
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Add this device to your trusted devices
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
          {/* Device Info Card */}
          {deviceInfo && (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_#e2e8f0,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                <Fingerprint className="w-5 h-5 mr-2" />
                Device Information
              </h3>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    Platform:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {deviceInfo.platform}
                  </span>
                </div>

                {deviceInfo.ipAddress && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      IP Address:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {deviceInfo.ipAddress}
                    </span>
                  </div>
                )}

                {deviceInfo.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      Location:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {deviceInfo.location}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400">
                    Fingerprint:
                  </span>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-inner">
                      {showFingerprint
                        ? deviceInfo.fingerprint
                        : "••••••••••••••••"}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowFingerprint(!showFingerprint)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showFingerprint ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Device Name */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Device Name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Enter device name"
              className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            />
            {errors.name && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Device Type */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Device Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "web",
                  label: "Web Browser",
                  icon: <Monitor className="w-5 h-5" />,
                },
                {
                  value: "mobile",
                  label: "Mobile",
                  icon: <Smartphone className="w-5 h-5" />,
                },
                {
                  value: "tablet",
                  label: "Tablet",
                  icon: <Tablet className="w-5 h-5" />,
                },
                {
                  value: "desktop",
                  label: "Desktop App",
                  icon: <Monitor className="w-5 h-5" />,
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="relative flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-[4px_4px_8px_#e2e8f0,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#e2e8f0,-6px_-6px_12px_#ffffff] transition-all duration-300 cursor-pointer border border-white/40 dark:border-slate-700/40"
                >
                  <input
                    {...register("type")}
                    type="radio"
                    value={option.value}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="text-slate-600 dark:text-slate-400">
                      {option.icon}
                    </div>
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {option.label}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 ring-opacity-0 peer-checked:ring-opacity-100 transition-all duration-200" />
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Trust Device Option */}
          <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
            <label className="flex items-start space-x-4 cursor-pointer">
              <input
                {...register("trusted")}
                type="checkbox"
                className="mt-1 rounded border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 shadow-sm"
              />
              <div>
                <div className="font-semibold text-blue-700 dark:text-blue-300 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Mark as Trusted Device
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Trusted devices can skip MFA verification for 30 days. Only
                  enable this on your personal devices.
                </p>
              </div>
            </label>
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
              disabled={isOperating}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
            >
              {isOperating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Register Device
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
          <Lock className="w-4 h-4 text-blue-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Device registration helps secure your account
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceRegistrationForm;
