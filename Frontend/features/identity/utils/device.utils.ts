/**
 * Device Utils
 * Utility functions for device management and registration
 * Aligned with backend device tracking architecture
 */

import { DeviceInfo } from "../types/session.types";

// =============================================================================
// DEVICE DETECTION UTILS
// =============================================================================

/**
 * Get current device information
 */
export const getCurrentDeviceInfo = (): DeviceInfo => {
  return {
    deviceId: generateDeviceFingerprint(),
    deviceName: getDeviceName(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isMobile: isMobileDevice(),
    lastSeen: new Date().toISOString(),
  };
};

/**
 * Generate a unique device fingerprint
 */
export const generateDeviceFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height + "x" + screen.colorDepth,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || "",
    navigator.maxTouchPoints?.toString() || "",
  ];

  // Simple hash function
  const fingerprint = components.join("|");
  let hash = 0;

  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
};

/**
 * Get human-readable device name
 */
export const getDeviceName = (): string => {
  const userAgent = navigator.userAgent;

  // Mobile devices
  if (/iPhone/.test(userAgent)) {
    return "iPhone";
  }
  if (/iPad/.test(userAgent)) {
    return "iPad";
  }
  if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android[^;]*;[^)]*\)([^)]*)/);
    return match ? `Android ${match[1].trim()}` : "Android Device";
  }

  // Desktop browsers
  if (/Windows/.test(userAgent)) {
    return `Windows - ${getBrowserName()}`;
  }
  if (/Mac OS X/.test(userAgent)) {
    return `Mac - ${getBrowserName()}`;
  }
  if (/Linux/.test(userAgent)) {
    return `Linux - ${getBrowserName()}`;
  }

  return `${getBrowserName()} on ${navigator.platform}`;
};

/**
 * Get browser name from user agent
 */
export const getBrowserName = (): string => {
  const userAgent = navigator.userAgent;

  if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
    return "Chrome";
  }
  if (/Firefox/.test(userAgent)) {
    return "Firefox";
  }
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    return "Safari";
  }
  if (/Edge/.test(userAgent)) {
    return "Edge";
  }
  if (/Opera/.test(userAgent)) {
    return "Opera";
  }

  return "Unknown Browser";
};

/**
 * Check if current device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Check if current device is tablet
 */
export const isTabletDevice = (): boolean => {
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
};

/**
 * Check if current device is desktop
 */
export const isDesktopDevice = (): boolean => {
  return !isMobileDevice() && !isTabletDevice();
};

/**
 * Get device type as string
 */
export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
  if (isMobileDevice()) return "mobile";
  if (isTabletDevice()) return "tablet";
  return "desktop";
};

// =============================================================================
// DEVICE CAPABILITY DETECTION
// =============================================================================

/**
 * Check if device supports WebAuthn
 */
export const supportsWebAuthn = (): boolean => {
  return !!(
    navigator.credentials &&
    typeof navigator.credentials.create === "function" &&
    window.PublicKeyCredential
  );
};

/**
 * Check if device supports biometric authentication
 */
export const supportsBiometrics = (): boolean => {
  return (
    supportsWebAuthn() &&
    typeof window.PublicKeyCredential
      ?.isUserVerifyingPlatformAuthenticatorAvailable === "function"
  );
};

/**
 * Check if device supports push notifications
 */
export const supportsPushNotifications = (): boolean => {
  return "Notification" in window && "serviceWorker" in navigator;
};

/**
 * Check if device supports geolocation
 */
export const supportsGeolocation = (): boolean => {
  return "geolocation" in navigator;
};

/**
 * Check if device supports camera
 */
export const supportsCamera = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Get device capabilities summary
 */
export const getDeviceCapabilities = () => {
  return {
    webauthn: supportsWebAuthn(),
    biometrics: supportsBiometrics(),
    pushNotifications: supportsPushNotifications(),
    geolocation: supportsGeolocation(),
    camera: supportsCamera(),
    touchScreen: "ontouchstart" in window,
    localStorage: typeof Storage !== "undefined",
    cookies: navigator.cookieEnabled,
  };
};

// =============================================================================
// DEVICE SECURITY UTILS
// =============================================================================

/**
 * Check if device appears to be trusted
 */
export const isDeviceTrusted = (device: DeviceInfo): boolean => {
  // Basic checks for trusted device characteristics
  const hasValidUserAgent = !!(
    device.userAgent && device.userAgent.length > 10
  );
  const hasValidPlatform = !!(device.platform && device.platform.length > 0);
  const hasRecentActivity = !!(
    device.lastSeen &&
    new Date(device.lastSeen) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ); // 30 days

  return hasValidUserAgent && hasValidPlatform && hasRecentActivity;
};

/**
 * Calculate device trust score (0-100)
 */
export const calculateDeviceTrustScore = (device: DeviceInfo): number => {
  let score = 0;

  // User agent validity (20 points)
  if (device.userAgent && device.userAgent.length > 20) {
    score += 20;
  }

  // Platform information (15 points)
  if (device.platform && device.platform.length > 0) {
    score += 15;
  }

  // Device name (10 points)
  if (device.deviceName && device.deviceName.length > 0) {
    score += 10;
  }

  // Recent activity (25 points)
  if (device.lastSeen) {
    const daysSinceLastSeen =
      (Date.now() - new Date(device.lastSeen).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceLastSeen < 1) score += 25;
    else if (daysSinceLastSeen < 7) score += 20;
    else if (daysSinceLastSeen < 30) score += 15;
    else if (daysSinceLastSeen < 90) score += 10;
  }

  // Consistency checks (30 points)
  const capabilities = getDeviceCapabilities();
  if (capabilities.webauthn) score += 10;
  if (capabilities.localStorage) score += 10;
  if (capabilities.cookies) score += 10;

  return Math.min(100, score);
};

