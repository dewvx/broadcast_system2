import { useEffect, useState } from 'react';
import { useLiff } from '../../context/LiffContext';
import { checkOrLogin, registerVillager } from '../../api/villager.api';

function RegisterPage() {
  const { isLiffReady, liffError, idToken, profile } = useLiff();

  const [status, setStatus] = useState('checking');
  const [errorMsg, setErrorMsg] = useState('');
  const [villager, setVillager] = useState(null);

  const [form, setForm] = useState({ firstName: '', lastName: '', houseNumber: '', zoneName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLiffReady || !idToken) return;

    checkOrLogin(idToken)
      .then((res) => {
        if (res.data.isNewUser) {
          setStatus('form');
        } else {
          setVillager(res.data.villager);
          setStatus('done');
        }
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        setStatus('form');
      });
  }, [isLiffReady, idToken]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await registerVillager(idToken, form);
      setVillager(res.data.villager);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'สมัครไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  }

  if (liffError) {
    return <div className="p-6 text-red-600">เกิดข้อผิดพลาดในการเชื่อมต่อ LINE: {liffError}</div>;
  }

  if (!isLiffReady || status === 'checking') {
    return <div className="p-6 text-slate-600">กำลังตรวจสอบข้อมูล...</div>;
  }

  if (status === 'done') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-green-700">ยินดีต้อนรับ {villager.first_name || profile?.displayName}</h1>
        <p className="mt-2 text-slate-600">พร้อมใช้งานระบบหอกระจายข่าวชุมชนแล้ว</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">ลงทะเบียนลูกบ้าน</h1>
      <p className="text-slate-500 mb-4">สวัสดี {profile?.displayName} กรอกข้อมูลเพื่อเริ่มใช้งาน</p>

      {errorMsg && <p className="text-red-600 mb-3">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">ชื่อ</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">นามสกุล</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">บ้านเลขที่</label>
          <input
            name="houseNumber"
            value={form.houseNumber}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">คุ้ม/หมู่บ้าน (ไม่บังคับ)</label>
          <input
            name="zoneName"
            value={form.zoneName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white rounded py-2 disabled:opacity-50"
        >
          {submitting ? 'กำลังบันทึก...' : 'ลงทะเบียน'}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;