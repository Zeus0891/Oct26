"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useProfile } from "../../hooks/useProfile";

const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "Max 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Max 50 characters"),
  displayName: z.string().max(100, "Max 100 characters").optional(),
  bio: z.string().max(500, "Max 500 characters").optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

interface ProfileUpdateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({
  onSuccess,
  onCancel,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    profile,
    updateProfile,
    uploadAvatar,
    isUpdating,
    error,
    fullName,
    initials,
  } = useProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
      phoneNumber: profile?.phoneNumber || "",
      timezone: profile?.timezone || "",
      locale: profile?.locale || "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload
      try {
        setIsUploading(true);
        await uploadAvatar(file);
      } catch (err) {
        console.error("Avatar upload failed:", err);
        setAvatarPreview(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      await updateProfile(data);
      onSuccess?.();
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const currentAvatar = avatarPreview || profile?.avatarUrl;

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-3xl p-8 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0f172a,-20px_-20px_60px_#334155] border border-white/40 dark:border-slate-600/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-xl" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Update Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Keep your information up to date
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] flex items-center justify-center text-white text-4xl font-bold cursor-pointer group hover:shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff] transition-all duration-300 transform hover:scale-105 overflow-hidden"
                onClick={handleAvatarClick}
              >
                {currentAvatar ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <span className="text-lg">{initials}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Overlay */}
              <div
                className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="px-6 py-2 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 border border-white/40 dark:border-slate-700/40 flex items-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Change Avatar"}
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <User className="w-4 h-4 mr-2" />
                First Name
              </label>
              <input
                {...register("firstName")}
                type="text"
                placeholder="Enter first name"
                className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Last Name
              </label>
              <input
                {...register("lastName")}
                type="text"
                placeholder="Enter last name"
                className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Display Name (Optional)
            </label>
            <input
              {...register("displayName")}
              type="text"
              placeholder="How should we display your name?"
              className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            />
            {errors.displayName && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Bio (Optional)
            </label>
            <textarea
              {...register("bio")}
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium resize-none"
            />
            {errors.bio && (
              <p className="text-red-500 text-sm flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Phone Number (Optional)
              </label>
              <input
                {...register("phoneNumber")}
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-200 font-medium"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Timezone */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Timezone (Optional)
              </label>
              <select
                {...register("timezone")}
                className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-[inset_6px_6px_12px_#e2e8f0,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155] border-0 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">Select timezone</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
              {errors.timezone && (
                <p className="text-red-500 text-sm flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.timezone.message}
                </p>
              )}
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
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 px-6 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] border border-white/40 dark:border-slate-700/40 flex items-center justify-center"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 flex items-center justify-center"
            >
              {isUpdating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Profile Preview */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] border border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {fullName && `Preview: ${fullName}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateForm;
