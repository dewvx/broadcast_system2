import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, toast } from '../../components/ui';
import { PageTransition } from '../../components/motion';
import { KeyRound, Eye, EyeOff, Radio } from 'lucide-react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    try {
      setLoading(true);
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Brand Panel (desktop only) */}
      <aside className="hidden lg:flex w-[45%] max-w-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
            className="w-12 h-12 rounded-full object-cover border border-white/20 ring-2 ring-primary/40"
          />
          <span className="text-body-lg font-bold tracking-wide">หอกระจายข่าวบ้านสี่แยก</span>
        </div>

        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Radio className="w-7 h-7 text-primary-soft" />
          </div>
          <h2 className="text-h1 leading-snug">
            ประกาศข่าวถึงลูกบ้าน
            <br />
            <span className="text-primary-soft">รวดเร็ว ในที่เดียว</span>
          </h2>
          <p className="text-body-lg text-slate-400 leading-relaxed max-w-md">
            ระบบจัดการข่าวสาร ประกาศ กิจกรรม และแบบฟอร์มราชการ
            พร้อมกระจายข่าวถึงลูกบ้านผ่าน LINE Official Account
          </p>
        </div>

        <p className="text-meta text-slate-500">ระบบประชาสัมพันธ์ชุมชน © {new Date().getFullYear()}</p>
      </aside>

      {/* Right Form Panel */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <PageTransition className="w-full max-w-md space-y-6">
          {/* Brand Header (mobile) */}
          <div className="text-center space-y-2 lg:hidden">
            <img
              src="/logo.jpg"
              alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
              className="w-20 h-20 rounded-full mx-auto object-cover shadow-md border-2 border-white ring-2 ring-primary/25 mb-2"
            />
            <h1 className="text-h2 text-text-primary">หอกระจายข่าวบ้านสี่แยก</h1>
            <p className="text-body-sm text-text-secondary">ระบบจัดการสำหรับผู้ใหญ่บ้านและผู้นำชุมชน</p>
          </div>

          <div className="hidden lg:block space-y-1.5">
            <h1 className="text-h1 text-text-primary">เข้าสู่ระบบผู้ดูแล</h1>
            <p className="text-body text-text-secondary">กรอกชื่อผู้ใช้งานและรหัสผ่านเพื่อเข้าใช้ระบบจัดการ</p>
          </div>

          {/* Card Form */}
          <div className="bg-surface border border-border rounded-md shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 bg-error-soft border border-error/20 text-error text-body-sm rounded-sm" role="alert">
                  {errorMsg}
                </div>
              )}

              <Input
                label="ชื่อผู้ใช้งาน (Username)"
                required
                autoComplete="username"
                placeholder="ระบุชื่อผู้ใช้งาน"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Input
                label="รหัสผ่าน (Password)"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="ระบุรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between -mt-1">
                <label className="flex items-center gap-2 min-h-11 cursor-pointer group px-1 rounded-sm">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span className="text-body-sm text-text-secondary group-hover:text-text-primary transition-colors duration-fast inline-flex items-center gap-1.5">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    แสดงรหัสผ่าน
                  </span>
                </label>

                <Link
                  to="/admin/forgot-password"
                  className="text-body-sm font-medium text-primary hover:text-primary-hover active:text-primary-active transition-colors duration-fast inline-flex items-center gap-1.5 py-2"
                >
                  <KeyRound className="w-4 h-4" /> ลืมรหัสผ่าน?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-2">
                เข้าสู่ระบบ
              </Button>
            </form>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}

export default LoginPage;
