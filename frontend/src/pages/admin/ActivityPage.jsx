import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../../api/activity.api';
import { Button, Input, Textarea, Modal, Card, EmptyState, LoadingSpinner } from '../../components/ui';
import { Calendar as CalendarIcon, Plus, MapPin, Edit2, Trash2, AlertCircle } from 'lucide-react';

const EMPTY_FORM = { actTitle: '', actContent: '', actDate: '', actLocation: '' };

function ActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      setLoading(true);
      const res = await getAllActivities();
      setActivities(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(item) {
    setEditTarget(item);
    setForm({
      actTitle: item.act_title || '',
      actContent: item.act_content || '',
      actDate: item.act_date ? item.act_date.substring(0, 10) : '',
      actLocation: item.act_location || '',
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
    if (!form.actTitle.trim() || !form.actDate) {
      setFormError('กรุณากรอกชื่อกิจกรรมและวันที่ให้ครบถ้วน');
      return;
    }
    try {
      setSubmitting(true);
      if (editTarget) {
        await updateActivity(editTarget.act_id, form);
      } else {
        await createActivity(form);
      }
      closeModal();
      fetchActivities();
    } catch (err) {
      setFormError(err.response?.data?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('ยืนยันลบกิจกรรมนี้?')) return;
    try {
      await deleteActivity(id);
      fetchActivities();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = activities.filter((a) => new Date(a.act_date) >= today);
  const past = activities.filter((a) => new Date(a.act_date) < today);

  if (loading) return <LoadingSpinner text="กำลังโหลดปฏิทินกิจกรรม..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">ปฏิทินกิจกรรม</h1>
          <p className="text-sm text-text-secondary mt-1">กิจกรรมและงานสำคัญที่จัดขึ้นในชุมชน</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={openCreate}>
          เพิ่มกิจกรรม
        </Button>
      </div>

      {/* Upcoming Activities Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          กิจกรรมที่กำลังจะมาถึง ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="ยังไม่มีกิจกรรมเร็วๆ นี้"
            description="สามารถกดปุ่มเพิ่มกิจกรรมด้านบนเพื่อจัดตารางกิจกรรมชุมชนใหม่"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((item) => (
              <ActivityCard
                key={item.act_id}
                item={item}
                isAdmin={user?.roleName === 'Admin'}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item.act_id)}
                upcoming
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Activities Section */}
      {past.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            กิจกรรมที่ผ่านมาแล้ว ({past.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {past.map((item) => (
              <ActivityCard
                key={item.act_id}
                item={item}
                isAdmin={user?.roleName === 'Admin'}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item.act_id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
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
            label="ชื่อกิจกรรม"
            required
            placeholder="เช่น ประชุมประจำเดือนหมู่บ้าน"
            value={form.actTitle}
            onChange={(e) => setForm({ ...form, actTitle: e.target.value })}
          />
          <Input
            label="วันที่จัดกิจกรรม"
            type="date"
            required
            value={form.actDate}
            onChange={(e) => setForm({ ...form, actDate: e.target.value })}
          />
          <Input
            label="สถานที่จัดกิจกรรม"
            placeholder="เช่น ศาลาเอนกประสงค์"
            value={form.actLocation}
            onChange={(e) => setForm({ ...form, actLocation: e.target.value })}
          />
          <Textarea
            label="รายละเอียดเนื้อหากิจกรรมเพิ่มเติม"
            rows={4}
            placeholder="ระบุรายละเอียดกิจกรรม สิ่งที่ต้องเตรียม กำหนดการ หรือข้อมูลสำคัญ..."
            value={form.actContent}
            onChange={(e) => setForm({ ...form, actContent: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}

function ActivityCard({ item, isAdmin, onEdit, onDelete, upcoming }) {
  const dateObj = new Date(item.act_date);
  const dayNum = dateObj.toLocaleDateString('th-TH', { day: 'numeric' });
  const monthStr = dateObj.toLocaleDateString('th-TH', { month: 'short' });
  const yearStr = dateObj.toLocaleDateString('th-TH', { year: 'numeric' });

  return (
    <Card padding="none" className={upcoming ? 'border-primary/30 shadow-xs' : ''}>
      <div className={`p-4 flex items-center gap-4 border-b border-border ${upcoming ? 'bg-primary-soft/50' : 'bg-slate-50'}`}>
        <div className="text-center min-w-[2.75rem] px-2 py-1 bg-surface rounded-sm border border-border">
          <p className={`text-xl font-bold leading-none ${upcoming ? 'text-primary' : 'text-text-muted'}`}>
            {dayNum}
          </p>
          <p className="text-[10px] font-semibold text-text-secondary mt-0.5">
            {monthStr} {yearStr}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">{item.act_title}</p>
          {item.act_location && (
            <p className="text-xs text-text-secondary flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>{item.act_location}</span>
            </p>
          )}
        </div>
      </div>
      <div className="p-3 bg-surface flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Edit2 className="w-3.5 h-3.5 text-primary" />
        </Button>
        {isAdmin && (
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5 text-error" />
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ActivityPage;
