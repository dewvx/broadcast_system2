import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../api/auth.api';
import { Button, Input, Card } from '../../components/ui';
import { KeyRound, CheckCircle, ArrowLeft, ArrowRight, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password, 3: Success

  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState('');
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
      setResetToken(res.data.resetToken);
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

    if (!otp.trim()) {
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
        resetToken,
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
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.jpg"
            alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
            className="w-20 h-20 rounded-full mx-auto object-cover shadow-md border-2 border-white ring-2 ring-primary/20 mb-2"
          />
          <h1 className="text-2xl font-bold text-text-primary">รีเซ็ตรหัสผ่านผู้ดูแลระบบ</h1>
          <p className="text-sm text-text-secondary">กู้คืนรหัสผ่านความปลอดภัยผ่าน LINE Official Account</p>
        </div>

        {/* Card Form */}
        <Card className="shadow-md">
          {errorMsg && (
            <div className="p-3 mb-4 bg-error-soft border border-error/20 text-error text-xs rounded-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="bg-primary-soft/40 border border-primary/20 rounded-sm p-3 flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  ระบบจะส่ง <strong className="text-text-primary">รหัส OTP 6 หลัก (อายุ 10 นาที)</strong> ไปยังบัญชี LINE Official Account ที่ผูกไว้กับชื่อผู้ใช้นี้
                </p>
              </div>

              <Input
                label="ชื่อผู้ใช้งาน (Username)"
                required
                placeholder="ระบุชื่อผู้ใช้งาน เช่น somsak_admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-2">
                ส่งรหัส OTP เข้า LINE
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {infoMsg && (
                <div className="p-3 bg-success-soft border border-success/20 text-success text-xs rounded-sm flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              <Input
                label="รหัส OTP 6 หลัก (จาก LINE OA)"
                required
                maxLength={6}
                placeholder="เช่น 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <Input
                label="รหัสผ่านใหม่"
                type="password"
                required
                placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="ยืนยันรหัสผ่านใหม่"
                type="password"
                required
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-2">
                ยืนยันการเปลี่ยนรหัสผ่าน
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                  }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  ขอรหัสใหม่อีกครั้ง
                </button>

                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> ยกเลิก
                </Link>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
                <p className="text-xs text-text-secondary mt-1">
                  รหัสผ่านของท่านได้รับการอัปเดตเรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
                </p>
              </div>

              <Button
                variant="primary"
                fullWidth
                icon={ArrowRight}
                onClick={() => navigate('/admin/login', { replace: true })}
              >
                เข้าสู่ระบบทันที
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
