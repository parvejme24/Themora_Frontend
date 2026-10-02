"use client";
import React, { useState } from "react";
import BlogList from "./BlogList";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiPlus, FiEdit3 } from "react-icons/fi";
import { useGetAllBlogs, useDeleteBlog } from "@/hooks/useBlogApi";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/Providers/AuthProvider";
import { UserRole } from "@/types/user";
import Swal from "sweetalert2";
import ErrorState from "@/components/shared/Feedback/ErrorState";

const BLOGS_PER_PAGE = 8;

export default function BlogContainer() {
  const { data: blogsResponse, isLoading, error, refetch } = useGetAllBlogs();
  const [page, setPage] = useState(1);
  const { mutate: deleteBlog } = useDeleteBlog();
  const router = useRouter();
  const { user } = useContext(AuthContext) || {};

  // Permission checking
  const userRole = user?.role;
  const isAdmin =
    (userRole as UserRole) === UserRole.ADMIN ||
    (userRole as UserRole) === UserRole.SUPER_ADMIN;
  const canDelete = isAdmin; // Only admins can delete blogs
  const canEdit = true; // All users can edit their own blogs

  // Extract blogs array from response
  const blogs = blogsResponse?.data || [];

  // Pagination logic - only if blogs > BLOGS_PER_PAGE
  const totalPages = Math.ceil(blogs.length / BLOGS_PER_PAGE);
  const paginatedBlogs =
    blogs.length > BLOGS_PER_PAGE
      ? blogs.slice((page - 1) * BLOGS_PER_PAGE, page * BLOGS_PER_PAGE)
      : blogs;

  const handleEditBlog = (blog: { id: string }) => {
    router.push(`/dashboard/blogs/edit/${blog.id}`);
  };

  const handleDeleteBlog = async (blog: { id: string; title: string }) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete the blog "${blog.title}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteBlog(blog.id);
        Swal.fire({
          title: "Deleted!",
          text: "The blog has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the blog. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* blog header   */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Blogs
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Manage and create your blog posts
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link href="/dashboard/blogs/create" className="cursor-pointer">
            <button className="cursor-pointer group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto justify-center">
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="text-sm sm:text-base">Create New Blog</span>
            </button>
          </Link>
        </div>
      </div>
      <div className="">
        {error ? (
          <ErrorState error={error} subject="blog posts" onRetry={refetch} compact />
        ) : (
          <>
            <BlogList
              blogs={paginatedBlogs}
              onEdit={handleEditBlog}
              onDelete={handleDeleteBlog}
              loading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
            />
            {/* Show pagination only if total blogs > BLOGS_PER_PAGE */}
            {blogs.length > BLOGS_PER_PAGE && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  className="cursor-pointer p-2 rounded-full border border-gray-300 dark:border-blue-800 bg-white dark:bg-blue-800 text-gray-700 dark:text-white disabled:opacity-50 flex items-center justify-center"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={20} />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`px-3 py-1 rounded-full border cursor-pointer transition-colors duration-150 ${
                      page === idx + 1
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white dark:bg-blue-900 text-gray-700 dark:text-white border-gray-300 dark:border-blue-800"
                    }`}
                    onClick={() => setPage(idx + 1)}
                    aria-label={`Go to page ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="cursor-pointer p-2 rounded-full border border-gray-300 dark:border-blue-800 bg-white dark:bg-blue-800 text-gray-700 dark:text-white disabled:opacity-50 flex items-center justify-center"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
