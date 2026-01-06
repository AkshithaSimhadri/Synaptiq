"use server";

import { recommendCareerPaths, RecommendCareerPathsInput } from "@/ai/flows/recommend-career-paths";
import { z } from "zod";

const RecommendCareerSchema = z.object({
  interests: z.string().min(3, "Please describe your interests."),
  strengths: z.string().min(3, "Please describe your strengths."),
  academicBackground: z.string().min(3, "Please describe your academic background."),
  currentSkills: z.string().min(3, "Please list your current skills."),
});

export async function recommendCareerAction(prevState: any, formData: FormData) {
  const validatedFields = RecommendCareerSchema.safeParse({
    interests: formData.get("interests"),
    strengths: formData.get("strengths"),
    academicBackground: formData.get("academicBackground"),
    currentSkills: formData.get("currentSkills"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const input: RecommendCareerPathsInput = validatedFields.data;
    const result = await recommendCareerPaths(input);
    return {
      message: "Recommendations generated successfully.",
      errors: null,
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to generate recommendations. Please try again.",
      errors: null,
      data: null,
    };
  }
}
