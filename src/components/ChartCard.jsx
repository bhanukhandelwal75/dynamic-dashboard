export default function ChartCard({ title, sub, badge, badgeClass = 'badge-blue', height = 'h240', children }) {
  return (
    <div className="card">
      <div className="card-hdr">
        <div>
          <div className="card-title">{title}</div>
          {sub && <div className="card-sub">{sub}</div>}
        </div>
        {badge && <span className={`badge ${badgeClass}`}>{badge}</span>}
      </div>
      <div className={`chart-wrap ${height}`}>
        {children}
      </div>
    </div>
  );
}
