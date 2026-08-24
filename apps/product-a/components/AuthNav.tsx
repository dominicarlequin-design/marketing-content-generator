"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentCustomerId, signOut } from "@/lib/auth";

export function AuthNav() {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getCurrentCustomerId().then((id) => {
      setCustomerId(id);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return null;
  }

  if (!customerId) {
    return (
      <span className="flex gap-4 text-sm">
        <Link href="/login" className="underline">
          Log in
        </Link>
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-4 text-sm">
      <Link href="/orders" className="underline">
        My orders
      </Link>
      <Link href="/account" className="text-neutral-500 underline">
        {customerId}
      </Link>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          setCustomerId(null);
        }}
        className="underline"
      >
        Log out
      </button>
    </span>
  );
}
