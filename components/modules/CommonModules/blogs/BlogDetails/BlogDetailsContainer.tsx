"use client";
import React, { useContext, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import BlogSidebar from "./BlogSidebar/BlogSidebar";
import BlogReviewForm from "./BlogReviewForm/BlogReviewForm";
import BlogDetailsSkeleton from "./BlogDetailsSkeleton";
import BlogReviewSkeleton from "./BlogReviewSkeleton";
import { useGetBlogById } from "@/hooks/useBlogApi";
import { useGetBlogReviews } from "@/hooks/useBlogReviewApi";
import { IBlog } from "@/types/blog";
import { BlogReview } from "@/types/blogReview";
import BlogReactions from "./BlogReactions/BlogReactions";
import BlogReviewActions, { BlogReviewEditForm } from "./BlogReviewActions/BlogReviewActions";
import { FiArrowLeft, FiArrowRight, FiCalendar, FiChevronRight, FiClock, FiEye, FiHeart, FiLink, FiMessageCircle } from "react-icons/fi";
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { useGetPublishedBlogs } from "@/hooks/useBlogApi";
import BlogCard from "../BlogCard";
import { AuthContext } from "@/Providers/AuthProvider";
import { toast } from "sonner";
import { useUpdateBlogReview } from "@/hooks/useBlogReviewApi";
import ErrorState from "@/components/shared/Feedback/ErrorState";

// Simple date formatter
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export default function BlogDetailsContainer({ id }: { id: string }) {
  const { user } = useContext(AuthContext) || {};
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useGetBlogById(id);
  const blog: IBlog | undefined = data?.data;
  const [editingReviews, setEditingReviews] = useState<Map<string, { commentText: string; fullName: string; email: string }>>(new Map());
  const updateReviewMutation = useUpdateBlogReview();
  
  // Fetch reviews separately using the blog review API
  
  // Fetch reviews separately using the blog review API
  const { data: reviewsData, isLoading: isLoadingReviews, error: reviewsError } = useGetBlogReviews(id, {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Reading progress for the article body
  // (page-level: a target ref isn't mounted during the loading/error early returns)
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  const { data: relatedData } = useGetPublishedBlogs({
    page: 1,
    limit: 4,
    categoryId: blog?.categoryId,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const related = (relatedData?.data || []).filter((b) => b.id !== id).slice(0, 3);

  if (isLoading) return <BlogDetailsSkeleton />;

  if (error)
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-14">
        <ErrorState error={error} subject="this article" onRetry={refetch} backHref="/blogs" backLabel="All articles" />
      </div>
    );

  if (!blog)
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-14">
        <ErrorState
          title="Article not found"
          message="This article may have been moved or unpublished."
          error={{ response: { status: 404 } }}
          backHref="/blogs"
          backLabel="All articles"
        />
      </div>
    );

  // Parse content if it's a string, otherwise use as-is
  let parsedContent: any = null;
  let htmlContent: string | null = null;
  
  if (blog.content) {
    try {
      parsedContent = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
      
      // Check if content has HTML format (rich-text editor format)
      if (parsedContent && typeof parsedContent === "object") {
        if (parsedContent.html && parsedContent.type === "rich-text") {
          htmlContent = parsedContent.html;
        } else if (parsedContent.html) {
          // Fallback: if html exists but type is not specified
          htmlContent = parsedContent.html;
        }
      }
    } catch (e) {
      // If parsing fails, treat as plain text
      parsedContent = { description: blog.content };
    }
  }

  // Parse description if it's a string
  const descriptionParagraphs = blog.description
    ? typeof blog.description === "string"
      ? blog.description.split("\n").filter((p) => p.trim())
      : Array.isArray(blog.description)
      ? blog.description
      : [blog.description]
    : [];

  // Get reviews from API or fallback to blog data
  // Filter out hidden reviews for non-admin users
  const userRole = (user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  
  // Get reviews from API or fallback to blog data
  // Check if we have valid reviews data (not placeholder/loading state)
  const isPlaceholderData = reviewsData?.success === false && reviewsData?.message === 'Loading reviews...';
  const hasValidApiResponse = reviewsData && 
                              reviewsData.success !== false && 
                              reviewsData.data && 
                              Array.isArray(reviewsData.data);
  
  let allReviews: BlogReview[] = [];
  
  if (hasValidApiResponse) {
    // Use API data if available and valid (even if empty array)
    allReviews = reviewsData.data as BlogReview[];
  } else if (!isLoadingReviews && !isPlaceholderData && blog?.reviews && Array.isArray(blog.reviews) && blog.reviews.length > 0) {
    // Fallback to blog data only if not loading, not placeholder, and blog has reviews
    allReviews = blog.reviews as BlogReview[];
  } else if (!isLoadingReviews && !isPlaceholderData && blog?.comments && Array.isArray(blog.comments) && blog.comments.length > 0) {
    // Fallback to blog comments if available
    allReviews = blog.comments as BlogReview[];
  }
  
  const reviews: BlogReview[] = isAdmin 
    ? allReviews 
    : allReviews.filter((review) => !review.isHidden);
  
  // Determine if we should show "No reviews" message
  // Only show if: not loading, not placeholder data, and we've confirmed there are no reviews from API
  const shouldShowNoReviews = !isLoadingReviews && 
                               !isPlaceholderData && 
                               reviews.length === 0 && 
                               hasValidApiResponse;

  const initials = (name?: string) =>
    (name || "Themora")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  const authorName = blog.author?.fullName || "Themora Team";

  const share = (network: "x" | "linkedin" | "facebook") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog.title);
    const links = {
      x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    window.open(links[network], "_blank", "noopener,noreferrer,width=600,height=520");
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const shareButtons = [
    { label: "Share on X", icon: FaXTwitter, onClick: () => share("x") },
    { label: "Share on LinkedIn", icon: FaLinkedinIn, onClick: () => share("linkedin") },
    { label: "Share on Facebook", icon: FaFacebookF, onClick: () => share("facebook") },
    { label: "Copy link", icon: FiLink, onClick: copyLink },
  ];

  const card = "rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0B0F2E]";

  return (
    <div className="overflow-x-clip">
      {/* Reading progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0]"
      />

      {/* Hero */}
      <header className="tf-noise relative isolate">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[460px] w-[460px] rounded-full bg-[#3B82F6]/15 blur-[120px] dark:bg-[#2563EB]/25" />
        <div aria-hidden className="pointer-events-none absolute -right-32 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#8B5CF6]/15 blur-[120px] dark:bg-[#7C3AED]/20" />

        <div className="container mx-auto max-w-4xl px-4 pb-12 pt-12 text-center sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/blogs" className="inline-flex items-center gap-1.5 transition hover:text-slate-900 dark:hover:text-white">
              <FiArrowLeft className="h-3.5 w-3.5" /> Blog
            </Link>
            {blog.category && (
              <>
                <FiChevronRight className="h-3.5 w-3.5" />
                <span className="text-slate-900 dark:text-white">{blog.category.title}</span>
              </>
            )}
          </nav>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-3xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px] dark:text-white"
          >
            {blog.title}
          </motion.h1>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-xs font-semibold text-white">
                {initials(blog.author?.fullName)}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{authorName}</span>
            </span>
            {blog.createdAt && (
              <span className="inline-flex items-center gap-1.5">
                <FiCalendar className="h-4 w-4" /> {formatDate(blog.createdAt)}
              </span>
            )}
            {blog.readingTime ? (
              <span className="inline-flex items-center gap-1.5">
                <FiClock className="h-4 w-4" /> {blog.readingTime} min read
              </span>
            ) : null}
            {blog.viewCount !== undefined && (
              <span className="inline-flex items-center gap-1.5">
                <FiEye className="h-4 w-4" /> {blog.viewCount} views
              </span>
            )}
          </div>
        </div>

        {blog.featuredImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
          >
            <div className="relative">
              <div aria-hidden className="absolute inset-10 -z-10 rounded-[40px] bg-gradient-to-tr from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] opacity-25 blur-3xl" />
              <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-100 shadow-2xl shadow-[#0F35A7]/10 sm:rounded-[36px] dark:border-white/10 dark:bg-white/5">
                <Image src={blog.featuredImageUrl} alt={blog.title} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Body */}
      <div className="container mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Share rail */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-32 flex flex-col items-center gap-3">
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 [writing-mode:vertical-rl]">Share</span>
              {shareButtons.map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:border-transparent hover:bg-slate-900 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-900"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </aside>

          {/* Article */}
          <article className="min-w-0 lg:col-span-7">
            {descriptionParagraphs.length > 0 && (
              <div className="space-y-5">
                {descriptionParagraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "text-xl leading-relaxed text-slate-700 sm:text-[22px] dark:text-slate-200"
                        : "text-[17px] leading-[1.85] text-slate-600 dark:text-slate-300"
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}

            {htmlContent ? (
              <div className="blog-content mt-10" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : parsedContent ? (
              <div className="blog-content mt-10">
                {Array.isArray(parsedContent) ? (
                  parsedContent.map((block: any, idx: number) => (
                    <section key={idx}>
                      {block.heading && <h2>{block.heading}</h2>}
                      {block.subHeading && <h3>{block.subHeading}</h3>}
                      {block.imageUrl && (
                        <div className="relative my-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                          <Image src={block.imageUrl} alt={block.heading || `Content image ${idx + 1}`} fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
                        </div>
                      )}
                      {block.description &&
                        (Array.isArray(block.description)
                          ? block.description.map((p: string, pIdx: number) => <p key={pIdx}>{p}</p>)
                          : <p>{block.description}</p>)}
                    </section>
                  ))
                ) : parsedContent.description ? (
                  Array.isArray(parsedContent.description) ? (
                    parsedContent.description.map((p: string, idx: number) => <p key={idx}>{p}</p>)
                  ) : (
                    <p>{parsedContent.description}</p>
                  )
                ) : null}
              </div>
            ) : null}

            {blog.screenshots && blog.screenshots.length > 0 && (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {blog.screenshots.map((screenshot, idx) => (
                  <div key={idx} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                    <Image src={screenshot} alt={`Screenshot ${idx + 1}`} fill sizes="(min-width: 640px) 360px, 100vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Share (mobile) */}
            <div className="mt-12 flex items-center gap-3 border-t border-slate-200 pt-8 lg:hidden dark:border-white/10">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Share</span>
              {shareButtons.map(({ label, icon: Icon, onClick }) => (
                <button key={label} type="button" onClick={onClick} aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-300">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Reactions */}
            <div className={`${card} mt-12`}>
              <BlogReactions blogId={id} reactCount={blog.reactCount || 0} />
            </div>

            {/* Comments */}
            <section className={`${card} mt-8`}>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white">
                  <FiMessageCircle className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Comments {reviews.length > 0 && <span className="text-slate-400">({reviews.length})</span>}
                </h2>
              </div>

              {isLoadingReviews && <BlogReviewSkeleton count={3} />}

              {!isLoadingReviews && reviews.length > 0 && (
                <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-3">
                    {/* Avatar */}
                    {review.photoUrl ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={review.photoUrl}
                          alt={review.fullName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-sm font-semibold text-white">
                        {review.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      {/* Comment Bubble or Edit Form */}
                      {editingReviews.has(review.id) ? (
                        <BlogReviewEditForm
                          review={review}
                          editData={editingReviews.get(review.id) || { commentText: review.commentText, fullName: review.fullName, email: review.email }}
                          onEditDataChange={(data) => {
                            setEditingReviews((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(review.id, {
                                commentText: data.commentText || review.commentText,
                                fullName: data.fullName || review.fullName,
                                email: data.email || review.email,
                              });
                              return newMap;
                            });
                          }}
                          onSave={async () => {
                            const editData = editingReviews.get(review.id);
                            if (!editData?.commentText?.trim()) {
                              toast.error("Comment cannot be empty");
                              return;
                            }
                            
                            // Start the mutation immediately to show "Saving..." state
                            try {
                              // Optimistically update the cache before API call
                              queryClient.setQueryData(['blog-reviews', id], (oldData: any) => {
                                if (!oldData?.data) return oldData;
                                return {
                                  ...oldData,
                                  data: oldData.data.map((r: BlogReview) =>
                                    r.id === review.id
                                      ? { ...r, commentText: editData.commentText || r.commentText, fullName: editData.fullName || r.fullName, email: editData.email || r.email }
                                      : r
                                  ),
                                };
                              });

                              // Don't close edit form immediately - let isSaving state handle the UI
                              // The form will show "Saving..." button state

                              await updateReviewMutation.mutateAsync({
                                reviewId: review.id,
                                data: {
                                  commentText: editData.commentText,
                                  fullName: editData.fullName,
                                  email: editData.email,
                                },
                              });
                              
                              // Close edit form after successful save
                              setEditingReviews((prev) => {
                                const newMap = new Map(prev);
                                newMap.delete(review.id);
                                return newMap;
                              });
                              
                              toast.success("Review updated successfully!");
                              
                              // Invalidate to sync with server (but UI already updated optimistically)
                              queryClient.invalidateQueries({ queryKey: ['blog-reviews', id], exact: false });
                            } catch (error: any) {
                              // Revert optimistic update on error
                              queryClient.invalidateQueries({ queryKey: ['blog-reviews', id], exact: false });
                              toast.error(error?.response?.data?.message || "Failed to update review");
                            }
                          }}
                          onCancel={() => {
                            setEditingReviews((prev) => {
                              const newMap = new Map(prev);
                              newMap.delete(review.id);
                              return newMap;
                            });
                          }}
                          isSaving={updateReviewMutation.isPending}
                        />
                      ) : (
                        <div className={`inline-block max-w-full rounded-2xl rounded-tl-md px-4 py-3 ${
                          review.isHidden 
                            ? 'bg-slate-200 opacity-60 dark:bg-white/10' 
                            : 'bg-slate-100/80 dark:bg-white/[0.05]'
                        }`}>
                          <div className="mb-1">
                            <span className={`font-semibold text-sm mr-2 ${
                              review.isHidden 
                                ? 'text-gray-500 dark:text-gray-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {review.fullName}
                            </span>
                            {review.createdAt && (
                              <span className={`text-xs ${
                                review.isHidden 
                                  ? 'text-gray-400 dark:text-gray-500' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatDate(review.createdAt)}
                              </span>
                            )}
                            {review.isHidden && isAdmin && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                (Hidden)
                              </span>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed break-words ${
                            review.isHidden 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {review.commentText}
                          </p>
                        </div>
                      )}
                      
                      {/* Actions Row */}
                      <div className="flex items-center gap-4 mt-1 ml-1">
                        {/* Review Actions (Edit/Delete/Hide) */}
                        {user && (
                          <BlogReviewActions 
                            review={review}
                            blogId={id}
                            isEditing={editingReviews.has(review.id)}
                            onEditStart={() => {
                              setEditingReviews((prev) => {
                                const newMap = new Map(prev);
                                newMap.set(review.id, {
                                  commentText: review.commentText,
                                  fullName: review.fullName,
                                  email: review.email,
                                });
                                return newMap;
                              });
                            }}
                            onEditCancel={() => {
                              setEditingReviews((prev) => {
                                const newMap = new Map(prev);
                                newMap.delete(review.id);
                                return newMap;
                              });
                            }}
                            onUpdated={() => {
                              queryClient.invalidateQueries({ queryKey: ['blog-reviews', id], exact: false });
                            }}
                            onDeleted={() => {
                              queryClient.invalidateQueries({ queryKey: ['blog-reviews', id], exact: false });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {shouldShowNoReviews && (
                <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-white/10">
                <BlogReviewForm blogId={id} />
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-32">
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Written by</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-sm font-semibold text-white shadow-lg shadow-[#3F5BF0]/30">
                    {initials(blog.author?.fullName)}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{authorName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Author at Themora</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3 text-center dark:divide-white/10 dark:bg-white/[0.03]">
                  {[
                    { icon: FiEye, value: blog.viewCount ?? 0, label: "Views" },
                    { icon: FiHeart, value: blog.reactCount ?? 0, label: "Reactions" },
                    { icon: FiMessageCircle, value: reviews.length, label: "Comments" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label}>
                      <Icon className="mx-auto h-4 w-4 text-slate-400" />
                      <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{value}</p>
                      <p className="text-[11px] text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <BlogSidebar excludeId={id} />
            </div>
          </aside>
        </div>

        {/* Keep reading */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-slate-200 pt-16 dark:border-white/10">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6FE0] dark:text-[#8DB8FF]">Keep reading</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">More from {blog.category?.title ?? "the blog"}</h2>
              </div>
              <Link href="/blogs" className="group hidden items-center gap-1.5 text-sm font-semibold text-[#1D6FE0] sm:inline-flex dark:text-[#8DB8FF]">
                All articles <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
