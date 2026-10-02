"use client";
import React, { useEffect, useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthContext } from "@/Providers/AuthProvider";
import { IUser, IUpdateProfile } from "@/types/auth";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";
import {
  useUpdateProfile,
  useUpdateAvatar,
  useCurrentUser,
} from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import ErrorState from "@/components/shared/Feedback/ErrorState";

interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  designation: string;
  stateOrRegion: string;
  postCode: string;
}

const ProfileEditForm: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const { user, loading: authLoading } = useContext(AuthContext) || {};

  // Use the proper hooks for profile and avatar updates
  const { updateProfile, isLoading: profileUpdateLoading } = useUpdateProfile();
  const { updateAvatar, isLoading: avatarUpdateLoading } = useUpdateAvatar();
  const { refetch: refetchCurrentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.profile?.phone || "",
      city: user?.profile?.city || "",
      country: user?.profile?.country || "",
      designation: user?.profile?.designation || "",
      stateOrRegion: user?.profile?.stateOrRegion || "",
      postCode: user?.profile?.postCode || "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        city: user.profile?.city || "",
        country: user.profile?.country || "",
        designation: user.profile?.designation || "",
        stateOrRegion: user.profile?.stateOrRegion || "",
        postCode: user.profile?.postCode || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setRemoveExistingImage(true);
  };

  const handleUpdate = async (values: ProfileFormValues) => {
    if (!user) return;

    try {
      setError(null);

      // Prepare profile update data (excluding avatar - handled separately)
      const profileData: IUpdateProfile = {
        fullName: values.fullName,
        phone: values.phone,
        city: values.city,
        country: values.country,
        designation: values.designation,
        stateOrRegion: values.stateOrRegion,
        postCode: values.postCode,
      };

      // Update profile information only
      await updateProfile(profileData);

      // Refresh current user data to get updated information
      await refetchCurrentUser();

      // Also invalidate the cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });

      toast.success("Profile updated successfully!");

      // Don't clear the form - keep the updated values
    } catch (err: any) {
      const errorMessage = err?.message || "Profile update failed!";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Separate function for avatar upload
  const handleAvatarUpdate = async () => {
    if (!selectedImage) return;

    try {
      setError(null);

      // Validate file
      if (selectedImage.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!selectedImage.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Check if token is expired
      const expiresAt = (user as any)?.expiresAt;
      if (expiresAt) {
        const expirationDate = new Date(expiresAt);
        const now = new Date();

        if (now > expirationDate) {
          toast.error("Session expired. Please log in again.");
          return;
        }
      }

      // Test if current user endpoint works first
      try {
        await refetchCurrentUser();
      } catch (currentUserError) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      // Upload avatar using backend API
      await updateAvatar(selectedImage);

      // Refresh current user data to get updated information
      // The hook already invalidates cache, but we refetch to ensure immediate update
      await refetchCurrentUser();
      
      // Also invalidate React Query cache to ensure all components update
      queryClient.invalidateQueries({ queryKey: ['getCurrentUser'] });
      queryClient.invalidateQueries({ queryKey: ['authApi', 'getCurrentUser'] });

      toast.success("Profile image updated successfully!");

      // Clear image selection after successful update
      setSelectedImage(null);
      setPreviewUrl(null);
      setRemoveExistingImage(false);
    } catch (err: any) {
      // Try to get more specific error information
      let errorMessage = "Avatar update failed!";

      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 500) {
        errorMessage = "Server error. Please try again or contact support.";
      } else if (err?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (err?.status === 413) {
        errorMessage = "File too large. Please select a smaller image.";
      } else if (err?.status === 415) {
        errorMessage = "Invalid file type. Please select a valid image.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Show loading state while fetching user data
  if (authLoading) {
    return (
      <div className="shadow p-6 flex-1 bg-white dark:bg-[#1A1D37] rounded-md">
        <div className="space-y-6">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if user data couldn't be fetched
  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <ErrorState subject="your profile" onRetry={refetchCurrentUser} compact />
      </div>
    );
  }

  return (
    <div className="shadow p-6 flex-1 bg-white dark:bg-[#1A1D37] rounded-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Update your personal information and profile picture
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleUpdate)}>
          {/* Image Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (user as any)?.profile?.avatarUrl &&
                  !removeExistingImage ? (
                  <Image
                    src={(user as any).profile.avatarUrl}
                    alt="Current profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Camera className="w-12 h-12 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Remove Button */}
              {(previewUrl ||
                ((user as any)?.profile?.avatarUrl &&
                  !removeExistingImage)) && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500 text-center">
              Click the camera icon to upload a new profile picture
            </p>

            {/* Save Avatar Button - Show when image is selected or when loading */}
            {(selectedImage || avatarUpdateLoading) && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={handleAvatarUpdate}
                  disabled={avatarUpdateLoading || !selectedImage}
                  className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-md transition-all duration-200 shadow-lg ${
                    avatarUpdateLoading || !selectedImage
                      ? 'cursor-not-allowed opacity-75'
                      : 'cursor-pointer hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {avatarUpdateLoading ? (
                    <div className="flex items-center gap-2 min-w-[180px] justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving Profile Image...</span>
                    </div>
                  ) : (
                    <span>Save Profile Image</span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      type="email"
                      {...field}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stateOrRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Region</FormLabel>
                  <FormControl>
                    <Input placeholder="State or Region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Post Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              disabled={!form.formState.isDirty || profileUpdateLoading}
            >
              {profileUpdateLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileEditForm;
