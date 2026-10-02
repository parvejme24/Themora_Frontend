"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FiSearch,
  FiRefreshCw,
  FiFilter,
  FiCalendar,
  FiUser,
  FiMail,
  FiHome,
  FiSend,
} from "react-icons/fi";
import { toast } from "sonner";
import EmailModal from "./EmailModal";
import { UserRole } from "@/types/user";
import ErrorState from "@/components/shared/Feedback/ErrorState";

// Skeleton Components
const ServiceRequestSkeleton = () => (
  <div className="min-h-screen py-8">
    <div className="container mx-auto max-w-7xl px-4">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded mb-2 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-4 w-80 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-10 w-28 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="h-10 w-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
        </div>
        <div className="h-10 w-32 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
      </div>

      {/* Table Skeleton */}
      <Card className="bg-white dark:bg-[#1A1D37]">
        <CardHeader>
          <div className="h-6 w-48 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {[...Array(7)].map((_, index) => (
                    <th key={index} className="text-left py-3 px-4">
                      <div className="h-4 w-16 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    {[...Array(7)].map((_, cellIndex) => (
                      <td key={cellIndex} className="py-3 px-4">
                        <div className="h-4 w-20 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `}</style>
  </div>
);

interface ServiceRequestContainerProps {
  userRole?: string;
}

export default function ServiceRequestContainer({
  userRole,
}: ServiceRequestContainerProps) {
  const isAdmin =
    userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  const isUser = userRole === UserRole.USER;

  const {
    data: serviceRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["serviceRequests", "all"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/contacts");
        console.log("API Response:", res.data); // Debug log

        // Backend returns { success: true, data: [...contacts...], pagination: {...} }
        if (res.data.success && Array.isArray(res.data.data)) {
          return res.data.data;
        } else {
          console.error("Invalid API response structure:", res.data);
          return [];
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
      }
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [emailModal, setEmailModal] = useState<{
    isOpen: boolean;
    clientEmail: string;
    clientName: string;
    requestId?: string;
  }>({
    isOpen: false,
    clientEmail: "",
    clientName: "",
    requestId: "",
  });

  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    serviceData: any | null;
  }>({
    isOpen: false,
    serviceData: null
  });

  // Ensure serviceRequests is always an array
  const requests = Array.isArray(serviceRequests) ? serviceRequests : [];

  // Debug logging
  console.log("Service Requests Data:", serviceRequests);
  console.log("Processed Requests:", requests);
  console.log("Is Loading:", isLoading);
  console.log("Error:", error);

  // Filter service requests based on search term and status
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.companyName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.serviceRequired?.toLowerCase().includes(searchTerm.toLowerCase());

    // Since Contact doesn't have status field, we'll show all contacts when no specific filter is applied
    const matchesStatus = filterStatus === "all";

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    refetch();
    toast.success("Service request list refreshed!");
  };

  const handleSendEmail = (
    clientEmail: string,
    clientName: string,
    requestId?: string
  ) => {
    setEmailModal({
      isOpen: true,
      clientEmail,
      clientName,
      requestId,
    });
  };

  const handleViewService = (serviceId: string) => {
    // Find the service data by ID
    const serviceData = requests.find(request => request.id === serviceId);
    if (serviceData) {
      setServiceModal({
        isOpen: true,
        serviceData: serviceData
      });
    } else {
      toast.error('Service request not found');
    }
  };

  const closeEmailModal = () => {
    setEmailModal({
      isOpen: false,
      clientEmail: "",
      clientName: "",
      requestId: "",
    });
  };

  const closeServiceModal = () => {
    setServiceModal({
      isOpen: false,
      serviceData: null
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in-progress":
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "pending":
        return "Pending";
      case "in-progress":
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <ServiceRequestSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState error={error} subject="service requests" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Service Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view all service requests from clients
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="cursor-pointer"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <FiFilter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contacts
              </CardTitle>
              <FiCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {requests.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <FiFilter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  requests.filter((r) => {
                    const contactDate = new Date(r.createdAt);
                    const now = new Date();
                    return (
                      contactDate.getMonth() === now.getMonth() &&
                      contactDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                With Replies
              </CardTitle>
              <FiFilter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {
                  requests.filter((r) => r.replies && r.replies.length > 0)
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, company, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Service Requests Table */}
        <Card className="bg-white dark:bg-[#1A1D37]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Service Request List ({filteredRequests.length} of{" "}
                {requests.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <FiFilter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  No service requests found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "No service requests yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Client Info
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Project Details
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Service Required
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Budget
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {request.fullName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center">
                                <FiMail className="w-3 h-3 mr-1" />
                                {request.email}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center">
                                <FiHome className="w-3 h-3 mr-1" />
                                {request.companyName || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                              {request.projectDetails}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {request.serviceRequired}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {request.budget}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Contact
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewService(request.id)}
                              size="sm"
                              variant="outline"
                              className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                            >
                              <FiUser className="w-3 h-3 mr-1" />
                              View Service
                            </Button>
                            <Button
                              onClick={() =>
                                handleSendEmail(
                                  request.email,
                                  request.fullName,
                                  request.id
                                )
                              }
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              <FiSend className="w-3 h-3 mr-1" />
                              Send Email
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Modal */}
      <EmailModal
        isOpen={emailModal.isOpen}
        onClose={closeEmailModal}
        clientEmail={emailModal.clientEmail}
        clientName={emailModal.clientName}
        requestId={emailModal.requestId}
      />

      {/* Service Details Modal */}
      {serviceModal.isOpen && serviceModal.serviceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{serviceModal.serviceData.fullName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{serviceModal.serviceData.email}</p>
                </div>
              </div>
              <button
                onClick={closeServiceModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Service Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Service</span>
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                    {serviceModal.serviceData.serviceRequired}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {serviceModal.serviceData.projectDetails}
                </p>
              </div>

              {/* Budget & Company */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget</p>
                  <p className="font-medium text-gray-900 dark:text-white">{serviceModal.serviceData.budget}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Company</p>
                  <p className="font-medium text-gray-900 dark:text-white">{serviceModal.serviceData.companyName || 'N/A'}</p>
                </div>
              </div>

              {/* Date & Replies */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{new Date(serviceModal.serviceData.createdAt).toLocaleDateString()}</span>
                <span>{serviceModal.serviceData.replies?.length || 0} replies</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={closeServiceModal}
                variant="outline"
                size="sm"
                className="cursor-pointer flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  closeServiceModal();
                  handleSendEmail(
                    serviceModal.serviceData.email,
                    serviceModal.serviceData.fullName,
                    serviceModal.serviceData.id
                  );
                }}
                size="sm"
                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FiSend className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
