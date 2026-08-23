import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import { Radio, KeyRound } from 'lucide-react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.jpg"
            alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
            className="w-20 h-20 rounded-full mx-auto object-cover shadow-md border-2 border-white ring-2 ring-primary/20 mb-2"
          />
          <h1 className="text-2xl font-bold text-text-primary">หอกระจายข่าวบ้านสี่แยก</h1>
          <p className="text-sm text-text-secondary">ระบบจัดการสำหรับผู้ใหญ่บ้านและผู้นำชุมชน</p>
        </div>

        {/* Card Form */}
        <Card className="shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-error-soft border border-error/20 text-error text-xs rounded-sm">
                {errorMsg}
              </div>
            )}

            <Input
              label="ชื่อผู้ใช้งาน (Username)"
              required
              placeholder="ระบุชื่อผู้ใช้งาน"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-text-secondary">
                  รหัสผ่าน (Password) <span className="text-error">*</span>
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" /> ลืมรหัสผ่าน?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="ระบุรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-2">
              เข้าสู่ระบบ
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;