"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

interface FeaturedImageSectionProps {
  selectedImage: File | null;
  previewUrl: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (e: React.DragEvent) => void;
  onImageDragOver: (e: React.DragEvent) => void;
  onRemoveImage: () => void;
}

const FeaturedImageSection: React.FC<FeaturedImageSectionProps> = ({
  selectedImage,
  previewUrl,
  onImageChange,
  onImageDrop,
  onImageDragOver,
  onRemoveImage,
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Image</CardTitle>
      </CardHeader>
      <CardContent>
        {previewUrl ? (
          <div className="space-y-3">
            {/* Image Preview with Perfect Aspect Ratio */}
            <div
              className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F2E] cursor-pointer"
              onClick={() =>
                document.getElementById("image-upload")?.click()
              }
              onDrop={onImageDrop}
              onDragOver={onImageDragOver}
            >
              <img
                src={previewUrl}
                alt="Featured Image Preview"
                className="w-full h-full object-contain"
                  onError={(e) => {
                    // Image failed to load
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                  }}
              />
              {/* Overlay with image info */}
              <div className="absolute inset-0 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                  Click to change or drag new image
                </div>
              </div>
            </div>

            {/* Image Details */}
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>Recommended: 1200x630px (16:9 ratio)</p>
              <p>Max size: 5MB</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Label
                htmlFor="image-upload"
                className="tf-btn-primary tf-shine flex-1 cursor-pointer text-white px-3 py-2 rounded-md text-sm inline-flex items-center justify-center gap-2"
              >
                <FiUpload className="w-4 h-4" />
                Change Image
              </Label>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemoveImage}
                className="cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </Button>
            </div>

            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 cursor-pointer"
              onClick={() =>
                document.getElementById("image-upload")?.click()
              }
              onDrop={onImageDrop}
              onDragOver={onImageDragOver}
            >
              <div className="space-y-3">
                <FiImage className="w-12 h-12 mx-auto text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload Featured Image
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Drag & drop or click to browse
                  </p>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p>Recommended: 1200x630px (16:9 ratio)</p>
                  <p>Supports: JPG, PNG, WebP</p>
                  <p>Max size: 5MB</p>
                </div>
              </div>
            </div>

            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeaturedImageSection;
