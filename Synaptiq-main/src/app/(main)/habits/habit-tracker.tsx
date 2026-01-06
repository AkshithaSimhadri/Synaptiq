
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Droplet,
  Flame,
  PlusCircle,
  Dumbbell,
  Bed,
  Brain,
  BookOpen,
  ScreenShare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/app-data-context";
import { format, isToday, isYesterday, startOfDay } from "date-fns";

// --- Helper Functions for Date Logic ---
const isDateBeforeYesterday = (someDate: Date) => {
    const today = startOfDay(new Date());
    const yesterday = startOfDay(new Date(today.getTime() - 86400000));
    return startOfDay(someDate) < yesterday;
}
// --- End Helper Functions ---


// Habit Definitions
const allHabits = [
  { id: "study", name: "Study", icon: BookOpen, goal: "Log your hours" },
  { id: "water", name: "Drink Water", icon: Droplet, goal: "8 glasses" },
  { id: "exercise", name: "Exercise", icon: Dumbbell, goal: "30 minutes" },
  { id: "sleep", name: "Good Sleep", icon: Bed, goal: "8 hours" },
  { id: "meditate", name: "Meditate", icon: Brain, goal: "10 minutes" },
  { id: "no-screen", name: "No Screen Time", icon: ScreenShare, goal: "1 hr before bed" },
];

type Habit = {
  id: string;
  name: string;
  icon: React.ElementType;
  goal: string;
  streak: number;
  lastCompleted: Date | null;
  completedToday: boolean;
};

// Main Component
export function HabitTracker() {
  const { addStudyLog } = useAppData();
  const [trackedHabits, setTrackedHabits] = useState<Habit[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [logHoursHabitId, setLogHoursHabitId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedHabits = localStorage.getItem("trackedHabits");
      if (savedHabits) {
        const parsedHabits = JSON.parse(savedHabits).map((savedHabit: any) => {
          const habitDefinition = allHabits.find(h => h.id === savedHabit.id);
          const lastCompletedDate = savedHabit.lastCompleted ? new Date(savedHabit.lastCompleted) : null;
          
          let streak = savedHabit.streak || 0;
          let completedToday = false;

          if (lastCompletedDate) {
              if (isToday(lastCompletedDate)) {
                  completedToday = true;
              } else if (isDateBeforeYesterday(lastCompletedDate)) {
                  // If last completed was before yesterday, reset streak
                  streak = 0;
              }
          }

          return {
            ...habitDefinition, // Get the latest name, goal, icon
            ...savedHabit,
            icon: habitDefinition ? habitDefinition.icon : BookOpen, // Fallback icon
            lastCompleted: lastCompletedDate,
            streak,
            completedToday,
          };
        });
        setTrackedHabits(parsedHabits);
      }
    } catch (error) {
      console.error("Failed to load habits from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        // Create a version of habits for storage without the icon component
        const habitsToSave = trackedHabits.map(({ icon, ...rest }) => rest);
        localStorage.setItem("trackedHabits", JSON.stringify(habitsToSave));
      } catch (error) {
        console.error("Failed to save habits to localStorage", error);
      }
    }
  }, [trackedHabits, isMounted]);

  const availableHabits = allHabits.filter(
    (habit) => !trackedHabits.some((th) => th.id === habit.id)
  );

  const addHabit = (habitId: string) => {
    const habitToAdd = allHabits.find((h) => h.id === habitId);
    if (habitToAdd) {
      setTrackedHabits([
        ...trackedHabits,
        { ...habitToAdd, streak: 0, lastCompleted: null, completedToday: false },
      ]);
    }
  };

  const removeHabit = (habitId: string) => {
    setTrackedHabits(trackedHabits.filter((h) => h.id !== habitId));
  };
  
  const markHabitAsComplete = (habitId: string) => {
    if (habitId === 'study') {
        setLogHoursHabitId(habitId);
        return;
    }
    
    setTrackedHabits(
      trackedHabits.map((h) => {
        if (h.id === habitId && !h.completedToday) {
          const now = new Date();
          let newStreak = h.streak;
          
          const lastCompletedDate = h.lastCompleted ? new Date(h.lastCompleted) : null;

          if (lastCompletedDate && isYesterday(lastCompletedDate)) {
            // Completed yesterday, so continue the streak
            newStreak += 1;
          } else if (lastCompletedDate && isToday(lastCompletedDate)) {
            // Already completed today, do nothing to the streak
          } else {
            // Missed a day or it's the first time, so streak is 1
            newStreak = 1;
          }
          
          return { ...h, completedToday: true, lastCompleted: now, streak: newStreak };
        }
        return h;
      })
    );
  };

  const handleLogHours = (hours: number) => {
    if (!logHoursHabitId) return;

    addStudyLog({ date: new Date(), duration: hours });
    
    setTrackedHabits(
      trackedHabits.map((h) => {
        if (h.id === logHoursHabitId && !h.completedToday) {
           const now = new Date();
           let newStreak = h.streak;
           const lastCompletedDate = h.lastCompleted ? new Date(h.lastCompleted) : null;

           if (lastCompletedDate && isYesterday(lastCompletedDate)) {
             newStreak += 1;
           } else if (!lastCompletedDate || isDateBeforeYesterday(lastCompletedDate)) {
             // If never completed, or last completed before yesterday, streak is 1
             newStreak = 1;
           }
          return { ...h, completedToday: true, lastCompleted: now, streak: newStreak };
        }
        return h;
      })
    );
    setLogHoursHabitId(null);
  }

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-[280px] animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" /> Add New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose a Habit to Track</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {availableHabits.length > 0 ? (
                availableHabits.map((habit) => (
                  <Card
                    key={habit.id}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary"
                    onClick={() => {
                      addHabit(habit.id);
                      setAddDialogOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <habit.icon className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">{habit.name}</p>
                        <p className="text-sm text-muted-foreground">{habit.goal}</p>
                      </div>
                    </div>
                    <PlusCircle className="w-5 h-5 text-muted-foreground" />
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground">You are tracking all available habits!</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {trackedHabits.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {trackedHabits.map((habit) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <HabitCard
                  habit={habit}
                  onComplete={markHabitAsComplete}
                  onRemove={removeHabit}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30">
          <h3 className="text-lg font-semibold">No Habits Tracked</h3>
          <p className="text-muted-foreground">
            Click "Add New Habit" to start building healthy routines.
          </p>
        </div>
      )}

      <LogHoursDialog 
        isOpen={!!logHoursHabitId}
        onClose={() => setLogHoursHabitId(null)}
        onLog={handleLogHours}
      />
    </div>
  );
}

