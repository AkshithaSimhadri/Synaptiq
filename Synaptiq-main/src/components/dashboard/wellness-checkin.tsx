
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { getWellnessSuggestion } from './actions';
import { Lightbulb, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const initialState = {
  tip: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Analyzing...' : 'Get My Tip'}
    </Button>
  );
}

export function WellnessCheckin() {
  const [state, formAction] = useActionState(getWellnessSuggestion, initialState);
  const [sleepHours, setSleepHours] = useState(7);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            <CardTitle className="font-headline">Wellness Check-in</CardTitle>
        </div>
        <CardDescription>How are you feeling today? Get a personalized tip.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Stress Level</Label>
            <RadioGroup name="stress" defaultValue="medium" className="flex justify-around">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="stress-low" />
                <Label htmlFor="stress-low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="stress-medium" />
                <Label htmlFor="stress-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="stress-high" />
                <Label htmlFor="stress-high">High</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="sleep">Hours Slept Last Night</Label>
              <span className="text-sm font-medium text-muted-foreground">{sleepHours} hours</span>
            </div>
            <Slider 
              name="sleep" 
              defaultValue={[sleepHours]} 
              min={0} max={12} 
              step={0.5} 
              onValueChange={(value) => setSleepHours(value[0])}
            />
          </div>
           <div className="space-y-3">
            <Label>Overall Mood</Label>
            <RadioGroup name="mood" defaultValue="neutral" className="flex justify-around">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="mood-good" />
                <Label htmlFor="mood-good">Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="mood-neutral" />
                <Label htmlFor="mood-neutral">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bad" id="mood-bad" />
                <Label htmlFor="mood-bad">Bad</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          {state.tip && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Today's Tip!</AlertTitle>
              <AlertDescription>{state.tip}</AlertDescription>
            </Alert>
          )}
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}
