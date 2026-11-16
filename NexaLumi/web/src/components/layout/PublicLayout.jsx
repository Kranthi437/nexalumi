import { Link, NavLink, Outlet } from 'react-router-dom';
import BrandLogo from '../BrandLogo.jsx';

export default function PublicLayout() {
  return <div className="public-layout">
    <header className="public-header">
      <div className="container nav-wrap">
        <BrandLogo light />
        <nav className="public-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink><a href="/#tools">Safety tools</a><a href="/#about">About</a><Link to="/contact">Contact</Link>
        </nav>
        <div className="nav-actions"><span className="nav-login">Guest demo</span><Link className="button button-teal button-small" to="/app">Open workspace <span>→</span></Link></div>
      </div>
    </header>
    <Outlet />
    <footer className="public-footer"><div className="container footer-grid">
      <div><BrandLogo /><p className="muted footer-intro">Helping people make more informed decisions online. Clear guidance, not fear.</p></div>
      <div><strong>Explore</strong><Link to="/">Home</Link><a href="/#tools">Safety tools</a><Link to="/academy">Safety Academy</Link></div>
      <div><strong>Company</strong><a href="/#about">About NEXALUMI</a><Link to="/contact">Contact</Link><Link to="/help">Help centre</Link></div>
      <div><strong>Legal</strong><Link to="/privacy">Privacy notice</Link><Link to="/terms">Terms of use</Link></div>
    </div><div className="container footer-bottom">© 2026 NEXALUMI · Your Digital Safety Partner <span>Prototype only · Not a live security service</span></div></footer>
  </div>;
}
