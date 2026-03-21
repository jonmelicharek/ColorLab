export default function Loading() {
  return (
    <div className="min-h-screen bg-pearl flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-sand border-t-caramel animate-spin" />
        </div>
        <p className="text-stone text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
