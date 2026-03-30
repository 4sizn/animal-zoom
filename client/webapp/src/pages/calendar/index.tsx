import React from "react";
import {
  getDaySummariesForRange,
  getDaySummary,
  formatMinutes,
  toneColor,
  toneBorderColor,
  toneTextColor,
  getMondayOfWeek,
  toDateStr,
  type DayStudySummary,
  type StudySession,
} from "./data";

type CalendarView = "month" | "week" | "day";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToPx(minutes: number, pxPerHour: number): number {
  return (minutes / 60) * pxPerHour;
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  cursor,
  today,
  onDayClick,
}: {
  cursor: Date;
  today: Date;
  onDayClick: (date: Date) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // First day of the month, adjust to Monday-start grid
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, ...
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const gridStart = addDays(firstDay, -startOffset);

  // Always show 6 weeks = 42 cells
  const cells: Date[] = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  // Fetch summaries for the whole grid range
  const summaries = React.useMemo(() => {
    const start = toDateStr(cells[0]);
    const end = toDateStr(cells[cells.length - 1]);
    const list = getDaySummariesForRange(start, end);
    const map = new Map<string, DayStudySummary>();
    list.forEach((s) => map.set(s.date, s));
    return map;
  }, [year, month]);

  // Max total for this month (for bar scaling)
  const maxMin = React.useMemo(() => {
    let max = 0;
    summaries.forEach((s) => { if (s.totalMin > max) max = s.totalMin; });
    return max || 1;
  }, [summaries]);

  return (
    <div className="flex flex-col gap-0">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-white/10">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1">
        {cells.map((date, idx) => {
          const dateStr = toDateStr(date);
          const summary = summaries.get(dateStr);
          const totalMin = summary?.totalMin ?? 0;
          const sessions = summary?.sessions ?? [];
          const isCurrentMonth = date.getMonth() === month;
          const isToday = isSameDay(date, today);
          const barPct = Math.round((totalMin / maxMin) * 100);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDayClick(date)}
              className={[
                "relative flex flex-col p-2 min-h-[100px] border-b border-r border-white/10 text-left transition-colors",
                isCurrentMonth ? "bg-transparent hover:bg-white/5" : "bg-white/[0.02] opacity-50",
                idx % 7 === 0 ? "border-l-0" : "",
              ].join(" ")}
            >
              {/* Day number */}
              <div className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold mb-1 self-end",
                isToday
                  ? "bg-primary text-white"
                  : "text-on-surface-variant",
              ].join(" ")}>
                {date.getDate()}
              </div>

              {/* Study time bar */}
              {totalMin > 0 && (
                <div className="w-full mt-auto">
                  <div className="mb-1 flex items-center gap-1 flex-wrap">
                    {sessions.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium leading-none ${toneColor(s.tone)}`}
                      >
                        {formatMinutes(s.durationMin)}
                      </span>
                    ))}
                    {sessions.length > 2 && (
                      <span className="text-[10px] text-on-surface-variant">+{sessions.length - 2}</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] font-medium text-on-surface-variant">
                    {formatMinutes(totalMin)}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

const PX_PER_HOUR = 64;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 23;
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

function WeekView({
  cursor,
  today,
  onDayClick,
}: {
  cursor: Date;
  today: Date;
  onDayClick: (date: Date) => void;
}) {
  const monday = getMondayOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => DAY_START_HOUR + i);

  const summaries = React.useMemo(() => {
    const start = toDateStr(days[0]);
    const end = toDateStr(days[6]);
    const list = getDaySummariesForRange(start, end);
    const map = new Map<string, DayStudySummary>();
    list.forEach((s) => map.set(s.date, s));
    return map;
  }, [toDateStr(monday)]);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Day headers */}
      <div className="flex border-b border-white/10 sticky top-0 bg-surface-dark z-10">
        <div className="w-14 shrink-0" /> {/* time gutter */}
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const dateStr = toDateStr(day);
          const summary = summaries.get(dateStr);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onDayClick(day)}
              className="flex-1 py-3 text-center hover:bg-white/5 transition-colors"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                {WEEKDAY_LABELS[i]}
              </div>
              <div className={[
                "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isToday ? "bg-primary text-white" : "text-on-surface",
              ].join(" ")}>
                {day.getDate()}
              </div>
              {summary && summary.totalMin > 0 && (
                <div className="mt-1 text-[10px] text-on-surface-variant">
                  {formatMinutes(summary.totalMin)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex overflow-auto flex-1">
        {/* Hour labels */}
        <div className="w-14 shrink-0 flex flex-col">
          {hours.map((h) => (
            <div
              key={h}
              className="shrink-0 text-right pr-3 text-[11px] text-on-surface-variant leading-none"
              style={{ height: PX_PER_HOUR, paddingTop: 4 }}
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, i) => {
          const dateStr = toDateStr(day);
          const summary = summaries.get(dateStr);
          const sessions = summary?.sessions ?? [];
          const isToday = isSameDay(day, today);

          return (
            <div
              key={i}
              className={[
                "flex-1 relative border-l border-white/10",
                isToday ? "bg-primary/5" : "",
              ].join(" ")}
              style={{ height: TOTAL_HOURS * PX_PER_HOUR }}
            >
              {/* Hour lines */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-white/5"
                  style={{ top: (h - DAY_START_HOUR) * PX_PER_HOUR }}
                />
              ))}

              {/* Session blocks */}
              {sessions.map((session) => {
                const startMin = timeToMinutes(session.startTime);
                const endMin = timeToMinutes(session.endTime);
                const top = minutesToPx(startMin - DAY_START_HOUR * 60, PX_PER_HOUR);
                const height = minutesToPx(endMin - startMin, PX_PER_HOUR);

                // skip sessions outside visible range
                if (endMin <= DAY_START_HOUR * 60 || startMin >= DAY_END_HOUR * 60) return null;

                return (
                  <div
                    key={session.id}
                    className={`absolute left-1 right-1 rounded-md border-l-2 px-2 py-1 overflow-hidden ${toneBorderColor(session.tone)} bg-white/10`}
                    style={{ top: Math.max(0, top), height: Math.max(20, height) }}
                    title={`${session.roomName} (${session.startTime}–${session.endTime})`}
                  >
                    <div className={`text-[11px] font-semibold truncate ${toneTextColor(session.tone)}`}>
                      {session.roomName}
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      {session.startTime}–{session.endTime}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({ cursor, today }: { cursor: Date; today: Date }) {
  const dateStr = toDateStr(cursor);
  const summary = getDaySummary(dateStr);
  const sessions = summary.sessions;
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => DAY_START_HOUR + i);
  const isToday = isSameDay(cursor, today);

  const dayLabel = cursor.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col">
      {/* Day header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-on-surface">
            {isToday ? "Today" : dayLabel}
          </div>
          {isToday && (
            <div className="text-sm text-on-surface-variant">{dayLabel}</div>
          )}
        </div>
        {summary.totalMin > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2">
            <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
            <span className="text-sm font-semibold text-primary">{formatMinutes(summary.totalMin)} studied</span>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">event_busy</span>
          <p className="text-sm text-on-surface-variant">No study sessions this day.</p>
        </div>
      ) : (
        <div className="flex overflow-auto flex-1">
          {/* Hour labels */}
          <div className="w-16 shrink-0 flex flex-col">
            {hours.map((h) => (
              <div
                key={h}
                className="shrink-0 text-right pr-3 text-[11px] text-on-surface-variant leading-none"
                style={{ height: PX_PER_HOUR, paddingTop: 4 }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Timeline column */}
          <div
            className="flex-1 relative border-l border-white/10"
            style={{ height: TOTAL_HOURS * PX_PER_HOUR }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-white/5"
                style={{ top: (h - DAY_START_HOUR) * PX_PER_HOUR }}
              />
            ))}

            {sessions.map((session) => {
              const startMin = timeToMinutes(session.startTime);
              const endMin = timeToMinutes(session.endTime);
              const top = minutesToPx(startMin - DAY_START_HOUR * 60, PX_PER_HOUR);
              const height = minutesToPx(endMin - startMin, PX_PER_HOUR);

              return (
                <div
                  key={session.id}
                  className={`absolute left-2 right-4 rounded-xl border-l-4 px-3 py-2 ${toneBorderColor(session.tone)} bg-white/10`}
                  style={{ top: Math.max(0, top), height: Math.max(32, height) }}
                >
                  <div className={`text-sm font-semibold ${toneTextColor(session.tone)}`}>
                    {session.roomName}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {session.startTime} – {session.endTime} · {formatMinutes(session.durationMin)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ view, cursor }: { view: CalendarView; cursor: Date }) {
  const stats = React.useMemo(() => {
    let startDate: string;
    let endDate: string;
    let label: string;

    if (view === "month") {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      startDate = toDateStr(firstDay);
      endDate = toDateStr(lastDay);
      label = `${MONTH_NAMES[month]} ${year}`;
    } else if (view === "week") {
      const monday = getMondayOfWeek(cursor);
      const sunday = addDays(monday, 6);
      startDate = toDateStr(monday);
      endDate = toDateStr(sunday);
      label = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      startDate = toDateStr(cursor);
      endDate = toDateStr(cursor);
      label = cursor.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    const summaries = getDaySummariesForRange(startDate, endDate);
    const totalMin = summaries.reduce((sum, s) => sum + s.totalMin, 0);
    const activeDays = summaries.filter((s) => s.totalMin > 0).length;
    const totalSessions = summaries.reduce((sum, s) => sum + s.sessions.length, 0);

    return { label, totalMin, activeDays, totalSessions };
  }, [view, toDateStr(cursor)]);

  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-white/10 bg-surface-dark/50 text-sm">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
        <span className="text-on-surface font-semibold">{formatMinutes(stats.totalMin)}</span>
        <span className="text-on-surface-variant">total</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-emerald-400 text-[18px]">calendar_month</span>
        <span className="text-on-surface font-semibold">{stats.activeDays}</span>
        <span className="text-on-surface-variant">active days</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-400 text-[18px]">auto_stories</span>
        <span className="text-on-surface font-semibold">{stats.totalSessions}</span>
        <span className="text-on-surface-variant">sessions</span>
      </div>
    </div>
  );
}

// ─── Main Calendar Page ────────────────────────────────────────────────────────

export function CalendarPage() {
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [view, setView] = React.useState<CalendarView>("month");
  const [cursor, setCursor] = React.useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const headerTitle = React.useMemo(() => {
    if (view === "month") {
      return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;
    }
    if (view === "week") {
      const monday = getMondayOfWeek(cursor);
      const sunday = addDays(monday, 6);
      return `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return cursor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }, [view, cursor]);

  function navigate(direction: -1 | 1) {
    setCursor((prev) => {
      if (view === "month") return addMonths(prev, direction);
      if (view === "week") return addDays(prev, direction * 7);
      return addDays(prev, direction);
    });
  }

  function goToToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  }

  function handleDayClick(date: Date) {
    setCursor(date);
    setView("day");
  }

  return (
    <div className="flex flex-col h-full bg-charcoal-dark text-on-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-surface-dark">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-control-bg ring-1 ring-white/10 hover:bg-white/10 transition-colors"
            aria-label="Previous"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-control-bg ring-1 ring-white/10 hover:bg-white/10 transition-colors"
            aria-label="Next"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <h2 className="text-base font-semibold text-on-surface min-w-[180px]">
            {headerTitle}
          </h2>
          <button
            type="button"
            onClick={goToToday}
            className="h-9 px-4 rounded-xl bg-control-bg ring-1 ring-white/10 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            Today
          </button>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-control-bg p-1 ring-1 ring-white/10">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={[
                "h-8 px-4 rounded-lg text-sm font-medium capitalize transition-colors",
                view === v
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar view={view} cursor={cursor} />

      {/* Calendar body */}
      <div className="flex-1 overflow-auto bg-surface-dark">
        {view === "month" && (
          <MonthView cursor={cursor} today={today} onDayClick={handleDayClick} />
        )}
        {view === "week" && (
          <WeekView cursor={cursor} today={today} onDayClick={handleDayClick} />
        )}
        {view === "day" && (
          <DayView cursor={cursor} today={today} />
        )}
      </div>
    </div>
  );
}
