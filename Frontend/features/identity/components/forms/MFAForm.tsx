/**
 * MFA Form - Multi-Factor Authentication Setup and Verification
 * Simplified version that works with existing hooks
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Smartphone, Key } from "lucide-react";
import { useMfa } from "../../hooks/useMfa";

// ============================================================================
// TYPES
// ============================================================================

interface MFAFormProps {
  mode?: "setup" | "verify";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MFAForm({
  mode = "setup",
  onSuccess,
  onCancel,
  className = "",
}: MFAFormProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");

  const {
    setupMfa,
    verifyMfaSetup,
    disableMfa,
    isLoading,
    error,
    qrCodeData,
    mfaEnabled,
  } = useMfa();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSetup = async () => {
    try {
      await setupMfa();
      onSuccess?.();
    } catch (err) {
      console.error("MFA setup failed:", err);
    }
  };

  const handleVerify = async () => {
    try {
      await verifyMfaSetup(verificationCode);
      onSuccess?.();
    } catch (err) {
      console.error("MFA verification failed:", err);
    }
  };

  const handleDisable = async () => {
    try {
      await disableMfa(password);
      onSuccess?.();
    } catch (err) {
      console.error("MFA disable failed:", err);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSetupMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Setup Two-Factor Authentication
        </h2>
        <p className="text-muted-foreground">
          Secure your account with an additional layer of protection
        </p>
      </div>

      {qrCodeData && (
        <div className="text-center p-4 neomorphic-inset rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Scan this QR code with your authenticator app
          </p>
          {/* QR Code would go here */}
          <div className="w-32 h-32 bg-muted mx-auto rounded-lg flex items-center justify-center">
            <Key className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Verification Code
        </label>
        <Input
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="neomorphic-input"
          maxLength={6}
        />
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleVerify}
          disabled={isLoading || verificationCode.length !== 6}
          className="neomorphic-primary flex-1"
        >
          {isLoading ? "Verifying..." : "Verify & Enable"}
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="neomorphic-button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderVerifyMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Enter Verification Code
        </h2>
        <p className="text-muted-foreground">
          Check your authenticator app for the 6-digit code
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Verification Code
        </label>
        <Input
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="000000"
          className="neomorphic-input text-center text-2xl tracking-widest"
          maxLength={6}
        />
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleVerify}
          disabled={isLoading || verificationCode.length !== 6}
          className="neomorphic-primary flex-1"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="neomorphic-button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderDisableMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Disable Two-Factor Authentication
        </h2>
        <p className="text-muted-foreground">
          Enter your password to disable MFA
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="neomorphic-input"
        />
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleDisable}
          disabled={isLoading || !password}
          className="neomorphic-primary flex-1"
        >
          {isLoading ? "Disabling..." : "Disable MFA"}
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="neomorphic-button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-6 max-w-md mx-auto ${className}`}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {mode === "setup" && !mfaEnabled && renderSetupMode()}
      {mode === "verify" && renderVerifyMode()}
      {mode === "setup" && mfaEnabled && renderDisableMode()}
    </div>
  );
}

export default MFAForm;
