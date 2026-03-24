import { Link } from "react-router";
import { LogoSvg } from "./LogoSvg";

const qrCodeImg = "/placeholder-image.svg";

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#0B1120] border-t border-[#E5E8EB] dark:border-slate-800 mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-[1440px] px-4 py-14 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Brand & Description & Copyright */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-4">
            <div>
              <Link to="/" className="inline-block transition-opacity hover:opacity-80 mb-3">
                <LogoSvg className="w-[320px] h-auto text-[#009EFF] dark:text-[#33B1FF]" />
              </Link>
              <p className="text-[#4A5568] dark:text-slate-300 whitespace-nowrap text-[23px]">
                连接每一位全域实时通讯开发者
              </p>
            </div>
            <p className="text-[14px] text-[#8792A2] dark:text-slate-400 whitespace-nowrap">
              © {new Date().getFullYear()} 环信 Easemob. All rights reserved. 京ICP备2023000793号
            </p>
          </div>

          {/* Right Side Links, Contact & Icons */}
          <div className="lg:col-span-3 flex flex-col lg:items-end justify-between gap-4">
            <div className="flex flex-col lg:items-end gap-4">
              <div className="flex items-center space-x-4 text-[14px]">
                <a href="https://www.easemob.com/" target="_blank" rel="noreferrer" className="text-[#8792A2] transition-colors hover:text-[#009EFF] dark:text-slate-400 dark:hover:text-[#33B1FF] text-[16px]">环信官网</a>
                <span className="text-[#E5E8EB] dark:text-slate-700">|</span>
                <a href="https://www.easemob.com/download/im" target="_blank" rel="noreferrer" className="text-[#8792A2] transition-colors hover:text-[#009EFF] dark:text-slate-400 dark:hover:text-[#33B1FF] text-[16px]">SDK 下载</a>
                <span className="text-[#E5E8EB] dark:text-slate-700">|</span>
                <a href="https://doc.easemob.com/" target="_blank" rel="noreferrer" className="text-[#8792A2] transition-colors hover:text-[#009EFF] dark:text-slate-400 dark:hover:text-[#33B1FF] text-[16px]">集成文档</a>
              </div>
              <div className="text-[16px] text-[#8792A2] dark:text-slate-400 flex items-center">
                联系环信 <span className="font-semibold text-[#8792A2] dark:text-slate-400 ml-3 tracking-wide text-[24px]">400-622-1772</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-[32px] items-center">
              <div className="relative group">
                <a href="https://github.com/Easemob-Community" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-[#8792A2] dark:text-slate-400 cursor-pointer transition-opacity hover:opacity-70">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-max bg-slate-900 dark:bg-slate-700 text-white text-[13px] py-1.5 px-3 rounded-md shadow-lg z-50 pointer-events-none">
                  查看环信开发者Github
                  <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
                </div>
              </div>
              <div className="relative group">
                <a href="#" className="flex items-center justify-center text-[#8792A2] dark:text-slate-400 cursor-pointer transition-opacity hover:opacity-70">
                  <svg width="28" height="24" viewBox="0 0 1284 1024" fill="currentColor">
                    <path d="M558.755355 679.972943c0 165.086809 162.777903 299.003382 362.498309 299.003382 48.487035 0 95.819617-8.081172 137.379932-21.934611 11.544532 5.772266 94.665163 77.348365 113.136415 64.64938 12.698985-10.390079-30.015784-87.738444-33.479143-101.591883 87.738444-54.259301 145.461105-141.997745 145.461105-240.126268 0-165.086809-162.777903-299.003382-362.498309-299.003383S558.755355 514.886133 558.755355 679.972943z m438.692221-105.055243c0-28.86133 23.089064-51.950395 51.950395-51.950394s51.950395 23.089064 51.950394 51.950394-23.089064 51.950395-51.950394 51.950395-51.950395-23.089064-51.950395-51.950395z m-255.13416 0c0-28.86133 23.089064-51.950395 51.950395-51.950394s51.950395 23.089064 51.950394 51.950394-23.089064 51.950395-51.950394 51.950395-51.950395-23.089064-51.950395-51.950395z" />
                    <path d="M526.430665 677.664036c0-180.094701 177.785795-325.555806 395.977452-325.555806 11.544532 0 23.089064 0 33.479143 1.154453C931.643743 154.696731 727.305524 0 479.098083 0 214.728298 0 0 176.631342 0 394.822999c0 129.29876 76.193912 244.744081 192.793687 316.32018-4.617813 17.316798-60.031567 120.063134-43.869223 133.916573 24.243517 16.162345 133.916573-78.502818 148.924465-85.429538 55.413754 18.471251 116.599775 28.86133 181.249154 28.861331 23.089064 0 46.178129-1.154453 69.267193-4.617813-13.853439-32.32469-21.934611-68.11274-21.934611-106.209696zM646.493799 184.712514c38.096956 0 69.267193 31.170237 69.267193 69.267193 1.154453 38.096956-30.015784 69.267193-69.267193 69.267193-38.096956 0-69.267193-31.170237-69.267192-69.267193s31.170237-69.267193 69.267192-69.267193zM310.547914 323.2469c-38.096956 0-69.267193-31.170237-69.267192-69.267193s31.170237-69.267193 69.267192-69.267193 69.267193 31.170237 69.267193 69.267193-31.170237 69.267193-69.267193 69.267193z" />
                  </svg>
                </a>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-[140px] bg-white dark:bg-slate-800 p-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 pointer-events-none">
                  <img src={qrCodeImg} alt="WeChat QR Code" className="w-full h-auto rounded-md" />
                  <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700 rotate-45"></div>
                </div>
              </div>
              <div className="relative group">
                <a href="mailto:bd@easemob.com" className="flex items-center justify-center text-[#8792A2] dark:text-slate-400 cursor-pointer transition-opacity hover:opacity-70">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-max bg-slate-900 dark:bg-slate-700 text-white text-[13px] py-1.5 px-3 rounded-md shadow-lg z-50 pointer-events-none">
                  bd@easemob.com
                  <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}