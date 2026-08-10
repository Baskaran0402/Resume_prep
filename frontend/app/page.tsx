import Link from "next/link";
import { BrainCircuit, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    icon: FileText,
    title: "Resume Analysis",
    description: "AI parses your resume and extracts skills, projects, and experience gaps.",
  },
  {
    icon: TrendingUp,
    title: "Gap Analysis",
    description: "See your readiness score and exactly what to focus on before the interview.",
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description: "Chat with an AI interviewer that scales difficulty and scores your answers live.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="w-5 h-5 text-blue-500" />
            InterviewIQ
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="text-sm px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            AI-Powered Interview Intelligence
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Stop guessing. <br />
            <span className="text-primary">Know</span> what to prepare.
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Upload your resume, set your target role, and get a personalized gap analysis with AI mock interviews tailored exactly to you.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-10">
            Everything you need
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-border bg-card space-y-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        InterviewIQ &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
