"use client";
import React, { useContext } from "react";
import { AuthContext } from "@/Providers/AuthProvider";

import ProfileCard, { ProfileAccountDetails } from "@/components/modules/DadhboardModules/profile/ProfileCard";
import ProfileEditForm from "@/components/modules/DadhboardModules/profile/ProfileEditForm";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export default function ProfilePage() {
  const { user, loading } = useContext(AuthContext) || {};

  if (loading) {
    return <LoadingState className="min-h-[60vh]" />;
  }

  if (!user) {
    return <div className="py-10 text-center text-slate-500 dark:text-slate-400">Please login to view your profile.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <ProfileCard />
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 pt-7 sm:mt-8 sm:px-8 sm:pt-8 dark:border-white/10 dark:bg-[#0B0F2E]">
        <ProfileEditForm />
        <ProfileAccountDetails />
      </div>
    </div>
  );
}
