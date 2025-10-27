"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Activity,
  ShoppingCart,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export function DashboardScreen() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/activities"),
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Initialize with empty data for production
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
        });
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: "This month",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      bg: "from-emerald-50 to-teal-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      description: "Active orders",
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-600",
      bg: "from-blue-50 to-indigo-50",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      description: "In inventory",
      icon: Package,
      gradient: "from-purple-500 to-pink-600",
      bg: "from-purple-50 to-pink-50",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "Registered",
      icon: Users,
      gradient: "from-orange-500 to-red-600",
      bg: "from-orange-50 to-red-50",
    },
  ];

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br rounded-full blur-3xl ${
              theme === "dark"
                ? "from-blue-600/20 to-purple-700/20"
                : "from-blue-400/20 to-purple-600/20"
            }`}
          ></div>
          <div
            className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr rounded-full blur-3xl ${
              theme === "dark"
                ? "from-indigo-600/20 to-pink-700/20"
                : "from-indigo-400/20 to-pink-600/20"
            }`}
          ></div>
        </div>

        <div
          className={`relative backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border ${
            theme === "dark"
              ? "bg-gray-800/30 border-gray-700/20"
              : "bg-white/30 border-white/20"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
              <BarChart3 className="h-8 w-8 text-white animate-spin" />
            </div>
            <p
              className={`font-medium ${
                theme === "dark" ? "text-gray-300/80" : "text-gray-600/80"
              }`}
            >
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-black"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br rounded-full blur-3xl ${
            theme === "dark"
              ? "from-blue-600/20 to-purple-700/20"
              : "from-blue-400/20 to-purple-600/20"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr rounded-full blur-3xl ${
            theme === "dark"
              ? "from-indigo-600/20 to-pink-700/20"
              : "from-indigo-400/20 to-pink-600/20"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r rounded-full blur-3xl ${
            theme === "dark"
              ? "from-violet-600/10 to-purple-700/10"
              : "from-violet-400/10 to-purple-600/10"
          }`}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div
          className={`backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border ${
            theme === "dark"
              ? "bg-gray-800/30 border-gray-700/20"
              : "bg-white/30 border-white/20"
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1
                className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === "dark"
                    ? "from-gray-100 via-blue-300 to-purple-300"
                    : "from-gray-900 via-blue-900 to-purple-900"
                }`}
              >
                Dashboard
              </h1>
              <p
                className={`font-medium mt-2 ${
                  theme === "dark" ? "text-gray-300/80" : "text-gray-600/80"
                }`}
              >
                Welcome to your ERP dashboard overview
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="group cursor-pointer">
              <div
                className={`backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.45)] transition-all duration-300 transform hover:scale-[1.02] ${
                  theme === "dark"
                    ? "bg-gray-800/30 border-gray-700/20 hover:bg-gray-800/40"
                    : "bg-white/30 border-white/20 hover:bg-white/40"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        theme === "dark"
                          ? "text-gray-400/80"
                          : "text-gray-600/80"
                      }`}
                    >
                      {stat.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {stat.title}
                </div>
                <div
                  className={`mt-2 h-1 bg-gradient-to-r ${stat.gradient} rounded-full opacity-70`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border ${
              theme === "dark"
                ? "bg-gray-800/30 border-gray-700/20"
                : "bg-white/30 border-white/20"
            }`}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  Recent Orders
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400/80" : "text-gray-600/80"
                  }`}
                >
                  Latest customer orders
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className={`w-16 h-16 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ${
                      theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
                    }`}
                  >
                    <ShoppingCart
                      className={`h-8 w-8 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <p
                    className={
                      theme === "dark" ? "text-gray-400/80" : "text-gray-600/80"
                    }
                  >
                    No recent orders
                  </p>
                </div>
              ) : (
                activities.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className={`backdrop-blur-sm p-4 rounded-xl border hover:scale-[1.02] transition-all duration-200 shadow-inner ${
                      theme === "dark"
                        ? "bg-gray-700/50 border-gray-600/30 hover:bg-gray-700/60"
                        : "bg-white/50 border-white/30 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`font-medium ${
                            theme === "dark" ? "text-gray-100" : "text-gray-800"
                          }`}
                        >
                          {activity.title}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-gray-400/80"
                              : "text-gray-600/80"
                          }`}
                        >
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs ${
                            theme === "dark"
                              ? "text-gray-400/80"
                              : "text-gray-600/80"
                          }`}
                        >
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            activity.status === "completed"
                              ? theme === "dark"
                                ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 border border-green-700/50"
                                : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border border-green-200"
                              : theme === "dark"
                                ? "bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-400 border border-yellow-700/50"
                                : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            className={`backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border ${
              theme === "dark"
                ? "bg-gray-800/30 border-gray-700/20"
                : "bg-white/30 border-white/20"
            }`}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  Low Stock Items
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400/80" : "text-gray-600/80"
                  }`}
                >
                  Products that need restocking
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8">
                <div
                  className={`w-16 h-16 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ${
                    theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
                  }`}
                >
                  <Package
                    className={`h-8 w-8 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
                <p
                  className={
                    theme === "dark" ? "text-gray-400/80" : "text-gray-600/80"
                  }
                >
                  No low stock alerts
                </p>
                <p
                  className={`text-xs mt-1 ${
                    theme === "dark" ? "text-gray-400/80" : "text-gray-600/80"
                  }`}
                >
                  All products are well stocked
                </p>
              </div>
            </div>
          </div>

          {/* Additional Features Section */}
          <div
            className={`backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border ${
              theme === "dark"
                ? "bg-gray-800/30 border-gray-700/20"
                : "bg-white/30 border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    Quick Actions
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400/80" : "text-gray-600/80"
                    }`}
                  >
                    Manage your business efficiently
                  </p>
                </div>
              </div>
              <div
                className={`w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-white/50"
                }`}
              >
                <Eye
                  className={`h-4 w-4 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Create Order",
                "Add Product",
                "Manage Users",
                "View Reports",
              ].map((action, index) => (
                <button
                  key={index}
                  className={`backdrop-blur-sm p-4 rounded-xl border hover:scale-[1.02] transition-all duration-200 shadow-inner text-center ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600/30 hover:bg-gray-700/60"
                      : "bg-white/50 border-white/30 hover:bg-white/60"
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {action}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
