import type { DashboardStats } from "@/lib/logic/dashboard";

function Bars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return <div className="bar-chart">{items.map((item) => <div className="bar-row" key={item.label}><span>{item.label}</span><div><i style={{ width: `${(item.value / max) * 100}%` }} /></div><strong>{item.value}</strong></div>)}</div>;
}

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return <section className="dashboard" aria-label="Assessment overview">
    <div className="metric-grid">
      <div><span>Total leads</span><strong>{stats.total}</strong></div>
      <div><span>Fitting requests</span><strong>{stats.fittingRequests}</strong></div>
      <div><span>High intent</span><strong>{stats.highIntent}</strong></div>
      <div><span>Average score</span><strong>{stats.averageScore}<small>/100</small></strong></div>
    </div>
    <div className="chart-grid">
      <article><div className="chart-heading"><h2>Submissions</h2><span>Last 7 days</span></div><Bars items={stats.daily} /></article>
      <article><div className="chart-heading"><h2>Top matches</h2><span>All assessments</span></div><Bars items={stats.categories.length ? stats.categories : [{ label: "No data", value: 0 }]} /></article>
    </div>
  </section>;
}
