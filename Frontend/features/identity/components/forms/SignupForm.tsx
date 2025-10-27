/**
 * SignupForm Component - Modern Registration Form
 * Aligned with auth module architecture
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, User, Shield } from "lucide-react";
import { useIdentityStore } from "@/features/identity/stores/identityStore";
import { registerSchema, getPasswordStrength } from "../../validators";
import type { RegisterRequest } from "../../types";

interface SignupFormProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  className = "",
  onSuccess,
  onError,
}) => {
  // State
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks
  const router = useRouter();
  const { register: registerUser, isLoading } = useIdentityStore();

  // Handlers
  const handleInputChange =
    (field: keyof RegisterRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate with schema
    const schemaValidation = registerSchema.safeParse({
      ...formData,
      confirmPassword,
    });

    if (!schemaValidation.success) {
      schemaValidation.error.issues.forEach((error) => {
        const field = error.path[0] as string;
        newErrors[field] = error.message;
      });
    }

    // Custom password confirmation validation
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      console.log("🔍 SignupForm: Attempting registration with identity store");
      await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      toast.success("Welcome aboard! 🚀", {
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        },
      });

      onSuccess?.();
      router.push("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";

      toast.error(errorMessage, {
        style: {
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          color: "white",
        },
      });

      onError?.(errorMessage);
    }
  };

  // Get password strength for UI
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
      {/* First Name Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4" />
          First Name
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange("firstName")}
            className={`w-full px-4 py-3.5 bg-white/50 backdrop-blur-sm border ${
              errors.firstName ? "border-red-400/50" : "border-white/30"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 shadow-inner placeholder-gray-500/70 text-gray-800`}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none"></div>
        </div>
        {errors.firstName && (
          <p className="text-sm text-red-500 font-medium flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.firstName}
          </p>
        )}
      </div>

      {/* Last Name Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4" />
          Last Name
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange("lastName")}
            className={`w-full px-4 py-3.5 bg-white/50 backdrop-blur-sm border ${
              errors.lastName ? "border-red-400/50" : "border-white/30"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 shadow-inner placeholder-gray-500/70 text-gray-800`}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none"></div>
        </div>
        {errors.lastName && (
          <p className="text-sm text-red-500 font-medium flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.lastName}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className={`w-full px-4 py-3.5 bg-white/50 backdrop-blur-sm border ${
              errors.email ? "border-red-400/50" : "border-white/30"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 shadow-inner placeholder-gray-500/70 text-gray-800`}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none"></div>
        </div>
        {errors.email && (
          <p className="text-sm text-red-500 font-medium flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className={`w-full px-4 py-3.5 pr-12 bg-white/50 backdrop-blur-sm border ${
              errors.password ? "border-red-400/50" : "border-white/30"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 shadow-inner placeholder-gray-500/70 text-gray-800`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none"></div>
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full ${
                    level <= passwordStrength.score
                      ? passwordStrength.color
                      : "bg-gray-200"
                  } transition-colors duration-300`}
                />
              ))}
            </div>
            {passwordStrength.label && (
              <p className="text-xs font-medium text-gray-600">
                Strength: {passwordStrength.label}
              </p>
            )}
          </div>
        )}

        {errors.password && (
          <p className="text-sm text-red-500 font-medium flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`w-full px-4 py-3.5 pr-12 bg-white/50 backdrop-blur-sm border ${
              errors.confirmPassword ? "border-red-400/50" : "border-white/30"
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 shadow-inner placeholder-gray-500/70 text-gray-800`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none"></div>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 font-medium flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Creating account...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Create Account
          </>
        )}
      </button>
    </form>
  );
};
export default SignupForm;
