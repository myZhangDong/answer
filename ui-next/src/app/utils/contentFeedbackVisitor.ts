import type { ContentObjectType } from "../api/contentApi";

const STORAGE_KEY = "content_feedback_visitor_v2";

export interface ContentFeedbackVisitorState {
  liked: boolean;
  rated: boolean;
  rating: number;
  updatedAt: number;
}

type VisitorStateMap = Record<string, ContentFeedbackVisitorState>;

function buildKey(objectType: ContentObjectType, objectID: string) {
  return `${objectType}:${objectID}`;
}

function readStateMap(): VisitorStateMap {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as VisitorStateMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStateMap(value: VisitorStateMap) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    return;
  }
}

export function getContentFeedbackVisitorState(
  objectType: ContentObjectType,
  objectID: string,
): ContentFeedbackVisitorState | null {
  const stateMap = readStateMap();
  return stateMap[buildKey(objectType, objectID)] || null;
}

export function markContentFeedbackVisitorAction(
  objectType: ContentObjectType,
  objectID: string,
  action: "like" | "rating",
  rating = 0,
) {
  const stateMap = readStateMap();
  const key = buildKey(objectType, objectID);
  const current = stateMap[key] || {
    liked: false,
    rated: false,
    rating: 0,
    updatedAt: 0,
  };
  stateMap[key] = {
    liked: current.liked || action === "like",
    rated: current.rated || action === "rating",
    rating: action === "rating" ? rating : current.rating,
    updatedAt: Date.now(),
  };
  writeStateMap(stateMap);
}
