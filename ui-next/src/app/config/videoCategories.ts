import type { VideoCategory } from "../api/types";

export const VIDEO_CATEGORY_OPTIONS: Array<{ label: VideoCategory; value: VideoCategory }> = [
  { label: "基础篇", value: "基础篇" },
  { label: "进阶篇", value: "进阶篇" },
  { label: "群组篇", value: "群组篇" },
  { label: "AI篇", value: "AI篇" },
];

export const VIDEO_CATEGORY_VALUES: VideoCategory[] = VIDEO_CATEGORY_OPTIONS.map((item) => item.value);

export const VIDEO_CATEGORY_FILTER_OPTIONS = ["全部", ...VIDEO_CATEGORY_VALUES] as const;

export function getDefaultVideoCategory(): VideoCategory {
  return VIDEO_CATEGORY_VALUES[0];
}
