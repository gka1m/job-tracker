"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import Navbar from "../components/Navbar";
import StatsHeader from "../components/StatsHeader";
import AppTable from "../components/AppTable";
import Pagination from "../components/Pagination";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else {
        const userName = session.user.user_metadata?.name || session.user.email;
        setName(userName);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <main className="p-6 flex flex-col gap-6">
        <h1 className="px-5 text-4xl">Welcome back, {name}</h1>
        <h3 className="px-5 text-xl">Applications Overview</h3>
        <StatsHeader />
        <AppTable page={page} setTotalPages={setTotalPages} />

        <div className="flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </main>
    </div>
  );
}
