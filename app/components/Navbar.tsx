"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Home, UserRound } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userName = session.user.user_metadata?.name || session.user.email;
        setName(userName);
      }
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="w-full px-6 py-4 bg-transparent flex items-center justify-between">
      {/* Left — app name */}
      <button
        onClick={() => router.push("/dashboard")}
        className="p-2 roudned-lg text-[#F5F7FA] hover:text-[#AAB4C3] cursor-pointer"
      >
        <Home size={20} />
      </button>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-[#0032A5] text-[#F5F7FA] flex items-center justify-center cursor-pointer hover:bg-[#0E2A47] transition-colors"
          >
            <UserRound size={18} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#F5F7FA] rounded-xl border border-[#F5F7FA] shadow-sm py-1 z-50">
              <div className="px-4 py-2 border-b border-[#F5F7FA]">
                <p className="text-sm font-medium text-black truncate">
                  {name}
                </p>
                <p className="text-xs text-[#AAB4C3]">Signed in</p>
              </div>
              <button
                onClick={() => {
                  router.push("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-[#AAB4C3] transition-colors cursor-pointer"
              >
                Edit profile
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
