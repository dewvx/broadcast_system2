import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { checkOrLogin, updateSelfProfile } from '../../api/villager.api';
import { Card, Button, Badge, LoadingSpinner } from '../../components/ui';
import { User, Phone, MapPin, ShieldCheck, UserCheck, AlertTriangle, Building, PhoneCall, Calendar, Pencil, X, Check } from 'lucide-react';

function ProfilePage() {
  const { liff, isLiffReady, idToken } = useLiff();
  const [villager, setVillager] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    houseNumber: '',
    zoneName: '',
  });

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

  function openEditForm() {
    if (!villager) return;
    setForm({
      firstName: villager.first_name || '',
      lastName: villager.last_name || '',
      houseNumber: villager.house_number || '',
      zoneName: villager.zone_name || '',
    });
    setSaveError('');
    setSaveSuccess(false);
    setIsEditing(true);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.houseNumber.trim()) {
      setSaveError('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบ');
      return;
    }

    // แปลงตัวเลขหมู่เป็น "หมู่ X"
    let zoneName = form.zoneName.trim();
    if (zoneName && /^\d+$/.test(zoneName)) {
      zoneName = `หมู่ ${zoneName}`;
    }

    try {
      setSaving(true);
      const token = idToken || (liff?.getIDToken ? liff.getIDToken() : null);
      const res = await updateSelfProfile(token, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        houseNumber: form.houseNumber.trim(),
        zoneName: zoneName || null,
      });
      setVillager(res.data.villager);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

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
        <>
          {/* Profile Display Card */}
          {!isEditing ? (
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

              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={Pencil}
                onClick={openEditForm}
              >
                แก้ไขข้อมูลส่วนตัว
              </Button>
            </Card>
          ) : (
            /* Edit Form Card */
            <Card padding="md" className="space-y-4 border-primary/30 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-text-primary text-sm">แก้ไขข้อมูลส่วนตัว</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">ชื่อจริง</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleFormChange}
                      required
                      className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-white"
                      placeholder="ชื่อ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">นามสกุล</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleFormChange}
                      required
                      className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-white"
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">บ้านเลขที่</label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={form.houseNumber}
                    onChange={handleFormChange}
                    required
                    className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-white"
                    placeholder="เช่น 123/4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    หมู่บ้าน / โซน <span className="text-text-muted font-normal">(กรอกเฉพาะตัวเลขหมู่ เช่น 4)</span>
                  </label>
                  <input
                    type="text"
                    name="zoneName"
                    value={form.zoneName}
                    onChange={handleFormChange}
                    className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-white"
                    placeholder="เช่น 4 (ระบบจะแปลงเป็น หมู่ 4)"
                  />
                </div>

                {saveError && (
                  <p className="text-xs text-error bg-error-soft/30 border border-error/30 rounded-sm px-3 py-2">
                    {saveError}
                  </p>
                )}
                {saveSuccess && (
                  <p className="text-xs text-success bg-success-soft/30 border border-success/30 rounded-sm px-3 py-2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> บันทึกข้อมูลเรียบร้อยแล้ว
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    fullWidth
                    disabled={saving}
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </>
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
