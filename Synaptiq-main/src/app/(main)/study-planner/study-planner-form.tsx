
"use client";

import { useActionState, useState, useEffect, use } from "react";
import { useFormStatus } from "react-dom";
import { addDays, format, parse } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateStudyPlanAction, StudyPlannerOutput } from "./actions";
import { PlusCircle, Trash2, CalendarIcon, AlertCircle, BarChart, CalendarDays, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/app-data-context";

type Subject = {
  id: string;
  name: string;
  topics: string;
  difficulty: "easy" | "medium" | "hard";
  examDate: Date | undefined;
};

const initialState: {
  message: string;
  errors: any;
  data: StudyPlannerOutput | null;
} = {
  message: "",
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Generating Plan..." : "Generate My Study Plan"}
    </Button>
  );
}

export function StudyPlannerForm() {
  const [serverState, formAction] = useActionState(generateStudyPlanAction, initialState);
  const [displayState, setDisplayState] = useState(initialState);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState("4");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string | undefined>();

  const { setSubjects: setSubjectsInContext, setTasks, tasks } = useAppData();

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    setSubjects([
        { id: String(Date.now()), name: "", topics: "10", difficulty: "medium", examDate: addDays(new Date(), 30) },
    ]);
    try {
        const savedPlan = localStorage.getItem('studyPlan');
        if (savedPlan) {
            const parsedPlan = JSON.parse(savedPlan);
            setDisplayState(parsedPlan);
            if (parsedPlan.data?.dailySchedule?.[0]?.day) {
                setSelectedScheduleDay(parsedPlan.data.dailySchedule[0].day);
            }
        }
    } catch (e) {
        console.error("Failed to load study plan from localStorage", e);
    }
  }, []);
  
  // Handle updates from server action
  useEffect(() => {
    if (serverState.message) { // This means the action has completed
        setDisplayState(serverState);
        if (serverState.data) {
            // Save successful plan to localStorage
            localStorage.setItem('studyPlan', JSON.stringify(serverState));

            if (serverState.data.dailySchedule?.[0]?.day) {
              setSelectedScheduleDay(serverState.data.dailySchedule[0].day);
            }

            // Update global context
            const newSubjects = serverState.data.completionTracker.map(ct => {
                const originalSubject = subjects.find(s => s.id === ct.subjectId);
                return {
                id: ct.subjectId,
                name: ct.subject,
                topicCount: ct.totalTopics,
                difficulty: originalSubject?.difficulty || 'medium',
                }
            });
            setSubjectsInContext(newSubjects);

            const newTasks = serverState.data.completionTracker.flatMap(ct => 
                Array.from({ length: ct.totalTopics }, (_, i) => ({
                id: `${ct.subjectId}-task-${i}`,
                subjectId: ct.subjectId,
                title: `${ct.subject} - Topic ${i + 1}`,
                completed: false,
                }))
            );
            setTasks(newTasks);
        } else {
             // If submission failed, remove old plan from localStorage
             localStorage.removeItem('studyPlan');
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverState]);


  const addSubject = () => {
    setSubjects([
      ...subjects,
      { id: String(Date.now()), name: "", topics: "10", difficulty: "medium", examDate: addDays(new Date(), 30) },
    ]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleSubjectChange = (id: string, field: keyof Omit<Subject, 'id'>, value: any) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };
  
  const handleFormAction = (formData: FormData) => {
    // Clear current display state when generating a new plan
    setDisplayState(initialState);
    localStorage.removeItem('studyPlan');
    formAction(formData);
  }

  const selectedDayData = displayState.data?.dailySchedule.find(d => d.day === selectedScheduleDay);

  if (!isMounted) {
      return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form action={handleFormAction} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Study Inputs</CardTitle>
              <CardDescription>Tell the AI how much time you can commit and what you need to study.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hoursPerDay">How many hours can you study per day?</Label>
                <Input
                  id="hoursPerDay"
                  name="hoursPerDay"
                  type="number"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  placeholder="e.g., 3.5"
                  required
                />
                 {displayState.errors?.hoursPerDay && <p className="text-sm text-destructive">{displayState.errors.hoursPerDay[0]}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Subjects</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                  <PlusCircle className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
              <CardDescription>Add each subject, its size, difficulty, and exam date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {subjects.map((subject, index) => (
                    <div key={subject.id} className="p-4 space-y-3 border rounded-lg bg-secondary/30">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`subjects[${index}].name`} className="font-semibold">Subject {index + 1}</Label>
                             <Button type="button" variant="ghost" size="icon" className="w-8 h-8 -mt-2 -mr-2 text-muted-foreground" onClick={() => removeSubject(subject.id)} disabled={subjects.length <= 1}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </div>
                        {/* Hidden inputs for form submission */}
                        <input type="hidden" name={`subjects[${index}].id`} value={subject.id} />
                        <input type="hidden" name={`subjects[${index}].examDate`} value={subject.examDate?.toISOString() ?? ''} />
                        <div className="space-y-2">
                           <Label htmlFor={`subjects[${index}].name`}>Subject Name</Label>
                            <Input 
                                id={`subjects[${index}].name`}
                                name={`subjects[${index}].name`}
                                placeholder="e.g. Calculus II"
                                value={subject.name}
                                onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                               <Label htmlFor={`subjects[${index}].topics`}>Topics / Chapters</Label>
                               <Input 
                                  id={`subjects[${index}].topics`}
                                  name={`subjects[${index}].topics`}
                                  type="number" 
                                  placeholder="e.g., 12" 
                                  required 
                                  value={subject.topics}
                                  onChange={(e) => handleSubjectChange(subject.id, 'topics', e.target.value)}
                                />
                             </div>
                            <div className="space-y-2">
                              <Label>Difficulty</Label>
                              <Select 
                                  name={`subjects[${index}].difficulty`}
                                  required
                                  value={subject.difficulty}
                                  onValueChange={(value) => handleSubjectChange(subject.id, 'difficulty', value)}
                              >
                                  <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="easy">Easy</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="hard">Hard</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Exam Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !subject.examDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {subject.examDate ? format(subject.examDate, "PPP") : <span>Pick exam date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={subject.examDate}
                                        onSelect={(date) => handleSubjectChange(subject.id, 'examDate', date)}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                         </div>
                    </div>
                ))}
                {displayState.errors?.subjects && <p className="text-sm text-destructive">{Array.isArray(displayState.errors.subjects) ? displayState.errors.subjects[0] : "Please check your subject details."}</p>}
            </CardContent>
             <CardFooter>
                 <SubmitButton />
             </CardFooter>
          </Card>
        </form>
      </div>
      
      <div className="lg:col-span-2">
         {displayState.data ? (
             <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily"><CalendarDays className="hidden w-4 h-4 mr-2 md:inline-block" />Daily Schedule</TabsTrigger>
                    <TabsTrigger value="weekly"><BarChart className="hidden w-4 h-4 mr-2 md:inline-block" />Weekly Plan</TabsTrigger>
                    <TabsTrigger value="tracker"><CheckCircle className="hidden w-4 h-4 mr-2 md:inline-block" />Tracker</TabsTrigger>
                </TabsList>
                
                <TabsContent value="daily" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Study Schedule</CardTitle>
                            <CardDescription>This is your session-by-session plan. Past sessions are greyed out.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Select value={selectedScheduleDay} onValueChange={setSelectedScheduleDay}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a day to view its schedule" />
                                </SelectTrigger>
                                <SelectContent>
                                    {displayState.data.dailySchedule.map(day => (
                                        <SelectItem key={day.day} value={day.day}>
                                            {day.day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedDayData && (
                                <div key={selectedDayData.day}>
                                    <h3 className="mb-2 text-lg font-semibold font-headline">{selectedDayData.day}</h3>
                                    <div className="space-y-2 border-l-2 border-primary pl-4">
                                        {selectedDayData.sessions.map((session, i) => {
                                            const now = new Date();
                                            const dayDateStr = selectedDayData.day.split(', ')[1]; // "MMM d"
                                            const sessionDate = parse(`${dayDateStr} ${now.getFullYear()}`, 'MMM d yyyy', new Date());
                                            
                                            const sessionEndTime = parse(session.end, 'h:mm a', sessionDate);
                                            const isPast = sessionDate.setHours(0,0,0,0) < now.setHours(0,0,0,0) || (sessionDate.setHours(0,0,0,0) === now.setHours(0,0,0,0) && sessionEndTime < now);

                                            return (
                                                <div key={i} className={cn("relative transition-opacity", isPast && "opacity-50")}>
                                                    <div className={cn(
                                                        "absolute w-3 h-3 bg-background border-2 rounded-full -left-[9px] top-1.5",
                                                        isPast ? "border-muted-foreground" : "border-primary"
                                                    )}></div>
                                                    <p className="font-mono text-xs text-muted-foreground">{session.start} - {session.end}</p>
                                                    <p className="font-medium">{session.activity}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="weekly" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Hour Distribution</CardTitle>
                            <CardDescription>This is how your study hours are allocated across subjects each week.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {displayState.data.weeklyPlan.map(plan => (
                                <div key={plan.subject}>
                                    <div className="flex justify-between mb-1">
                                        <h4 className="font-semibold">{plan.subject}</h4>
                                        <p className="text-sm text-muted-foreground">{plan.totalHours} hours/week</p>
                                    </div>
                                    <Progress value={(plan.totalHours / Math.max(...displayState.data.weeklyPlan.map(p => p.totalHours))) * 100} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tracker" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Subject Completion Tracker</CardTitle>
                            <CardDescription>Track your progress by completing tasks on the To-Do List page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {displayState.data.completionTracker.map(tracker => {
                                const subjectTasks = tasks.filter(t => t.subjectId === tracker.subjectId);
                                const completedTasks = subjectTasks.filter(t => t.completed).length;
                                const progress = subjectTasks.length > 0 ? (completedTasks / subjectTasks.length) * 100 : 0;
                                
                                return (
                                    <div key={tracker.subjectId} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">{tracker.subject}</h4>
                                            <p className="text-sm text-muted-foreground">{completedTasks} / {subjectTasks.length} Topics</p>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
         ) : (
            <Card className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <CardHeader className="text-center">
                    <CardTitle>Your Study Plan Awaits</CardTitle>
                    <CardDescription>Fill out the form to generate your personalized schedule.</CardDescription>
                </CardHeader>
                <CardContent>
                     {displayState.message && !displayState.data && (
                         <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{displayState.message}</AlertDescription>
                        </Alert>
                     )}
                </CardContent>
            </Card>
         )}
      </div>
    </div>
  );
}

    
