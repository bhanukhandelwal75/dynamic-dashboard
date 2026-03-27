import { useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function FilterBar() {
  const { rawData, filteredData, CM, filters, applyFilters, resetFilters } = useData();

  // Unique month values
  const months = useMemo(() => {
    const vals = new Set();
    rawData.forEach((r) => {
      const v = CM.month ? (r[CM.month] || '') : r._created ? r._created.toISOString().slice(0, 7) : '';
      if (v) vals.add(v);
    });
    return [...vals].sort();
  }, [rawData, CM]);

  // Unique analysts
  const users = useMemo(() => {
    if (!CM.user) return [];
    return [...new Set(rawData.map((r) => r[CM.user]).filter(Boolean))].sort();
  }, [rawData, CM]);

  // Unique statuses
  const statuses = useMemo(() => {
    if (!CM.status) return [];
    return [...new Set(rawData.map((r) => r[CM.status]).filter(Boolean))].sort();
  }, [rawData, CM]);

  const handleChange = (key, value) => {
    applyFilters({ ...filters, [key]: value });
  };

  return (
    <div className="filters-bar">
      <span className="filter-label">🔍 Filter</span>

      <select className="filter-select" value={filters.month} onChange={(e) => handleChange('month', e.target.value)}>
        <option value="">All Months</option>
        {months.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <div className="filter-div" />

      <select className="filter-select" value={filters.user} onChange={(e) => handleChange('user', e.target.value)}>
        <option value="">All Analysts</option>
        {users.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>

      <div className="filter-div" />

      <select className="filter-select" value={filters.level} onChange={(e) => handleChange('level', e.target.value)}>
        <option value="">All Levels</option>
        {['L1', 'L2', 'L3'].map((l) => <option key={l} value={l}>{l}</option>)}
      </select>

      <div className="filter-div" />

      <select className="filter-select" value={filters.status} onChange={(e) => handleChange('status', e.target.value)}>
        <option value="">All Status</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <button className="reset-btn" onClick={resetFilters}>↺ Reset</button>

      <span className="filter-count">
        {filteredData.length.toLocaleString()} / {rawData.length.toLocaleString()} cases
      </span>
    </div>
  );
}
