"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import api from "@/lib/api";

interface Report {
  id: string;
  name: string;
  description: string;
  type: "financial" | "inventory" | "sales" | "analytics";
  lastGenerated: string;
  status: "ready" | "generating" | "error";
}

export function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/reports");
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        // Initialize with empty data for production
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getReportIcon = (type: string) => {
    switch (type) {
      case "financial":
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case "inventory":
        return <BarChart3 className="h-6 w-6 text-blue-600" />;
      case "sales":
        return <TrendingUp className="h-6 w-6 text-purple-600" />;
      case "analytics":
        return <BarChart3 className="h-6 w-6 text-orange-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neomorphic-card p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 neomorphic-button rounded-full flex items-center justify-center animate-pulse">
            <BarChart3 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="neomorphic-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate and download business reports
              </p>
            </div>
          </div>
          <Button className="neomorphic-primary">
            <FileText className="h-4 w-4 mr-2" />
            Generate New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {reports.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available reports
              </p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Total Reports
          </div>
        </div>

        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {reports.filter((r) => r.status === "ready").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready to download
              </p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Ready Reports
          </div>
        </div>

        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {reports.filter((r) => r.status === "generating").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Generating
          </div>
        </div>

        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {reports.filter((r) => r.status === "error").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Failed reports
              </p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Errors
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Generate and download various business reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No reports available
              </h3>
              <p className="text-muted-foreground mb-6">
                Generate your first report to get started
              </p>
              <Button className="neomorphic-primary">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getReportIcon(report.type)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Last generated:{" "}
                            {new Date(
                              report.lastGenerated
                            ).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost">
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Report Activity</CardTitle>
          <CardDescription>
            Latest report generations and downloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Generated",
                report: "Financial Summary Report",
                time: "2 hours ago",
              },
              {
                action: "Downloaded",
                report: "Inventory Status Report",
                time: "4 hours ago",
              },
              {
                action: "Generated",
                report: "Sales Performance Report",
                time: "1 day ago",
              },
              {
                action: "Downloaded",
                report: "Business Analytics Dashboard",
                time: "2 days ago",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.action === "Generated"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">
                      {activity.action} {activity.report}
                    </p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
