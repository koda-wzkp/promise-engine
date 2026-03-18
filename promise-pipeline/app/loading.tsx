import { HeartLoader } from "@/components/layout/HeartLoader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <HeartLoader size={120} />
    </div>
  );
}
