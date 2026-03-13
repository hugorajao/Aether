export default function Loading() {
  return (
    <div className="min-h-screen bg-void-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-2 border-void-700 border-t-amber rounded-full animate-spin" />
        <p className="font-mono text-mono-sm text-ivory-400 tracking-widest uppercase">
          Loading
        </p>
      </div>
    </div>
  );
}
