// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Exam = {
  id: string;
  subject: string;
  date: string; // ISO string
  location?: string;
  notes?: string;
};

export type StressEntry = {
  date: string; // YYYY-MM-DD
  level: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: string; // ISO
};

export type ReflectionEntry = {
  examId: string;
  createdAt: string; // ISO
  rating?: 1 | 2 | 3 | 4 | 5; // optional: how it went
  stressBefore?: 1 | 2 | 3 | 4 | 5;
  whatHelped?: string;
  whatToChange?: string;
};

const KEYS = {
  EXAMS: "unstressify:exams",
  STRESS: "unstressify:stress",
  REFLECTIONS: "unstressify:reflections",
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toISODateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ---------------- Exams ---------------- */

export async function getExams(): Promise<Exam[]> {
  const raw = await AsyncStorage.getItem(KEYS.EXAMS);
  const list = safeParse<Exam[]>(raw, []);
  // normalize
  return Array.isArray(list) ? list : [];
}

export async function saveExams(exams: Exam[]) {
  await AsyncStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
}

export async function addExam(exam: Exam) {
  const list = await getExams();
  await saveExams([exam, ...list]);
}

export async function deleteExam(id: string) {
  const list = await getExams();
  await saveExams(list.filter((e) => e.id !== id));
}

export async function updateExam(updated: Exam) {
  const list = await getExams();
  await saveExams(list.map((e) => (e.id === updated.id ? updated : e)));
}

/* --------------- Stress ---------------- */

export async function getStressEntries(): Promise<StressEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.STRESS);
  const list = safeParse<StressEntry[]>(raw, []);
  return Array.isArray(list) ? list : [];
}

export async function getStressByDate(dateKey: string): Promise<StressEntry | null> {
  const all = await getStressEntries();
  return all.find((x) => x.date === dateKey) ?? null;
}

export async function upsertStressEntry(entry: StressEntry) {
  const all = await getStressEntries();
  const next = all.some((x) => x.date === entry.date)
    ? all.map((x) => (x.date === entry.date ? entry : x))
    : [entry, ...all];
  await AsyncStorage.setItem(KEYS.STRESS, JSON.stringify(next));
}

/* ------------ Reflections -------------- */

export async function getReflections(): Promise<ReflectionEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.REFLECTIONS);
  const list = safeParse<ReflectionEntry[]>(raw, []);
  return Array.isArray(list) ? list : [];
}

export async function getReflectionForExam(examId: string): Promise<ReflectionEntry | null> {
  const all = await getReflections();
  return all.find((r) => r.examId === examId) ?? null;
}

export async function upsertReflection(entry: ReflectionEntry) {
  const all = await getReflections();
  const next = all.some((r) => r.examId === entry.examId)
    ? all.map((r) => (r.examId === entry.examId ? entry : r))
    : [entry, ...all];
  await AsyncStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(next));
}


