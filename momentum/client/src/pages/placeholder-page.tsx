import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 rounded-xl border border-dashed border-border bg-card/50 p-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/app">Back to dashboard</Link>
      </Button>
    </div>
  );
}
