
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  unit?: string;
  change?: string;
};

export function StatCard({ title, value, unit, change }: StatCardProps) {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          {value}
          {unit && <span className="text-2xl text-muted-foreground">{unit}</span>}
        </div>
        {change && (
          <p className={cn("text-xs text-muted-foreground", isPositive && "text-green-600", isNegative && "text-red-600")}>
            {change} from last week
          </p>
        )}
      </CardContent>
    </Card>
  );
}
