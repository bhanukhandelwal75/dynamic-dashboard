

import { useState, useRef } from 'react';
import { DataProvider, useData } from './context/DataContext';
import LoginPage        from './pages/LoginPage';
import Dashboard        from './pages/Dashboard';
import Productivity     from './pages/Productivity';
import Ageing           from './pages/Ageing';
import TeamView         from './pages/TeamView';
import MerchantAnalyzer from './pages/MerchantAnalyzer';
import BossExtractor from './pages/BossExtractor'; // ← NEW
import Sidebar          from './components/Sidebar';
import Training from './pages/Training';
import NameScreening from './pages/NameScreening';
import QCSampling    from './pages/QCSampling';
import MIDReconciliation from './pages/MIDReconciliation';
import JocataExtractor from './pages/JocataExtractor';
import RuleEngine from './pages/RuleEngine';

// renderPage() mein:

import './index.css';
 
function AppInner() {
  const { currentUser, handleUpload } = useData();
  const [activePage, setActivePage]  = useState('dashboard');
  const fileInputRef = useRef(null);
 
  if (!currentUser) return <LoginPage />;
 
  const triggerUpload = () => fileInputRef.current?.click();
 
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':         return <Dashboard        onUploadClick={triggerUpload} />;
      case 'productivity':      return <Productivity     onUploadClick={triggerUpload} />;
      case 'ageing':            return <Ageing />;
      case 'team':              return <TeamView         onUploadClick={triggerUpload} />;
      case 'analyzer': return <MerchantAnalyzer/>;
      case 'boss-extractor':    return <BossExtractor />; 
      case 'training':      return <Training />;
      case 'name-screening': return <NameScreening />;
      case 'qc-sampling':    return <QCSampling />;
      case 'mid-reconciliation': return <MIDReconciliation />;
      case 'jocata-extractor': return <JocataExtractor />;
      case 'rule-engine': return <RuleEngine />;


                                  // ← NEW
      default:                  return <Dashboard        onUploadClick={triggerUpload} />;
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



