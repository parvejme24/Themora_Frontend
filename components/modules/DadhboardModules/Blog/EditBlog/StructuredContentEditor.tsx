"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FiX, FiFileText } from "react-icons/fi";
import { toast } from "sonner";

// Content structure for JSON storage
export interface BlogContent {
  title?: string;
  sections?: ContentSection[];
  metadata?: {
    wordCount?: number;
    readingTime?: number;
    lastModified?: string;
  };
}

export interface ContentSection {
  id: string;
  type:
    | "heading"
    | "subheading"
    | "paragraph"
    | "image"
    | "list"
    | "numbered-list";
  content: string;
  items?: string[]; // For lists
  html?: string; // Generated HTML for dangerouslySetInnerHTML
}

// Generate HTML from content for dangerouslySetInnerHTML
export const generateHTML = (content: BlogContent): string => {
  if (!content.sections) return "";

  return content.sections
    .map((section) => {
      switch (section.type) {
        case "heading":
          return `<h1 class="text-3xl font-bold mb-4">${section.content}</h1>`;
        case "subheading":
          return `<h2 class="text-2xl font-semibold mb-3">${section.content}</h2>`;
        case "paragraph":
          return `<p class="mb-4">${section.content}</p>`;
        case "image":
          return `<img src="${section.content}" alt="Content image" class="w-full h-auto mb-4 rounded-lg" />`;
        case "list":
          return `<ul class="list-disc list-inside mb-4">${section.items
            ?.map((item) => `<li>${item}</li>`)
            .join("")}</ul>`;
        case "numbered-list":
          return `<ol class="list-decimal list-inside mb-4">${section.items
            ?.map((item) => `<li>${item}</li>`)
            .join("")}</ol>`;
        default:
          return "";
      }
    })
    .join("");
};

interface StructuredContentEditorProps {
  value: BlogContent;
  onChange: (value: BlogContent) => void;
}

