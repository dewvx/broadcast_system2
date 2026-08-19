import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { checkOrLogin, registerVillager } from '../../api/villager.api';
import { Button, Input, Card, LoadingSpinner } from '../../components/ui';
import { Radio, CheckCircle, ArrowRight } from 'lucide-react';

function RegisterPage() {
  const { liff, isLiffReady, liffError } = useLiff();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [registeredVillager, setRegisteredVillager] = useState(null);
  const [idToken, setIdToken] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [zoneName, setZoneName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [redirectTarget, setRedirectTarget] = useState(null);

  useEffect(() => {
    if (!isLiffReady) return;

    const pendingTarget = sessionStorage.getItem('target_after_register');
    if (pendingTarget) {
      setRedirectTarget(pendingTarget);
    }

    async function verifyUser() {
      try {
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const token = liff.getIDToken();
        setIdToken(token);

        const res = await checkOrLogin(token);
        if (res.data.isNewUser) {
          setDisplayName(res.data.displayName || '');
        } else {
          setRegisteredVillager(res.data.villager);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ LINE');
      } finally {
        setChecking(false);
      }
    }

    verifyUser();
  }, [isLiffReady, liff]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName.trim() || !lastName.trim() || !houseNumber.trim()) {
      setErrorMsg('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);

      // ปรับรูปแบบชื่อโซน หากผู้ใช้ใส่แค่ตัวเลข เช่น "4" ให้บันทึกเป็น "หมู่ 4" เพื่อความเป็นมาตรฐาน
      let finalZone = zoneName.trim();
      if (/^\d+$/.test(finalZone)) {
        finalZone = `หมู่ ${finalZone}`;
      }

      const res = await registerVillager(idToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        houseNumber: houseNumber.trim(),
        zoneName: finalZone,
      });

      setRegisteredVillager(res.data.villager);

      const target = sessionStorage.getItem('target_after_register');
      if (target) {
        sessionStorage.removeItem('target_after_register');
        setTimeout(() => {
          navigate(target, { replace: true });
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'การลงทะเบียนไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    const target = sessionStorage.getItem('target_after_register');
    if (target) {
      sessionStorage.removeItem('target_after_register');
      navigate(target, { replace: true });
    } else {
      navigate('/liff/home', { replace: true });
    }
  }

  if (liffError) {
    return (
      <div className="p-6 text-center text-error space-y-2">
        <p className="font-bold">เกิดข้อผิดพลาด LIFF</p>
        <p className="text-xs text-text-secondary">{liffError}</p>
      </div>
    );
  }

  if (!isLiffReady || checking) {
    return <LoadingSpinner text="กำลังเชื่อมต่อ LINE..." className="min-h-screen" />;
  }

  if (registeredVillager) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col justify-center max-w-md mx-auto">
        <Card className="text-center space-y-4 py-8">
          <div className="w-14 h-14 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">ลงทะเบียนเรียบร้อยแล้ว</h2>
            <p className="text-xs text-text-secondary mt-1">ยินดีต้อนรับเข้าสู่ระบบหอกระจายข่าวชุมชน</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-sm border border-border text-left text-xs space-y-2 text-text-primary">
            <p><strong>ชื่อ-นามสกุล:</strong> {registeredVillager.first_name} {registeredVillager.last_name}</p>
            <p><strong>บ้านเลขที่:</strong> {registeredVillager.house_number}</p>
            <p><strong>หมู่บ้าน / โซน:</strong> {registeredVillager.zone_name || '—'}</p>
          </div>

          <Button variant="primary" fullWidth icon={ArrowRight} onClick={handleContinue}>
            {redirectTarget ? 'ไปที่ข่าวสารที่กดดู' : 'เข้าสู่ระบบข่าวสารชุมชน'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col justify-center max-w-md mx-auto space-y-4">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-md bg-primary mx-auto flex items-center justify-center text-white shadow-sm">
          <Radio className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-text-primary">ลงทะเบียนลูกบ้าน</h1>
        <p className="text-xs text-text-secondary">
          สวัสดีคุณ <strong className="text-text-primary">{displayName || 'ลูกบ้าน'}</strong> กรุณากรอกข้อมูลเพื่อรับข่าวสาร
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-error-soft border border-error/20 text-error text-xs rounded-sm">
              {errorMsg}
            </div>
          )}

          <Input
            label="ชื่อจริง"
            required
            placeholder="เช่น สมชาย"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Input
            label="นามสกุล"
            required
            placeholder="เช่น ใจดี"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Input
            label="บ้านเลขที่"
            required
            placeholder="เช่น 123/45"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
          />

          <div>
            <Input
              label="หมู่บ้าน / โซน (ใส่เฉพาะตัวเลขหมู่ เช่น 4)"
              placeholder="ระบุตัวเลขหมู่ เช่น 4"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
            />
            <p className="text-[11px] text-text-muted mt-1">
              * หากพิมพ์เฉพาะตัวเลข "4" ระบบจะบันทึกเป็น "หมู่ 4" ให้อัตโนมัติ
            </p>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={submitting} className="mt-2">
            ยืนยันการลงทะเบียน
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default RegisterPage;