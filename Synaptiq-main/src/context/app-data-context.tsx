
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Data Types ---
export type Subject = {
  id: string;
  name: string;
  topicCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type Task = {
  id: string;
  subjectId: string;
  title: string;
  completed: boolean;
};

export type StudyLog = {
  date: Date;
  duration: number; // in hours
};

export type SleepLog = {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // HH:mm
  wakeTime: string; // HH:mm
  quality: 'poor' | 'fair' | 'good' | 'excellent';
};

export type Exam = {
  id: number;
  subject: string;
  date: Date;
};

// --- Context Type ---
type AppDataContextType = {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  toggleTask: (taskId: string) => void;
  studyLogs: StudyLog[];
  addStudyLog: (log: StudyLog) => void;
  sleepLogs: SleepLog[];
  addSleepLog: (log: Omit<SleepLog, 'id'>) => void;
  removeSleepLog: (logId: string) => void;
  exams: Exam[];
  setExams: (exams: Exam[]) => void;
};

// --- Context ---
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);


// --- Utility Hook ---
export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

// --- Provider Component ---
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjectsState] = useState<Subject[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [studyLogs, setStudyLogsState] = useState<StudyLog[]>([]);
  const [sleepLogs, setSleepLogsState] = useState<SleepLog[]>([]);
  const [exams, setExamsState] = useState<Exam[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load data from localStorage on initial mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedSubjects = localStorage.getItem('app_subjects');
      const savedTasks = localStorage.getItem('app_tasks');
      const savedStudyLogs = localStorage.getItem('app_studyLogs');
      const savedSleepLogs = localStorage.getItem('app_sleepLogs');
      const savedExams = localStorage.getItem('app_exams');

      if (savedSubjects) setSubjectsState(JSON.parse(savedSubjects));
      if (savedTasks) setTasksState(JSON.parse(savedTasks));
      if (savedStudyLogs) setStudyLogsState(JSON.parse(savedStudyLogs).map((l:any) => ({...l, date: new Date(l.date)})));
      if (savedSleepLogs) setSleepLogsState(JSON.parse(savedSleepLogs));
      if (savedExams) setExamsState(JSON.parse(savedExams).map((e:any) => ({...e, date: new Date(e.date)})));
      
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('app_subjects', JSON.stringify(subjects));
        localStorage.setItem('app_tasks', JSON.stringify(tasks));
        localStorage.setItem('app_studyLogs', JSON.stringify(studyLogs));
        localStorage.setItem('app_sleepLogs', JSON.stringify(sleepLogs));
        localStorage.setItem('app_exams', JSON.stringify(exams));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [subjects, tasks, studyLogs, sleepLogs, exams, isMounted]);

  // --- Actions ---
  const setSubjects = (newSubjects: Subject[]) => {
    setSubjectsState(newSubjects);
  };
  
  const addSubject = (newSubject: Subject) => {
    setSubjectsState(prev => {
        if (prev.find(s => s.name.toLowerCase() === newSubject.name.toLowerCase())) {
            return prev;
        }
        return [...prev, newSubject];
    })
  }

  const setTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
  };

  const toggleTask = (taskId: string) => {
    setTasksState(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const addStudyLog = (log: StudyLog) => {
    setStudyLogsState(prev => [...prev, log]);
  }

  const addSleepLog = (log: Omit<SleepLog, 'id'>) => {
    setSleepLogsState(prev => {
        // Prevent duplicate logs for the same date
        const existingLogIndex = prev.findIndex(l => l.date === log.date);
        const newLog = { ...log, id: String(Date.now()) };
        if (existingLogIndex !== -1) {
            const newState = [...prev];
            newState[existingLogIndex] = newLog;
            return newState.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        return [...prev, newLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  const removeSleepLog = (logId: string) => {
    setSleepLogsState(prev => prev.filter(log => log.id !== logId));
  }
  
  const setExams = (newExams: Exam[]) => {
    setExamsState(newExams);
  }

  const value = {
    subjects,
    setSubjects,
    addSubject,
    tasks,
    setTasks,
    toggleTask,
    studyLogs,
    addStudyLog,
    sleepLogs,
    addSleepLog,
    removeSleepLog,
    exams,
    setExams,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
