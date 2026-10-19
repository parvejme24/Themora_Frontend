"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { FiCheckCircle, FiMessageSquare } from "react-icons/fi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCreateReview, useProductReviews, type ReviewQuery } from "@/hooks/useProductReviewApi";
import { formatDate } from "@/lib/format";
import type { ProductReview } from "@/types/marketplace";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner from "@/components/shared/Feedback/Spinner";
import Pagination from "../shared/Pagination";
import Stars from "../shared/Stars";

const Avatar = ({ name, url }: { name: string; url?: string | null }) =>
  url ? (
    <Image src={url} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
      {name.charAt(0).toUpperCase()}
    </span>
  );

const ReviewItem = ({ review }: { review: ProductReview }) => (
  <li className="py-6">
    <div className="flex items-center gap-3">
      <Avatar name={review.user.fullName} url={review.user.profile?.avatarUrl} />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          {review.user.fullName}
          {review.isVerifiedBuyer && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="h-3.5 w-3.5" /> Verified buyer
            </span>
          )}
        </p>
        <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Stars rating={review.rating} className="h-3 w-3" /> {formatDate(review.createdAt)}
        </p>
      </div>
    </div>
    {review.title && <p className="mt-3 font-semibold text-slate-900 dark:text-white">{review.title}</p>}
    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.body}</p>
    {review.replies.map((reply) => (
      <div key={reply.id} className="ml-6 mt-4 rounded-2xl border-l-2 border-[#1D6FE0] bg-slate-50 p-4 dark:bg-white/5">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">
          {reply.user.fullName} <span className="font-normal text-slate-500">· {reply.user.role === "USER" ? "Author" : "Themora team"}</span>
        </p>
        <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{reply.body}</p>
      </div>
    ))}
  </li>
);

const ReviewForm = ({ slug, onDone }: { slug: string; onDone: () => void }) => {
  const create = useCreateReview(slug);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) return toast.error("Choose a star rating");
    create.mutate(
      { rating, title: title.trim() || undefined, body: body.trim() },
      {
        onSuccess: () => {
          toast.success("Thanks for your review!");
          onDone();
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1D6FE0]/50 focus:ring-4 focus:ring-[#1D6FE0]/10 dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            className="p-0.5"
          >
            <FaStar className={`h-6 w-6 transition ${(hover || rating) >= star ? "text-amber-400" : "text-slate-300 dark:text-white/20"}`} />
          </button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Title (optional)" aria-label="Review title" className={input} />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        minLength={10}
        maxLength={3000}
        required
        rows={4}
        placeholder="What did you build with it? How were the code quality and docs?"
        aria-label="Review"
        className={input}
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="h-10 rounded-full px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
          Cancel
        </button>
        <button
          type="submit"
          disabled={create.isPending || body.trim().length < 10}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          {create.isPending && <Spinner size="xs" tone="light" />} Post review
        </button>
      </div>
    </form>
  );
};

export default function ProductReviews({ slug }: { slug: string }) {
  const [query, setQuery] = useState<ReviewQuery>({ sort: "newest", page: 1, limit: 8 });
  const { data, isLoading, error, refetch } = useProductReviews(slug, query);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [writing, setWriting] = useState(false);
  const summary = data?.summary;

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <div>
        {summary && (
          <>
            <p className="text-5xl font-bold tabular-nums text-slate-900 dark:text-white">{summary.reviewCount ? summary.avgRating.toFixed(1) : "–"}</p>
            <div className="mt-2">
              <Stars rating={summary.avgRating} className="h-4 w-4" />
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {summary.reviewCount} {summary.reviewCount === 1 ? "review" : "reviews"}
            </p>
            <div className="mt-5 space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = summary.breakdown[String(star) as keyof typeof summary.breakdown] ?? 0;
                const pct = summary.reviewCount ? (count / summary.reviewCount) * 100 : 0;
                const active = query.rating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setQuery({ ...query, rating: active ? undefined : star, page: 1 })}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition hover:bg-slate-100 dark:hover:bg-white/5 ${active ? "bg-slate-100 dark:bg-white/5" : ""}`}
                  >
                    <span className="w-3 tabular-nums text-slate-600 dark:text-slate-300">{star}</span>
                    <FaStar className="h-3 w-3 text-amber-400" />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-6 text-right tabular-nums text-slate-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="mt-6">
          {isAuthenticated ? (
            !writing && (
              <button
                type="button"
                onClick={() => setWriting(true)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                <FiMessageSquare className="h-4 w-4" /> Write a review
              </button>
            )
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
            >
              Sign in to review
            </Link>
          )}
        </div>
      </div>

      <div>
        {writing && <ReviewForm slug={slug} onDone={() => setWriting(false)} />}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {query.rating ? `Showing ${query.rating}-star reviews` : "All reviews"}
          </p>
          <select
            value={query.sort}
            onChange={(e) => setQuery({ ...query, sort: e.target.value as ReviewQuery["sort"], page: 1 })}
            aria-label="Sort reviews"
            className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>
        {error ? (
          <ErrorState error={error} subject="reviews" onRetry={refetch} compact className="mt-6" />
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !data?.items.length ? (
          <EmptyState compact className="mt-6" title="No reviews yet" message={query.rating ? "No reviews with this rating." : "Be the first to share what you built."} />
        ) : (
          <>
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {data.items.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
            <Pagination pagination={data.pagination} onPage={(page) => setQuery({ ...query, page })} />
          </>
        )}
      </div>
    </div>
  );
}
