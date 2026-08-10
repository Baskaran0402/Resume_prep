import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="text-center space-y-6 max-w-3xl px-4 w-full">
        <h1 className="text-5xl font-bold tracking-tight">
          AI-Powered Interview Intelligence
        </h1>
        <p className="text-lg text-zinc-400">
          Personalized interview preparation based on your resume, target role, and seniority level. 
          Stop practicing generic questions. Start preparing for what you will actually be asked.
        </p>
        
        <Link href="/dashboard" className="inline-block mt-4 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors">
          Go to Dashboard →
        </Link>
        
      </div>
    </main>
  );
}
