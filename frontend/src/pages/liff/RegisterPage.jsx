import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { checkOrLogin, registerVillager } from '../../api/villager.api';
import { getAllZones } from '../../api/zone.api';
import { Button, Input, Select, Card, LoadingSpinner } from '../../components/ui';
import { PageTransition } from '../../components/motion';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

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
  const [zones, setZones] = useState([]);
  const [pdpaConsent, setPdpaConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [redirectTarget, setRedirectTarget] = useState(null);

  useEffect(() => {
    async function loadZones() {
      try {
        const res = await getAllZones();
        setZones(res.data.data || []);
      } catch (err) {
        console.error('Failed to load zones:', err);
      }
    }
    loadZones();
  }, []);

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

    if (!pdpaConsent) {
      setErrorMsg('กรุณายินยอมให้เก็บข้อมูลส่วนบุคคลก่อนลงทะเบียน');
      return;
    }

    try {
      setSubmitting(true);

      const res = await registerVillager(idToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        houseNumber: houseNumber.trim(),
        zoneName: zoneName || null,
        pdpaConsent: true, // ส่งหลังผ่าน client validation แล้ว — backend ยังคง enforce อีกรอบอยู่ดี
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
        <p className="font-bold text-body-lg">เกิดข้อผิดพลาด LIFF</p>
        <p className="text-body-sm text-text-secondary">{liffError}</p>
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
          <div className="w-16 h-16 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-h2 text-text-primary">ลงทะเบียนเรียบร้อยแล้ว</h2>
            <p className="text-body-sm text-text-secondary mt-1">ยินดีต้อนรับเข้าสู่ระบบหอกระจายข่าวชุมชน</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-border text-left text-body-sm space-y-2 text-text-primary">
            <p>
              <strong>ชื่อ-นามสกุล:</strong> {registeredVillager.first_name} {registeredVillager.last_name}
            </p>
            <p>
              <strong>บ้านเลขที่:</strong> {registeredVillager.house_number}
            </p>
            <p>
              <strong>ซอย/คุ้ม:</strong> {registeredVillager.zone_name || '—'}
            </p>
          </div>

          <Button variant="primary" fullWidth icon={ArrowRight} onClick={handleContinue}>
            {redirectTarget ? 'ไปที่ข่าวสารที่กดดู' : 'เข้าสู่ระบบข่าวสารชุมชน'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-background p-4 py-8 flex flex-col justify-center max-w-md mx-auto space-y-4">
      <div className="text-center space-y-2.5">
        <img
          src="/logo.jpg"
          alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
          className="w-[72px] h-[72px] rounded-full mx-auto object-cover shadow-md border-2 border-white ring-2 ring-primary/20"
        />
        <h1 className="text-h1 text-text-primary">ลงทะเบียนลูกบ้าน</h1>
        <p className="text-body-sm text-text-secondary">
          สวัสดีคุณ <strong className="text-text-primary">{displayName || 'ลูกบ้าน'}</strong> กรุณากรอกข้อมูลเพื่อรับข่าวสาร
        </p>
      </div>

      <Card padding="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-error-soft border border-error/20 text-error text-body-sm rounded-sm" role="alert">
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

          <Select
            label="ซอย/คุ้ม"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
          >
            <option value="">-- เลือกซอย/คุ้ม (ไม่บังคับ) --</option>
            {zones.map((z) => (
              <option key={z.zone_id} value={z.zone_name}>
                {z.zone_name}
              </option>
            ))}
          </Select>

          {/* PDPA Consent Checkbox */}
          <div className="bg-slate-50 border border-border rounded-md p-4 space-y-3">
            <div className="flex items-start gap-2.5 text-text-secondary">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
              <p className="text-body-sm leading-relaxed">
                <strong className="text-text-primary">นโยบายความเป็นส่วนตัว (PDPA)</strong>
                <br />
                ระบบหอกระจายข่าวชุมชนจะจัดเก็บข้อมูลส่วนบุคคลของท่าน ได้แก่ ชื่อ-นามสกุล บ้านเลขที่ และซอย/คุ้ม
                เพื่อวัตถุประสงค์ในการส่งข่าวสารและการติดต่อประชาสัมพันธ์ของชุมชนเท่านั้น
                ข้อมูลจะไม่ถูกเปิดเผยหรือส่งต่อให้บุคคลภายนอก
              </p>
            </div>

            <label className="flex items-start gap-2.5 min-h-11 cursor-pointer group -mx-1 px-1 py-1 rounded-sm hover:bg-primary-soft/40 transition-colors duration-fast">
              <input
                type="checkbox"
                checked={pdpaConsent}
                onChange={(e) => setPdpaConsent(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-primary shrink-0 cursor-pointer"
              />
              <span className="text-body-sm text-text-primary group-hover:text-primary-active transition-colors duration-fast">
                ข้าพเจ้ายินยอมให้ระบบเก็บและใช้ข้อมูลส่วนบุคคลตามวัตถุประสงค์ที่ระบุข้างต้น
              </span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting} disabled={!pdpaConsent} className="mt-2">
            ยืนยันการลงทะเบียน
          </Button>
        </form>
      </Card>
    </PageTransition>
  );
}

export default RegisterPage;
