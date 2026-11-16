import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DemoBadge from '../components/DemoBadge.jsx';
import { requestMessageCheck, requestEmailCheck } from '../api/checkers.js';
import { requestLinkCheck } from '../api/linkCheck.js';
import { saveScan, getScans, clearScans } from '../utils/scanHistory.js';
import { Button, Card, Field, Notice, PageTitle } from '../components/ui.jsx';
export { LinkChecker } from './LinkChecker.jsx';

export function Dashboard() {
  const stats = [['12','Links reviewed','↗','blue'],['08','Messages reviewed','▤','teal'],['03','Items to review','♢','amber'],['05','Learning topics','✦','purple']];
  return <><PageTitle title="Good afternoon, Guest" subtitle="Here’s your digital safety overview. Take a moment to review what matters today." action={<DemoBadge />} />
    <div className="welcome-banner"><div><span className="banner-kicker">A LITTLE MORE CONFIDENCE ONLINE</span><h2>Pause. Check. Then click.</h2><p>Use NEXALUMI’s guided tools to think through unexpected links and messages.</p><Button to="/app/link-check" variant="white">Check something now <span>→</span></Button></div><div className="banner-art"><div className="shield-art">✓</div><span className="orbit orbit-one"/><span className="orbit orbit-two"/></div></div>
    <div className="stat-grid">{stats.map(([v,l,i,c])=><Card className="stat-card" key={l}><div className={`stat-icon ${c}`}>{i}</div><div><strong>{v}</strong><span>{l}</span></div><small className="stat-note">Illustrative data</small></Card>)}</div>
    <div className="content-grid"><Card><div className="panel-heading"><div><h2>Quick safety checks</h2><p>Choose what you would like to review.</p></div><span className="soft-pill">4 tools</span></div><div className="quick-tools">{[['↗','Link checker','Review a website address','/app/link-check','blue'],['▤','Message checker','Review a suspicious text','/app/message-check','teal'],['✉','Email checker','Review an email message','/app/email-check','purple'],['▦','QR code checker','Understand QR code risks','/app/qr-check','amber']].map(([i,t,d,to,c])=><Link className="quick-tool" to={to} key={t}><span className={`tool-icon ${c}`}>{i}</span><span><strong>{t}</strong><small>{d}</small></span><b>→</b></Link>)}</div></Card><Card><div className="panel-heading"><div><h2>Your safety snapshot</h2><p>A sample view of your activity.</p></div><span className="tiny-dot"/></div><div className="snapshot-score"><div className="score-ring"><strong>78</strong><small>/ 100</small></div><div><strong>Building good habits</strong><p>Keep learning and reviewing unfamiliar requests.</p></div></div><div className="snapshot-row"><span>Learning progress</span><strong>3 of 5 topics</strong></div><div className="progress"><span style={{width:'60%'}}/></div><Link className="text-link" to="/app/academy">Continue learning →</Link></Card></div>
    <div className="content-grid lower-grid"><Card><div className="panel-heading"><div><h2>Recent activity</h2><p>Sample activity for layout preview.</p></div><Link className="text-link" to="/app/history">View history →</Link></div><ActivityRows /></Card><Card className="tip-card"><div className="tip-symbol">✦</div><span className="eyebrow">TODAY’S SAFETY TIP</span><h2>Urgency is a warning sign.</h2><p>Scammers often pressure people to act quickly. Pause and verify through a channel you already trust.</p><Link className="text-link" to="/app/academy">Learn more →</Link></Card></div>
  </>;
}

function ActivityRows() { return <div className="activity-list">{[['↗','Website address review','Today · 10:42 AM','No known threat found','green'],['▤','Message review','Yesterday · 4:18 PM','Suspicious indicators','amber'],['✉','Email review','Nov 06 · 1:25 PM','Demo preview only','gray']].map(r=><div className="activity-row" key={r[1]}><span className="activity-icon">{r[0]}</span><div><strong>{r[1]}</strong><small>{r[2]}</small></div><span className={`result-chip ${r[4]}`}>{r[3]}</span></div>)}</div>; }

