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
import { IUpdateProfile } from "@/types/auth";
import SettingsSection from "./SettingsSection";
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

type RequestError = { message?: string; status?: number; data?: { message?: string; error?: string } };

type FieldConfig = {
  name: keyof ProfileFormValues;
  label: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  hint?: string;
};

const personalFields: FieldConfig[] = [
  { name: "fullName", label: "Full name", placeholder: "Your full name" },
  { name: "email", label: "Email", placeholder: "you@example.com", type: "email", disabled: true, hint: "Email can't be changed." },
  { name: "phone", label: "Phone", placeholder: "+1 555 000 0000", type: "tel" },
  { name: "designation", label: "Designation", placeholder: "e.g. Product designer" },
];

const addressFields: FieldConfig[] = [
  { name: "country", label: "Country", placeholder: "Country" },
  { name: "city", label: "City", placeholder: "City" },
  { name: "stateOrRegion", label: "State / region", placeholder: "State or region" },
  { name: "postCode", label: "Post code", placeholder: "Post code" },
];

const inputClass = "h-10 rounded-lg border-slate-200 bg-transparent shadow-none focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10";

function getErrorMessage(err: unknown, fallback: string) {
  const e = (err ?? {}) as RequestError;
  if (e.data?.message) return e.data.message;
  if (e.data?.error) return e.data.error;
  if (e.message) return e.message;
  if (e.status === 500) return "Server error. Please try again or contact support.";
  if (e.status === 401) return "Session expired. Please log in again.";
  if (e.status === 413) return "File too large. Please select a smaller image.";
  if (e.status === 415) return "Invalid file type. Please select a valid image.";
  return fallback;
}

const ProfileEditForm: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const { user, loading: authLoading } = useContext(AuthContext) || {};

  const { updateProfile, isLoading: profileUpdateLoading } = useUpdateProfile();
  const { updateAvatar, isLoading: avatarUpdateLoading } = useUpdateAvatar();
  const { refetch: refetchCurrentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const valuesFromUser = () => ({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    city: user?.profile?.city || "",
    country: user?.profile?.country || "",
    designation: user?.profile?.designation || "",
    stateOrRegion: user?.profile?.stateOrRegion || "",
    postCode: user?.profile?.postCode || "",
  });

  const form = useForm<ProfileFormValues>({
    defaultValues: valuesFromUser(),
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) form.reset(valuesFromUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Release the object URL when the preview changes or the form unmounts
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    event.target.value = "";
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setRemoveExistingImage(true);
  };

  const handleUpdate = async (values: ProfileFormValues) => {
    if (!user) return;

    try {
      const profileData: IUpdateProfile = {
        fullName: values.fullName,
        phone: values.phone,
        city: values.city,
        country: values.country,
        designation: values.designation,
        stateOrRegion: values.stateOrRegion,
        postCode: values.postCode,
      };

      await updateProfile(profileData);
      await refetchCurrentUser();
      queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
      form.reset(values);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Profile update failed!"));
    }
  };

  const handleAvatarUpdate = async () => {
    if (!selectedImage) return;

    try {
      if (selectedImage.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!selectedImage.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const expiresAt = (user as { expiresAt?: string } | null | undefined)?.expiresAt;
      if (expiresAt && new Date() > new Date(expiresAt)) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      // Make sure the session is still valid before uploading
      try {
        await refetchCurrentUser();
      } catch {
        toast.error("Session expired. Please log in again.");
        return;
      }

      await updateAvatar(selectedImage);
      await refetchCurrentUser();
      queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
      queryClient.invalidateQueries({ queryKey: ["authApi", "getCurrentUser"] });

      toast.success("Profile image updated successfully!");
      setSelectedImage(null);
      setPreviewUrl(null);
      setRemoveExistingImage(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Avatar update failed!"));
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4 pb-8">
        {[0, 1, 2, 3].map((row) => <div key={row} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-white/[0.06]" />)}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <ErrorState subject="your profile" onRetry={refetchCurrentUser} compact />
      </div>
    );
  }

  const currentAvatar = previewUrl || (!removeExistingImage ? user.profile?.avatarUrl : undefined);
  const displayName = user.fullName || user.email.split("@")[0];
  const isDirty = form.formState.isDirty;

  const renderFields = (fields: FieldConfig[]) => (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map(({ name, label, placeholder, type, disabled, hint }) => (
        <FormField
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{label}</FormLabel>
              <FormControl>
                <Input
                  placeholder={placeholder}
                  type={type}
                  disabled={disabled}
                  {...field}
                  className={`${inputClass} ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-500 dark:bg-white/[0.03]" : ""}`}
                />
              </FormControl>
              {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );

  const textButton = "cursor-pointer rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5";

  return (
    <>
      <SettingsSection first title="Photo" description="JPG, PNG or WebP, up to 5 MB.">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#6D5DFC] text-lg font-semibold text-white">
            {currentAvatar ? (
              <Image src={currentAvatar} alt="Profile preview" width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedImage ? (
              <>
                <Button type="button" onClick={handleAvatarUpdate} disabled={avatarUpdateLoading} className="tf-btn-primary h-9 cursor-pointer px-4 text-sm">
                  {avatarUpdateLoading ? "Saving…" : "Save photo"}
                </Button>
                <button type="button" onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} disabled={avatarUpdateLoading} className={textButton}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <label className={textButton}>
                  {currentAvatar ? "Change" : "Upload"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                </label>
                {currentAvatar && (
                  <button type="button" onClick={removeImage} className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                    Remove
                  </button>
                )}
              </>
            )}
          </div>
          {selectedImage && <p className="w-full truncate text-xs text-slate-500 dark:text-slate-400">{selectedImage.name}</p>}
        </div>
      </SettingsSection>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdate)}>
          <SettingsSection title="Personal" description="How you appear across Themora.">
            {renderFields(personalFields)}
          </SettingsSection>

          <SettingsSection title="Location" description="Used on invoices and receipts.">
            {renderFields(addressFields)}
          </SettingsSection>

          {/* Only shown while there are unsaved edits; sticks to the bottom of the viewport */}
          {isDirty && (
            <div className="sticky bottom-3 z-10 mb-2 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#0B0F2E]/95 dark:shadow-black/30">
              <p className="text-sm text-slate-600 dark:text-slate-300">Unsaved changes</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => form.reset()} disabled={profileUpdateLoading} className={`${textButton} flex-1 sm:flex-none`}>
                  Discard
                </button>
                <Button type="submit" disabled={profileUpdateLoading} className="tf-btn-primary h-9 flex-1 cursor-pointer px-4 text-sm sm:flex-none">
                  {profileUpdateLoading ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};

export default ProfileEditForm;
