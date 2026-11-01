import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <main aria-busy="true" className="min-h-[100svh] bg-background pb-24 pt-32 sm:pt-40">
      <div className="flex flex-col gap-8 px-5 mx-auto max-w-7xl sm:px-8 sm:gap-12">
        
        <div className="space-y-4">
          <Skeleton className="h-10 sm:h-12 w-3/4 sm:w-1/3 !rounded-lg" />
          <Skeleton className="w-full h-4 sm:h-5 sm:w-2/3" />
          <Skeleton className="w-5/6 h-4 sm:h-5 sm:w-1/2" />
        </div>

        <Skeleton className="w-full h-64 sm:h-[400px] !rounded-xl" />

        <div className="w-full space-y-4">
          <Skeleton className="w-full h-4 sm:h-5" />
          <Skeleton className="w-11/12 h-4 sm:h-5" />
          <Skeleton className="w-4/5 h-4 sm:h-5" />
          <Skeleton className="w-3/4 h-4 sm:h-5" />
        </div>

      </div>
    </main>
  );
}