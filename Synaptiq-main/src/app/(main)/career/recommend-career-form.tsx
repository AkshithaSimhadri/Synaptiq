
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { recommendCareerAction } from "./actions";
import { RecommendCareerPathsOutput } from "@/ai/flows/recommend-career-paths";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle, Link as LinkIcon, Milestone, Youtube } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const initialState = {
  message: "",
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Analyzing..." : "Find My Career Path"}
    </Button>
  );
}

export function RecommendCareerForm() {
  const [state, formAction] = useActionState(recommendCareerAction, initialState);
  const data = state.data as RecommendCareerPathsOutput | null;

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <form action={formAction} className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Discover Your Future</CardTitle>
            <CardDescription>
              The more detail you provide, the better the AI's recommendations will be. Be honest and thoughtful!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interests">What are your interests & hobbies?</Label>
              <Textarea id="interests" name="interests" placeholder="e.g., Playing video games, building models, reading sci-fi novels, watching documentaries on space." required />
              {state.errors?.interests && <p className="text-sm text-destructive">{state.errors.interests[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="strengths">What are you good at?</Label>
              <Textarea id="strengths" name="strengths" placeholder="e.g., Solving complex puzzles, explaining ideas to others, staying organized, leading group projects." required />
              {state.errors?.strengths && <p className="text-sm text-destructive">{state.errors.strengths[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicBackground">What is your academic background?</Label>
              <Textarea id="academicBackground" name="academicBackground" placeholder="e.g., Currently a high school student focused on math and science. Took an online course in Python." required />
              {state.errors?.academicBackground && <p className="text-sm text-destructive">{state.errors.academicBackground[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSkills">What skills do you currently have?</Label>
              <Textarea id="currentSkills" name="currentSkills" placeholder="e.g., Basic Python, good at algebra, comfortable with public speaking, familiar with Photoshop." required />
              {state.errors?.currentSkills && <p className="text-sm text-destructive">{state.errors.currentSkills[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>

      <div className="space-y-6 md:col-span-1 lg:col-span-2">
        {data?.recommendations ? (
          data.recommendations.map((rec, index) => (
            <ResultCard key={index} recommendation={rec} />
          ))
        ) : (
          <Card className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <CardHeader>
                <CardTitle className="font-headline">Your Career Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
                <p>Your personalized career recommendations will appear here.</p>
                {state.message && !state.errors && <p className="mt-4 text-sm text-destructive">{state.message}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ResultCard({ recommendation }: { recommendation: RecommendCareerPathsOutput['recommendations'][0] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-headline">{recommendation.careerPath}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base font-semibold">Required Skills & Skill Gap</AccordionTrigger>
            <AccordionContent className="pt-2 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Key Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.requiredSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold">Your Skill Gap</h4>
                <p className="text-sm text-muted-foreground">{recommendation.skillGapAnalysis}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base font-semibold">Learning Roadmap</AccordionTrigger>
            <AccordionContent className="pt-2 space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {recommendation.learningRoadmap.map((phase, index) => (
                    <AccordionItem value={`phase-${index}`} key={index}>
                       <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <Milestone className="w-5 h-5 text-primary"/>
                          <div>
                            <h4 className="font-semibold text-left">{phase.phase}</h4>
                            <p className="text-xs text-left text-muted-foreground">{phase.description}</p>
                          </div>
                        </div>
                       </AccordionTrigger>
                       <AccordionContent className="pt-2 pl-8">
                         <ul className="space-y-2">
                           {phase.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 mt-1 text-green-500 shrink-0"/> 
                                <span>{step}</span>
                              </li>
                           ))}
                         </ul>
                       </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base font-semibold">Learning Resources</AccordionTrigger>
            <AccordionContent className="pt-2 space-y-4">
               <div>
                  <h4 className="flex items-center gap-2 mb-2 font-semibold"><LinkIcon className="w-4 h-4" /> Websites</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    {recommendation.learningResources.websites.map(site => (
                      <li key={site}><Link href={site} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{site}</Link></li>
                    ))}
                  </ul>
               </div>
               <div>
                  <h4 className="flex items-center gap-2 mb-2 font-semibold"><Youtube className="w-4 h-4" /> YouTube Channels</h4>
                   <ul className="space-y-1 list-disc list-inside">
                    {recommendation.learningResources.youtubeChannels.map(channel => (
                      <li key={channel} className="text-sm text-muted-foreground">{channel}</li>
                    ))}
                  </ul>
               </div>
                <div>
                  <h4 className="flex items-center gap-2 mb-2 font-semibold"><Book className="w-4 h-4" /> Other Resources</h4>
                   <ul className="space-y-1 list-disc list-inside">
                    {recommendation.learningResources.other.map(other => (
                      <li key={other} className="text-sm text-muted-foreground">{other}</li>
                    ))}
                  </ul>
               </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
