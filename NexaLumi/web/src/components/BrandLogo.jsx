import { Link } from 'react-router-dom';
import logoMark from '../assets/nexalumi-mark.webp';

export default function BrandLogo({ to = '/', light = false, compact = false }) {
  return (
    <Link to={to} className={`brand ${light ? 'brand-light' : ''}`} aria-label="NEXALUMI home">
      <img src={logoMark} alt="" />
      {!compact && <span><strong>NEXALUMI</strong><small>Your Digital Safety Partner</small></span>}
    </Link>
  );
}
