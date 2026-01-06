
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useAppData } from "@/context/app-data-context";
import { useMemo } from "react";
import { format, subDays } from "date-fns";

const chartConfig = {
  hours: {
    label: "Study Hours",
    color: "hsl(var(--primary))",
  },
};

export function WeeklyActivityChart() {
  const { studyLogs } = useAppData();

  const data = useMemo(() => {
    const weekData: { [key: string]: number } = {};
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayKey = format(day, "yyyy-MM-dd");
      weekData[dayKey] = 0;
    }
    
    // Aggregate study logs
    studyLogs.forEach(log => {
      const logDate = new Date(log.date);
      const dayKey = format(logDate, "yyyy-MM-dd");
      if (dayKey in weekData) {
        weekData[dayKey] += log.duration;
      }
    });

    return Object.entries(weekData).map(([date, hours]) => ({
      day: format(new Date(date), "E"),
      hours: parseFloat(hours.toFixed(1)),
    }));

  }, [studyLogs]);

  return (
    <ChartContainer config={chartConfig} className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar
            dataKey="hours"
            fill="var(--color-hours)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