function CheckerPage({ type }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraTimerRef = useRef(null);
  const config = {
    message: { eyebrow: 'MESSAGE CHECKER', title: 'Review a suspicious message', desc: 'Look for common pressure tactics, unusual requests and warning signs in a text message.', label: 'Message content', placeholder: 'Paste the message you received…', hint: 'Do not include passwords, OTPs or private information.', icon: '▤', button: 'Analyze message' },
    email: { eyebrow: 'EMAIL CHECKER', title: 'Review an email', desc: 'Review message content and any pasted email headers for warning signs.', label: 'Email content and headers', placeholder: 'Paste the email content. Include From, Reply-To and Authentication-Results headers if available…', hint: 'Remove personal information and secrets before submitting.', icon: '✉', button: 'Analyze email' },
    qr: { eyebrow: 'QR CODE CHECKER', title: 'Check a QR code destination', desc: 'Decode a QR image in a supported browser or paste the decoded destination URL.', label: 'QR destination or decoded text', placeholder: 'Paste the URL decoded from the QR code…', hint: 'Image decoding uses your browser when BarcodeDetector is supported.', icon: '▦', button: 'Check destination' },
  }[type];

  async function submit(event) {
    event?.preventDefault();
    setError(''); setResult(null); setLoading(true);
    if (type === 'qr' && cameraActive) stopCamera();
    try {
      let data;
      if (type === 'message') data = await requestMessageCheck(value);
      else if (type === 'email') data = await requestEmailCheck(value);
      else {
        data = await requestLinkCheck(value);
        saveScan({ type: 'QR code', label: value, classification: data.classification, details: data.explanation });
      }
      setResult(data);
      if (type !== 'qr') saveScan({ type: type === 'message' ? 'Message' : 'Email', label: value.slice(0, 90), classification: data.classification, details: data.disclaimer });
    } catch (e) { setError(e.message || 'The check could not be completed.'); }
    finally { setLoading(false); }
  }

  function stopCamera() {
    if (cameraTimerRef.current) clearInterval(cameraTimerRef.current);
    cameraTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function startCamera() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !('BarcodeDetector' in window)) {
      setError('Live camera scanning is not supported in this browser. Upload a QR image or paste its decoded URL instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      cameraTimerRef.current = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length) { setValue(codes[0].rawValue); stopCamera(); }
        } catch { /* Ignore transient frame decode errors. */ }
      }, 500);
    } catch {
      stopCamera();
      setError('Camera access was blocked or unavailable. Allow camera permission or upload a QR image.');
    }
  }

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => setError('Could not start the camera preview.'));
    }
  }, [cameraActive]);

  useEffect(() => () => {
    if (cameraTimerRef.current) clearInterval(cameraTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  async function decodeQr(file) {
    setQrFile(file); setError(''); setResult(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('QR images must be 5 MB or smaller.'); return; }
    if (!('BarcodeDetector' in window) || !window.createImageBitmap) {
      setError('QR image decoding is not supported in this browser. Use Chrome or Edge, or paste the decoded URL below.');
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(bitmap);
      bitmap.close?.();
      if (!codes.length) throw new Error('No QR code was detected in this image.');
      setValue(codes[0].rawValue);
    } catch (e) { setError(e.message || 'Could not decode this QR image.'); }
  }

  return <>
    <PageTitle eyebrow={config.eyebrow} title={config.title} subtitle={config.desc} action={<span className="soft-pill">Live analysis · heuristic</span>} />
    <div className="checker-layout">
      <Card className="checker-card">
        <div className="checker-intro"><span className="large-tool-icon">{config.icon}</span><div><h2>What would you like to review?</h2><p>Submit content for an on-server analysis. Results are guidance, not a guarantee.</p></div></div>
        {type === 'qr' ? <><label className="field"><span>Upload QR image (optional)</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => decodeQr(e.target.files?.[0])} /><small>{qrFile?.name || 'Image decoding is performed locally in supported browsers. Maximum 5 MB.'}</small></label><div className="form-actions"><Button type="button" variant="outline" onClick={cameraActive ? stopCamera : startCamera}>{cameraActive ? 'Stop camera' : 'Scan with camera'}</Button></div>{cameraActive ? <video ref={videoRef} className="qr-camera-preview" autoPlay playsInline muted aria-label="QR code camera preview"/> : null}</> : null}
        <form onSubmit={submit}>
          <label className="field"><span>{config.label}</span><textarea rows="8" value={value} onChange={(e) => setValue(e.target.value)} placeholder={config.placeholder} required /><small>{config.hint}</small></label>
          <div className="form-actions"><Button type="submit" disabled={loading || !value.trim()}>{loading ? 'Analyzing…' : config.button} <span>→</span></Button><button type="button" className="button button-ghost" onClick={() => { if (cameraActive) stopCamera(); setValue(''); setResult(null); setError(''); setQrFile(null); }}>Clear</button></div>
        </form>
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <Notice>Do not submit passwords, one-time codes, private messages containing personal data, or confidential URLs. Content is sent to the NEXALUMI API for analysis. Message and email checks use pattern-based heuristics and cannot confirm whether a sender is genuine.</Notice>
      </Card>
      <div className="side-stack"><Card><h3>Before you continue</h3><ul className="check-list"><li>Never share passwords or one-time passcodes.</li><li>Verify payment requests through a trusted channel.</li><li>Inspect the destination before opening a QR link.</li></ul></Card><Card className="soft-panel"><span className="eyebrow">GOOD TO KNOW</span><h3>A result is not a guarantee.</h3><p>New scams and targeted attacks may not match known patterns.</p></Card></div>
    </div>
    {result ? <Card className="preview-result" aria-live="polite"><div className="panel-heading"><div><span className="eyebrow">LIVE CHECK RESULT</span><h2>{result.classification}</h2></div></div><div className="result-preview-body"><div className="result-icon">{result.classification === 'Suspicious' ? '!' : 'ⓘ'}</div><div><span className="result-chip blue">{result.classification}</span><h3>Findings</h3><p>{result.disclaimer || result.explanation || 'Review the findings and verify independently.'}</p></div></div>{result.findings?.length ? <ul className="check-list">{result.findings.map((item) => <li key={item.code}><strong>{item.severity}:</strong> {item.message}</li>)}</ul> : <p>No matching heuristic indicators were found. This does not prove the content is safe.</p>}{result.headerAnalysis ? <div className="sample-value"><strong>Email header analysis</strong><p>{result.headerAnalysis.note}</p><p>From: {result.headerAnalysis.from || 'Not provided'} · Reply-To: {result.headerAnalysis.replyTo || 'Not provided'}</p></div> : null}{result.hostname ? <div className="sample-value"><strong>Checked hostname</strong><p>{result.hostname}</p></div> : null}<small>Checked: {new Date(result.checkedAt).toLocaleString()}</small></Card> : null}
  </>;
}
export const MessageChecker = () => <CheckerPage type="message"/>;
export const EmailChecker = () => <CheckerPage type="email"/>;
export const QRChecker = () => <CheckerPage type="qr"/>;

export function ScanHistory() {
  const [filter, setFilter] = useState('All');
  const [rows, setRows] = useState(() => getScans());
  const visible = filter === 'All' ? rows : rows.filter((row) => row.type === filter);
  return <><PageTitle title="Scan history" subtitle="Recent checks saved locally in this browser." action={<span className="soft-pill">Local history</span>} /><Card><div className="toolbar"><div className="tabs">{['All','Link','Message','Email','QR code'].map((f) => <button className={filter === f ? 'selected' : ''} key={f} onClick={() => setFilter(f)}>{f}</button>)}</div><Button variant="outline" onClick={() => { clearScans(); setRows([]); }}>Clear history</Button></div>{visible.length ? <div className="table-wrap"><table><thead><tr><th>ITEM</th><th>TYPE</th><th>DATE</th><th>RESULT</th></tr></thead><tbody>{visible.map((r) => <tr key={r.id}><td><strong>{r.label}</strong></td><td>{r.type}</td><td>{new Date(r.checkedAt).toLocaleString()}</td><td>{r.classification}</td></tr>)}</tbody></table></div> : <p>No saved scans yet. Completed checks will appear here in this browser.</p>}<Notice>History is stored in local browser storage only. It is not synchronized between devices or backed up to a server.</Notice></Card></>;
}

export function SecurityAlerts() { return <><PageTitle title="Security alerts" subtitle="A central place for important safety updates and reminders." action={<DemoBadge/>}/><div className="alert-summary"><Card><span className="alert-number">02</span><strong>Sample reminders</strong><small>For interface preview only</small></Card><Card><span className="alert-number teal-text">01</span><strong>Learning update</strong><small>New safety topic available</small></Card></div><Card><div className="panel-heading"><div><h2>Recent updates</h2><p>Example alert cards and notification states.</p></div><button className="text-link" onClick={()=>{}}>Mark all as read</button></div><div className="alert-list">{[['amber','!','Review unexpected payment requests','Be careful if someone asks you to move money urgently. Verify the request using a trusted contact method.','Today · 9:00 AM','Safety reminder'],['blue','✦','A new learning topic is available','Explore the guide to recognising fake delivery and parcel notifications.','Yesterday · 11:30 AM','Learning update'],['teal','✓','Your profile checklist is ready','Review the privacy and notification preferences in your workspace.','Nov 06 · 2:15 PM','Account tip']].map(a=><div className="alert-row" key={a[2]}><span className={`alert-symbol ${a[0]}`}>{a[1]}</span><div className="alert-copy"><div><strong>{a[2]}</strong><span className="soft-pill">{a[5]}</span></div><p>{a[3]}</p><small>{a[4]}</small></div><button className="more-button" aria-label="More alert options">•••</button></div>)}</div></Card></>; }

const lessons=[['01','Spotting phishing','Learn how fake websites and messages try to collect personal details.','8 min','Beginner','blue'],['02','OTP and payment safety','Understand why you should never share one-time passcodes.','6 min','Beginner','teal'],['03','QR code awareness','Know what to consider before scanning an unfamiliar QR code.','5 min','Beginner','purple'],['04','Safer online shopping','Recognise common warning signs in unfamiliar online stores.','10 min','Intermediate','amber'],['05','Protecting your accounts','Explore passwords, multi-factor authentication and recovery.','9 min','Intermediate','blue']];
export function SafetyAcademy() { const [active,setActive]=useState(null); return <><PageTitle eyebrow="LEARN AT YOUR PACE" title="Safety Academy" subtitle="Friendly, practical lessons to help you build safer online habits." action={<DemoBadge/>}/><div className="academy-banner"><div><span className="banner-kicker">YOUR LEARNING JOURNEY</span><h2>Knowledge is your first line of defence.</h2><p>Explore short guides designed for everyday digital life.</p></div><div className="academy-progress"><strong>3<span>/5</span></strong><small>Topics explored</small><div className="progress"><span style={{width:'60%'}}/></div></div></div><div className="lesson-grid">{lessons.map((l,i)=><Card className="lesson-card" key={l[0]}><div className={`lesson-number ${l[5]}`}>{l[0]}</div><div className="lesson-meta"><span>{l[3]}</span><span>{l[4]}</span></div><h3>{l[1]}</h3><p>{l[2]}</p><button className="text-link" onClick={()=>setActive(active===i?null:i)}>{active===i?'Close lesson preview':'Explore lesson →'}</button>{active===i&&<div className="lesson-preview"><strong>Lesson preview</strong><p>This learning module will include practical examples, warning signs and a short knowledge check. Content is illustrative in this prototype.</p></div>}</Card>)}</div></>; }

export function ProfilePage() { return <><PageTitle title="My profile" subtitle="Manage the profile details displayed in your workspace." action={<DemoBadge/>}/><div className="settings-layout"><Card><div className="profile-head"><div className="profile-avatar">G</div><div><h2>Guest User</h2><p>guest@example.com · Demo account</p><span className="soft-pill">Personal workspace</span></div></div><div className="form-grid"><Field label="Display name" defaultValue="Guest User"/><Field label="Email address" defaultValue="guest@example.com" type="email"/><Field label="Phone number" placeholder="Add a phone number"/><Field label="Preferred language" as="select" defaultValue="English"><option>English</option><option>Hindi (preview)</option><option>Telugu (preview)</option></Field></div><div className="form-actions"><Button onClick={()=>{}}>Save profile preview</Button><span className="muted">Changes are not saved.</span></div></Card><Card><h3>Profile completeness</h3><div className="profile-complete"><strong>60%</strong><div className="progress"><span style={{width:'60%'}}/></div></div><p className="muted">Add optional profile details when account features become available.</p></Card></div></>; }

export function SettingsPage() { const [tab,setTab]=useState('General'); return <><PageTitle title="Account settings" subtitle="Choose how your NEXALUMI workspace should look and behave." action={<DemoBadge/>}/><div className="settings-layout"><Card className="settings-menu">{['General','Appearance','Language','Security'].map(t=><button className={tab===t?'active':''} key={t} onClick={()=>setTab(t)}>{t}<span>›</span></button>)}</Card><Card><h2>{tab} preferences</h2><p className="muted">Preview your workspace preferences. Settings are not persisted.</p>{tab==='General'?<><SettingRow title="Workspace name" desc="The name shown in your workspace navigation." control={<input defaultValue="Personal workspace"/>}/><SettingRow title="Default landing page" desc="Choose which page opens when you enter the workspace." control={<select defaultValue="Overview"><option>Overview</option><option>Link checker</option><option>Safety Academy</option></select>}/></>:tab==='Appearance'?<><SettingRow title="Colour theme" desc="Choose a visual theme for the workspace." control={<select><option>Light</option><option>Dark (preview)</option><option>System</option></select>}/><SettingRow title="Compact navigation" desc="Use a more condensed sidebar layout." control={<input type="checkbox"/>}/></>:tab==='Language'?<SettingRow title="Display language" desc="Choose your preferred language." control={<select><option>English</option><option>हिन्दी (preview)</option><option>తెలుగు (preview)</option></select>}/>:<><SettingRow title="Two-step verification" desc="Additional sign-in protection will be available in a future phase." control={<span className="soft-pill">Not connected</span>}/><SettingRow title="Active sessions" desc="Session management is not connected in this prototype." control={<span className="soft-pill">Demo only</span>}/></>}<div className="form-actions"><Button onClick={()=>{}}>Save preference preview</Button></div></Card></div></>; }
function SettingRow({title,desc,control}) { return <div className="setting-row"><div><strong>{title}</strong><p>{desc}</p></div><div className="setting-control">{control}</div></div>; }

export function PrivacySettings() { return <><PageTitle title="Privacy settings" subtitle="Understand the information used by this prototype and review example privacy controls." action={<DemoBadge/>}/><Card><h2>Your privacy controls</h2><p className="muted">The controls below are visual previews. No personal data processing settings are connected.</p><SettingRow title="Save scan history" desc="Choose whether scan metadata would be kept in your account." control={<input type="checkbox" defaultChecked/>}/><SettingRow title="Personalised learning suggestions" desc="Use your learning activity to suggest relevant topics." control={<input type="checkbox"/>}/><SettingRow title="Share product analytics" desc="Help improve the product with aggregated usage information." control={<input type="checkbox"/>}/><SettingRow title="Third-party AI processing" desc="No AI provider is connected in this UI-only phase." control={<span className="soft-pill">Not enabled</span>}/><div className="form-actions"><Button onClick={()=>{}}>Save privacy preview</Button><Button variant="outline" to="/privacy">Read privacy notice</Button></div></Card><Notice>Before a live launch, privacy controls, consent, retention and deletion behaviour need implementation and legal review.</Notice></>; }

export function NotificationsPage() { return <><PageTitle title="Notification preferences" subtitle="Choose which updates you would like to receive in a future release." action={<DemoBadge/>}/><Card><h2>How we contact you</h2><SettingRow title="Important security updates" desc="Critical product and security announcements." control={<input type="checkbox" defaultChecked/>}/><SettingRow title="Learning reminders" desc="Occasional reminders to continue your safety lessons." control={<input type="checkbox" defaultChecked/>}/><SettingRow title="Product news" desc="New features, guides and product announcements." control={<input type="checkbox"/>}/><SettingRow title="Email notifications" desc="Email delivery is not connected in this prototype." control={<span className="soft-pill">Not connected</span>}/><div className="form-actions"><Button onClick={()=>{}}>Save notification preview</Button></div></Card></>; }

export function AdminDashboard() { return <><PageTitle eyebrow="ADMIN CONSOLE PREVIEW" title="Admin dashboard" subtitle="A visual concept for future platform administration. No admin operations are active." action={<DemoBadge/>}/><div className="stat-grid">{[['1,248','Registered users'],['8,420','Demo scans'],['98.4%','Service availability'],['12','Open support items']].map(s=><Card className="stat-card" key={s[1]}><div><strong>{s[0]}</strong><span>{s[1]}</span></div><small className="stat-note">Illustrative metrics</small></Card>)}</div><div className="content-grid"><Card><h2>Platform activity</h2><p className="muted">Sample activity trend · Not connected to live analytics</p><div className="chart-bars">{[35,55,44,70,58,85,66,92,73,100,81,88].map((v,i)=><div key={i}><span style={{height:`${v}%`}}/><small>{['M','T','W','T','F','S','S','M','T','W','T','F'][i]}</small></div>)}</div></Card><Card><h2>Admin modules</h2><div className="admin-links">{['User management','Content management','Threat intelligence settings','Support requests','Audit log','Platform configuration'].map(x=><div key={x}><span>{x}</span><span className="soft-pill">Planned</span></div>)}</div></Card></div><Notice>Administrative permissions, user data, threat feeds and audit records are not connected. Do not use this screen for real operations.</Notice></>; }

export function LoginPage() { const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [message,setMessage]=useState(false); return <AuthFrame title="Welcome back" subtitle="Sign in to your personal safety workspace."><form onSubmit={e=>{e.preventDefault();setMessage(true)}}><Field label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/><Field label="Password" type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required/><div className="auth-extras"><label><input type="checkbox"/> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div><button className="button button-primary button-full">Continue to demo</button>{message&&<Notice>Demo only. No account was authenticated and no details were sent.</Notice>}</form><p className="auth-switch">New to NEXALUMI? <Link to="/signup">Create an account</Link></p></AuthFrame>; }
export function SignupPage() { const [message,setMessage]=useState(false); return <AuthFrame title="Create your account" subtitle="Start building safer digital habits with NEXALUMI."><form onSubmit={e=>{e.preventDefault();setMessage(true)}}><Field label="Full name" placeholder="Your name" required/><Field label="Email address" type="email" placeholder="you@example.com" required/><Field label="Create password" type="password" placeholder="At least 8 characters" required/><label className="checkbox-line"><input type="checkbox" required/> I agree to the <Link to="/terms">Terms of use</Link> and acknowledge the <Link to="/privacy">Privacy notice</Link>.</label><button className="button button-primary button-full">Create demo account</button>{message&&<Notice>Demo only. Account creation and email verification are not connected.</Notice>}</form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></AuthFrame>; }
export function ForgotPasswordPage() { const [sent,setSent]=useState(false); return <AuthFrame title="Reset your password" subtitle="Enter your email address and we’ll show a preview of the reset confirmation."><form onSubmit={e=>{e.preventDefault();setSent(true)}}><Field label="Email address" type="email" placeholder="you@example.com" required/><button className="button button-primary button-full">Preview reset instructions</button>{sent&&<Notice>This is a prototype. No reset email has been sent.</Notice>}</form><p className="auth-switch"><Link to="/login">← Back to sign in</Link></p></AuthFrame>; }
function AuthFrame({title,subtitle,children}) { return <div className="auth-page"><div className="auth-card"><div className="auth-logo"><span className="auth-mark">✦</span><span>NEXALUMI</span><DemoBadge/></div><h1>{title}</h1><p className="muted">{subtitle}</p>{children}<div className="auth-foot">Your Digital Safety Partner · UI prototype</div></div></div>; }

export function AboutPage() { return <div className="simple-page"><span className="eyebrow">ABOUT NEXALUMI</span><h1>A calmer, clearer way to navigate digital life.</h1><p className="lead">NEXALUMI is being designed to help everyday people recognise potential online risks and make more informed decisions.</p><Card><h2>Our approach</h2><p>We believe digital safety should feel approachable, understandable and useful. Our goal is to explain warning signs and practical next steps without creating unnecessary fear.</p></Card><Notice>The Link Checker uses configured community threat-intelligence providers. Message, email and QR tools provide limited live checks with explicit limitations. NEXALUMI does not guarantee safety.</Notice></div>; }
export function ContactPage() { const [sent,setSent]=useState(false); return <div className="simple-page narrow"><span className="eyebrow">WE’RE HERE TO HELP</span><h1>Get in touch</h1><p className="lead">Have a question or feedback about the NEXALUMI concept? Send us a message preview.</p><Card><form onSubmit={e=>{e.preventDefault();setSent(true)}}><Field label="Your name" placeholder="Name" required/><Field label="Email address" type="email" placeholder="you@example.com" required/><label className="field"><span>How can we help?</span><select><option>General enquiry</option><option>Product feedback</option><option>Privacy question</option><option>Partnership</option></select></label><label className="field"><span>Message</span><textarea rows="5" placeholder="Write your message…" required/></label><button className="button button-primary">Preview message</button>{sent&&<Notice>Demo only. Your message has not been transmitted.</Notice>}</form></Card></div>; }
export function HelpPage() { return <div className="simple-page narrow"><span className="eyebrow">HELP CENTRE</span><h1>How can we help?</h1><p className="lead">Helpful guidance for using NEXALUMI's current Link Checker and interface previews.</p>{[['What does a Link Checker result mean?','NEXALUMI sends the URL to its backend and configured reputation providers (PhishTank, URLhaus and AlienVault OTX). A no-match result means no known threat was reported by responding providers at lookup time; it is not a guarantee of safety.'],['Does NEXALUMI open the links I submit?','No. The backend does not fetch, open or crawl submitted destinations. It sends the URL string to configured reputation providers for lookup; review the privacy notice before submitting private URLs.'],['Can NEXALUMI guarantee a website is safe?','No. No result should be treated as a guarantee. Verify important requests through a trusted channel.'],['What if I already shared an OTP?','Contact your bank or service provider through an official channel immediately and follow their account-protection guidance.']].map(q=><details className="faq" key={q[0]}><summary>{q[0]}</summary><p>{q[1]}</p></details>)}</div>; }
export function LegalPage({type}) { const privacy=type==='privacy'; return <div className="simple-page narrow"><span className="eyebrow">NEXALUMI · {privacy?'PRIVACY':'LEGAL'}</span><h1>{privacy?'Privacy notice':'Terms of use'}</h1><p className="muted">Prototype draft · Requires professional legal review before public launch.</p><Card><h2>{privacy?'Information in this prototype':'Using this prototype'}</h2><p>{privacy?'The Link Checker sends the submitted URL to the NEXALUMI backend and configured threat-intelligence providers. Message and email content is sent to the backend for heuristic analysis. QR images are decoded locally where supported, while decoded URLs are sent to the Link Checker. Scan history is stored in local browser storage. Do not submit private URLs or personal secrets.':'The Link Checker uses community threat-intelligence providers configured by the operator. Message, email and QR checks have limited functionality and documented limitations. Account features, sample metrics and learning progress are previews. No result is a guarantee of safety.'}</p><h2>Important limitations</h2><p>Any future live service must clearly explain its data handling, retention, third-party processing, security controls and deletion options. A result is not a guarantee of safety.</p><h2>Contact and updates</h2><p>These documents are draft content and require professional legal review before commercial launch. Submitted URLs are shared with configured threat-intelligence providers; pasted message and email content is sent to the NEXALUMI backend. Scan history is stored locally in the browser. Review the Privacy notice for details.</p></Card></div>; }
export function NotFoundPage() { return <div className="not-found"><span>404</span><h1>We can’t find that page.</h1><p>The page may have moved or the link may be incorrect.</p><Button to="/">Back to home</Button></div>; }
