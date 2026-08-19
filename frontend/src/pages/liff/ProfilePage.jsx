import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { checkOrLogin } from '../../api/villager.api';
import { Card, Button, Badge, LoadingSpinner } from '../../components/ui';
import { User, Phone, MapPin, ShieldCheck, UserCheck, AlertTriangle, Building, PhoneCall, Calendar } from 'lucide-react';

function ProfilePage() {
  const { liff, isLiffReady, idToken } = useLiff();
  const [villager, setVillager] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const token = idToken || (liff?.getIDToken ? liff.getIDToken() : null);

        if (token) {
          const res = await checkOrLogin(token);
          if (!res.data.isNewUser) {
            setVillager(res.data.villager);
          }
        }
      } catch (err) {
        console.error('Failed to check villager profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isLiffReady) {
      loadProfile();
    }
  }, [isLiffReady, liff, idToken]);

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลส่วนตัว..." className="min-h-screen" />;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">ฉันและติดต่อชุมชน</h1>
        <p className="text-xs text-text-secondary mt-0.5">จัดการข้อมูลส่วนตัวและช่องทางติดต่อผู้นำชุมชน</p>
      </div>

      {/* User Info / Profile Card */}
      {villager ? (
        <Card padding="md" className="space-y-4 border-primary/30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-lg shrink-0">
              {villager.first_name?.charAt(0) || 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-primary text-base truncate">
                  {villager.first_name} {villager.last_name}
                </h2>
                <Badge variant="success">ลงทะเบียนแล้ว</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                บ้านเลขที่ {villager.house_number} {villager.zone_name ? `• ${villager.zone_name}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-sm border border-border text-xs space-y-1.5 text-text-secondary">
            <div className="flex items-center justify-between">
              <span>วันที่ลงทะเบียนระบบ:</span>
              <span className="font-semibold text-text-primary">
                {new Date(villager.join_date).toLocaleDateString('th-TH')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>สถานะบัญชี:</span>
              <span className="font-semibold text-success">ยืนยันตัวตนผ่าน LINE แล้ว</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="md" className="text-center space-y-3 border-warning/30 bg-warning-soft/30">
          <div className="w-10 h-10 rounded-full bg-warning-soft text-warning mx-auto flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary text-sm">ยังไม่ได้ลงทะเบียนลูกบ้าน</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              ลงทะเบียนเพื่อบันทึกข้อมูลและรับประกาศสำคัญจากผู้ใหญ่บ้าน
            </p>
          </div>
          <Link to="/liff/register" className="block w-full">
            <Button variant="primary" fullWidth size="sm">
              ลงทะเบียนข้อมูลลูกบ้าน
            </Button>
          </Link>
        </Card>
      )}

      {/* Community Contact Info & Emergency Phone Numbers */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-primary" />
          <span>ช่องทางติดต่อผู้นำชุมชน & เบอร์ฉุกเฉิน</span>
        </h2>

        <div className="space-y-2 text-xs">
          {/* Village Leader */}
          <Card padding="sm" className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">ที่ทำการผู้ใหญ่บ้าน</p>
                <p className="text-text-muted">ติดต่อร้องเรียน / สอบถามเอกสาร</p>
              </div>
            </div>
            <a href="tel:0812345678" className="shrink-0">
              <Button size="sm" variant="outline" icon={PhoneCall}>
                โทร
              </Button>
            </a>
          </Card>

          {/* OSM / Health Center */}
          <Card padding="sm" className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary-soft text-secondary flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.)</p>
                <p className="text-text-muted">สอบถามงานอนามัย / อสม.</p>
              </div>
            </div>
            <a href="tel:0898765432" className="shrink-0">
              <Button size="sm" variant="outline" icon={PhoneCall}>
                โทร
              </Button>
            </a>
          </Card>

          {/* Emergency Ambulance */}
          <Card padding="sm" className="flex items-center justify-between gap-3 border-error/30 bg-error-soft/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-error text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-error">หน่วยกู้ชีพฉุกเฉิน (เจ็บป่วยฉุกเฉิน)</p>
                <p className="text-text-secondary">โทรฟรี 24 ชั่วโมง</p>
              </div>
            </div>
            <a href="tel:1669" className="shrink-0">
              <Button size="sm" variant="danger" icon={PhoneCall}>
                1669
              </Button>
            </a>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
