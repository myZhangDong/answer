import { Outlet } from "react-router";
import { Header } from "./Header";
import { LeftSidebar } from "./LeftSidebar";
import { Footer } from "./Footer";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B1120] text-[#1A1F36] dark:text-[#E2E8F0] font-sans relative z-0 flex flex-col transition-colors duration-300">
      {/* Easemob-style Background Banner Gradient - Updated to #009EFF hue with left pink-purple */}
      <div 
        className="absolute top-0 inset-x-0 h-[260px] z-[-1] pointer-events-none dark:opacity-50" 
        style={{
          background: 'linear-gradient(180deg, rgba(0, 158, 255, 0.08) 0%, rgba(245, 247, 250, 0) 100%)',
        }}
      />
      {/* Right Blue Gradient */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[500px] z-[-1] pointer-events-none opacity-[0.4] dark:opacity-[0.25] mix-blend-multiply dark:mix-blend-normal"
        style={{
          background: 'radial-gradient(circle at 80% 0%, rgba(0, 158, 255, 0.15) 0%, transparent 60%)',
        }}
      />
      {/* Left Pink/Purple Gradient */}
      <div 
        className="absolute top-0 left-0 w-[800px] h-[500px] z-[-1] pointer-events-none opacity-[0.4] dark:opacity-[0.25] mix-blend-multiply dark:mix-blend-normal"
        style={{
          background: 'radial-gradient(circle at 20% 0%, rgba(216, 56, 255, 0.12) 0%, transparent 60%)',
        }}
      />

      <Header />
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 lg:px-8 flex-1">
        <div className="flex gap-8 items-start">
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
