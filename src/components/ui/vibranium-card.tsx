import { cn } from "@/lib/utils";

export function VibraniumCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-blue-400/10 bg-blue-400/5 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-blue-400/20 hover:bg-blue-400/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 