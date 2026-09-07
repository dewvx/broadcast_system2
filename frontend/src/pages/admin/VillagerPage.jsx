import { useState, useEffect } from 'react';
import { getAllVillagers, updateVillager, deleteVillager } from '../../api/admin-villager.api';
import { getAllZones } from '../../api/zone.api';
import { Button, Select, Badge, EmptyState, LoadingSpinner, Pagination } from '../../components/ui';
import { Users, Search, ShieldAlert, Pencil, Trash2, X, UserCheck, UserX } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

/* ---------- Edit Modal ---------- */
function EditVillagerModal({ villager, onClose, onSaved }) {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    firstName: villager.first_name || '',
    lastName: villager.last_name || '',
    houseNumber: villager.house_number || '',
    zoneName: villager.zone_name || '',
    isActive: villager.is_active !== undefined ? villager.is_active : 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadZones() {
      try {
        const res = await getAllZones();
        setZones(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch zones:', err);
      }
    }
    loadZones();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim() || !form.houseNumber.trim()) {
      setError('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่ให้ครบ');
      return;
    }

    try {
      setSaving(true);
      const res = await updateVillager(villager.villager_id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        houseNumber: form.houseNumber.trim(),
        zoneName: form.zoneName || null,
        isActive: form.isActive,
      });
      onSaved(res.data.villager);
    } catch (err) {
      setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-text-primary">แก้ไขข้อมูลลูกบ้าน</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">ชื่อจริง</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary"
                placeholder="ชื่อ"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">นามสกุล</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary"
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
              onChange={handleChange}
              required
              className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary"
              placeholder="เช่น 123/4"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              ซอย / คุ้ม
            </label>
            <select
              name="zoneName"
              value={form.zoneName}
              onChange={handleChange}
              className="w-full text-sm px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-surface"
            >
              <option value="">-- กรุณาเลือกซอย/คุ้ม --</option>
              {zones.map((z) => (
                <option key={z.zone_id} value={z.zone_name}>
                  {z.zone_name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive === 1}
              onChange={handleChange}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-text-secondary">สถานะ Active (ยังติดตาม LINE OA อยู่)</span>
          </label>

          {error && (
            <p className="text-body-sm text-error bg-error-soft/30 border border-error/30 rounded-sm px-3 py-2" role="alert">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" fullWidth onClick={onClose} disabled={saving}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" size="sm" fullWidth disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Delete Confirm Modal ---------- */
function DeleteConfirmModal({ villager, onClose, onConfirmed }) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    try {
      setDeleting(true);
      await deleteVillager(villager.villager_id);
      onConfirmed(villager.villager_id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-4 space-y-4">
        <div className="flex items-center gap-3 text-error">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <h2 className="font-bold text-text-primary">ยืนยันการลบลูกบ้าน</h2>
        </div>
        <p className="text-sm text-text-secondary">
          คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกบ้าน{' '}
          <strong className="text-text-primary">
            {villager.first_name} {villager.last_name}
          </strong>{' '}
          ออกจากระบบ?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting}>
            ยกเลิก
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'กำลังลบ...' : 'ลบข้อมูล'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main VillagerPage ---------- */
function VillagerPage() {
  const [villagers, setVillagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [currentPage, setCurrentPage] = useState(1);

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    async function fetchVillagers() {
      try {
        const res = await getAllVillagers();
        setVillagers(res.data.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }
    fetchVillagers();
  }, []);

  // เมื่อเปลี่ยนเงื่อนไขค้นหา ให้รีเซ็ตกลับหน้า 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterZone, filterStatus]);

  const zones = [...new Set(villagers.map((v) => v.zone_name).filter(Boolean))].sort();

  const filtered = villagers.filter((v) => {
    const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
    const matchSearch =
      searchTerm === '' ||
      fullName.includes(searchTerm.toLowerCase()) ||
      v.house_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchZone =
      filterZone === '' ||
      (filterZone === 'unassigned' && !v.zone_name) ||
      v.zone_name === filterZone;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && v.is_active) ||
      (filterStatus === 'inactive' && !v.is_active);
    return matchSearch && matchZone && matchStatus;
  });

  const paginatedVillagers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleSaved(updated) {
    setVillagers((prev) =>
      prev.map((v) => (v.villager_id === updated.villager_id ? { ...v, ...updated } : v))
    );
    setEditTarget(null);
  }

  function handleDeleted(deletedId) {
    setVillagers((prev) => prev.filter((v) => v.villager_id !== deletedId));
    setDeleteTarget(null);
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลลูกบ้าน..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  const activeCount = villagers.filter((v) => v.is_active).length;
  const inactiveCount = villagers.length - activeCount;
  const unassignedZoneCount = villagers.filter((v) => !v.zone_name).length;

  return (
    <>
      {editTarget && (
        <EditVillagerModal
          villager={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          villager={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={handleDeleted}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 text-text-primary">ข้อมูลลูกบ้าน</h1>
            <p className="text-sm text-text-secondary mt-1">
              ลูกบ้านที่ลงทะเบียนผ่าน LINE ทั้งหมด{' '}
              <strong className="text-text-primary">{villagers.length}</strong> คน
              {' · '}
              <span className="text-success">Active {activeCount}</span>
              {' · '}
              <span className="text-text-muted">Inactive {inactiveCount}</span>
              {unassignedZoneCount > 0 && (
                <>
                  {' · '}
                  <span className="text-warning font-medium">ยังไม่ระบุซอย {unassignedZoneCount} คน</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-surface border border-border p-4 rounded-md shadow-xs flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ นามสกุล หรือบ้านเลขที่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterZone} onChange={(e) => setFilterZone(e.target.value)}>
              <option value="">ทุกซอย / คุ้ม</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
              {unassignedZoneCount > 0 && (
                <option value="unassigned">⚠️ ยังไม่ระบุซอย ({unassignedZoneCount})</option>
              )}
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">ทุกสถานะ</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="ไม่พบข้อมูลลูกบ้าน"
              description="ไม่พบลูกบ้านที่ตรงกับเงื่อนไขการค้นหาในขณะนี้"
            />
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">#</th>
                      <th className="px-6 py-3.5">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3.5">ชื่อ LINE</th>
                      <th className="px-6 py-3.5">บ้านเลขที่</th>
                      <th className="px-6 py-3.5">ซอย / คุ้ม</th>
                      <th className="px-6 py-3.5">สถานะ</th>
                      <th className="px-6 py-3.5">วันที่ลงทะเบียน</th>
                      <th className="px-6 py-3.5 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedVillagers.map((v, idx) => (
                      <tr
                        key={v.villager_id}
                        className={`hover:bg-slate-50/80 transition-colors ${!v.is_active ? 'opacity-60' : ''}`}
                      >
                        <td className="px-6 py-4 text-text-muted">
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-text-primary">
                          {v.first_name} {v.last_name}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">{v.display_name || '—'}</td>
                        <td className="px-6 py-4 text-text-secondary">{v.house_number || '—'}</td>
                        <td className="px-6 py-4">
                          {v.zone_name ? (
                            <Badge variant="primary">{v.zone_name}</Badge>
                          ) : (
                            <Badge variant="warning" withDot>
                              ยังไม่ระบุซอย
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {v.is_active ? (
                            <Badge variant="success">
                              <UserCheck className="w-3 h-3 inline mr-1" />Active
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              <UserX className="w-3 h-3 inline mr-1" />Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {new Date(v.join_date).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditTarget(v)}
                              className="p-1.5 text-primary hover:bg-primary-soft rounded-sm transition-colors cursor-pointer"
                              title="แก้ไขข้อมูล"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(v)}
                              className="p-1.5 text-error hover:bg-error-soft rounded-sm transition-colors cursor-pointer"
                              title="ลบออกจากระบบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VillagerPage;
