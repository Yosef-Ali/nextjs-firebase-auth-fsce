import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostStatus } from '@/types/post';

interface PostStatusSelectProps {
  initialStatus: PostStatus;
  onStatusChange: (newStatus: PostStatus) => void;
}

export const PostStatusSelect = ({
  initialStatus,
  onStatusChange
}: PostStatusSelectProps) => {
  return (
    <div className="grid gap-3">
      <Label htmlFor="status">Status</Label>
      <Select
        value={initialStatus}
        onValueChange={onStatusChange}
      >
        <SelectTrigger id="status">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};