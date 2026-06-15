export default function KpiCard({ label, value, sub, icon, variant = 'blue-v' }) {
  return (
    <div className={`kpi ${variant}`}>
      <div className="kpi-top-bar" />
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-label">{label}</div>
      <div className="kpi-val">{value || '—'}</div>
      <div className="kpi-sub">{sub || ''}</div>
    </div>
  );
}




// export default function KpiCard({ label, value, sub, icon, variant = 'blue-v' }) {
//   return (
//     <div className={`kpi ${variant}`}>
//       <div className="kpi-top-bar" />
//       {icon && <div className="kpi-icon">{icon}</div>}
//       <div className="kpi-label">{label}</div>
//       <div className="kpi-val">{value || '—'}</div>
//       <div className="kpi-sub">{sub || ''}</div>
//     </div>
//   );
// }