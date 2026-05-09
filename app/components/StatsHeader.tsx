"use client";
import { useState, useEffect } from "react";

interface Stats {
  applied: number;
  todo: number;
  active: number;
}

const StatsHeader = () => {
  const [stats, setStats] = useState<Stats>({ applied: 0, todo: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/jobs");
      const jobs = await res.json();

      const applied = jobs.filter((j: any) => j.status === "APPLIED").length;
      const todo = jobs.filter(
        (j: any) => j.status === "INTERVIEW_ASSESSMENT",
      ).length;
      const active = jobs.filter((j: any) => j.status !== "REJECTED").length;

      setStats({ applied, todo, active });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Applied",
      value: stats.applied,
      description: "Awaiting responses",
      color: "bg-blue-50 border-blue-100",
      valueColor: "text-blue-600",
    },
    {
      label: "To Do",
      value: stats.todo,
      description: "Interviews & assessments",
      color: "bg-yellow-50 border-yellow-100",
      valueColor: "text-yellow-600",
    },
    {
      label: "Active",
      value: stats.active,
      description: "Total in progress",
      color: "bg-green-50 border-green-100",
      valueColor: "text-green-600",
    },
  ];

  return (
    <div className="p-5 grid grid-cols-3 gap-4 max-w-2xl">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-5 flex flex-col gap-1 ${card.color}`}
        >
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md" />
          ) : (
            <span className={`text-3xl font-semibold ${card.valueColor}`}>
              {card.value}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">
            {card.label}
          </span>
          <span className="text-xs text-gray-400">{card.description}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsHeader;
