import { useState, useRef } from 'react';
import { DataProvider, useData } from './context/DataContext';
import LoginPage    from './pages/LoginPage';
import Dashboard    from './pages/Dashboard';
import Productivity from './pages/Productivity';
import Ageing       from './pages/Ageing';
import TeamView     from './pages/TeamView';
import Sidebar      from './components/Sidebar';
import './index.css';

function AppInner() {
  const { currentUser, handleUpload } = useData();
  const [activePage, setActivePage]  = useState('dashboard');
  const fileInputRef = useRef(null);

  // If not logged in, show login screen
  if (!currentUser) return <LoginPage />;

  const triggerUpload = () => fileInputRef.current?.click();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard    onUploadClick={triggerUpload} />;
      case 'productivity': return <Productivity onUploadClick={triggerUpload} />;
      case 'ageing':       return <Ageing />;
      case 'team':         return <TeamView     onUploadClick={triggerUpload} />;
      default:             return <Dashboard    onUploadClick={triggerUpload} />;
    }
  };

  return (
    <div className="layout">
      {/* Global hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files[0]) handleUpload(e.target.files[0]); e.target.value = ''; }}
      />

      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