function HabitCard({ habit, onComplete, onRemove }: { habit: Habit, onComplete: (id: string) => void, onRemove: (id: string) => void }) {
  const { id, name, icon: Icon, goal, completedToday, streak, lastCompleted } = habit;
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon className={cn("w-6 h-6", id === 'study' ? 'text-blue-500' : 'text-primary')} />
                <CardTitle className="text-xl font-headline">{name}</CardTitle>
            </div>
             <Button variant="ghost" size="sm" onClick={() => onRemove(id)}>
              <span className="text-xs text-muted-foreground">Remove</span>
            </Button>
        </div>
        <CardDescription>{goal}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-secondary/50">
          <Flame
            className={cn(
              "w-8 h-8 transition-colors",
              streak > 0 ? "text-amber-500" : "text-muted-foreground/50"
            )}
          />
          <div className="text-center">
            <p className="text-4xl font-bold font-headline">
              {streak}
            </p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
        </div>
         {lastCompleted && (
          <p className="mt-3 text-xs text-center text-muted-foreground">
            Last completed: {format(lastCompleted, "MMM d, yyyy")}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={completedToday ? "secondary" : "default"}
          onClick={() => onComplete(id)}
          disabled={completedToday}
        >
          {completedToday ? "Completed Today!" : "Mark as Complete"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function LogHoursDialog({ isOpen, onClose, onLog }: { isOpen: boolean, onClose: () => void, onLog: (hours: number) => void}) {
    const [hours, setHours] = useState('');

    const handleSubmit = () => {
        const numHours = parseFloat(hours);
        if (!isNaN(numHours) && numHours > 0) {
            onLog(numHours);
            setHours('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { setHours(''); onClose(); }}}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Study Hours</DialogTitle>
                    <DialogDescription>
                        How many hours did you study today?
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="py-4">
                        <Label htmlFor="study-hours">Hours</Label>
                        <Input 
                            id="study-hours"
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            placeholder="e.g. 2.5"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => { setHours(''); onClose(); }}>Cancel</Button>
                        <Button type="submit">Log Hours</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

    