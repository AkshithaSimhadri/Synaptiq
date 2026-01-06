
'use server';

import { z } from 'zod';

const WellnessSchema = z.object({
  stress: z.enum(['low', 'medium', 'high']),
  sleep: z.coerce.number(),
  mood: z.enum(['good', 'neutral', 'bad']),
});

// Rule-based logic engine to generate tips
function generateSuggestion(data: z.infer<typeof WellnessSchema>): string {
  const { stress, sleep, mood } = data;

  if (stress === 'high' && sleep < 6) {
    return "High stress and low sleep are a tough combination. Prioritize a 15-minute screen-free break today. Your mind needs it to recharge.";
  }
  if (stress === 'high') {
    return "High stress levels detected. Try a 5-minute guided breathing exercise. It can make a huge difference in your focus and calm.";
  }
  if (sleep < 6) {
    return "Less than 6 hours of sleep can impact your memory and focus. Aim for an earlier bedtime tonight, even 30 minutes can help.";
  }
  if (mood === 'bad') {
    return "Feeling down can make studying harder. A short 10-minute walk outside can boost your mood and reset your energy.";
  }
  if (stress === 'medium' && sleep < 7) {
    return "You're managing, but you could be better rested. Make sure to hydrate well today and consider a short power nap if you feel a slump.";
  }
  if (mood === 'neutral' && stress === 'medium') {
      return "It's an average day. Why not make it a great one? Tackle one small, easy task on your to-do list to build some momentum.";
  }
  if (mood === 'good' && stress === 'low') {
    return "You're in a great state to be productive! Use this energy to tackle one of your more challenging subjects today. You've got this!";
  }
  
  return "Consistency is key. Keep up with your healthy habits to maintain your well-being and stay on top of your studies!";
}


export async function getWellnessSuggestion(prevState: any, formData: FormData) {
    const validatedFields = WellnessSchema.safeParse({
        stress: formData.get('stress'),
        sleep: formData.get('sleep'),
        mood: formData.get('mood'),
    });

    if (!validatedFields.success) {
        return {
            tip: null,
            error: "Invalid data. Please check your inputs.",
        }
    }
    
    try {
        const tip = generateSuggestion(validatedFields.data);
        return {
            tip: tip,
            error: null,
        }
    } catch (error) {
        return {
            tip: null,
            error: "Failed to generate a suggestion. Please try again."
        }
    }
}
