'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending career paths based on user inputs.
 *
 * The flow takes in user's interests, strengths, academic background, and current skills,
 * and recommends suitable career paths, required skills, skill gap analysis, and a learning roadmap.
 *
 * @exports recommendCareerPaths - The main function to trigger the career path recommendation flow.
 * @exports RecommendCareerPathsInput - The input type for the recommendCareerPaths function.
 * @exports RecommendCareerPathsOutput - The output type for the recommendCareerPaths function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendCareerPathsInputSchema = z.object({
  interests: z.string().describe("The user's interests."),
  strengths: z.string().describe("The user's strengths."),
  academicBackground: z.string().describe("The user's academic background."),
  currentSkills: z.string().describe("The user's current skills."),
});
export type RecommendCareerPathsInput = z.infer<typeof RecommendCareerPathsInputSchema>;

const LearningRoadmapPhaseSchema = z.object({
  phase: z.string().describe('The title of the learning phase (e.g., "Phase 1: Foundations").'),
  description: z.string().describe('A brief description of the focus of this phase.'),
  steps: z.array(z.string()).describe('A list of specific learning steps or topics for this phase.'),
});

const CareerPathRecommendationSchema = z.object({
  careerPath: z.string().describe('A single recommended career path (e.g., "Software Engineer").'),
  requiredSkills: z.array(z.string()).describe('A list of key skills required for this career path.'),
  skillGapAnalysis: z.string().describe("A brief analysis of the user's skill gaps for this specific career path."),
  learningRoadmap: z.array(LearningRoadmapPhaseSchema).describe('A structured, multi-phase learning roadmap. Each phase should have a title, description, and a list of steps.'),
  learningResources: z.object({
    websites: z.array(z.string().url()).describe('A list of relevant website URLs for learning (e.g., FreeCodeCamp, Coursera).'),
    youtubeChannels: z.array(z.string()).describe('A list of names for relevant YouTube channels (e.g., "Fireship", "Programming with Mosh").'),
    other: z.array(z.string()).describe('Other relevant learning resources like books, courses, or communities.')
  }).describe('A collection of resources to help learn the required skills.')
});

const RecommendCareerPathsOutputSchema = z.object({
  recommendations: z.array(CareerPathRecommendationSchema).describe('A list of 3-4 detailed career path recommendations.')
});
export type RecommendCareerPathsOutput = z.infer<typeof RecommendCareerPathsOutputSchema>;


export async function recommendCareerPaths(input: RecommendCareerPathsInput): Promise<RecommendCareerPathsOutput> {
  return recommendCareerPathsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendCareerPathsPrompt',
  input: {schema: RecommendCareerPathsInputSchema},
  output: {schema: RecommendCareerPathsOutputSchema},
  prompt: `You are an expert career counselor AI. Your goal is to provide detailed and actionable career guidance based on a user's profile.

  User Profile:
  - Interests: {{{interests}}}
  - Strengths: {{{strengths}}}
  - Academic Background: {{{academicBackground}}}
  - Current Skills: {{{currentSkills}}}

  Based on this profile, generate 3 to 4 distinct career path recommendations. For EACH recommendation, you must provide the following details:

  1.  **careerPath**: The name of the career (e.g., "Data Scientist").
  2.  **requiredSkills**: A list of the most crucial skills for this role.
  3.  **skillGapAnalysis**: A concise analysis comparing the user's current skills to the required skills, highlighting what's missing.
  4.  **learningRoadmap**: A structured learning roadmap broken into 3-4 logical phases (e.g., "Phase 1: Foundations", "Phase 2: Core Skills", "Phase 3: Advanced Topics & Portfolio"). For each phase, provide a title, a short description, and a list of specific learning steps.
  5.  **learningResources**: Suggest specific resources for learning.
      - **websites**: Provide URLs to helpful websites (e.g., tutorials, documentation, online courses).
      - **youtubeChannels**: List the names of relevant, high-quality YouTube channels.
      - **other**: Mention any other resources like popular books, communities, or specific online courses.

  Your response must be structured according to the output schema. Be specific, encouraging, and realistic in your recommendations.
  `,
});

const recommendCareerPathsFlow = ai.defineFlow(
  {
    name: 'recommendCareerPathsFlow',
    inputSchema: RecommendCareerPathsInputSchema,
    outputSchema: RecommendCareerPathsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
