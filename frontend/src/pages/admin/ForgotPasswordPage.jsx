import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/auth.api';
import { Button, Input } from '../../components/ui';
import { PageTransition } from '../../components/motion';
import { CheckCircle, ArrowLeft, ArrowRight, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password, 3: Success

  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Step 1: ขอ OTP ผ่าน LINE OA
  async function handleRequestOtp(e) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!username.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้งาน (Username)');
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(username.trim());
      setInfoMsg(res.data.message || 'ส่งรหัส OTP 6 หลักไปยัง LINE เรียบร้อยแล้ว');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ไม่สามารถส่งรหัส OTP ได้ กรุณาตรวจสอบชื่อผู้ใช้งาน');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: ยืนยัน OTP และตั้งรหัสผ่านใหม่
  async function handleResetPassword(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        username: username.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep(3);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <PageTransition className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.jpg"
            alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
            className="w-20 h-20 rounded-full mx-auto object-cover shadow-md border-2 border-white ring-2 ring-primary/25 mb-2"
          />
          <h1 className="text-h2 text-text-primary">รีเซ็ตรหัสผ่านผู้ดูแลระบบ</h1>
          <p className="text-body-sm text-text-secondary">กู้คืนรหัสผ่านอย่างปลอดภัยผ่าน LINE Official Account</p>
        </div>

        {/* Card Form */}
        <div className="bg-surface border border-border rounded-md shadow-sm p-6 sm:p-8">
          {errorMsg && (
            <div
              className="p-3.5 mb-5 bg-error-soft border border-error/20 text-error text-body-sm rounded-sm flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="bg-primary-soft/50 border border-primary/20 rounded-md p-4 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  ระบบจะส่ง{' '}
                  <strong className="text-text-primary">รหัส OTP 6 หลัก (อายุ 10 นาที)</strong>{' '}
                  ไปยังบัญชี LINE Official Account ที่ผูกไว้กับชื่อผู้ใช้นี้
                </p>
              </div>

              <Input
                label="ชื่อผู้ใช้งาน (Username)"
                required
                autoComplete="username"
                placeholder="ระบุชื่อผู้ใช้งาน เช่น somsak_admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-1">
                ส่งรหัส OTP เข้า LINE
              </Button>

              <div className="text-center pt-1">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 min-h-11 px-2 text-body-sm font-medium text-text-secondary hover:text-primary transition-colors duration-fast"
                >
                  <ArrowLeft className="w-4 h-4" /> กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {infoMsg && (
                <div className="p-3.5 bg-success-soft border border-success/20 text-success text-body-sm rounded-sm flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              <Input
                label="รหัส OTP 6 หลัก (จาก LINE OA)"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="เช่น 123456"
                className="tracking-[0.4em] font-semibold text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />

              <Input
                label="รหัสผ่านใหม่"
                type="password"
                required
                autoComplete="new-password"
                placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="ยืนยันรหัสผ่านใหม่"
                type="password"
                required
                autoComplete="new-password"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-1">
                ยืนยันการเปลี่ยนรหัสผ่าน
              </Button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                    setOtp('');
                  }}
                  className="min-h-11 px-2 text-body-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-fast cursor-pointer"
                >
                  ขอรหัสใหม่อีกครั้ง
                </button>

                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 min-h-11 px-2 text-body-sm font-medium text-text-secondary hover:text-primary transition-colors duration-fast"
                >
                  <ArrowLeft className="w-4 h-4" /> ยกเลิก
                </Link>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-2 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-h2 text-text-primary">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
                <p className="text-body-sm text-text-secondary mt-1.5 leading-relaxed">
                  รหัสผ่านของท่านได้รับการอัปเดตเรียบร้อยแล้ว
                  สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
                </p>
              </div>

              <Button variant="primary" size="lg" fullWidth icon={ArrowRight} onClick={() => navigate('/admin/login', { replace: true })}>
                เข้าสู่ระบบทันที
              </Button>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

export default ForgotPasswordPage;
