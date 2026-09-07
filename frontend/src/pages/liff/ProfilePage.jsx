import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { checkOrLogin, updateSelfProfile } from '../../api/villager.api';
import { getAllZones } from '../../api/zone.api';
import { getPublicContacts } from '../../api/user.api';
import { Card, Button, Badge, Input, Select, LoadingSpinner, toast } from '../../components/ui';
import { FadeStagger, FadeItem } from '../../components/motion';
import {
  User,
  Phone,
  UserCheck,
  AlertTriangle,
  Building,
  PhoneCall,
  Pencil,
  X,
  UserCircle2,
} from 'lucide-react';

function ProfilePage() {
  const { liff, isLiffReady, idToken } = useLiff();
  const [villager, setVillager] = useState(null);
  const [zones, setZones] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    houseNumber: '',
    zoneName: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [zonesRes, contactsRes] = await Promise.all([
          getAllZones().catch(() => ({ data: { data: [] } })),
          getPublicContacts().catch(() => ({ data: { data: [] } })),
        ]);
        setZones(zonesRes.data?.data || []);
        setContacts(contactsRes.data?.data || []);

        const token = idToken || (liff?.getIDToken ? liff.getIDToken() : null);
        if (token) {
          const res = await checkOrLogin(token);
          if (!res.data.isNewUser) {
            setVillager(res.data.villager);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isLiffReady) {
      loadData();
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
    setIsEditing(true);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaveError('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.houseNumber.trim()) {
      setSaveError('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบ');
      return;
    }

    if (!form.zoneName || !form.zoneName.trim()) {
      setSaveError('กรุณาเลือกซอย/คุ้มที่อยู่อาศัย');
      return;
    }

    try {
      setSaving(true);
      const token = idToken || (liff?.getIDToken ? liff.getIDToken() : null);
      const res = await updateSelfProfile(token, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        houseNumber: form.houseNumber.trim(),
        zoneName: form.zoneName.trim(),
      });
      setVillager(res.data.villager);
      setIsEditing(false);
      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลส่วนตัว..." className="min-h-screen" />;

  return (
    <FadeStagger className="p-4 pt-5 space-y-6">
      {/* Header */}
      <FadeItem>
        <div>
          <h1 className="text-h2 text-text-primary">ฉันและติดต่อชุมชน</h1>
          <p className="text-body-sm text-text-secondary mt-1">จัดการข้อมูลส่วนตัวและช่องทางติดต่อผู้นำชุมชน</p>
        </div>
      </FadeItem>

      {/* User Info / Profile Card */}
      <FadeItem>
        {villager ? (
          !isEditing ? (
            <Card padding="md" className="space-y-4 border-primary/25 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-h2 shrink-0">
                  {villager.first_name?.charAt(0) || 'V'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-text-primary text-h3 truncate">
                      {villager.first_name} {villager.last_name}
                    </h2>
                    <Badge variant="success" withDot>
                      ลงทะเบียนแล้ว
                    </Badge>
                  </div>
                  <p className="text-body-sm text-text-secondary mt-1">
                    บ้านเลขที่ {villager.house_number} • {villager.zone_name ? villager.zone_name : <span className="text-warning font-medium">ยังไม่ระบุซอย</span>}
                  </p>
                </div>
              </div>

              {/* Banner เตือนลูกบ้านที่ยังไม่ได้ระบุซอย/คุ้ม */}
              {!villager.zone_name && (
                <div className="bg-warning-soft/70 border border-warning/30 rounded-md p-3.5 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 text-body-sm">
                    <p className="font-semibold text-text-primary">ยังไม่ได้ระบุซอย / คุ้ม</p>
                    <p className="text-text-secondary mt-0.5">
                      กรุณาระบุซอย/คุ้มที่อยู่อาศัย เพื่อให้ได้รับข่าวสารและประกาศเฉพาะพื้นที่ของท่านได้อย่างทั่วถึง
                    </p>
                    <button
                      type="button"
                      onClick={openEditForm}
                      className="mt-2 text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      ระบุซอย/คุ้มตอนนี้
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-md border border-border text-body-sm space-y-2 text-text-secondary">
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

              <Button variant="outline" fullWidth icon={Pencil} onClick={openEditForm}>
                แก้ไขข้อมูลส่วนตัว
              </Button>
            </Card>
          ) : (
            /* Edit Form Card */
            <Card padding="md" className="space-y-4 border-primary/25 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-text-primary text-h3">แก้ไขข้อมูลส่วนตัว</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  aria-label="ยกเลิกการแก้ไข"
                  className="w-9 h-9 -mr-2 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="ชื่อจริง"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    required
                    placeholder="ชื่อ"
                  />
                  <Input
                    label="นามสกุล"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleFormChange}
                    required
                    placeholder="นามสกุล"
                  />
                </div>

                <Input
                  label="บ้านเลขที่"
                  name="houseNumber"
                  value={form.houseNumber}
                  onChange={handleFormChange}
                  required
                  placeholder="เช่น 123/4"
                />

                <Select
                  label="ซอย/คุ้ม"
                  name="zoneName"
                  value={form.zoneName}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">-- กรุณาเลือกซอย/คุ้มที่อยู่อาศัย --</option>
                  {zones.map((z) => (
                    <option key={z.zone_id} value={z.zone_name}>
                      {z.zone_name}
                    </option>
                  ))}
                </Select>

                {saveError && (
                  <p className="text-body-sm text-error bg-error-soft border border-error/20 rounded-sm px-3 py-2.5" role="alert">
                    {saveError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="secondary" fullWidth onClick={() => setIsEditing(false)} disabled={saving}>
                    ยกเลิก
                  </Button>
                  <Button type="submit" fullWidth loading={saving}>
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </div>
              </form>
            </Card>
          )
        ) : (
          <Card padding="md" className="text-center space-y-3.5 border-warning/30 bg-warning-soft/40">
            <div className="w-14 h-14 rounded-full bg-warning-soft text-warning mx-auto flex items-center justify-center">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-h3">ยังไม่ได้ลงทะเบียนลูกบ้าน</h2>
              <p className="text-body-sm text-text-secondary mt-1">
                ลงทะเบียนเพื่อบันทึกข้อมูลและรับประกาศสำคัญจากผู้ใหญ่บ้าน
              </p>
            </div>
            <Link to="/liff/register" className="block w-full">
              <Button variant="primary" fullWidth>
                ลงทะเบียนข้อมูลลูกบ้าน
              </Button>
            </Link>
          </Card>
        )}
      </FadeItem>

      {/* Community Contact Info & Emergency Phone Numbers */}
      <FadeItem>
        <section className="space-y-3">
          <h2 className="text-h3 font-bold text-text-primary flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>ติดต่อผู้นำชุมชน & เบอร์ฉุกเฉิน</span>
          </h2>

          <div className="space-y-2.5 text-body-sm">
            {/* Dynamic Community Leader Contacts */}
            {contacts.map((contact, idx) => (
              <Card key={idx} padding="sm" className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <UserCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                      {contact.full_name}
                    </p>
                    <p className="text-body-sm text-text-muted truncate">
                      {contact.position_title || 'ผู้นำชุมชน'} • {contact.phone_number}
                    </p>
                  </div>
                </div>
                <a href={`tel:${contact.phone_number.replace(/\s+/g, '')}`} className="shrink-0">
                  <Button size="sm" variant="outline" icon={PhoneCall}>
                    โทร
                  </Button>
                </a>
              </Card>
            ))}

            {/* Emergency Ambulance 1669 */}
            <Card padding="sm" className="flex items-center justify-between gap-3 border-error/30 bg-error-soft/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-error leading-snug">หน่วยกู้ชีพฉุกเฉิน (เจ็บป่วยฉุกเฉิน)</p>
                  <p className="text-body-sm text-text-secondary">โทรฟรี 24 ชั่วโมง</p>
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
      </FadeItem>
    </FadeStagger>
  );
}

export default ProfilePage;
