"use client";

import { useAppData } from "@/context/app-data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


export function TaskManager() {
  const { subjects, tasks, toggleTask, setTasks } = useAppData();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [subjectForNewTask, setSubjectForNewTask] = useState<string | null>(null);

  const handleAddTask = (e: React.FormEvent, subjectId: string) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !subjectId) return;

    const newTask = {
      id: String(Date.now()),
      subjectId: subjectId,
      title: newTaskTitle,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setSubjectForNewTask(null);
  };
  
  if (subjects.length === 0) {
      return (
           <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg bg-secondary/30">
              <h3 className="text-lg font-semibold">No Subjects Found</h3>
              <p className="text-muted-foreground">
                Add a subject through the Exam Schedule or Study Planner to start managing tasks.
              </p>
            </div>
      )
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {subjects.map((subject) => {
        const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
        const completedCount = subjectTasks.filter(t => t.completed).length;

        return (
          <AccordionItem value={subject.id} key={subject.id}>
            <AccordionTrigger className="p-4 bg-secondary/50 rounded-md hover:no-underline">
                <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold font-headline">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{completedCount} / {subjectTasks.length} completed</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                        {subjectTasks.length > 0 ? (
                            subjectTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-secondary/50">
                                <Checkbox
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onCheckedChange={() => toggleTask(task.id)}
                                />
                                <label
                                htmlFor={`task-${task.id}`}
                                className={`flex-1 text-sm ${
                                    task.completed ? "text-muted-foreground line-through" : ""
                                }`}
                                >
                                {task.title}
                                </label>
                            </div>
                            ))
                        ) : (
                            <p className="text-sm text-center text-muted-foreground">No tasks for this subject yet.</p>
                        )}
                        </div>

                        <form
                         onSubmit={(e) => handleAddTask(e, subject.id)}
                         className="flex items-center gap-2 pt-6 mt-6 border-t"
                        >
                            <Input
                                placeholder="Add a new task..."
                                value={subjectForNewTask === subject.id ? newTaskTitle : ""}
                                onChange={(e) => {
                                    setSubjectForNewTask(subject.id);
                                    setNewTaskTitle(e.target.value);
                                }}
                            />
                            <Button type="submit" size="icon">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
