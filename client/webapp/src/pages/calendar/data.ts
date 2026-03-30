export type SessionTone = "focus" | "cozy" | "deep";

export type StudySession = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  durationMin: number;
  roomName: string;
  tone: SessionTone;
};

export type DayStudySummary = {
  date: string; // YYYY-MM-DD
  totalMin: number;
  sessions: StudySession[];
};

// 2026년 3월 기준 목업 데이터 (오늘 날짜: 2026-03-30)
// 약 3주치 데이터를 생성 (2026-03-09 ~ 2026-03-30)

const MOCK_SESSIONS: StudySession[] = [
  // 3월 9일 (월)
  { id: "s1", date: "2026-03-09", startTime: "09:00", endTime: "10:30", durationMin: 90, roomName: "Quiet Library", tone: "focus" },
  { id: "s2", date: "2026-03-09", startTime: "14:00", endTime: "15:00", durationMin: 60, roomName: "The Cozy Cafe", tone: "cozy" },
  // 3월 10일 (화)
  { id: "s3", date: "2026-03-10", startTime: "10:00", endTime: "11:30", durationMin: 90, roomName: "Quiet Library", tone: "focus" },
  // 3월 11일 (수)
  { id: "s4", date: "2026-03-11", startTime: "09:30", endTime: "12:00", durationMin: 150, roomName: "Riverside Porch", tone: "deep" },
  { id: "s5", date: "2026-03-11", startTime: "15:00", endTime: "16:00", durationMin: 60, roomName: "Quiet Library", tone: "focus" },
  // 3월 12일 (목)
  { id: "s6", date: "2026-03-12", startTime: "11:00", endTime: "12:30", durationMin: 90, roomName: "The Cozy Cafe", tone: "cozy" },
  // 3월 13일 (금)
  { id: "s7", date: "2026-03-13", startTime: "09:00", endTime: "10:00", durationMin: 60, roomName: "Quiet Library", tone: "focus" },
  { id: "s8", date: "2026-03-13", startTime: "13:00", endTime: "14:30", durationMin: 90, roomName: "Riverside Porch", tone: "deep" },
  // 3월 16일 (월)
  { id: "s9", date: "2026-03-16", startTime: "09:00", endTime: "11:00", durationMin: 120, roomName: "Quiet Library", tone: "focus" },
  // 3월 17일 (화)
  { id: "s10", date: "2026-03-17", startTime: "10:30", endTime: "12:00", durationMin: 90, roomName: "The Cozy Cafe", tone: "cozy" },
  { id: "s11", date: "2026-03-17", startTime: "14:00", endTime: "15:30", durationMin: 90, roomName: "Quiet Library", tone: "focus" },
  // 3월 18일 (수)
  { id: "s12", date: "2026-03-18", startTime: "09:00", endTime: "12:00", durationMin: 180, roomName: "Riverside Porch", tone: "deep" },
  // 3월 19일 (목)
  { id: "s13", date: "2026-03-19", startTime: "10:00", endTime: "11:00", durationMin: 60, roomName: "Quiet Library", tone: "focus" },
  // 3월 20일 (금)
  { id: "s14", date: "2026-03-20", startTime: "09:30", endTime: "11:30", durationMin: 120, roomName: "Quiet Library", tone: "focus" },
  { id: "s15", date: "2026-03-20", startTime: "14:00", endTime: "15:00", durationMin: 60, roomName: "The Cozy Cafe", tone: "cozy" },
  // 3월 23일 (월)
  { id: "s16", date: "2026-03-23", startTime: "09:00", endTime: "10:30", durationMin: 90, roomName: "Riverside Porch", tone: "deep" },
  // 3월 24일 (화)
  { id: "s17", date: "2026-03-24", startTime: "10:00", endTime: "12:30", durationMin: 150, roomName: "Quiet Library", tone: "focus" },
  // 3월 25일 (수)
  { id: "s18", date: "2026-03-25", startTime: "09:00", endTime: "11:00", durationMin: 120, roomName: "Quiet Library", tone: "focus" },
  { id: "s19", date: "2026-03-25", startTime: "14:00", endTime: "16:00", durationMin: 120, roomName: "Riverside Porch", tone: "deep" },
  // 3월 26일 (목)
  { id: "s20", date: "2026-03-26", startTime: "11:00", endTime: "12:00", durationMin: 60, roomName: "The Cozy Cafe", tone: "cozy" },
  // 3월 27일 (금)
  { id: "s21", date: "2026-03-27", startTime: "09:30", endTime: "11:00", durationMin: 90, roomName: "Quiet Library", tone: "focus" },
  { id: "s22", date: "2026-03-27", startTime: "13:00", endTime: "15:00", durationMin: 120, roomName: "Riverside Porch", tone: "deep" },
  // 3월 28일 (토)
  { id: "s23", date: "2026-03-28", startTime: "10:00", endTime: "11:30", durationMin: 90, roomName: "The Cozy Cafe", tone: "cozy" },
  // 3월 30일 (오늘)
  { id: "s24", date: "2026-03-30", startTime: "09:00", endTime: "10:30", durationMin: 90, roomName: "Quiet Library", tone: "focus" },
  { id: "s25", date: "2026-03-30", startTime: "14:00", endTime: "15:30", durationMin: 90, roomName: "Riverside Porch", tone: "deep" },
];

export function getSessionsByDate(date: string): StudySession[] {
  return MOCK_SESSIONS.filter((s) => s.date === date);
}

export function getDaySummary(date: string): DayStudySummary {
  const sessions = getSessionsByDate(date);
  const totalMin = sessions.reduce((sum, s) => sum + s.durationMin, 0);
  return { date, totalMin, sessions };
}

export function getDaySummariesForRange(
  startDate: string,
  endDate: string,
): DayStudySummary[] {
  const result: DayStudySummary[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    result.push(getDaySummary(dateStr));
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function formatMinutes(min: number): string {
  if (min === 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function toneColor(tone: SessionTone): string {
  switch (tone) {
    case "focus": return "bg-primary/80 text-white";
    case "cozy": return "bg-amber-500/80 text-white";
    case "deep": return "bg-emerald-500/80 text-white";
  }
}

export function toneBorderColor(tone: SessionTone): string {
  switch (tone) {
    case "focus": return "border-l-primary";
    case "cozy": return "border-l-amber-500";
    case "deep": return "border-l-emerald-500";
  }
}

export function toneTextColor(tone: SessionTone): string {
  switch (tone) {
    case "focus": return "text-primary";
    case "cozy": return "text-amber-400";
    case "deep": return "text-emerald-400";
  }
}

// 오늘 기준 이번 주 월요일 계산 유틸
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// YYYY-MM-DD 포맷
export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}
