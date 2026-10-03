"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BlogSlugSectionProps {
  slug: string;
  onSlugChange: (slug: string) => void;
}

const BlogSlugSection: React.FC<BlogSlugSectionProps> = ({
  slug,
  onSlugChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>URL Slug</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          name="slug"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="url-friendly-slug"
          className="cursor-text font-mono"
        />
        <p className="text-xs text-slate-500 mt-1">
          Auto-generated from title (editable)
        </p>
      </CardContent>
    </Card>
  );
};

export default BlogSlugSection;

