import { useState, useEffect, useMemo } from 'react';
import {
  getAllZones,
  createZone,
  updateZone,
  deleteZone,
} from '../../api/zone.api';
import { Button, Input, Modal, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Navigation,
  Search,
  X,
} from 'lucide-react';

function ZonePage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [zoneName, setZoneName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchZones();
  }, []);

  async function fetchZones() {
    try {
      setLoading(true);
      const res = await getAllZones();
      setZones(res.data.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลซอย/คุ้มไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setZoneName('');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditTarget(item);
    setZoneName(item.zone_name || '');
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setZoneName('');
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!zoneName.trim()) {
      setFormError('กรุณากรอกชื่อซอย/คุ้ม');
      return;
    }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateZone(editTarget.zone_id, { zoneName: zoneName.trim() });
      } else {
        await createZone({ zoneName: zoneName.trim() });
      }
      closeModal();
      fetchZones();
    } catch (err) {
      setFormError(err.response?.data?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(zone) {
    if (zone.villager_count > 0) {
      alert(`ไม่สามารถลบ "${zone.zone_name}" ได้ เนื่องจากมีลูกบ้าน ${zone.villager_count} คน อยู่ในซอย/คุ้มนี้`);
      return;
    }

    if (!window.confirm(`ยืนยันลบซอย/คุ้ม "${zone.zone_name}" ออกจากระบบ?`)) return;

    try {
      await deleteZone(zone.zone_id);
      fetchZones();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  // คัดกรองตามช่องค้นหา
  const filteredZones = useMemo(() => {
    if (!searchTerm.trim()) return zones;
    const query = searchTerm.toLowerCase();
    return zones.filter((z) => z.zone_name.toLowerCase().includes(query));
  }, [zones, searchTerm]);

  if (loading) return <LoadingSpinner text="กำลังโหลดรายการซอย/คุ้ม..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h1 text-text-primary">จัดการซอย / คุ้ม</h1>
            <Badge variant="primary">{zones.length} ซอย/คุ้ม</Badge>
          </div>
          <p className="text-body-sm text-text-secondary mt-1">
            กำหนดรายชื่อซอยและคุ้มภายในชุมชน สำหรับจัดกลุ่มลูกบ้านและกระจายข่าวสารเจาะจงพื้นที่
          </p>
        </div>
        <Button icon={Plus} variant="primary" onClick={openCreate} className="shrink-0 shadow-sm">
          เพิ่มซอย / คุ้มใหม่
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-error-soft border border-error/20 rounded-md text-error text-body-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-border p-3.5 rounded-lg shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อซอย / คุ้ม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-9 text-body-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table View */}
      <div className="bg-surface border border-border rounded-lg shadow-xs overflow-hidden">
        {filteredZones.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={searchTerm ? 'ไม่พบซอย/คุ้มที่ตรงกับการค้นหา' : 'ยังไม่มีรายการซอย/คุ้ม'}
            description={
              searchTerm
                ? `ไม่พบข้อมูลที่ตรงกับคำว่า "${searchTerm}" กรุณาลองใช้คำค้นอื่น`
                : 'กดปุ่ม "เพิ่มซอย / คุ้มใหม่" ด้านบนเพื่อเริ่มสร้างรายการแรก'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                <tr>
                  <th className="px-6 py-3.5 w-16 text-center">#</th>
                  <th className="px-6 py-3.5">ชื่อซอย / คุ้ม</th>
                  <th className="px-6 py-3.5">จำนวนลูกบ้านในซอย</th>
                  <th className="px-6 py-3.5">วันที่สร้าง</th>
                  <th className="px-6 py-3.5 text-right w-36">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredZones.map((zone, idx) => (
                  <tr key={zone.zone_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-center text-text-muted text-body-sm">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <span className="text-body font-semibold">{zone.zone_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={Number(zone.villager_count) > 0 ? 'primary' : 'default'}>
                        {Number(zone.villager_count) > 0 ? `${zone.villager_count} คน` : 'ไม่มีลูกบ้าน'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-text-muted">
                      {zone.created_at ? new Date(zone.created_at).toLocaleDateString('th-TH') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(zone)} title="แก้ไข">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(zone)} title="ลบ">
                        <Trash2 className="w-4 h-4 text-text-muted hover:text-error" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? 'แก้ไขซอย / คุ้ม' : 'เพิ่มซอย / คุ้มใหม่'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              ยกเลิก
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>
              {editTarget ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-error-soft border border-error/20 rounded-md text-error text-body-sm flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="ชื่อซอย / คุ้ม"
            required
            placeholder="เช่น ซอย 1, คุ้มเหนือ, ซอยร่วมใจ, คุ้มวัดเก่า"
            helperText="ระบุชื่อซอยหรือคุ้มภายในหมู่บ้าน เพื่อใช้เป็นตัวเลือกให้ลูกบ้านตอนลงทะเบียน"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
          />

          {editTarget && editTarget.villager_count > 0 && (
            <div className="bg-primary-soft/50 border border-primary/20 rounded-md p-3 text-body-sm text-text-secondary">
              ℹ️ มีลูกบ้านจำนวน <strong>{editTarget.villager_count}</strong> คน อยู่ในซอย/คุ้มนี้ การเปลี่ยนชื่อจะอัปเดตข้อมูลของลูกบ้านทุกคนโดยอัตโนมัติ
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default ZonePage;
