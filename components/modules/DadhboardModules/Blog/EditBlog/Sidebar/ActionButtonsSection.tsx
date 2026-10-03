"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiSave, FiTrash2 } from "react-icons/fi";

interface ActionButtonsSectionProps {
  isCreating: boolean;
  isPublished: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSaveDraft: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
}

const ActionButtonsSection: React.FC<ActionButtonsSectionProps> = ({
  isCreating,
  isPublished,
  onSubmit,
  onSaveDraft,
  onDelete,
  isEditMode = false,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {isEditMode ? (
            // Edit mode buttons
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isCreating}
                className="w-full cursor-pointer"
              >
                <FiSave className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>

              <Button
                type="submit"
                disabled={isCreating}
                className="tf-btn-primary tf-shine w-full cursor-pointer"
                onClick={onSubmit}
              >
                <FiSave className="w-4 h-4 mr-2" />
                {isCreating ? "Updating..." : "Update Blog"}
              </Button>

              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isCreating}
                  className="w-full cursor-pointer"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete Blog
                </Button>
              )}
            </>
          ) : (
            // Create mode buttons
            <>
              <Button
                type="submit"
                disabled={isCreating}
                className="tf-btn-primary tf-shine w-full cursor-pointer"
                onClick={onSubmit}
              >
                <FiSave className="w-4 h-4 mr-2" />
                {isCreating
                  ? "Creating..."
                  : isPublished
                  ? "Publish Blog"
                  : "Save as Draft"}
              </Button>

              {!isPublished && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={isCreating}
                  className="w-full cursor-pointer"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtonsSection;
