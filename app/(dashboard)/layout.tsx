import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { LoadingGate } from "@/components/loader";
import { StoreProvider } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="flex h-full overflow-hidden print:block print:h-auto print:overflow-visible">
        <div className="hidden md:flex print:hidden h-full">
          <AppSidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden print:overflow-visible print:h-auto">
          <MobileNav />
          <main className="flex-1 overflow-y-auto print:overflow-visible print:height-auto">
            <LoadingGate>
              {children}
            </LoadingGate>
          </main>
        </div>
      </div>
    </StoreProvider>
  );
}
