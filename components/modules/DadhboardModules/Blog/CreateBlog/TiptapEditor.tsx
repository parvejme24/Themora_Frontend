"use client";

import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import { FiImage, FiUpload, FiX } from "react-icons/fi";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Custom image extension with upload support
const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },
});

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      CustomImage.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      PlaceholderExtension.configure({
        placeholder: "Start writing your blog content...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  // Upload image to backend/Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      // Try uploading to backend - using the same pattern as blog image uploads
      // The backend should handle Cloudinary upload
      const token = localStorage.getItem("nextAuthSecret");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5050/api/v1";

      const response = await fetch(`${baseUrl}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Check various possible response structures
        const imageUrl =
          result?.url ||
          result?.data?.url ||
          result?.data?.imageUrl ||
          result?.imageUrl;
        if (imageUrl) {
          return imageUrl;
        }
      }

      // If backend upload fails, use base64 as fallback
      throw new Error("Backend upload failed, using base64");
    } catch (error: any) {
      console.warn("Image upload to backend failed, using base64:", error);

      // Fallback: Use base64 encoding for immediate display
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Url = reader.result as string;
          toast.info("Image uploaded as base64 (backend upload unavailable)");
          resolve(base64Url);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read image file"));
        };
        reader.readAsDataURL(file);
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      handleImageUpload(imageFiles[0]); // Upload first image
      if (imageFiles.length > 1) {
        toast.info(
          `${imageFiles.length - 1} more image(s) ignored. Upload one at a time.`,
        );
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Update editor content when content prop changes externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-white/[0.04] min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-white/[0.04]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F2E]">
        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`px-3 py-1.5 text-sm font-semibold rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Heading 1 - Apply to selected text"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`px-3 py-1.5 text-sm font-semibold rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Heading 2 - Apply to selected text"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`px-3 py-1.5 text-sm font-semibold rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Heading 3 - Apply to selected text"
          >
            H3
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 px-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("bold")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Bold - Select text and click"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("italic")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Italic - Select text and click"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("strike")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Strikethrough - Select text and click"
          >
            <s>S</s>
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 px-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("bulletList")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("orderedList")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("blockquote")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Blockquote"
          >
            "
          </button>
        </div>

        {/* Image Upload */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 px-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={isUploading}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors flex items-center gap-1 ${
              isUploading
                ? "opacity-50 cursor-not-allowed"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Upload Image - Click to select image file"
          >
            <FiImage className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Image"}
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 px-2">
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors ${
              editor.isActive("link")
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            }`}
            title="Add Link - Select text and click"
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
            disabled={!editor.isActive("link")}
            title="Remove Link"
          >
            Unlink
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors text-slate-700 dark:text-slate-300"
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="px-3 py-1.5 text-sm rounded hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-colors text-slate-700 dark:text-slate-300"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Editor with drag and drop */}
      <div onDrop={handleDrop} onDragOver={handleDragOver} className="relative">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 400px;
          padding: 1rem;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 0.875rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          cursor: pointer;
        }
        .ProseMirror img:hover {
          opacity: 0.9;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror strong {
          font-weight: 700;
        }
        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
