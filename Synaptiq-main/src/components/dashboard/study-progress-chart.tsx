
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useAppData } from "@/context/app-data-context";
import { useMemo } from "react";

const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--primary))",
  },
};

export function StudyProgressChart() {
  const { subjects, tasks } = useAppData();

  const data = useMemo(() => {
    if (subjects.length === 0) {
      return [
        { subject: "Math", progress: 0 },
        { subject: "Science", progress: 0 },
        { subject: "History", progress: 0 },
      ]
    }

    return subjects.map(subject => {
      const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
      const completedTasks = subjectTasks.filter(t => t.completed).length;
      const progress = subjectTasks.length > 0 ? (completedTasks / subjectTasks.length) * 100 : 0;
      return { subject: subject.name, progress: Math.round(progress) };
    });
  }, [subjects, tasks]);

  return (
    <ChartContainer config={chartConfig} className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="subject"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={5}
            width={80}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
            formatter={(value) => `${value}%`}
          />
          <Bar
            dataKey="progress"
            fill="var(--color-progress)"
            radius={[0, 4, 4, 0]}
            layout="vertical"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
