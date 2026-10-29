<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { PROBLEMS, splitTicket } from '#lib/kb/problems';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: problem → the ticket filed for it, e.g. { parser: 'https://…/issues/1' }.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const rows = $derived(reports as Report[]);
  const groups = $derived(splitTicket(rows, ticket, tenantOf));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const copies = $derived(rows.filter((r) => r.mergedInto === ticket).length - uniqueById(rows).filter((r) => r.mergedInto === ticket).length);
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} ({copies} export rows were the same report twice) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="why">{PROBLEMS[g.problem]}</span></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{tickets[g.problem].replace(/^.*\/issues\//, '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {@const moved = g.reports.filter((r) => notes.oneDayMove.includes(r.id)).length}
  {#if moved}
    <p class="why">{moved} of the {g.problem} reports read as a one-day move; counted under <code>{g.problem}</code> by tenant, as the desk counts them.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .why { color: var(--muted); font-size: 0.85em; }
</style>