/**
 * Get device security recommendations
 */
export const getDeviceSecurityRecommendations = (
  device: DeviceInfo
): string[] => {
  const recommendations: string[] = [];
  const trustScore = calculateDeviceTrustScore(device);
  const capabilities = getDeviceCapabilities();

  if (trustScore < 50) {
    recommendations.push(
      "This device appears to have low trust score. Consider additional verification."
    );
  }

  if (!capabilities.webauthn) {
    recommendations.push(
      "Consider upgrading to a browser that supports WebAuthn for better security."
    );
  }

  if (!capabilities.localStorage) {
    recommendations.push(
      "Local storage is not available. Some features may be limited."
    );
  }

  if (device.isMobile && !capabilities.biometrics) {
    recommendations.push(
      "Enable biometric authentication on your mobile device for better security."
    );
  }

  if (
    !device.lastSeen ||
    new Date(device.lastSeen) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ) {
    recommendations.push(
      "Device has not been used recently. Verify this is your device."
    );
  }

  return recommendations;
};

// =============================================================================
// DEVICE COMPARISON UTILS
// =============================================================================

/**
 * Compare two devices to see if they are the same
 */
export const areDevicesSame = (
  device1: DeviceInfo,
  device2: DeviceInfo
): boolean => {
  return (
    device1.deviceId === device2.deviceId ||
    (device1.userAgent === device2.userAgent &&
      device1.platform === device2.platform)
  );
};

/**
 * Check if device has changed significantly
 */
export const hasDeviceChanged = (
  previousDevice: DeviceInfo,
  currentDevice: DeviceInfo
): boolean => {
  // Check for major changes that might indicate different device
  const userAgentChanged = previousDevice.userAgent !== currentDevice.userAgent;
  const platformChanged = previousDevice.platform !== currentDevice.platform;
  const mobileStatusChanged =
    previousDevice.isMobile !== currentDevice.isMobile;

  return userAgentChanged || platformChanged || mobileStatusChanged;
};

/**
 * Get device change summary
 */
export const getDeviceChangeSummary = (
  previousDevice: DeviceInfo,
  currentDevice: DeviceInfo
): {
  hasChanged: boolean;
  changes: string[];
  riskLevel: "low" | "medium" | "high";
} => {
  const changes: string[] = [];

  if (previousDevice.userAgent !== currentDevice.userAgent) {
    changes.push("Browser or browser version changed");
  }

  if (previousDevice.platform !== currentDevice.platform) {
    changes.push("Operating system changed");
  }

  if (previousDevice.deviceName !== currentDevice.deviceName) {
    changes.push("Device name changed");
  }

  if (previousDevice.isMobile !== currentDevice.isMobile) {
    changes.push("Device type changed (mobile/desktop)");
  }

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low";

  if (changes.length >= 3) {
    riskLevel = "high";
  } else if (changes.length >= 2) {
    riskLevel = "medium";
  } else if (changes.length === 1) {
    riskLevel = "low";
  }

  return {
    hasChanged: changes.length > 0,
    changes,
    riskLevel,
  };
};

// =============================================================================
// DEVICE MANAGEMENT UTILS
// =============================================================================

/**
 * Format device info for display
 */
export const formatDeviceForDisplay = (device: DeviceInfo) => {
  return {
    id: device.deviceId,
    name: device.deviceName || "Unknown Device",
    type: getDeviceType(),
    browser: getBrowserName(),
    platform: device.platform || "Unknown Platform",
    isCurrent: device.deviceId === getCurrentDeviceInfo().deviceId,
    lastSeen: device.lastSeen ? formatLastSeen(device.lastSeen) : "Never",
    trustScore: calculateDeviceTrustScore(device),
    isSecure: calculateDeviceTrustScore(device) >= 70,
  };
};

/**
 * Format last seen time for display
 */
export const formatLastSeen = (lastSeen: string): string => {
  const date = new Date(lastSeen);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)} minutes ago`;
  } else if (diffInMinutes < 24 * 60) {
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  } else if (diffInMinutes < 7 * 24 * 60) {
    return `${Math.floor(diffInMinutes / (24 * 60))} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Check if device needs security review
 */
export const needsSecurityReview = (device: DeviceInfo): boolean => {
  const trustScore = calculateDeviceTrustScore(device);
  const daysSinceLastSeen = device.lastSeen
    ? (Date.now() - new Date(device.lastSeen).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;

  return trustScore < 50 || daysSinceLastSeen > 90;
};

/**
 * Generate device registration data
 */
export const generateDeviceRegistrationData = () => {
  const currentDevice = getCurrentDeviceInfo();

  return {
    deviceId: currentDevice.deviceId,
    deviceName: currentDevice.deviceName,
    userAgent: currentDevice.userAgent,
    platform: currentDevice.platform,
    isMobile: currentDevice.isMobile,
    capabilities: getDeviceCapabilities(),
    registeredAt: new Date().toISOString(),
    trustScore: calculateDeviceTrustScore(currentDevice),
  };
};
