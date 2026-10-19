"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useUpdateBlogReview,
  useDeleteBlogReview,
  useHideBlogReview,
  useUnhideBlogReview,
} from "@/hooks/useBlogReviewApi";
import { AuthContext } from "@/Providers/AuthProvider";
import { useContext } from "react";
import { toast } from "sonner";
import { BlogReview, UpdateBlogReview } from "@/types/blogReview";
import { FiEdit2, FiTrash2, FiEyeOff, FiEye } from "react-icons/fi";
import Swal from "sweetalert2";
import { useStaff } from "@/hooks/useAdminProductsApi";

interface BlogReviewActionsProps {
  review: BlogReview;
  blogId?: string; // Add blogId for proper cache invalidation
  onUpdated?: () => void;
  onDeleted?: () => void;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditCancel?: () => void;
  editData?: UpdateBlogReview;
  onEditDataChange?: (data: UpdateBlogReview) => void;
}

export default function BlogReviewActions({
  review,
  blogId,
  onUpdated,
  onDeleted,
  isEditing: externalIsEditing,
  onEditStart,
  onEditCancel,
  editData: externalEditData,
  onEditDataChange,
}: BlogReviewActionsProps) {
  const { user } = useContext(AuthContext) || {};
  const updateReviewMutation = useUpdateBlogReview();
  const deleteReviewMutation = useDeleteBlogReview();
  const hideReviewMutation = useHideBlogReview();
  const unhideReviewMutation = useUnhideBlogReview();

  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [internalEditData, setInternalEditData] = useState<UpdateBlogReview>({
    commentText: review.commentText,
    fullName: review.fullName,
    email: review.email,
  });

  // Use external state if provided, otherwise use internal state
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const editData = externalEditData !== undefined ? externalEditData : internalEditData;
  
  const setIsEditing = (value: boolean) => {
    if (externalIsEditing === undefined) {
      setInternalIsEditing(value);
    }
    if (value && onEditStart) {
      onEditStart();
    } else if (!value && onEditCancel) {
      onEditCancel();
    }
  };

  const setEditData = (data: UpdateBlogReview | ((prev: UpdateBlogReview) => UpdateBlogReview)) => {
    if (externalEditData === undefined) {
      setInternalEditData(data);
    } else if (onEditDataChange) {
      const newData = typeof data === 'function' ? data(externalEditData) : data;
      onEditDataChange(newData);
    }
  };

  // Owners and comment moderators can edit/delete; moderators can hide
  const { can } = useStaff();
  const isOwner = user?.id === review.userId;
  const isAdmin = can("reviews:moderate");
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const canHide = isAdmin;

  const handleUpdate = async () => {
    if (!editData.commentText?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await updateReviewMutation.mutateAsync({
        reviewId: review.id,
        data: editData,
      });
      setIsEditing(false);
      toast.success("Review updated successfully!");
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update review");
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this review/comment. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteReviewMutation.mutateAsync({ reviewId: review.id, blogId });
      Swal.fire({
        title: "Deleted!",
        text: "The review has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      onDeleted?.();
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error?.response?.data?.message || "Failed to delete review. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleHide = async () => {
    try {
      await hideReviewMutation.mutateAsync({ reviewId: review.id, blogId });
      toast.success("Review hidden successfully!");
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to hide review");
    }
  };

  const handleUnhide = async () => {
    try {
      await unhideReviewMutation.mutateAsync({ reviewId: review.id, blogId });
      toast.success("Review unhidden successfully!");
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to unhide review");
    }
  };

  if (!canEdit && !canDelete && !canHide) {
    return null;
  }

  // Return only action buttons - edit form will be handled by parent
  return (
    <div className="flex items-center gap-3">
      {canEdit && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
        >
          Edit
        </button>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleteReviewMutation.isPending}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Delete
        </button>
      )}
      {canHide && (
        <>
          {review.isHidden ? (
            <button
              onClick={handleUnhide}
              disabled={unhideReviewMutation.isPending}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Unhide
            </button>
          ) : (
            <button
              onClick={handleHide}
              disabled={hideReviewMutation.isPending}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Hide
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Export edit form component separately
export function BlogReviewEditForm({
  review,
  editData,
  onEditDataChange,
  onSave,
  onCancel,
  isSaving,
}: {
  review: BlogReview;
  editData: { commentText: string; fullName: string; email: string };
  onEditDataChange: (data: { commentText: string; fullName: string; email: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="bg-gray-100 dark:bg-[#0B1026] rounded-2xl rounded-tl-sm px-4 py-2">
        <Textarea
          value={editData.commentText}
          onChange={(e) =>
            onEditDataChange({ ...editData, commentText: e.target.value })
          }
          placeholder="Edit your comment..."
          className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[60px] text-sm text-gray-900 dark:text-gray-200"
          rows={2}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
      </div>
      <div className="flex gap-2 ml-1">
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-7 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          onClick={onCancel}
          disabled={isSaving}
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
