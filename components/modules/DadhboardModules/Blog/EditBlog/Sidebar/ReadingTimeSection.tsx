"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ReadingTimeSectionProps {
  readingTime: number;
  onReadingTimeChange: (readingTime: number) => void;
}

const ReadingTimeSection: React.FC<ReadingTimeSectionProps> = ({
  readingTime,
  onReadingTimeChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Time</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          name="readingTime"
          type="number"
          value={readingTime}
          onChange={(e) => onReadingTimeChange(Number(e.target.value))}
          min="1"
          max="60"
          className="cursor-text"
        />
        <p className="text-xs text-slate-500 mt-1">
          Estimated reading time in minutes
        </p>
      </CardContent>
    </Card>
  );
};

export default ReadingTimeSection;

