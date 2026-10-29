// One ticket per problem. causes.ts tells the parser from the hint by tenant and channel; reports the
// desk read as a one-day move (desk-notes.json) stay where causes.ts files them, as on the desk's own view.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'unplaced';

export const PROBLEMS: Record<Problem, string> = {
  parser: 'The shared parser reads every date month first; day-first tenants get day and month swapped.',
  hint: 'booking-v3 prints MM/DD/YYYY under its date field; people type month first and the form reads it day first.',
  unplaced: 'No tenant on file, so no cause can be told.',
};

export function problemOf(r: Report, t: Tenant | undefined): Problem {
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function splitTicket(reports: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r));
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
