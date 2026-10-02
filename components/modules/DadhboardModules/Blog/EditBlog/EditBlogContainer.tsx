"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FiUpload, FiX, FiSave, FiImage, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useDeleteBlog,
  useGetBlogById,
  useUpdateBlog,
} from "@/hooks/useBlogApi";
import { useGetAllBlogCategoriesForStats } from "@/hooks/useBlogCategoryApi";
import { useAuth } from "@/hooks/useAuth";
import RichTextEditor from "../CreateBlog/RichTextEditor";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import ErrorState from "@/components/shared/Feedback/ErrorState";

interface EditBlogContainerProps {
  blogId?: string;
}

export default function EditBlogContainer({
  blogId,
}: EditBlogContainerProps = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: updateBlog, isPending: isUpdating } = useUpdateBlog();
  const { mutateAsync: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const { data: categoriesData } = useGetAllBlogCategoriesForStats();

  // Fetch blog data for editing
  const {
    data: blogData,
    isLoading: isLoadingBlog,
    error: blogError,
  } = useGetBlogById(blogId || "");

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    description: "",
    readingTime: 5,
    slug: "",
    isPublished: false,
  });

  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .substring(0, 200);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Populate form when blog data is loaded (for editing)
  // Note: categoryId will be set separately when categories are loaded
  useEffect(() => {
    if (blogData?.data && blogId) {
      const blog = blogData.data;

      setFormData((prev) => ({
        ...prev,
        title: blog.title || "",
        // Don't set categoryId here - it will be set in the separate useEffect
        description: typeof blog.description === 'string'
          ? blog.description
          : Array.isArray(blog.description as any)
          ? (blog.description as any).join("\n")
          : String(blog.description || ""),
        readingTime: blog.readingTime || 5,
        slug: blog.slug || "",
        isPublished: blog.isPublished || false,
      }));

      // Update content - handle both HTML string and structured content
      if (blog.content) {
        if (typeof blog.content === 'string') {
          // Direct HTML string
          setContent(blog.content);
        } else if (blog.content.html) {
          // Structured content with HTML property
          setContent(blog.content.html);
        } else if (blog.content.content?.html) {
          // Nested structured content
          setContent(blog.content.content.html);
        } else {
          // Fallback: try to extract HTML from content object
          setContent("");
        }
      } else {
        setContent("");
      }

      // Set image preview if blog has an image
      if (blog.featuredImageUrl) {
        setPreviewUrl(blog.featuredImageUrl);
        setOriginalImageUrl(blog.featuredImageUrl); // Store original URL for preservation
        // Don't set featuredImage for existing images - only for new uploads
        setFeaturedImage(null);
      } else {
        setPreviewUrl(null);
        setOriginalImageUrl(null);
      }
    }
  }, [blogData, blogId]);

  // Set categoryId separately when both blog data and categories are loaded
  useEffect(() => {
    if (blogData?.data && categoriesData?.data && categoriesData.data.length > 0 && blogId) {
      const blog = blogData.data;
      const blogCategoryId = blog.categoryId;
      
      if (blogCategoryId) {
        // Verify that the blog's categoryId exists in the categories list
        const categoryExists = categoriesData.data.some(cat => cat.id === blogCategoryId);
        
        if (categoryExists) {
          // Always set the categoryId from blog data
          setFormData((prev) => ({
            ...prev,
            categoryId: blogCategoryId,
          }));
        } else {
          console.warn(`Category ${blogCategoryId} not found in categories list. Available categories:`, categoriesData.data.map(c => c.id));
        }
      }
    }
  }, [blogData, categoriesData, blogId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublished: checked }));
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFeaturedImage(file);
    }
  };

  const processFeaturedImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setFeaturedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    toast.success("Featured image selected!");
  };

  const handleFeaturedImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      processFeaturedImage(imageFiles[0]);
    } else {
      toast.error("Please drop only image files");
    }
  };

  const handleFeaturedImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    if (previewUrl) {
      // Only revoke blob URLs, not regular URLs
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
    setOriginalImageUrl(null); // Clear original URL to remove image on save
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Category is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    if (!blogId) {
      toast.error("Blog ID is required");
      return;
    }

    try {
      // Parse content HTML to JSON structure for backend
      const contentObject = {
        html: content,
        type: "rich-text",
        version: "1.0",
      };

      const blogData: any = {
        title: formData.title.trim(),
        categoryId: formData.categoryId,
        description: formData.description.trim(), // String field
        readingTime: Number(formData.readingTime),
        slug: formData.slug.trim() || undefined,
        isPublished: Boolean(formData.isPublished),
        content: contentObject, // JSON object
      };

      // Only include featuredImage if a new file is selected
      // If no new image is selected, preserve the original image URL
      if (featuredImage) {
        blogData.featuredImage = featuredImage;
      } else if (originalImageUrl && !featuredImage) {
        // Preserve existing image URL if no new image is selected
        blogData.featuredImageUrl = originalImageUrl;
      }

      await updateBlog({ id: blogId, ...blogData });
      toast.success("Blog updated successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("Update blog error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update blog. Please try again."
      );
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim() || !formData.categoryId || !user?.id || !blogId) {
      toast.error("Title and category are required for draft");
      return;
    }

    try {
      const contentObject = {
        html: content || "",
        type: "rich-text",
        version: "1.0",
      };

      const draftData: any = {
        title: formData.title.trim(),
        categoryId: formData.categoryId,
        description: formData.description.trim() || "",
        readingTime: Number(formData.readingTime),
        slug: formData.slug.trim() || undefined,
        isPublished: false,
        content: contentObject,
      };

      // Only include featuredImage if a new file is selected
      // If no new image is selected, preserve the original image URL
      if (featuredImage) {
        draftData.featuredImage = featuredImage;
      } else if (originalImageUrl && !featuredImage) {
        // Preserve existing image URL if no new image is selected
        draftData.featuredImageUrl = originalImageUrl;
      }

      await updateBlog({ id: blogId, ...draftData });
      toast.success("Draft updated successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("Save draft error:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save draft. Please try again."
      );
    }
  };

  const handleDeleteBlog = async () => {
    if (!blogId) {
      toast.info("Delete functionality is only available when editing existing blogs");
      setShowDeleteModal(false);
      return;
    }

    try {
      await deleteBlog(blogId);
      toast.success("Blog deleted successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("Delete blog error:", error);
      toast.error(error?.message || "Failed to delete blog. Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Show loading state when fetching blog data
  if (blogId && isLoadingBlog) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Spinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if blog fetch failed
  if (blogId && blogError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState error={blogError} subject="this blog post" onRetry={() => window.location.reload()} backHref="/dashboard/blogs" backLabel="All blogs" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Blog Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your blog post
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle>Blog Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter blog title"
                    required
                    className="cursor-text"
                  />
                </CardContent>
              </Card>

              {/* Slug */}
              <Card>
                <CardHeader>
                  <CardTitle>URL Slug</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="url-friendly-slug"
                    className="cursor-text font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from title (editable)
                  </p>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter blog description (this will be displayed as a summary)"
                    rows={4}
                    required
                    className="cursor-text"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A brief summary of your blog post
                  </p>
                </CardContent>
              </Card>

              {/* Content - Rich Text Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Blog Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor content={content} onChange={setContent} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="isPublished" className="cursor-pointer">
                      Publish immediately
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoriesData?.data && categoriesData.data.length > 0 ? (
                    <Select
                      key={`category-select-${formData.categoryId || 'empty'}`}
                      value={formData.categoryId || undefined}
                      onValueChange={(value) =>
                        handleSelectChange("categoryId", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData.data.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex h-10 items-center"><Spinner size="sm" /></div>
                  )}
                </CardContent>
              </Card>

              {/* Reading Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Reading Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    name="readingTime"
                    type="number"
                    value={formData.readingTime}
                    onChange={handleInputChange}
                    min="1"
                    max="60"
                    className="cursor-text"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated reading time in minutes
                  </p>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div
                        className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer"
                        onClick={() =>
                          document.getElementById("featured-image-upload")?.click()
                        }
                        onDrop={handleFeaturedImageDrop}
                        onDragOver={handleFeaturedImageDragOver}
                      >
                        <img
                          src={previewUrl}
                          alt="Featured Image Preview"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                            Click to change or drag new image
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p>Recommended: 1200x630px (16:9 ratio)</p>
                        <p>Max size: 5MB</p>
                      </div>

                      <div className="flex gap-2">
                        <Label
                          htmlFor="featured-image-upload"
                          className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm inline-flex items-center justify-center gap-2"
                        >
                          <FiUpload className="w-4 h-4" />
                          Change Image
                        </Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeFeaturedImage}
                          className="cursor-pointer"
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      </div>

                      <Input
                        id="featured-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 cursor-pointer"
                        onClick={() =>
                          document.getElementById("featured-image-upload")?.click()
                        }
                        onDrop={handleFeaturedImageDrop}
                        onDragOver={handleFeaturedImageDragOver}
                      >
                        <div className="space-y-3">
                          <FiImage className="w-12 h-12 mx-auto text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Upload Featured Image
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Drag & drop or click to browse
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p>Recommended: 1200x630px (16:9 ratio)</p>
                            <p>Supports: JPG, PNG, WebP</p>
                            <p>Max size: 5MB</p>
                          </div>
                        </div>
                      </div>

                      <Input
                        id="featured-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700"
                    >
                      <FiSave className="w-4 h-4 mr-2" />
                      {isUpdating
                        ? "Updating..."
                        : formData.isPublished
                        ? "Update & Publish"
                        : "Update Draft"}
                    </Button>

                    {!formData.isPublished && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isUpdating}
                        className="w-full cursor-pointer"
                      >
                        <FiSave className="w-4 h-4 mr-2" />
                        Save as Draft
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isUpdating || isDeleting}
                      className="w-full cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete Blog"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteBlog}
          blogTitle={formData.title || "Untitled Blog"}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
