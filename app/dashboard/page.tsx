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
  // const [loading, setLoading] = useState(true);
  // const [name, setName] = useState("");

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     if (!session) {
  //       router.push("/");
  //     } else {
  //       const userName = session.user.user_metadata?.name || session.user.email;
  //       setName(userName);
  //       setLoading(false);
  //     }
  //   });
  // }, [router]);

  // if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      {/* <h1>Welcome back, {name} 👋</h1> */}
      <main className="p-6 flex flex-col gap-6">
        <h1 className="p-5 text-4xl font-semibold text-gray-900">
          Welcome back 👋
        </h1>
        <h3 className="px-5 text-xl">Your applications at a glance</h3>
        <StatsHeader />
        <AppTable />
        <Pagination page={1} totalPages={1} onPageChange={() => {}} />
      </main>
    </div>
  );
}
