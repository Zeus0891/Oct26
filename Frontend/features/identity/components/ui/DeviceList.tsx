// ============================================================================
// DEVICE LIST COMPONENT
// ============================================================================
// Lista de dispositivos autenticados del usuario
// ============================================================================

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Calendar,
  MoreVertical,
  Shield,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useIdentity } from "../../hooks";

// ============================================================================
// TYPES
// ============================================================================

interface Device {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  location?: string;
  lastSeenAt: string;
  isCurrentDevice: boolean;
  isTrusted: boolean;
}

interface DeviceListProps {
  className?: string;
  showHeader?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DeviceList({
  className = "",
  showHeader = true,
}: DeviceListProps) {
  const { user } = useIdentity();
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "MacBook Pro",
      type: "desktop",
      browser: "Chrome",
      os: "macOS",
      location: "New York, NY",
      lastSeenAt: "2025-10-16T10:30:00Z",
      isCurrentDevice: true,
      isTrusted: true,
    },
    {
      id: "2",
      name: "iPhone 15",
      type: "mobile",
      browser: "Safari",
      os: "iOS",
      location: "New York, NY",
      lastSeenAt: "2025-10-15T18:45:00Z",
      isCurrentDevice: false,
      isTrusted: true,
    },
  ]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRevokeDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId));
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getDeviceIcon = (type: Device["type"]) => {
    switch (type) {
      case "desktop":
        return <Monitor className="w-5 h-5" />;
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Active now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderDevice = (device: Device) => (
    <div
      key={device.id}
      className={`
        neomorphic-card p-4 
        ${device.isCurrentDevice ? "ring-2 ring-primary/20" : ""}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="neomorphic-button w-12 h-12 flex items-center justify-center">
            {getDeviceIcon(device.type)}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-foreground">{device.name}</h4>
              {device.isCurrentDevice && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Current
                </span>
              )}
              {device.isTrusted && (
                <Shield className="w-4 h-4 text-green-600" />
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {device.browser} on {device.os}
            </p>

            <div className="flex items-center space-x-4 mt-1">
              {device.location && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{device.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatLastSeen(device.lastSeenAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!device.isCurrentDevice && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRevokeDevice(device.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!user) {
    return (
      <div className={`neomorphic-card p-6 text-center ${className}`}>
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Please log in to view devices</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your Devices
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage devices that have access to your account
          </p>
        </div>
      )}

      <div className="space-y-4">{devices.map(renderDevice)}</div>

      {devices.length === 0 && (
        <div className="neomorphic-card p-6 text-center">
          <Monitor className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No devices found</p>
        </div>
      )}
    </div>
  );
}
