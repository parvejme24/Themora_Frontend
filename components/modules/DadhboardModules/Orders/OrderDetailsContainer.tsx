"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiEdit,
  FiDownload,
  FiMail,
  FiUser,
  FiShoppingBag,
  FiCalendar,
  FiDollarSign,
  FiTag,
  FiCreditCard,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "sonner";
import { useGetOrderById, useUpdateOrderStatus } from "@/hooks/useOrderApi";
import { Order } from "@/types/order";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/Providers/AuthProvider";
import { useContext } from "react";
import { UserRole } from "@/types/user";
import ErrorState from "@/components/shared/Feedback/ErrorState";

interface OrderDetailsContainerProps {
  orderId: string;
}

export default function OrderDetailsContainer({
  orderId,
}: OrderDetailsContainerProps) {
  const router = useRouter();
  const { user } = useContext(AuthContext) || {};
  const role = (user as { role?: UserRole })?.role;
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderById(orderId || "");

  const updateOrderStatusMutation = useUpdateOrderStatus();

  const handleStatusUpdate = async (status: Order["status"]) => {
    try {
      setActionLoading(true);
      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        data: { status },
      });
      toast.success("Order status updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const statusOptions: Order["status"][] = [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ];

  // Validate orderId
  if (!orderId || orderId.trim() === "") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAFCFF] dark:from-[#000424] to-[#FAFCFF] dark:to-[#000424] flex items-center justify-center">
        <div className="container mx-auto max-w-7xl px-4 lg:px-0 py-10">
          <div className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl p-8 lg:p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Invalid Order ID
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              The order ID is missing or invalid.
            </p>
            <Button
              onClick={() => router.back()}
              className="cursor-pointer bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] hover:from-[#0F35A7]/90 hover:to-[#0F59BC]/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAFCFF] dark:from-[#000424] to-[#FAFCFF] dark:to-[#000424] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0F5BBD] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState error={error ?? { response: { status: 404 } }} subject="this order" onRetry={refetch} backHref="/dashboard/orders" backLabel="All orders" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto max-w-7xl px-4 lg:px-0 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="cursor-pointer"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </Button>
          </div>
          <h1 
            className="text-3xl lg:text-4xl font-bold mb-2"
            style={{
              background: "linear-gradient(90deg, #1f2937, #3b82f6, #8b5cf6, #1f2937)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Order Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Order ID: {order.lemonsqueezyOrderId}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Order Status</p>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">License Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.licenseType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {order.currency} {order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.paymentMethod || "N/A"}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          disabled={actionLoading}
                          className="w-full sm:w-auto"
                        >
                          <FiEdit className="mr-2" />
                          Update Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusUpdate(status)}
                            disabled={order.status === status || actionLoading}
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Information */}
            <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                  Template Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Template Name</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {order.template.title}
                  </p>
                </div>
                {order.template.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={order.template.imageUrl}
                      alt={order.template.title}
                      className="w-full h-64 object-contain rounded-lg shadow-md"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {order.template.shortDescription}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Template Price</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.currency} {order.template.price.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Licenses */}
            {order.licenses && order.licenses.length > 0 && (
              <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                    Licenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.licenses.map((license) => (
                      <div
                        key={license.id}
                        className="p-4 bg-gray-50 dark:bg-[#0F1419] border border-gray-200 dark:border-gray-800 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              {license.licenseKey}
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Type: <span className="font-medium text-gray-700 dark:text-gray-300">{license.licenseType}</span>
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                Status:{" "}
                                <span
                                  className={
                                    license.isActive
                                      ? "font-semibold text-green-600 dark:text-green-400"
                                      : "font-semibold text-red-600 dark:text-red-400"
                                  }
                                >
                                  {license.isActive ? "Active" : "Inactive"}
                                </span>
                              </span>
                              {license.expiresAt && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  Expires: <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(license.expiresAt).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Download Links */}
            {order.downloadLinks && order.downloadLinks.length > 0 && (
              <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                    Download Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.downloadLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-gray-50 dark:bg-[#0F1419] border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-[#0F35A7] dark:hover:border-[#0F59BC] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Download Link {index + 1}
                          </span>
                          <FiDownload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <FiMail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.customerEmail}
                  </p>
                </div>
                {order.customerName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <FiUser className="h-4 w-4" />
                      Name
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customerName}
                    </p>
                  </div>
                )}
                {order.user && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">User Account</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {order.user.email}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing Address */}
            {order.billingAddress && (
              <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    {order.billingAddress.firstName && order.billingAddress.lastName && (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.billingAddress.firstName} {order.billingAddress.lastName}
                      </p>
                    )}
                    {order.billingAddress.address && <p>{order.billingAddress.address}</p>}
                    {(order.billingAddress.city ||
                      order.billingAddress.state ||
                      order.billingAddress.zipCode) && (
                      <p>
                        {order.billingAddress.city}
                        {order.billingAddress.city && order.billingAddress.state && ", "}
                        {order.billingAddress.state} {order.billingAddress.zipCode}
                      </p>
                    )}
                    {order.billingAddress.country && <p>{order.billingAddress.country}</p>}
                    {order.billingAddress.phone && (
                      <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Phone: </span>
                        {order.billingAddress.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Dates */}
            <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                  Order Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <FiCalendar className="h-4 w-4" />
                    Created At
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <FiCalendar className="h-4 w-4" />
                    Updated At
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
                {order.expiresAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      Expires At
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(order.expiresAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