const StructuredContentEditor: React.FC<StructuredContentEditorProps> = ({
  value,
  onChange,
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const addElement = (type: ContentSection["type"]) => {
    const newSection: ContentSection = {
      id: Date.now().toString(),
      type,
      content: "",
      items: type === "list" || type === "numbered-list" ? [""] : undefined,
    };

    const updatedContent: BlogContent = {
      ...value,
      sections: [...(value.sections || []), newSection],
      metadata: {
        ...value.metadata,
        lastModified: new Date().toISOString(),
      },
    };
    onChange(updatedContent);
  };

  const updateElement = (id: string, updates: Partial<ContentSection>) => {
    const updatedContent: BlogContent = {
      ...value,
      sections:
        value.sections?.map((section) =>
          section.id === id ? { ...section, ...updates } : section
        ) || [],
      metadata: {
        ...value.metadata,
        lastModified: new Date().toISOString(),
      },
    };
    onChange(updatedContent);
  };

  const removeElement = (id: string) => {
    const updatedContent: BlogContent = {
      ...value,
      sections: value.sections?.filter((section) => section.id !== id) || [],
      metadata: {
        ...value.metadata,
        lastModified: new Date().toISOString(),
      },
    };
    onChange(updatedContent);
  };

  const addListItem = (elementId: string) => {
    const updatedContent: BlogContent = {
      ...value,
      sections:
        value.sections?.map((section) =>
          section.id === elementId
            ? { ...section, items: [...(section.items || []), ""] }
            : section
        ) || [],
      metadata: {
        ...value.metadata,
        lastModified: new Date().toISOString(),
      },
    };
    onChange(updatedContent);
  };

  const updateListItem = (
    elementId: string,
    itemIndex: number,
    content: string
  ) => {
    const updatedContent: BlogContent = {
      ...value,
      sections:
        value.sections?.map((section) =>
          section.id === elementId
            ? {
                ...section,
                items: section.items?.map((item, index) =>
                  index === itemIndex ? content : item
                ),
              }
            : section
        ) || [],
      metadata: {
        ...value.metadata,
        lastModified: new Date().toISOString(),
      },
    };
    onChange(updatedContent);
  };

  const removeListItem = (elementId: string, itemIndex: number) => {
    const updatedContent: BlogContent = {
      ...value,
      sections:
        value.sections?.map((section) =>
          section.id === elementId
            ? {
                ...section,
                items: section.items?.filter((_, index) => index !== itemIndex),
              }
            : section
        ) || [],
      metadata: {
        ...value.metadata,
        lastModified: new Date().toISOString(),
      },
    };
    onChange(updatedContent);
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.url;

        const newSection: ContentSection = {
          id: Date.now().toString(),
          type: "image",
          content: imageUrl,
        };

        const updatedContent: BlogContent = {
          ...value,
          sections: [...(value.sections || []), newSection],
          metadata: {
            ...value.metadata,
            lastModified: new Date().toISOString(),
          },
        };
        onChange(updatedContent);

        setUploadedImages((prev) => [...prev, imageUrl]);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
        <button
          type="button"
          onClick={() => addElement("heading")}
          className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
          title="Add Heading"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => addElement("subheading")}
          className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
          title="Add Subheading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => addElement("paragraph")}
          className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
          title="Add Paragraph"
        >
          📝 Paragraph
        </button>
        <button
          type="button"
          onClick={() => addElement("list")}
          className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
          title="Add List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => addElement("numbered-list")}
          className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
          title="Add Numbered List"
        >
          1. List
        </button>
        <div className="border-l border-slate-300 dark:border-slate-600 mx-1"></div>
        <Label
          htmlFor="content-image-upload"
          className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-1"
          title="Upload Image"
        >
          <FiFileText className="w-4 h-4" />
          Image
        </Label>
        <Input
          id="content-image-upload"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
          }}
          className="hidden"
        />
      </div>

      {/* Content Elements */}
      <div className="p-4 space-y-4 min-h-[400px]">
        {!value.sections || value.sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 w-full h-full">
            <FiFileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">Click the buttons above to add content elements</p>
          </div>
        ) : (
          value.sections.map((section, index) => (
            <div
              key={section.id}
              className="border border-slate-200 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {section.type === "heading" && "Heading 1"}
                  {section.type === "subheading" && "Heading 2"}
                  {section.type === "paragraph" && "Paragraph"}
                  {section.type === "list" && "Bullet List"}
                  {section.type === "numbered-list" && "Numbered List"}
                  {section.type === "image" && "Image"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeElement(section.id)}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>

              {section.type === "heading" && (
                <Input
                  value={section.content}
                  onChange={(e) =>
                    updateElement(section.id, { content: e.target.value })
                  }
                  placeholder="Enter heading text..."
                  className="text-xl font-bold"
                />
              )}

              {section.type === "subheading" && (
                <Input
                  value={section.content}
                  onChange={(e) =>
                    updateElement(section.id, { content: e.target.value })
                  }
                  placeholder="Enter subheading text..."
                  className="text-lg font-semibold"
                />
              )}

              {section.type === "paragraph" && (
                <Textarea
                  value={section.content}
                  onChange={(e) =>
                    updateElement(section.id, { content: e.target.value })
                  }
                  placeholder="Enter paragraph text..."
                  rows={3}
                />
              )}

              {section.type === "image" && (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F2E]">
                    <img
                      src={section.content}
                      alt="Content image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Input
                    value={section.content}
                    onChange={(e) =>
                      updateElement(section.id, { content: e.target.value })
                    }
                    placeholder="Image URL..."
                    className="text-sm"
                  />
                </div>
              )}

              {(section.type === "list" ||
                section.type === "numbered-list") && (
                <div className="space-y-2">
                  {section.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 w-6">
                        {section.type === "list" ? "•" : `${itemIndex + 1}.`}
                      </span>
                      <Input
                        value={item}
                        onChange={(e) =>
                          updateListItem(section.id, itemIndex, e.target.value)
                        }
                        placeholder={`List item ${itemIndex + 1}...`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeListItem(section.id, itemIndex)}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(section.id)}
                    className="cursor-pointer"
                  >
                    + Add Item
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StructuredContentEditor;

