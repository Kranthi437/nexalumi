import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import BrandLogo from '../BrandLogo.jsx';
import DemoBadge from '../DemoBadge.jsx';

const groups = [
  { title: 'WORKSPACE', links: [['/app','Overview','⌂'],['/app/link-check','Link checker','↗'],['/app/message-check','Message checker','▤'],['/app/email-check','Email checker','✉'],['/app/qr-check','QR code checker','▦']] },
  { title: 'YOUR SECURITY', links: [['/app/history','Scan history','◷'],['/app/alerts','Security alerts','♢'],['/app/academy','Safety academy','✦']] },
  { title: 'PREFERENCES', links: [['/app/profile','My profile','◉'],['/app/settings','Account settings','⚙'],['/app/privacy-settings','Privacy settings','♧'],['/app/notifications','Notifications','♧']] },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const current = groups.flatMap(g => g.links).find(l => l[0] === location.pathname);
  return <div className="workspace">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><BrandLogo to="/app" /></div>
      <div className="workspace-label">PERSONAL WORKSPACE</div>
      <nav aria-label="Workspace navigation">
        {groups.map(group => <div className="nav-group" key={group.title}><p>{group.title}</p>{group.links.map(([to,label,icon]) => <NavLink key={to} to={to} end={to === '/app'} onClick={() => setMobileOpen(false)} className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}><span className="side-icon">{icon}</span>{label}</NavLink>)}</div>)}
        <div className="nav-group"><p>OTHER</p><NavLink to="/help" className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}><span className="side-icon">?</span>Help & support</NavLink><NavLink to="/admin" className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}><span className="side-icon">▦</span>Admin preview</NavLink></div>
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✦</div><strong>Stay one step ahead</strong><p>Small safety habits make a big difference.</p><NavLink to="/app/academy">Explore learning →</NavLink></div><div className="sidebar-user"><div className="avatar">G</div><div><strong>Guest user</strong><small>Demo workspace</small></div><span className="user-menu">•••</span></div></div>
    </aside>
    <div className="workspace-main"><header className="workspace-topbar"><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen}>☰</button><div className="breadcrumb">Workspace <span>/</span> <strong>{current?.[1] || (location.pathname === '/admin' ? 'Admin preview' : 'Overview')}</strong></div><div className="topbar-actions"><DemoBadge /><Link className="icon-button" aria-label="Notifications" to="/app/notifications">♧<i /></Link><div className="avatar avatar-small">G</div></div></header><main className="workspace-content"><Outlet /></main><footer className="workspace-footer">The Link Checker uses Google Web Risk when the backend is configured. Other tools and workspace data are previews. No result guarantees safety.</footer></div>
  </div>;
}
