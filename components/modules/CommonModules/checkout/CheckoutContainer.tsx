"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import { useGetTemplateById } from "@/hooks/useTemplateApi";
import { useCreateOrder } from "@/hooks/useOrderApi";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import ErrorState from "@/components/shared/Feedback/ErrorState";

interface Template {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  shortDescription: string;
  checkoutUrl?: string | null;
  category: {
    title: string;
  };
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutContainer({ templateId }: { templateId: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const { data: templateData, isLoading: templateLoading, error: templateError, refetch: refetchTemplate } = useGetTemplateById(templateId);
  const createOrderMutation = useCreateOrder();
  
  const [processing, setProcessing] = useState(false);
  
  // Get user profile data
  const userProfile = currentUserData?.data?.user?.profile;
  const fullUser = currentUserData?.data?.user || user;
  
  // Split fullName into firstName and lastName
  const splitName = (fullName: string) => {
    const parts = fullName?.split(" ") || [];
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const { firstName: userFirstName, lastName: userLastName } = splitName(fullUser?.fullName || "");

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  // Populate form with user data when logged in
  useEffect(() => {
    if (isAuthenticated && fullUser) {
      setFormData(prev => ({
        ...prev,
        firstName: userFirstName || prev.firstName,
        lastName: userLastName || prev.lastName,
        email: fullUser.email || prev.email,
        phone: userProfile?.phone || prev.phone,
        city: userProfile?.city || prev.city,
        state: userProfile?.stateOrRegion || prev.state,
        zipCode: userProfile?.postCode || prev.zipCode,
        country: userProfile?.country || prev.country,
      }));
    }
  }, [isAuthenticated, fullUser, userProfile, userFirstName, userLastName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check if all mandatory fields are filled
  const isFormValid = React.useMemo(() => {
    const requiredFields: (keyof CheckoutForm)[] = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check all required fields are filled
    const allFieldsFilled = requiredFields.every(field => {
      const value = formData[field];
      return value && value.trim() !== '';
    });
    
    // Check email format
    const emailValid = emailRegex.test(formData.email);
    
    return allFieldsFilled && emailValid;
  }, [formData]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Validate form
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CheckoutForm]);
    
    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      setProcessing(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setProcessing(false);
      return;
    }

    if (!template) {
      toast.error("Template not found");
      setProcessing(false);
      return;
    }

    try {
      // Check if checkoutUrl exists first
      if (!template.checkoutUrl) {
        toast.error("Checkout URL not available. Please contact support.");
        setProcessing(false);
        return;
      }

      // Generate temporary LemonSqueezy order ID (will be updated with actual ID after payment)
      const tempOrderId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare order data according to backend schema
      const orderData = {
        templateId: template.id,
        lemonsqueezyOrderId: tempOrderId, // Temporary ID, will be updated via webhook
        totalAmount: template.price,
        currency: "USD",
        licenseType: "SINGLE" as const,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || "",
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };

      // Store order data in sessionStorage for reference
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        ...orderData,
        templateTitle: template.title,
        timestamp: new Date().toISOString(),
      }));

      // Create order in database before redirecting to LemonSqueezy
      // Note: This requires admin authentication. If you need user-facing order creation,
      // you may need to create a separate endpoint or handle via webhook
      try {
        await createOrderMutation.mutateAsync(orderData);
        toast.success("Order created successfully. Redirecting to payment...");
      } catch (orderError: any) {
        console.error("Order creation error:", orderError);
        // If order creation fails due to auth, still redirect to LemonSqueezy
        // The webhook can create the order after payment
        if (orderError?.response?.status === 401 || orderError?.response?.status === 403) {
          toast.warning("Order will be created after payment confirmation");
        } else {
          toast.error(orderError?.response?.data?.message || "Failed to create order. Redirecting anyway...");
        }
      }
      
      // Redirect to LemonSqueezy checkout page
      window.location.href = template.checkoutUrl;
    } catch (error: any) {
      console.error("Error during checkout:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to process checkout. Please try again.");
      setProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/template'); // Redirect to templates page
  };

  const handleDownloadTemplate = () => {
    // In real app, trigger actual download
    toast.success("Download started! Check your email for the template files.");
    handleCloseModal();
  };

  const handleSendEmail = async () => {
    try {
      // Simulate sending email with template files
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Template files sent to ${formData.email}`);
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    }
  };

  // Map template data to Template interface
  const template = templateData ? {
    id: templateData.id,
    title: templateData.title,
    price: templateData.price,
    imageUrl: templateData.imageUrl || "",
    shortDescription: templateData.shortDescription,
    checkoutUrl: templateData.checkoutUrl,
    category: {
      title: templateData.category?.title || "Premium"
    }
  } : null;

  if (templateLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (templateError || !template) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        {templateError ? (
          <ErrorState error={templateError} subject="this template" onRetry={refetchTemplate} backHref="/template" backLabel="Browse templates" />
        ) : (
          <ErrorState
            title="Template not found"
            message="The template you're looking for doesn't exist or has been removed."
            error={{ response: { status: 404 } }}
            backHref="/template"
            backLabel="Browse templates"
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFCFF] dark:from-[#000424] to-[#FAFCFF] dark:to-[#000424]">
      <div className="container mx-auto max-w-7xl px-4 lg:px-0 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2"
            style={{
              background: "linear-gradient(90deg, #1f2937, #3b82f6, #8b5cf6, #1f2937)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your purchase and get instant access to your template
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your first name"
                      className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your last name"
                      className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                    className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                    className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      City *
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="New York"
                      className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      State *
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      placeholder="NY"
                      className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      placeholder="10001"
                      className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Country
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    className="h-11 bg-white dark:bg-[#0F1419] border-2 border-gray-300 dark:border-gray-600 focus:border-[#0F35A7] dark:focus:border-[#0F59BC] text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={processing || !isFormValid}
                  className={`w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                    isFormValid && !processing
                      ? "bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] hover:from-[#0F35A7]/90 hover:to-[#0F59BC]/90 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {processing ? "Processing..." : `Complete Purchase - $${template.price}`}
                </Button>
                {!isFormValid && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Please fill in all required fields to continue
                  </p>
                )}
                </form>
              </CardContent>
            </Card>
          </div>

        {/* Order Summary */}
        <div>
          <Card className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#0F1419] rounded-xl">
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {template.title}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] text-white text-xs rounded-full mb-2">
                      {template.category.title}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {template.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      ${template.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold border-t-2 border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] bg-clip-text text-transparent">
                      ${template.price}
                    </span>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1D37] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your template has been purchased successfully. You can download the files or we can send them to your email.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#0F1419] dark:to-blue-900/10 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Template Files</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                    <span>Complete source code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                    <span>Documentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                    <span>License information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] rounded-full"></div>
                    <span>Setup instructions</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadTemplate}
                  className="flex-1 bg-gradient-to-r from-[#0F35A7] to-[#0F59BC] hover:from-[#0F35A7]/90 hover:to-[#0F59BC]/90 text-white shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Now
                </Button>
                <Button
                  onClick={handleSendEmail}
                  variant="outline"
                  className="flex-1 border-2 border-[#0F35A7] text-[#0F35A7] hover:bg-[#0F35A7] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send to Email
                </Button>
              </div>

              <Button
                onClick={handleCloseModal}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
