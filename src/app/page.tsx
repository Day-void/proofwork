import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
          ProofWork
        </h1>
        <p className="text-lg text-surface-600 leading-relaxed">
          Verified skills assessment platform. Submit real projects, receive
          AI-assisted and human-verified evaluations, and share verified skill
          reports.
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge>Phase 0</Badge>
          <Badge variant="secondary">Foundation Audit</Badge>
          <Badge variant="outline">Tailwind 4</Badge>
        </div>

        <Separator className="my-4" />

        <Card className="text-left">
          <CardHeader>
            <CardTitle>Foundation Verified</CardTitle>
            <CardDescription>
              All core dependencies installed and configured. Ready for Phase 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button>Get Started</Button>
              <Button variant="outline">Learn More</Button>
              <Button variant="secondary">Documentation</Button>
              <Button variant="ghost">Contact</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
