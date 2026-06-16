import { useData } from '../context/DataContext';

export default function Sidebar({ activePage, onNavigate }) {
  const { currentUser, doLogout, sheetNames, activeSheet, switchSheet } = useData();

  const navItems = [
    { id: 'dashboard',           icon: '🏠', label: 'Executive Dashboard' },
    { id: 'productivity',        icon: '📈', label: 'Productivity' },
    { id: 'ageing',              icon: '⏱', label: 'Ageing Analysis' },
    { id: 'team',                icon: '👥', label: 'Team View' },
    { id: 'analyzer',            icon: '📝', label: 'L3 Comment Analyzer' },
    { id: 'boss-extractor',      icon: '🏦', label: 'Boss Extractor' },
    { id: 'training',            icon: '🎓', label: 'AML Training' },
    { id: 'name-screening',      icon: '🔎', label: 'Name Screening' },
    //{ id: 'qc-sampling',         icon: '✅', label: 'QC Sampling' },
    { id: 'mid-reconciliation',  icon: '🔄', label: 'MID Reconciliation' },
    { id: 'jocata-extractor',    icon: '⚡', label: 'Jocata Extractor' },
    { id: 'rule-engine',         icon: '🔧', label: 'Rule Engine' },
    { id: 'qc-analyzer',         icon: '✅', label: 'QC Checklist Analyzer' },
  ];

  return (
    <nav className="sidebar">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo">📊</div>
        <div>
          <div className="sb-title">Dashboard <span>Panel</span></div>
          <div className="sb-subtitle">AML Operations</div>
        </div>
      </div>

      {/* Sheet selector */}
      {sheetNames.length > 1 && activePage !== 'analyzer' && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Sheet</div>
          <select
            className="filter-select"
            style={{ width: '100%', minWidth: 'unset' }}
            value={activeSheet}
            onChange={(e) => switchSheet(parseInt(e.target.value))}
          >
            {sheetNames.map((s, i) => (
              <option key={i} value={i}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <div className="nav-grp">Main</div>
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item${activePage === item.id ? ' active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </div>
      ))}

      {/* Bottom user card */}
      <div className="sb-bottom">
        <div className="user-card">
          <div className="avatar">{currentUser?.name?.[0] || 'U'}</div>
          <div className="user-info">
            <span>{currentUser?.name || 'User'}</span>
            <small>{currentUser?.role || 'Member'}</small>
          </div>
          <button className="logout-btn" onClick={doLogout} title="Sign out">⏻</button>
        </div>
      </div>
    </nav>
  );
}
