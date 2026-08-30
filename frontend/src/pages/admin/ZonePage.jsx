import { useState, useEffect } from 'react';
import {
  getAllZones,
  createZone,
  updateZone,
  deleteZone,
} from '../../api/zone.api';
import { Button, Input, Modal, EmptyState, LoadingSpinner } from '../../components/ui';
import { MapPin, Plus, Edit2, Trash2, AlertCircle, Navigation } from 'lucide-react';

function ZonePage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
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

  async function handleDelete(id) {
    if (!window.confirm('ยืนยันลบซอย/คุ้มนี้? (จะไม่สามารถลบได้หากมีลูกบ้านอยู่ในซอยนี้)')) return;
    try {
      await deleteZone(id);
      fetchZones();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดรายการซอย/คุ้ม..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">จัดการซอย / คุ้ม</h1>
          <p className="text-sm text-text-secondary mt-1">
            รายชื่อซอยหรือคุ้มภายในชุมชนสำหรับจัดกลุ่มลูกบ้านและกระจายข่าวสาร ({zones.length} รายการ)
          </p>
        </div>
        <Button icon={Plus} variant="primary" onClick={openCreate}>
          เพิ่มซอย / คุ้ม
        </Button>
      </div>

      {/* Zones Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {zones.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="ยังไม่มีรายการซอย/คุ้ม"
            description="กดปุ่มเพิ่มซอย/คุ้มด้านบนเพื่อสร้างรายการแรกของคุณ"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">ชื่อซอย / คุ้ม</th>
                  <th className="px-6 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {zones.map((zone, idx) => (
                  <tr key={zone.zone_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-text-muted">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-primary" />
                        <span>{zone.zone_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(zone)} title="แก้ไข">
                        <Edit2 className="w-4 h-4 text-primary" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(zone.zone_id)} title="ลบ">
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
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="ชื่อซอย / คุ้ม"
            required
            placeholder="เช่น ซอย 1, คุ้มเหนือ, ซอยร่วมใจ"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editTarget ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ZonePage;
