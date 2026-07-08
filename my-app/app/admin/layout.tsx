import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex h-[100dvh] overflow-hidden w-full bg-[#f8f9fa] dark:bg-navy/5 transition-colors duration-300">
        {children}
      </div>
    </TooltipProvider>
  );
}
