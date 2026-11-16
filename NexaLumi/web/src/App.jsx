import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import { Dashboard, LinkChecker, MessageChecker, EmailChecker, QRChecker, ScanHistory, SecurityAlerts, SafetyAcademy, ProfilePage, SettingsPage, PrivacySettings, NotificationsPage, AdminDashboard, LoginPage, SignupPage, ForgotPasswordPage, AboutPage, ContactPage, HelpPage, LegalPage, NotFoundPage } from './pages/PrototypePages.jsx';
import { LandingPage } from './pages/PublicPages.jsx';

export default function App() {
  return <Routes>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/about" element={<AboutPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/help" element={<HelpPage/>}/>
      <Route path="/privacy" element={<LegalPage type="privacy"/>}/><Route path="/terms" element={<LegalPage type="terms"/>}/>
      <Route path="/login" element={<LoginPage/>}/><Route path="/signup" element={<SignupPage/>}/><Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
      <Route path="/academy" element={<Navigate to="/app/academy" replace/>}/>
    </Route>
    <Route path="/app" element={<AppLayout/>}>
      <Route index element={<Dashboard/>}/><Route path="link-check" element={<LinkChecker/>}/><Route path="message-check" element={<MessageChecker/>}/><Route path="email-check" element={<EmailChecker/>}/><Route path="qr-check" element={<QRChecker/>}/>
      <Route path="history" element={<ScanHistory/>}/><Route path="alerts" element={<SecurityAlerts/>}/><Route path="academy" element={<SafetyAcademy/>}/><Route path="profile" element={<ProfilePage/>}/><Route path="settings" element={<SettingsPage/>}/><Route path="privacy-settings" element={<PrivacySettings/>}/><Route path="notifications" element={<NotificationsPage/>}/>
    </Route>
    <Route path="/admin" element={<AppLayout/>}><Route index element={<AdminDashboard/>}/></Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes>;
}
