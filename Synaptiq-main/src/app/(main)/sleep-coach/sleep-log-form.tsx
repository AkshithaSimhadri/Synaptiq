
"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SleepLog } from "@/context/app-data-context";

type SleepLogFormProps = {
  onLogSleep: (log: Omit<SleepLog, 'id'>) => void;
};

const getDefaultDate = () => format(new Date(), 'yyyy-MM-dd');
const getYesterdayDate = () => format(subDays(new Date(), 1), 'yyyy-MM-dd');

export function SleepLogForm({ onLogSleep }: SleepLogFormProps) {
  const [date, setDate] = useState(getDefaultDate());
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>("good");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogSleep({ date, bedtime, wakeTime, quality });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="font-headline">Log Your Sleep</CardTitle>
          <CardDescription>
            Add your sleep details from last night to track your patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sleep-date">Date</Label>
            <Select onValueChange={setDate} value={date}>
                <SelectTrigger id="sleep-date">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={getDefaultDate()}>Today</SelectItem>
                    <SelectItem value={getYesterdayDate()}>Yesterday</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedtime">Bedtime</Label>
              <Input
                id="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wake-time">Wake Time</Label>
              <Input
                id="wake-time"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleep-quality">Sleep Quality</Label>
            <Select onValueChange={(v) => setQuality(v as any)} value={quality}>
              <SelectTrigger id="sleep-quality">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Log Sleep</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
