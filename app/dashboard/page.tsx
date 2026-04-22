"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/login");
      else setLoading(false);
    });
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
      >
        Sign out
      </button>
    </div>
  );
}
