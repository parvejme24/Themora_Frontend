"use client";
import React, { useState, useEffect } from "react";
import { useAddBlogReaction, useGetUserReaction } from "@/hooks/useBlogApi";
import { AuthContext } from "@/Providers/AuthProvider";
import { useContext } from "react";
import { toast } from "sonner";

interface BlogReactionsProps {
  blogId: string;
  reactCount?: number;
}

type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
};

const REACTION_LABELS: Record<ReactionType, string> = {
  LIKE: 'Like',
  LOVE: 'Love',
  HAHA: 'Haha',
  WOW: 'Wow',
  SAD: 'Sad',
  ANGRY: 'Angry',
};

export default function BlogReactions({ blogId, reactCount = 0 }: BlogReactionsProps) {
  const { user } = useContext(AuthContext) || {};
  const addReactionMutation = useAddBlogReaction();
  const { data: userReactionData } = useGetUserReaction(blogId, user?.id);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);

  // Update selected reaction when user reaction data changes
  useEffect(() => {
    if (userReactionData?.data?.reactionType) {
      setSelectedReaction(userReactionData.data.reactionType as ReactionType);
    } else {
      setSelectedReaction(null);
    }
  }, [userReactionData]);

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!user?.id) {
      toast.error("Please log in to react");
      return;
    }

    try {
      // If clicking the same reaction, it will toggle (remove) it
      await addReactionMutation.mutateAsync({
        id: blogId,
        userId: user.id,
        reactionType,
      });

      // Update local state
      if (selectedReaction === reactionType) {
        setSelectedReaction(null);
      } else {
        setSelectedReaction(reactionType);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to add reaction");
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">Enjoyed this article?</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {reactCount > 0 ? `${reactCount} ${reactCount === 1 ? "person has" : "people have"} reacted` : "Be the first to react"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((reactionType) => {
          const isSelected = selectedReaction === reactionType;
          return (
            <button
              key={reactionType}
              type="button"
              onClick={() => handleReactionClick(reactionType)}
              disabled={addReactionMutation.isPending}
              title={REACTION_LABELS[reactionType]}
              aria-label={REACTION_LABELS[reactionType]}
              aria-pressed={isSelected}
              className={`group flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-all duration-200 hover:-translate-y-1 hover:scale-110 active:scale-95 disabled:opacity-50 ${
                isSelected
                  ? "border-transparent bg-gradient-to-br from-[#1D6FE0]/15 to-[#7C5CFC]/15 shadow-md ring-2 ring-[#1D6FE0]/40"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <span className="transition-transform group-hover:scale-110">{REACTION_EMOJIS[reactionType]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
