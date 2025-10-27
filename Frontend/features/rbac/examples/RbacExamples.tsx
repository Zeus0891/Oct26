/**
 * Example Component - Using Auto-Generated RBAC Types
 * Demonstrates how to use the generated types in real components
 */

import React from "react";
import { Permission, ROLES, ROLE_PERMISSIONS } from "../types/rbac.generated";

import { RoleGuard, PermissionGuard } from "../components";

// =============================================================================
// EXAMPLE: Dashboard with RBAC Protection
// =============================================================================
export function RbacDashboardExample() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">RBAC Dashboard Example</h1>

      {/* Admin-only section */}
      <RoleGuard roles={["ADMIN"]} fallback={<div>Admin section hidden</div>}>
        <div className="bg-red-50 p-4 rounded mb-4">
          <h2 className="font-semibold text-red-800">Admin Controls</h2>
          <p>Only admins can see this section</p>
        </div>
      </RoleGuard>

      {/* Project Manager or Admin */}
      <RoleGuard
        roles={["PROJECT_MANAGER", "ADMIN"]}
        requireAll={false}
        fallback={<div>Management section hidden</div>}
      >
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h2 className="font-semibold text-blue-800">Project Management</h2>
          <p>Project Managers and Admins can see this</p>
        </div>
      </RoleGuard>

      {/* Specific permission check */}
      <PermissionGuard
        permissions={["User.create"]}
        fallback={<div>No user creation permission</div>}
      >
        <div className="bg-green-50 p-4 rounded mb-4">
          <h2 className="font-semibold text-green-800">User Management</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Create New User
          </button>
        </div>
      </PermissionGuard>

      {/* Multiple roles */}
      <RoleGuard
        roles={["ADMIN", "PROJECT_MANAGER"]}
        requireAll={false}
        fallback={<div>Financial section hidden</div>}
      >
        <div className="bg-yellow-50 p-4 rounded mb-4">
          <h2 className="font-semibold text-yellow-800">
            Financial Operations
          </h2>
          <p>Admins or Project Managers can see this</p>
        </div>
      </RoleGuard>

      {/* Permission-based actions */}
      <div className="bg-gray-50 p-4 rounded">
        <h2 className="font-semibold mb-2">Available Actions</h2>

        <PermissionGuard permissions={["Project.create"]}>
          <button className="mr-2 mb-2 bg-blue-600 text-white px-3 py-1 rounded text-sm">
            Create Project
          </button>
        </PermissionGuard>

        <PermissionGuard permissions={["Invoice.approve"]}>
          <button className="mr-2 mb-2 bg-green-600 text-white px-3 py-1 rounded text-sm">
            Approve Invoice
          </button>
        </PermissionGuard>

        <PermissionGuard permissions={["Task.assign"]}>
          <button className="mr-2 mb-2 bg-purple-600 text-white px-3 py-1 rounded text-sm">
            Assign Task
          </button>
        </PermissionGuard>

        <PermissionGuard permissions={["Tenant.update"]}>
          <button className="mr-2 mb-2 bg-red-600 text-white px-3 py-1 rounded text-sm">
            Tenant Settings
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
}

// =============================================================================
// EXAMPLE: Role Information Display
// =============================================================================
export function RoleInfoExample() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Role Definitions</h2>

      {Object.entries(ROLES).map(([roleKey, roleDef]) => (
        <div key={roleKey} className="border rounded p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{roleDef.name}</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {roleDef.code}
            </span>
          </div>
          <p className="text-gray-600 mb-3">{roleDef.description}</p>

          <details>
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              View Permissions ({ROLE_PERMISSIONS[roleDef.code]?.length || 0})
            </summary>
            <div className="mt-2 pl-4">
              {ROLE_PERMISSIONS[roleDef.code]
                ?.slice(0, 10)
                .map((permission: Permission) => (
                  <span
                    key={permission}
                    className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs mr-1 mb-1"
                  >
                    {permission}
                  </span>
                ))}
              {(ROLE_PERMISSIONS[roleDef.code]?.length || 0) > 10 && (
                <span className="text-gray-500 text-sm">
                  ... and {(ROLE_PERMISSIONS[roleDef.code]?.length || 0) - 10}{" "}
                  more
                </span>
              )}
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// EXAMPLE: Permission Matrix
// =============================================================================
export function PermissionMatrixExample() {
  const samplePermissions: Permission[] = [
    "User.create",
    "Project.create",
    "Invoice.approve",
    "Task.assign",
    "Tenant.update",
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Permission Matrix</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Role
              </th>
              {samplePermissions.map((permission) => (
                <th
                  key={permission}
                  className="border border-gray-300 px-2 py-2 text-center text-xs"
                >
                  {permission}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(ROLES).map(([roleKey, roleDef]) => (
              <tr key={roleKey}>
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {roleDef.name}
                </td>
                {samplePermissions.map((permission) => {
                  const hasPermission =
                    ROLE_PERMISSIONS[roleDef.code]?.includes(permission);
                  return (
                    <td
                      key={permission}
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      {hasPermission ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
