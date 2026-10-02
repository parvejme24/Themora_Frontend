import React, { useContext } from "react";
import Image from "next/image";
import { User as UserIcon, Phone, Globe, DollarSign } from "lucide-react";
import { FaEnvelopeOpen } from "react-icons/fa";
import { Clock } from "lucide-react";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { AuthContext } from "@/Providers/AuthProvider";
import { RiAdminLine } from "react-icons/ri";
import { IUser } from "@/types/auth";
import { useCurrentUser } from "@/hooks/useAuth";
import ErrorState from "@/components/shared/Feedback/ErrorState";

const ProfileCard: React.FC = () => {
  const { user: authContextUser, loading, error } = useContext(AuthContext) || {};
  const { data: currentUserData } = useCurrentUser();
  
  // Prioritize fresh API data over cached context data
  const user = currentUserData?.data?.user || authContextUser;
  
  
  const displayName = user?.fullName || (user as any)?.name || "N/A";
  const photoUrl = user?.profile?.avatarUrl || (user as any)?.image || "";

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1A1D37] rounded-lg shadow p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mb-2"></div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="mt-4 space-y-2 w-full">
            {[...Array(7)].map((_, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <hr className="w-full border-dashed border-gray-400 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <ErrorState error={error} subject="your profile" compact />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1A1D37] rounded-lg shadow p-6">
      <div className="flex flex-col items-center gap-2">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-2">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="user profile"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {displayName && displayName !== "N/A"
                ? displayName.trim().split(" ").length >= 2
                  ? `${displayName.trim().split(" ")[0][0]}${
                      displayName.trim().split(" ")[
                        displayName.trim().split(" ").length - 1
                      ][0]
                    }`.toUpperCase()
                  : displayName[0].toUpperCase()
                : "U"}
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold">{displayName}</h3>
        <p className="text-gray-500">
          {user?.profile?.designation || "No designation"}
        </p>

        <div className="mt-4 space-y-2 w-full">
          <div className="flex items-center gap-2 py-1">
            <FaEnvelopeOpen className="text-2xl" /> {user?.email || "N/A"}
          </div>
          <hr className="w-full border-dashed border-gray-400" />
          <div className="flex items-center gap-2 py-1">
            <RiAdminLine className="text-2xl" /> {user?.role || "N/A"}
          </div>
          <hr className="w-full border-dashed border-gray-400" />
          <div className="flex items-center gap-2 py-1">
            <Phone className="text-2xl" /> {user?.profile?.phone || "N/A"}
          </div>
          <hr className="w-full border-dashed border-gray-400" />
          <div className="flex items-center gap-2 py-1">
            <Globe className="text-2xl" /> {user?.profile?.country || "N/A"}
          </div>
          <hr className="w-full border-dashed border-gray-400" />
          <div className="flex items-center gap-2 py-1">
            <IoCheckmarkCircleSharp className="text-green-500 text-2xl" />{" "}
            Verified: {user?.otpVerified ? "Yes" : "No"}
          </div>
          <hr className="w-full border-dashed border-gray-400" />
          <div className="flex items-center gap-2 py-1">
            <Clock className="text-2xl" /> Member since:{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
