import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ChapterLoading() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Loading chapter..." />
      </div>
    </div>
  );
}
