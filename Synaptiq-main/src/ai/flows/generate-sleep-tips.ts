'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating sleep improvement tips.
 *
 * The flow takes in a summary of the user's recent sleep data and provides personalized,
 * actionable tips to improve their sleep quality and consistency.
 *
 * @exports generateSleepTips - The main function to trigger the sleep tips flow.
 * @exports GenerateSleepTipsInput - The input type for the generateSleepTips function.
 * @exports GenerateSleepTipsOutput - The output type for the generateSleepTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SleepLog } from '@/context/app-data-context';

const GenerateSleepTipsInputSchema = z.object({
  sleepLogs: z.array(z.object({
    date: z.string(),
    bedtime: z.string(),
    wakeTime: z.string(),
    quality: z.string(),
  })).describe("An array of the user's recent sleep logs."),
  consistencyScore: z.number().describe("The user's sleep consistency score (0-100)."),
  averageQuality: z.string().describe("The user's average sleep quality (e.g., 'Good', 'Fair')."),
});
export type GenerateSleepTipsInput = z.infer<typeof GenerateSleepTipsInputSchema>;

const GenerateSleepTipsOutputSchema = z.object({
  mainInsight: z.string().describe("The single most important insight based on the user's sleep data."),
  personalizedTips: z.array(z.string()).describe('A list of 2-3 actionable, personalized tips for the user.'),
  reminderSuggestion: z.string().describe("A suggestion for a bedtime reminder based on their patterns."),
});
export type GenerateSleepTipsOutput = z.infer<typeof GenerateSleepTipsOutputSchema>;


export async function generateSleepTips(input: GenerateSleepTipsInput): Promise<GenerateSleepTipsOutput> {
  return generateSleepTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSleepTipsPrompt',
  input: {schema: GenerateSleepTipsInputSchema},
  output: {schema: GenerateSleepTipsOutputSchema},
  prompt: `You are an expert sleep coach AI. Your goal is to provide encouraging, actionable, and personalized advice based on a user's recent sleep data.

  User's Sleep Data:
  - Average Quality: {{{averageQuality}}}
  - Consistency Score: {{{consistencyScore}}}
  - Recent Logs:
  {{#each sleepLogs}}
    - Date: {{date}}, Bedtime: {{bedtime}}, Wake Time: {{wakeTime}}, Quality: {{quality}}
  {{/each}}

  Based on this data, generate a helpful and concise analysis.

  1.  **mainInsight**: Identify the most significant pattern or issue. For example, if their bedtime is inconsistent, focus on that. If their quality is poor despite consistent times, focus on quality improvement.
  2.  **personalizedTips**: Provide 2-3 specific, actionable tips. These should directly relate to the data. For example, if bedtimes are late and inconsistent, a tip could be "Try starting your wind-down routine 15 minutes earlier to help you get to bed closer to your target time."
  3.  **reminderSuggestion**: Analyze their average bedtime and suggest a realistic bedtime reminder. For example, "Your average bedtime is around 11:45 PM. How about setting a gentle reminder at 11:15 PM to start winding down?"

  Your tone should be supportive and non-judgmental. The goal is to empower the user to make small, positive changes.
  `,
});

const generateSleepTipsFlow = ai.defineFlow(
  {
    name: 'generateSleepTipsFlow',
    inputSchema: GenerateSleepTipsInputSchema,
    outputSchema: GenerateSleepTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
