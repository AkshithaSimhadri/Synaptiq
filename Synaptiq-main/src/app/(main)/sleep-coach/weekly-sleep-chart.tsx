
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, subDays, differenceInMinutes, parse } from "date-fns";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { SleepLog } from "@/context/app-data-context";
import { useMemo } from "react";

const chartConfig = {
  hours: {
    label: "Sleep Hours",
    color: "hsl(var(--primary))",
  },
};

const calculateDuration = (bedtime: string, wakeTime: string, date: string): number => {
    const bedDateTime = parse(`${date} ${bedtime}`, 'yyyy-MM-dd HH:mm', new Date());
    let wakeDateTime = parse(`${date} ${wakeTime}`, 'yyyy-MM-dd HH:mm', new Date());

    // If wake time is on the next day
    if (wakeDateTime <= bedDateTime) {
        wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }
    
    const durationMinutes = differenceInMinutes(wakeDateTime, bedDateTime);
    return durationMinutes / 60;
};

export function WeeklySleepChart({ logs }: { logs: SleepLog[] }) {
  const data = useMemo(() => {
    const weekData: { [key: string]: number } = {};
    const today = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayKey = format(day, "yyyy-MM-dd");
      weekData[dayKey] = 0;
    }

    // Aggregate sleep logs
    logs.forEach(log => {
      if (log.date in weekData) {
        weekData[log.date] = calculateDuration(log.bedtime, log.wakeTime, log.date);
      }
    });

    return Object.entries(weekData).map(([date, hours]) => ({
      day: format(new Date(date), "E"),
      hours: parseFloat(hours.toFixed(1)),
    }));
  }, [logs]);

  return (
    <ChartContainer config={chartConfig} className="w-full h-[250px]">
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
