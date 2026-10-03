"use client";
import React, { useContext } from "react";
import { AuthContext } from "@/Providers/AuthProvider";

import ProfileCard, { ProfileAccountDetails } from "@/components/modules/DadhboardModules/profile/ProfileCard";
import ProfileEditForm from "@/components/modules/DadhboardModules/profile/ProfileEditForm";

export default function ProfilePage() {
  const { user, loading } = useContext(AuthContext) || {};

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#1D6FE0] dark:border-white/20 dark:border-t-[#8DB8FF]"></div>
      </div>
    );
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
