"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiEye, FiEyeOff, FiMessageSquare, FiStar } from "react-icons/fi";
import { toast } from "sonner";
import { useAdminReviews, useSetReviewStatus, useStaffReply, type AdminReview } from "@/hooks/useAdminApi";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import Stars from "@/components/modules/Storefront/shared/Stars";
import { Badge, Card, buttonClass, inputClass, type Tone } from "@/components/modules/Account/ui";
import { StatusTabs } from "./AdminUi";

type ReviewStatus = "APPROVED" | "PENDING" | "HIDDEN";

const STATUS: Record<ReviewStatus, { label: string; tone: Tone }> = {
  APPROVED: { label: "Visible", tone: "green" },
  PENDING: { label: "Pending", tone: "amber" },
  HIDDEN: { label: "Hidden", tone: "gray" },
};

const ReviewCard = ({ review }: { review: AdminReview }) => {
  const setStatus = useSetReviewStatus();
  const reply = useStaffReply();
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState("");

  const change = (status: ReviewStatus) =>
    setStatus.mutate({ id: review.id, status }, { onSuccess: () => toast.success(status === "HIDDEN" ? "Review hidden; the rating was recalculated" : "Review visible"), onError: (e) => toast.error(e.message) });

  return (
    <Card as="li" className="!p-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Stars rating={review.rating} />
        <span className="font-semibold text-slate-900 dark:text-white">{review.user.fullName}</span>
        {review.isVerifiedBuyer && <span className="text-xs text-emerald-600">verified buyer</span>}
        <span className="text-slate-500">
          on{" "}
          <Link href={`/products/${review.product.slug}#reviews`} target="_blank" className="font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
            {review.product.title}
          </Link>{" "}
          · {formatDate(review.createdAt)}
        </span>
        <span className="ml-auto">
          <Badge tone={STATUS[review.status].tone}>{STATUS[review.status].label}</Badge>
        </span>
      </div>
      {review.title && <p className="mt-3 font-semibold text-slate-900 dark:text-white">{review.title}</p>}
      <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{review.body}</p>
      {review.replies.map((r) => (
        <p key={r.id} className="ml-4 mt-3 border-l-2 border-[#1D6FE0] pl-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{r.user.fullName}:</span> {r.body}
        </p>
      ))}
      {replying && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            reply.mutate(
              { reviewId: review.id, body: body.trim() },
              {
                onSuccess: () => {
                  setReplying(false);
                  setBody("");
                  toast.success("Reply posted");
                },
                onError: (e) => toast.error(e.message),
              }
            );
          }}
          className="mt-3 space-y-2"
        >
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} minLength={2} maxLength={2000} placeholder="Public reply from the Themora team" aria-label="Reply" className={inputClass} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setReplying(false)} className={buttonClass.secondary}>
              Cancel
            </button>
            <button type="submit" disabled={reply.isPending || body.trim().length < 2} className={buttonClass.primary}>
              Post reply
            </button>
          </div>
        </form>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {review.status !== "HIDDEN" ? (
          <button type="button" onClick={() => change("HIDDEN")} disabled={setStatus.isPending} className={buttonClass.secondary}>
            <FiEyeOff className="h-4 w-4" /> Hide
          </button>
        ) : (
          <button type="button" onClick={() => change("APPROVED")} disabled={setStatus.isPending} className={buttonClass.secondary}>
            <FiEye className="h-4 w-4" /> Show again
          </button>
        )}
        {review.status === "PENDING" && (
          <button type="button" onClick={() => change("APPROVED")} disabled={setStatus.isPending} className={buttonClass.primary}>
            <FiCheckCircle className="h-4 w-4" /> Approve
          </button>
        )}
        {!replying && (
          <button type="button" onClick={() => setReplying(true)} className={buttonClass.secondary}>
            <FiMessageSquare className="h-4 w-4" /> Reply
          </button>
        )}
      </div>
    </Card>
  );
};

export default function ReviewsModeration() {
  const [status, setStatus] = useState<ReviewStatus | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAdminReviews({ status: status || undefined, page, limit: 20 });

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Hidden reviews disappear from the store and stop counting towards the product's rating." />
      <StatusTabs
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[
          { value: "", label: "All" },
          { value: "PENDING", label: "Pending" },
          { value: "APPROVED", label: "Visible" },
          { value: "HIDDEN", label: "Hidden" },
        ]}
      />
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="reviews" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiStar} title="No reviews here" />
      ) : (
        <>
          <ul className="space-y-3">
            {data.items.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
