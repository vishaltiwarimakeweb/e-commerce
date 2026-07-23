import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AddressManager } from "@/components/profile/AddressManager";
import { SignOutButton } from "@/components/profile/SignOutButton";

export const metadata: Metadata = { title: "Your profile — Woozi" };

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/sign-in?redirect=/profile");

  const profile = await getProfile(sessionUser.id);
  if (!profile) redirect("/sign-in?redirect=/profile");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Your profile</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your details and saved addresses.
        </p>
      </div>

      <ProfileForm profile={profile} />
      <AddressManager initialAddresses={profile.addresses} />
      <SignOutButton />
    </div>
  );
}
