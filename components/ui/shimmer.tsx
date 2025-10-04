import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded",
        className
      )}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
    />
  )
}

export function FormShimmer() {
  return (
    <>
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3">
        <div className="sticky top-6 rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 bg-card border-b">
            <Shimmer className="h-6 w-20 mb-1" />
          </div>
          <div className="p-0">
            <div className="flex flex-col">
              {Array(6).fill(0).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors border-l-2",
                    index === 0 ? "border-l-primary bg-muted/50" : "border-l-transparent"
                  )}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted-foreground/10">
                    <Shimmer className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Shimmer className="h-4 w-16 mb-1" />
                    <Shimmer className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="lg:col-span-6">
        <div className="rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/30 border-b">
            <Shimmer className="h-8 w-36" />
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <Shimmer className="h-5 w-1/4" />
                <Shimmer className="h-12" />
              </div>
              
              <div className="space-y-4">
                <Shimmer className="h-5 w-1/3" />
                <Shimmer className="h-32" />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <Shimmer className="h-5 w-1/2" />
                  <Shimmer className="h-12" />
                </div>
                <div className="space-y-4">
                  <Shimmer className="h-5 w-1/2" />
                  <Shimmer className="h-12" />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <Shimmer className="h-5 w-1/3" />
                  <Shimmer className="h-12" />
                </div>
                <div className="space-y-4">
                  <Shimmer className="h-5 w-1/3" />
                  <Shimmer className="h-12" />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Shimmer className="h-10 w-24" />
                <Shimmer className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-3">
        <div className="sticky top-6 rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <Shimmer className="h-6 w-36" />
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <Shimmer className="aspect-[16/9] w-full" />
              <div className="space-y-2">
                <Shimmer className="h-3 w-1/3" />
                <Shimmer className="h-6 w-4/5" />
                <Shimmer className="h-4 w-2/3" />
                <Shimmer className="h-4 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Shimmer className="h-6 w-16 rounded-full" />
                <Shimmer className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 