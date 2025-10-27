// ============================================================================
// TWO FACTOR SETUP COMPONENT
// ============================================================================
// Setup and management of two-factor authentication
// ============================================================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Shield,
  Smartphone,
  QrCode,
  Key,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TwoFactorSetupProps {
  isEnabled?: boolean;
  onSetupComplete?: (backupCodes: string[]) => void;
  onDisable?: () => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TwoFactorSetup({
  isEnabled = false,
  onSetupComplete,
  onDisable,
  className = "",
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<
    "initial" | "qr" | "verify" | "backup" | "complete"
  >("initial");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes] = useState([
    "ABC123DEF",
    "GHI456JKL",
    "MNO789PQR",
    "STU012VWX",
    "YZ3456ABC",
  ]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleStartSetup = () => {
    setStep("qr");
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setStep("backup");
    }
  };

  const handleCompleteSetup = () => {
    setStep("complete");
    onSetupComplete?.(backupCodes);
  };

  const handleDisable = () => {
    onDisable?.();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderInitialStep = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center mx-auto">
        <Shield className="w-8 h-8 text-primary" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Enable Two-Factor Authentication
        </h3>
        <p className="text-muted-foreground mt-2">
          Add an extra layer of security to your account using an authenticator
          app
        </p>
      </div>

      <div className="neomorphic-inset p-4 rounded-lg text-left">
        <h4 className="font-medium text-foreground mb-3">What youll need:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center">
            <Smartphone className="w-4 h-4 mr-3 text-primary" />
            An authenticator app (Google Authenticator, Authy, etc.)
          </li>
          <li className="flex items-center">
            <QrCode className="w-4 h-4 mr-3 text-primary" />
            Ability to scan QR codes
          </li>
          <li className="flex items-center">
            <Key className="w-4 h-4 mr-3 text-primary" />A secure place to store
            backup codes
          </li>
        </ul>
      </div>

      <Button onClick={handleStartSetup} className="neomorphic-primary w-full">
        Start Setup
      </Button>
    </div>
  );

  const renderQrStep = () => (
    <div className="text-center space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Scan QR Code</h3>
      <p className="text-muted-foreground">
        Use your authenticator app to scan this QR code
      </p>

      <div className="neomorphic-inset p-6 rounded-lg">
        <div className="w-48 h-48 bg-muted flex items-center justify-center mx-auto rounded-lg">
          <QrCode className="w-16 h-16 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Cant scan? Enter this code manually: ABC123DEF456GHI
        </p>
      </div>

      <Button
        onClick={() => setStep("verify")}
        className="neomorphic-primary w-full"
      >
        Ive Added the Account
      </Button>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">Verify Setup</h3>
        <p className="text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className="space-y-3">
        <Input
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="000000"
          className="neomorphic-input text-center text-lg tracking-wider"
          maxLength={6}
        />

        <Button
          onClick={handleVerifyCode}
          disabled={verificationCode.length !== 6}
          className="neomorphic-primary w-full"
        >
          Verify Code
        </Button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground">Almost Done!</h3>
        <p className="text-muted-foreground">
          Save these backup codes in a secure location
        </p>
      </div>

      <div className="neomorphic-inset p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground">Backup Codes</h4>
          <Button className="neomorphic-button" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-1 font-mono text-sm">
          {backupCodes.map((code, index) => (
            <div key={index} className="p-2 bg-muted/30 rounded text-center">
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="neomorphic-inset p-3 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Important:</p>
            <p className="text-muted-foreground">
              Each backup code can only be used once. Store them safely!
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button className="neomorphic-button flex-1" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={handleCompleteSetup}
          className="neomorphic-primary flex-1"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Two-Factor Authentication Enabled!
        </h3>
        <p className="text-muted-foreground">
          Your account is now more secure with 2FA protection
        </p>
      </div>
    </div>
  );

  const renderEnabledState = () => (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Shield className="w-6 h-6 text-green-600" />
      </div>

      <div>
        <h3 className="font-semibold text-foreground">2FA is Enabled</h3>
        <p className="text-sm text-muted-foreground">
          Your account is protected with two-factor authentication
        </p>
      </div>

      <div className="flex space-x-3">
        <Button className="neomorphic-button flex-1" size="sm">
          View Backup Codes
        </Button>
        <Button
          onClick={handleDisable}
          className="neomorphic-button text-red-600 flex-1"
          size="sm"
        >
          Disable 2FA
        </Button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`neomorphic-card p-6 ${className}`}>
      {isEnabled ? (
        renderEnabledState()
      ) : (
        <>
          {step === "initial" && renderInitialStep()}
          {step === "qr" && renderQrStep()}
          {step === "verify" && renderVerifyStep()}
          {step === "backup" && renderBackupStep()}
          {step === "complete" && renderCompleteStep()}
        </>
      )}
    </div>
  );
}

export default TwoFactorSetup;
