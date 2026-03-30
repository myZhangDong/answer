import { Link } from "react-router";
import { LogoSvg } from "./LogoSvg";

const qrCodeImg = "/placeholder-image.svg";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-[#E5E8EB] bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-[#0B1120]">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-5 md:py-14 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:gap-8">
          <div className="flex flex-col justify-between gap-5 lg:col-span-2">
            <div>
              <Link to="/" className="mb-3 inline-block transition-opacity hover:opacity-80">
                <LogoSvg className="h-auto w-[210px] text-[#009EFF] dark:text-[#33B1FF] sm:w-[260px] lg:w-[320px]" />
              </Link>
              <p className="max-w-[20ch] text-[18px] leading-snug text-[#4A5568] dark:text-slate-300 sm:text-[20px] lg:text-[23px]">
                连接每一位全域实时通讯开发者
              </p>
            </div>
            <p className="max-w-[32rem] text-[13px] leading-6 text-[#8792A2] dark:text-slate-400 sm:text-[14px]">
              © {new Date().getFullYear()} 环信 Easemob. All rights reserved. 京ICP备2023000793号
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-3 lg:items-end">
            <div className="flex flex-col gap-4 lg:items-end">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[14px]">
                <a href="https://www.easemob.com/" target="_blank" rel="noreferrer" className="text-[15px] text-[#8792A2] transition-colors hover:text-[#009EFF] dark:text-slate-400 dark:hover:text-[#33B1FF] sm:text-[16px]">环信官网</a>
                <span className="hidden text-[#E5E8EB] dark:text-slate-700 sm:inline">|</span>
                <a href="https://www.easemob.com/download/im" target="_blank" rel="noreferrer" className="text-[15px] text-[#8792A2] transition-colors hover:text-[#009EFF] dark:text-slate-400 dark:hover:text-[#33B1FF] sm:text-[16px]">SDK 下载</a>
                <span className="hidden text-[#E5E8EB] dark:text-slate-700 sm:inline">|</span>
                <a href="https://doc.easemob.com/" target="_blank" rel="noreferrer" className="text-[15px] text-[#8792A2] transition-colors hover:text-[#009EFF] dark:text-slate-400 dark:hover:text-[#33B1FF] sm:text-[16px]">集成文档</a>
              </div>
              <div className="flex flex-col gap-1 text-[15px] text-[#8792A2] dark:text-slate-400 sm:flex-row sm:items-center sm:text-[16px]">
                <span>联系环信</span>
                <span className="font-semibold tracking-wide text-[#8792A2] dark:text-slate-400 sm:ml-3 sm:text-[24px]">
                  400-622-1772
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8">
              <div className="relative group">
                <a href="https://github.com/Easemob-Community" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-[#8792A2] transition-opacity hover:opacity-70 dark:text-slate-400" aria-label="查看环信开发者 Github">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                <div className="pointer-events-none invisible absolute bottom-full left-1/2 mb-3 hidden w-max -translate-x-1/2 rounded-md bg-slate-900 px-3 py-1.5 text-[13px] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100 md:block dark:bg-slate-700">
                  查看环信开发者Github
                  <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
                </div>
              </div>
              <div className="relative group">
                <a href={qrCodeImg} target="_blank" rel="noreferrer" className="flex items-center justify-center text-[#8792A2] transition-opacity hover:opacity-70 dark:text-slate-400" aria-label="查看微信二维码">
                  <svg width="28" height="24" viewBox="0 0 1284 1024" fill="currentColor">
                    <path d="M558.755355 679.972943c0 165.086809 162.777903 299.003382 362.498309 299.003382 48.487035 0 95.819617-8.081172 137.379932-21.934611 11.544532 5.772266 94.665163 77.348365 113.136415 64.64938 12.698985-10.390079-30.015784-87.738444-33.479143-101.591883 87.738444-54.259301 145.461105-141.997745 145.461105-240.126268 0-165.086809-162.777903-299.003382-362.498309-299.003383S558.755355 514.886133 558.755355 679.972943z m438.692221-105.055243c0-28.86133 23.089064-51.950395 51.950395-51.950394s51.950395 23.089064 51.950394 51.950394-23.089064 51.950395-51.950394 51.950395-51.950395-23.089064-51.950395-51.950395z m-255.13416 0c0-28.86133 23.089064-51.950395 51.950395-51.950394s51.950395 23.089064 51.950394 51.950394-23.089064 51.950395-51.950394 51.950395-51.950395-23.089064-51.950395-51.950395z" />
                    <path d="M526.430665 677.664036c0-180.094701 177.785795-325.555806 395.977452-325.555806 11.544532 0 23.089064 0 33.479143 1.154453C931.643743 154.696731 727.305524 0 479.098083 0 214.728298 0 0 176.631342 0 394.822999c0 129.29876 76.193912 244.744081 192.793687 316.32018-4.617813 17.316798-60.031567 120.063134-43.869223 133.916573 24.243517 16.162345 133.916573-78.502818 148.924465-85.429538 55.413754 18.471251 116.599775 28.86133 181.249154 28.861331 23.089064 0 46.178129-1.154453 69.267193-4.617813-13.853439-32.32469-21.934611-68.11274-21.934611-106.209696zM646.493799 184.712514c38.096956 0 69.267193 31.170237 69.267193 69.267193 1.154453 38.096956-30.015784 69.267193-69.267193 69.267193-38.096956 0-69.267193-31.170237-69.267192-69.267193s31.170237-69.267193 69.267192-69.267193zM310.547914 323.2469c-38.096956 0-69.267193-31.170237-69.267192-69.267193s31.170237-69.267193 69.267192-69.267193 69.267193 31.170237 69.267193 69.267193-31.170237 69.267193-69.267193 69.267193z" />
                  </svg>
                </a>
                <div className="pointer-events-none invisible absolute bottom-full left-1/2 mb-3 hidden w-[140px] -translate-x-1/2 rounded-xl border border-slate-100 bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 md:block dark:border-slate-700 dark:bg-slate-800">
                  <img src={qrCodeImg} alt="WeChat QR Code" className="w-full h-auto rounded-md" />
                  <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700 rotate-45"></div>
                </div>
              </div>
              <div className="relative group">
                <a href="mailto:bd@easemob.com" className="flex items-center justify-center text-[#8792A2] transition-opacity hover:opacity-70 dark:text-slate-400" aria-label="发送邮件到 bd@easemob.com">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </a>
                <div className="pointer-events-none invisible absolute bottom-full left-1/2 mb-3 hidden w-max -translate-x-1/2 rounded-md bg-slate-900 px-3 py-1.5 text-[13px] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100 md:block dark:bg-slate-700">
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
