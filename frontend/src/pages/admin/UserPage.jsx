import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, getRoles, createUser, updateUser, deleteUser } from '../../api/user.api';
import { Button, Input, Select, Modal, Badge, EmptyState, LoadingSpinner, Card } from '../../components/ui';
import { Users, Plus, Edit2, Trash2, ShieldCheck, Key, UserCheck, AlertCircle } from 'lucide-react';

const EMPTY_FORM = { username: '', password: '', fullName: '', roleId: '' };

function UserPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
    if (currentUser?.roleName === 'Admin') {
      fetchRoles();
    }
  }, [currentUser]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const res = await getRoles();
      setRoles(res.data.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, roleId: roles[0]?.role_id || '' });
    setFormError('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditTarget(item);
    setForm({
      username: item.username || '',
      password: '', // ปล่อยว่างถ้าไม่ต้องการเปลี่ยน password
      fullName: item.full_name || '',
      roleId: item.role_id || '',
    });
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!editTarget && (!form.username.trim() || !form.password.trim())) {
      setFormError('กรุณากรอกชื่อผู้ใช้งาน (username) และรหัสผ่าน');
      return;
    }

    if (!form.fullName.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุลจริง');
      return;
    }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateUser(editTarget.user_id, form);
      } else {
        await createUser(form);
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'บันทึกข้อมูลผู้ใช้ไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('ยืนยันลบผู้ใช้งานนี้?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดรายการผู้ใช้งานระบบ..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">จัดการบัญชีผู้ใช้งาน</h1>
          <p className="text-sm text-text-secondary mt-1">
            บัญชีผู้ใหญ่บ้าน (Admin) และ ผู้นำชุมชน/อสม. (Leader) ที่มีสิทธิ์เข้าใช้งานระบบ
          </p>
        </div>
        {currentUser?.roleName === 'Admin' && (
          <Button icon={Plus} variant="primary" onClick={openCreate}>
            เพิ่มผู้ใช้ใหม่
          </Button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="ไม่พบข้อมูลผู้ใช้งาน"
            description="ยังไม่มีผู้ใช้งานระบบคนอื่นในขณะนี้"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-border text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-3.5">ชื่อผู้ใช้งาน (Username)</th>
                  <th className="px-6 py-3.5">สิทธิ์การใช้งาน (Role)</th>
                  <th className="px-6 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((item) => {
                  const isSelf = currentUser?.userId === item.user_id;
                  return (
                    <tr key={item.user_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <span>{item.full_name}</span>
                          {isSelf && <Badge variant="primary">บัญชีของคุณ</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-mono text-xs">{item.username}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.role_name === 'Admin' ? 'danger' : 'secondary'}>
                          {item.role_name === 'Admin' ? 'ผู้ใหญ่บ้าน (Admin)' : 'ผู้นำชุมชน (Leader)'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {(currentUser?.roleName === 'Admin' || isSelf) && (
                          <Button size="sm" variant="ghost" onClick={() => openEdit(item)} title="แก้ไข">
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                        )}

                        {currentUser?.roleName === 'Admin' && !isSelf && (
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(item.user_id)} title="ลบ">
                            <Trash2 className="w-4 h-4 text-error" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit User */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? `แก้ไขข้อมูลผู้ใช้: ${editTarget.username}` : 'เพิ่มผู้ใช้งานระบบใหม่'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              ยกเลิก
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              บันทึก
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-error-soft border border-error/20 rounded-sm text-error text-xs">
              {formError}
            </div>
          )}

          <Input
            label="ชื่อ-นามสกุลจริง"
            required
            placeholder="เช่น ผู้ใหญ่สมศักดิ์ รุ่งเรือง"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <Input
            label="ชื่อผู้ใช้งาน (Username สำหรับเข้าสู่ระบบ)"
            required={!editTarget}
            disabled={Boolean(editTarget)}
            placeholder="เช่น somsak_admin"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <Input
            label={editTarget ? 'เปลี่ยนรหัสผ่านใหม่ (หากไม่ต้องการเปลี่ยนให้เว้นว่างไว้)' : 'รหัสผ่าน (Password)'}
            type="password"
            required={!editTarget}
            placeholder={editTarget ? '•••••••• (พิมพ์เมื่อต้องการเปลี่ยนรหัสผ่าน)' : 'กำหนดรหัสผ่านเข้าสู่ระบบ'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {currentUser?.roleName === 'Admin' && (
            <Select
              label="สิทธิ์การใช้งานระบบ (Role)"
              required
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.role_name === 'Admin' ? 'ผู้ใหญ่บ้าน (Admin - สิทธิ์สูงสุด)' : 'ผู้นำชุมชน / อสม. (Leader - ร่างข่าว/เสนอข่าว)'}
                </option>
              ))}
            </Select>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default UserPage;
