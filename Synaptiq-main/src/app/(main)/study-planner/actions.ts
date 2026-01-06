
'use server';

import { z } from 'zod';
import { differenceInDays, add, format } from 'date-fns';

// Schemas
const SubjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Subject name is required'),
  topics: z.coerce.number().min(1, 'Must have at least 1 topic'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  examDate: z.coerce.date(),
});

const StudyPlannerSchema = z.object({
  subjects: z.array(SubjectSchema).min(1, 'At least one subject is required'),
  hoursPerDay: z.coerce.number().min(0.5, 'Must study at least 30 minutes a day').max(16),
});

export type StudyPlan = z.infer<typeof StudyPlannerSchema>;

// Output Types
type SubjectPriority = {
  name: string;
  priorityScore: number;
  daysUntilExam: number;
  studyHours: number;
  revisionHours: number;
};

type DailySchedule = {
  day: string;
  sessions: {
    start: string;
    end: string;
    activity: string; // "Study X", "Revision for Y", "Break"
  }[];
};

type WeeklyPlan = {
  subject: string;
  totalHours: number;
  dailyBreakdown: Record<string, number>; // e.g. { "Monday": 2, "Tuesday": 1.5 }
};

type CompletionTracker = {
  subject: string;
  totalTopics: number;
  subjectId: string;
};

export type StudyPlannerOutput = {
  subjectPriorities: SubjectPriority[];
  dailySchedule: DailySchedule[];
  weeklyPlan: WeeklyPlan[];
  completionTracker: CompletionTracker[];
};


