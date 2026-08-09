import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="text-center space-y-6 max-w-3xl px-4">
        <h1 className="text-5xl font-bold tracking-tight">
          AI-Powered Interview Intelligence
        </h1>
        <p className="text-lg text-zinc-400">
          Personalized interview preparation based on your resume, target role, and seniority level. 
          Stop practicing generic questions. Start preparing for what you will actually be asked.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button size="lg" className="bg-white text-black hover:bg-zinc-200">
            Upload Resume
          </Button>
          <Button size="lg" variant="outline" className="border-zinc-800 text-black hover:bg-zinc-900">
            View Demo
          </Button>
        </div>
      </div>
    </main>
  );
}
