import { Link } from 'react-router-dom';

export const Card = ({ children, className = '' }) => (
  <section className={`panel ${className}`}>{children}</section>
);

export const PageTitle = ({ eyebrow = 'YOUR WORKSPACE', title, subtitle, action }) => (
  <div className="page-title">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Button = ({
  children,
  to,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) =>
  to ? (
    <Link className={`button button-${variant}`} to={to}>
      {children}
    </Link>
  ) : (
    <button
      type={type}
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );

export const Field = ({ label, hint, as: Control = 'input', children, ...props }) => (
  <label className="field">
    <span>{label}</span>
    {Control === 'input' ? <input {...props} /> : <Control {...props}>{children}</Control>}
    {hint && <small>{hint}</small>}
  </label>
);

export const Notice = ({ children, title = 'Demo experience' }) => (
  <div className="demo-notice">
    <span>ⓘ</span>
    <div>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  </div>
);