// Main Logic
export async function generateStudyPlanAction(prevState: any, formData: FormData) {
  
  // 1. Parse and Validate Form Data
  const subjects: z.infer<typeof SubjectSchema>[] = [];
  let i = 0;
  while (formData.has(`subjects[${i}].name`)) {
    const id = formData.get(`subjects[${i}].id`) as string;
    const name = formData.get(`subjects[${i}].name`) as string;
    const topics = formData.get(`subjects[${i}].topics`) as string;
    const difficulty = formData.get(`subjects[${i}].difficulty`) as 'easy' | 'medium' | 'hard';
    const examDate = formData.get(`subjects[${i}].examDate`) as string;
    
    if (name && examDate) {
      subjects.push({
        id,
        name,
        topics: Number(topics) || 1,
        difficulty: difficulty || 'medium',
        examDate: new Date(examDate),
      });
    }
    i++;
  }

  const validatedFields = StudyPlannerSchema.safeParse({
    subjects,
    hoursPerDay: formData.get('hoursPerDay'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  const { subjects: subjectData, hoursPerDay } = validatedFields.data;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Calculate Subject Priority
  const difficultyWeight = { easy: 1, medium: 1.5, hard: 2 };
  const revisionPeriodDays = 7; // Last 7 days for revision

  let totalPriorityScore = 0;
  const subjectPriorities = subjectData.map(subject => {
    const daysUntilExam = differenceInDays(subject.examDate, today);
    if (daysUntilExam < 0) {
        // Exam date is in the past, handle this case if needed
        return { name: subject.name, priorityScore: 0, daysUntilExam: 0, studyHours: 0, revisionHours: 0 };
    }

    const timeUrgencyFactor = 1 / (daysUntilExam + 1); // Higher for closer exams
    const priorityScore =
      subject.topics *
      difficultyWeight[subject.difficulty] *
      (1 + timeUrgencyFactor * 5); // Amplify urgency effect

    totalPriorityScore += priorityScore;
    return { name: subject.name, priorityScore, daysUntilExam };
  });

  // 3. Allocate Study and Revision Hours
  const totalStudyDays = Math.max(...subjectPriorities.map(s => s.daysUntilExam));
  const totalAvailableHours = totalStudyDays * hoursPerDay;

  const prioritiesWithHours = subjectPriorities.map(sub => {
    const proportion = sub.priorityScore / totalPriorityScore;
    const totalAllocatedHours = proportion * totalAvailableHours;

    const studyDaysForSubject = Math.max(0, sub.daysUntilExam - revisionPeriodDays);
    const revisionDaysForSubject = Math.min(sub.daysUntilExam, revisionPeriodDays);
    
    const availableStudyHours = studyDaysForSubject * hoursPerDay;
    const availableRevisionHours = revisionDaysForSubject * hoursPerDay;

    let studyHours = 0;
    let revisionHours = 0;

    if (sub.daysUntilExam > revisionPeriodDays) {
        // Has distinct study and revision period
        const hoursNeeded = subjectData.find(s => s.name === sub.name)!.topics * 1; // Approx 1 hour per topic
        studyHours = Math.min(totalAllocatedHours, hoursNeeded, availableStudyHours);
        revisionHours = Math.min(totalAllocatedHours - studyHours, availableRevisionHours);
    } else {
        // Only revision period left
        revisionHours = Math.min(totalAllocatedHours, availableRevisionHours);
    }

    return { ...sub, studyHours: Math.round(studyHours), revisionHours: Math.round(revisionHours) };
  });

  // 4. Generate Weekly Plan
  const weeklyPlan: WeeklyPlan[] = prioritiesWithHours.map(sub => {
    const totalHours = sub.studyHours + sub.revisionHours;
    return {
      subject: sub.name,
      totalHours: totalHours,
      dailyBreakdown: {}
    };
  });

  // 5. Generate Daily Schedule (and populate weekly plan breakdown)
  const studyBlockMinutes = 50;
  const breakMinutes = 10;
  const sessionMinutes = studyBlockMinutes + breakMinutes;
  const sessionsPerDay = Math.floor((hoursPerDay * 60) / sessionMinutes);
  let sessionPool: string[] = [];

  prioritiesWithHours.forEach(sub => {
    const studySessions = Math.round(sub.studyHours * 60 / studyBlockMinutes);
    const revisionSessions = Math.round(sub.revisionHours * 60 / studyBlockMinutes);
    for (let i = 0; i < studySessions; i++) sessionPool.push(`Study ${sub.name}`);
    for (let i = 0; i < revisionSessions; i++) sessionPool.push(`Revise ${sub.name}`);
  });

  // Shuffle for variety
  sessionPool.sort(() => Math.random() - 0.5);

  const dailySchedule: DailySchedule[] = [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let dayIndex = 0; dayIndex < totalStudyDays; dayIndex++) {
    const currentDate = add(today, { days: dayIndex });
    const dayName = dayNames[currentDate.getDay()];
    const daySchedule: DailySchedule = { day: format(currentDate, "EEEE, MMM d"), sessions: [] };
    
    let dayStartTime = add(currentDate, { hours: 9 }); // Start at 9 AM

    for (let i = 0; i < sessionsPerDay; i++) {
        if (sessionPool.length > 0) {
            const activity = sessionPool.shift()!;
            const sessionEnd = add(dayStartTime, { minutes: studyBlockMinutes });
            const breakEnd = add(sessionEnd, { minutes: breakMinutes });

            daySchedule.sessions.push({
                start: format(dayStartTime, 'h:mm a'),
                end: format(sessionEnd, 'h:mm a'),
                activity,
            });
             daySchedule.sessions.push({
                start: format(sessionEnd, 'h:mm a'),
                end: format(breakEnd, 'h:mm a'),
                activity: 'Break',
            });

            // Update weekly plan
            if (!activity.startsWith('Break')) {
                const subjectName = activity.split(' ').slice(1).join(' ');
                const plan = weeklyPlan.find(p => p.subject === subjectName);
                if (plan) {
                    plan.dailyBreakdown[dayName] = (plan.dailyBreakdown[dayName] || 0) + (studyBlockMinutes / 60);
                }
            }
            
            dayStartTime = breakEnd;
        }
    }
    if (daySchedule.sessions.length > 0) {
      dailySchedule.push(daySchedule);
    }
  }


  // 6. Generate Completion Tracker
  const completionTracker: CompletionTracker[] = subjectData.map(sub => ({
    subject: sub.name,
    totalTopics: sub.topics,
    subjectId: sub.id,
  }));


  const output: StudyPlannerOutput = {
    subjectPriorities: prioritiesWithHours,
    dailySchedule,
    weeklyPlan,
    completionTracker,
  };

  return {
    message: 'Study plan generated successfully.',
    errors: null,
    data: output,
  };
}
