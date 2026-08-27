import React, { useState } from 'react';
import { Modal, Input, Button, toast } from '../ui';
import { Eye, EyeOff } from 'lucide-react';
import { updateUser } from '../../api/user.api';

function EditProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (form.newPassword && form.newPassword.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setSaving(true);
      const payload = { fullName: form.fullName.trim() };
      if (form.newPassword) {
        payload.password = form.newPassword;
      }

      await updateUser(user.userId, payload);
      onSaved({ fullName: form.fullName.trim() });
      setForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="แก้ไขข้อมูลบัญชีของฉัน" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ชื่อเข้าใช้งาน (Username)"
          value={user?.username || ''}
          readOnly
          disabled
          className="bg-slate-50 text-text-muted cursor-not-allowed"
        />

        <Input
          label="ชื่อ-นามสกุล"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          required
          placeholder="ระบุชื่อ-นามสกุลที่แสดงในระบบ"
        />

        <div className="border-t border-border pt-4 space-y-4">
          <p className="text-body-sm font-medium text-text-secondary">
            เปลี่ยนรหัสผ่าน{' '}
            <span className="font-normal text-text-muted">(ว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span>
          </p>

          <div className="relative">
            <Input
              type={showPass ? 'text' : 'password'}
              label="รหัสผ่านใหม่"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary cursor-pointer"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            type={showPass ? 'text' : 'password'}
            label="ยืนยันรหัสผ่านใหม่"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="ยืนยันรหัสผ่านใหม่"
          />
        </div>

        {error && (
          <p className="text-body-sm text-error bg-error-soft border border-error/20 rounded-sm px-3 py-2.5" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            ปิด
          </Button>
          <Button type="submit" loading={saving} fullWidth>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;
