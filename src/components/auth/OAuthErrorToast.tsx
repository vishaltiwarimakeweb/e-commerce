"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export function OAuthErrorToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "oauth_failed") {
      toast.error("That sign-in attempt didn't go through. Please try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
