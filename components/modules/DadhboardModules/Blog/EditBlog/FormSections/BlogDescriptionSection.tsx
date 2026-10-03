"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface BlogDescriptionSectionProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

const BlogDescriptionSection: React.FC<BlogDescriptionSectionProps> = ({
  description,
  onDescriptionChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          name="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter blog description (each line will be a separate paragraph)"
          rows={4}
          required
          className="cursor-text"
        />
        <p className="text-xs text-slate-500 mt-1">
          Each line will become a separate paragraph in the description array
        </p>
      </CardContent>
    </Card>
  );
};

export default BlogDescriptionSection;

