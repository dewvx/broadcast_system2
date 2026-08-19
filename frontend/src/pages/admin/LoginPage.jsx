import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import { Radio } from 'lucide-react';

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
          <div className="w-12 h-12 rounded-md bg-primary mx-auto flex items-center justify-center text-white shadow-sm mb-3">
            <Radio className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">เข้าสู่ระบบจัดการหอกระจายข่าว</h1>
          <p className="text-sm text-text-secondary">สำหรับผู้ใหญ่บ้านและผู้นำชุมชน</p>
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

            <Input
              label="รหัสผ่าน (Password)"
              type="password"
              required
              placeholder="ระบุรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

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