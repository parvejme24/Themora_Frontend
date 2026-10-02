"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FiLayers,
  FiUpload,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";
import { toast } from "sonner";
import { useUpdateTemplate, useGetTemplateById } from "@/hooks/useTemplateApi";
import { useGetAllTemplateCategoriesForStats } from "@/hooks/useTemplateCategoryApi";
import { UpdateTemplateInput } from "@/types/template";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import ErrorState from "@/components/shared/Feedback/ErrorState";

interface EditTemplateContainerProps {
  templateId: string;
}

export default function EditTemplateContainer({ templateId }: EditTemplateContainerProps) {
  const router = useRouter();
  const formPopulated = useRef(false);
  const [formData, setFormData] = useState<UpdateTemplateInput>({
    title: "",
    price: 0,
    shortDescription: "",
    categoryId: "",
    description: [],
    whatsIncluded: [],
    keyFeatures: [],
    screenshots: [],
    version: 1.0,
    pages: 1,
    checkoutUrl: "",
    previewLink: "",
    lemonsqueezyProductId: "",
    lemonsqueezyVariantId: "",
    lemonsqueezyPermalink: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSourceFiles, setSelectedSourceFiles] = useState<File[]>([]);
  
  const updateTemplateMutation = useUpdateTemplate();
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();
  
  // Fetch template data
  const {
    data: templateData,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useGetTemplateById(templateId);

  const categories = categoriesData?.data || [];

  // Populate form when template data is loaded
  useEffect(() => {
    if (templateData && templateData.categoryId && !formPopulated.current) {
      formPopulated.current = true;
      setFormData({
        title: templateData.title,
        price: templateData.price,
        shortDescription: templateData.shortDescription,
        categoryId: templateData.categoryId,
        description: Array.isArray(templateData.description) ? templateData.description : [],
        whatsIncluded: templateData.whatsIncluded,
        keyFeatures: templateData.keyFeatures,
        screenshots: templateData.screenshots,
        version: templateData.version,
        pages: templateData.pages,
        checkoutUrl: templateData.checkoutUrl || "",
        previewLink: templateData.previewLink || "",
        lemonsqueezyProductId: templateData.lemonsqueezyProductId || "",
        lemonsqueezyVariantId: templateData.lemonsqueezyVariantId || "",
        lemonsqueezyPermalink: templateData.lemonsqueezyPermalink || "",
      });
      
      // Set preview URL for existing image
      if (templateData.imageUrl) {
        setPreviewUrl(templateData.imageUrl);
      }
    }
  }, [templateData]);


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    if (value && value !== formData.categoryId) {
      handleInputChange("categoryId", value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSourceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedSourceFiles(prev => [...prev, ...files]);
  };

  const removeSourceFile = (index: number) => {
    setSelectedSourceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addWhatsIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: [...(prev.whatsIncluded || []), ""],
    }));
  };

  const updateWhatsIncludedItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: (prev.whatsIncluded || []).map((item, i) => i === index ? value : item),
    }));
  };

  const removeWhatsIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: (prev.whatsIncluded || []).filter((_, i) => i !== index),
    }));
  };

  const addKeyFeature = () => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: [...(prev.keyFeatures || []), { title: "", description: "" }],
    }));
  };

  const updateKeyFeature = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: (prev.keyFeatures || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeKeyFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: (prev.keyFeatures || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Category is required");
      return;
    }

    if (!formData.shortDescription?.trim()) {
      toast.error("Short description is required");
      return;
    }

    try {
      const updateData: UpdateTemplateInput = {
        title: formData.title,
        price: formData.price,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        description: formData.description,
        whatsIncluded: formData.whatsIncluded,
        keyFeatures: formData.keyFeatures,
        screenshots: formData.screenshots,
        version: formData.version,
        pages: formData.pages,
        checkoutUrl: formData.checkoutUrl,
        previewLink: formData.previewLink,
        lemonsqueezyProductId: formData.lemonsqueezyProductId,
        lemonsqueezyVariantId: formData.lemonsqueezyVariantId,
        lemonsqueezyPermalink: formData.lemonsqueezyPermalink,
        image: selectedImage || undefined,
        sourceFiles: selectedSourceFiles.length > 0 ? selectedSourceFiles : undefined,
      };

      await updateTemplateMutation.mutateAsync({ id: templateId, data: updateData });
      
      toast.success("Template updated successfully!");
      router.push("/dashboard/templates");
    } catch (error) {
      console.error("Update template error:", error);
      toast.error("Failed to update template. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/templates");
  };

  // Loading state
  if (isLoadingTemplate) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (templateError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState error={templateError} subject="this template" backHref="/dashboard/templates" backLabel="Back to templates" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="cursor-pointer"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Template
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update template information and settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiLayers className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Template Title *</Label>
                      <Input
                        id="title"
                        value={formData.title || ""}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter template title"
                        required
                        disabled={updateTemplateMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price || 0}
                        onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                        disabled={updateTemplateMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category *</Label>
                    {categories.length > 0 ? (
                      <Select
                        value={formData.categoryId || ""}
                        onValueChange={handleCategoryChange}
                        disabled={updateTemplateMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <span className="h-3 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                        <Spinner size="sm" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription || ""}
                      onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                      placeholder="Brief description of the template"
                      rows={3}
                      required
                      disabled={updateTemplateMutation.isPending}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.version || 1.0}
                        onChange={(e) => handleInputChange("version", parseFloat(e.target.value) || 1.0)}
                        disabled={updateTemplateMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pages">Pages</Label>
                      <Input
                        id="pages"
                        type="number"
                        min="1"
                        value={formData.pages || 1}
                        onChange={(e) => handleInputChange("pages", parseInt(e.target.value) || 1)}
                        disabled={updateTemplateMutation.isPending}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="description">Template Description</Label>
                    <Textarea
                      id="description"
                      value={(formData.description || []).join('\n\n')}
                      onChange={(e) => {
                        const paragraphs = e.target.value.split('\n\n').filter(p => p.trim());
                        handleInputChange("description", paragraphs);
                      }}
                      placeholder="Enter detailed description of the template. You can write multiple paragraphs here..."
                      rows={8}
                      disabled={updateTemplateMutation.isPending}
                      className="resize-y"
                    />
                    <p className="text-sm text-gray-500">
                      You can write multiple paragraphs in this field. Press Enter to create new paragraphs.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* LemonSqueezy Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiLayers className="w-5 h-5" />
                    LemonSqueezy Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <FiLayers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Payment Processing Integration
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Configure LemonSqueezy integration for automated payment processing and checkout management.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lemonsqueezyProductId">Product ID</Label>
                      <Input
                        id="lemonsqueezyProductId"
                        value={formData.lemonsqueezyProductId || ""}
                        onChange={(e) => handleInputChange("lemonsqueezyProductId", e.target.value)}
                        placeholder="e.g., 12345"
                        disabled={updateTemplateMutation.isPending}
                      />
                      <p className="text-xs text-gray-500">
                        Your LemonSqueezy product identifier
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lemonsqueezyVariantId">Variant ID</Label>
                      <Input
                        id="lemonsqueezyVariantId"
                        value={formData.lemonsqueezyVariantId || ""}
                        onChange={(e) => handleInputChange("lemonsqueezyVariantId", e.target.value)}
                        placeholder="e.g., 67890"
                        disabled={updateTemplateMutation.isPending}
                      />
                      <p className="text-xs text-gray-500">
                        Specific variant for this template
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkoutUrl">Checkout URL</Label>
                    <Input
                      id="checkoutUrl"
                      value={formData.checkoutUrl || ""}
                      onChange={(e) => handleInputChange("checkoutUrl", e.target.value)}
                      placeholder="https://example.com/checkout"
                      disabled={updateTemplateMutation.isPending}
                    />
                    <p className="text-xs text-gray-500">
                      Direct checkout link for this template (optional)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previewLink">Preview Link</Label>
                    <Input
                      id="previewLink"
                      type="url"
                      value={formData.previewLink || ""}
                      onChange={(e) => handleInputChange("previewLink", e.target.value)}
                      placeholder="https://example.com/preview"
                      disabled={updateTemplateMutation.isPending}
                    />
                    <p className="text-xs text-gray-500">
                      Link to preview or demo of the template (optional)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lemonsqueezyPermalink">LemonSqueezy Permalink</Label>
                    <Input
                      id="lemonsqueezyPermalink"
                      value={formData.lemonsqueezyPermalink || ""}
                      onChange={(e) => handleInputChange("lemonsqueezyPermalink", e.target.value)}
                      placeholder="https://yourstore.lemonsqueezy.com/checkout/buy/..."
                      disabled={updateTemplateMutation.isPending}
                    />
                    <p className="text-xs text-gray-500">
                      LemonSqueezy-specific checkout link (optional)
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Note:</strong> All LemonSqueezy fields are optional. Leave empty if you're not using LemonSqueezy for this template.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>What's Included</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWhatsIncludedItem}
                      className="cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.whatsIncluded || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateWhatsIncludedItem(index, e.target.value)}
                        placeholder={`Included item ${index + 1}`}
                        disabled={updateTemplateMutation.isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWhatsIncludedItem(index)}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Key Features */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Key Features</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addKeyFeature}
                      className="cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.keyFeatures || []).map((feature, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={feature.title}
                        onChange={(e) => updateKeyFeature(index, "title", e.target.value)}
                        placeholder="Feature title"
                        disabled={updateTemplateMutation.isPending}
                      />
                      <div className="flex gap-2">
                        <Input
                          value={feature.description}
                          onChange={(e) => updateKeyFeature(index, "description", e.target.value)}
                          placeholder="Feature description"
                          disabled={updateTemplateMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyFeature(index)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Media & Files */}
              <Card>
                <CardHeader>
                  <CardTitle>Media & Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Template Image */}
                  <div className="space-y-2">
                    <Label>Template Image</Label>
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Template preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute top-2 right-2 cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <FiLayers className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 mb-3 text-sm">Upload template image</p>
                        <Label
                          htmlFor="edit-template-image"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
                        >
                          <FiUpload className="w-4 h-4" />
                          Choose Image
                        </Label>
                        <Input
                          id="edit-template-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Source Files */}
                  <div className="space-y-2">
                    <Label>Source Files</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <Label
                        htmlFor="edit-source-files"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm"
                      >
                        <FiUpload className="w-4 h-4" />
                        Add Source Files
                      </Label>
                      <Input
                        id="edit-source-files"
                        type="file"
                        multiple
                        onChange={handleSourceFilesChange}
                        className="hidden"
                      />
                      
                      {selectedSourceFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedSourceFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                              <span className="truncate flex-1">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSourceFile(index)}
                                className="text-red-600 hover:text-red-700 cursor-pointer ml-2"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    type="submit"
                    disabled={updateTemplateMutation.isPending || !formData.title?.trim() || !formData.categoryId || !formData.shortDescription?.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {updateTemplateMutation.isPending ? "Updating..." : "Update Template"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateTemplateMutation.isPending}
                    className="w-full cursor-pointer"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}