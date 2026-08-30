import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, getRoles, createUser, updateUser, deleteUser } from '../../api/user.api';
import { getAllVillagers } from '../../api/admin-villager.api';
import { Button, Input, Select, Modal, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import { Users, Plus, Edit2, Trash2, Key, AlertCircle, Phone, Award, Check } from 'lucide-react';

const EMPTY_FORM = {
  username: '',
  password: '',
  fullName: '',
  phoneNumber: '',
  positionTitle: '',
  roleId: '',
  lineUserId: '',
};

function UserPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [villagers, setVillagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  async function fetchData() {
    try {
      setLoading(true);
      const [usersRes, rolesRes, villagersRes] = await Promise.all([
        getUsers(),
        currentUser?.roleName === 'Admin' ? getRoles() : Promise.resolve({ data: { data: [] } }),
        getAllVillagers().catch(() => ({ data: { data: [] } })),
      ]);
      setUsers(usersRes.data.data);
      if (rolesRes.data?.data) setRoles(rolesRes.data.data);
      if (villagersRes.data?.data) setVillagers(villagersRes.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to reload users:', err);
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
      phoneNumber: item.phone_number || '',
      positionTitle: item.position_title || '',
      roleId: item.role_id || '',
      lineUserId: item.line_user_id || '',
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
          <h1 className="text-h1 text-text-primary">จัดการบัญชีผู้ใช้งาน</h1>
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
              <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                <tr>
                  <th className="px-6 py-3.5">ชื่อ-นามสกุล / ตำแหน่ง</th>
                  <th className="px-6 py-3.5">เบอร์โทรติดต่อ</th>
                  <th className="px-6 py-3.5">ชื่อผู้ใช้งาน (Username)</th>
                  <th className="px-6 py-3.5">สิทธิ์การใช้งาน (Role)</th>
                  <th className="px-6 py-3.5">ผูกบัญชี LINE (รับ OTP)</th>
                  <th className="px-6 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((item) => {
                  const isSelf = currentUser?.userId === item.user_id;
                  const matchedVillager = villagers.find((v) => v.line_user_id === item.line_user_id);
                  return (
                    <tr key={item.user_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span>{item.full_name}</span>
                            {isSelf && <Badge variant="primary">บัญชีของคุณ</Badge>}
                          </div>
                          {item.position_title && (
                            <span className="text-body-sm text-text-muted flex items-center gap-1 font-normal">
                              <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                              {item.position_title}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {item.phone_number ? (
                          <div className="flex items-center gap-1 text-text-primary font-mono text-xs">
                            <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span>{item.phone_number}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-mono text-xs">{item.username}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.role_name === 'Admin' ? 'danger' : 'secondary'}>
                          {item.role_name === 'Admin' ? 'ผู้ใหญ่บ้าน (Admin)' : 'ผู้นำชุมชน (Leader)'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {item.line_user_id ? (
                          <Badge variant="success" className="gap-1">
                            <Check className="w-3 h-3 inline" />
                            {matchedVillager ? `LINE: ${matchedVillager.display_name || matchedVillager.first_name}` : 'ผูก LINE แล้ว'}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-text-muted">
                            ยังไม่ผูก LINE
                          </Badge>
                        )}
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
            <div className="p-3 bg-error-soft border border-error/20 rounded-sm text-error text-body-sm">
              {formError}
            </div>
          )}

          <Input
            label="ชื่อ-นามสกุลจริง"
            required
            placeholder="เช่น นายสมศักดิ์ รุ่งเรือง"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="ตำแหน่งแสดงผล (Position)"
              placeholder="เช่น ผู้ใหญ่บ้าน, อสม., ผู้ช่วยฯ"
              helperText="แสดงในการ์ดติดต่อผู้นำชุมชน"
              value={form.positionTitle}
              onChange={(e) => setForm({ ...form, positionTitle: e.target.value })}
            />

            <Input
              label="เบอร์โทรติดต่อ"
              placeholder="เช่น 0812345678"
              helperText="ใช้แสดงในการ์ดเพื่อให้ลูกบ้านโทรติดต่อ"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </div>

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

          {/* ผูกบัญชี LINE สำหรับรับ OTP กู้รหัสผ่าน */}
          <div>
            <label className="block text-body-sm font-medium text-text-primary mb-1">
              ผูกบัญชี LINE OA (สำหรับรับ OTP กู้รหัสผ่าน)
            </label>
            <select
              value={form.lineUserId}
              onChange={(e) => setForm({ ...form, lineUserId: e.target.value })}
              className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">— ไม่ผูกบัญชี LINE —</option>
              {villagers
                .filter((v) => v.line_user_id)
                .map((v) => (
                  <option key={v.villager_id} value={v.line_user_id}>
                    {v.first_name} {v.last_name} ({v.display_name ? `LINE: ${v.display_name}` : 'ลูกบ้าน'} • {v.house_number})
                  </option>
                ))}
            </select>
            <p className="text-body-sm text-text-muted mt-1">
              * เลือกชื่อบัญชี LINE ของท่านที่เคยลงทะเบียนในระบบ เพื่อให้ระบบสามารถส่ง OTP กู้คืนรหัสผ่านเข้า LINE ได้
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UserPage;
