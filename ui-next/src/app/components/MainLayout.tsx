import { Outlet } from "react-router";
import { Header } from "./Header";
import { LeftSidebar } from "./LeftSidebar";
import { Footer } from "./Footer";

export function MainLayout() {
  return (
    <div className="relative z-0 flex min-h-screen flex-col bg-[#F5F7FA] font-sans text-[#1A1F36] transition-colors duration-300 dark:bg-[#0B1120] dark:text-[#E2E8F0]">
      <div
        className="absolute top-0 inset-x-0 h-[220px] z-[-1] pointer-events-none dark:opacity-50 md:h-[260px]"
        style={{
          background: "linear-gradient(180deg, rgba(0, 158, 255, 0.08) 0%, rgba(245, 247, 250, 0) 100%)",
        }}
      />
      <div
        className="absolute top-0 right-0 h-[340px] w-full max-w-[520px] z-[-1] pointer-events-none opacity-[0.35] mix-blend-multiply dark:opacity-[0.25] dark:mix-blend-normal md:h-[500px] md:w-[800px] md:max-w-none"
        style={{
          background: "radial-gradient(circle at 80% 0%, rgba(0, 158, 255, 0.15) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-0 left-0 h-[340px] w-full max-w-[520px] z-[-1] pointer-events-none opacity-[0.35] mix-blend-multiply dark:opacity-[0.25] dark:mix-blend-normal md:h-[500px] md:w-[800px] md:max-w-none"
        style={{
          background: "radial-gradient(circle at 20% 0%, rgba(216, 56, 255, 0.12) 0%, transparent 60%)",
        }}
      />

      <Header />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-5 md:py-8 lg:px-8">
        <div className="flex w-full flex-col items-stretch gap-6 xl:flex-row xl:items-start xl:gap-8">
          <LeftSidebar />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
