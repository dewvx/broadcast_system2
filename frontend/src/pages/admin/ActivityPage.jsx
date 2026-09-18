import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../../api/activity.api';
import {
  Button,
  Input,
  Textarea,
  Modal,
  Card,
  EmptyState,
  LoadingSpinner,
  toast,
  useConfirm,
} from '../../components/ui';
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  AlertCircle,
  User,
  Link2,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
} from 'lucide-react';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const EMPTY_FORM = {
  actTitle: '',
  actContent: '',
  actDate: '',
  actLocation: '',
};

function formatThaiDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = THAI_MONTHS[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];

  // วันของเดือนก่อนหน้า
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const d = new Date(year, month - 1, dayNum);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    days.push({ dateStr, dayNum, isCurrentMonth: false });
  }

  // วันของเดือนปัจจุบัน
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // วันของเดือนถัดไป (เติมให้ครบสัปดาห์)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  return days;
}

function ActivityPage() {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // มุมมอง: 'list' (รายการ) หรือ 'calendar' (ปฏิทิน) - ค่าเริ่มต้นเป็นรายการ
  const [viewMode, setViewMode] = useState('list');

  // ควบคุมเดือนในปฏิทิน
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // ฟอร์มเพิ่ม/แก้ไขกิจกรรม
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ป๊อปอัปดูรายละเอียดกิจกรรม (เมื่อคลิกในปฏิทิน)
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      setLoading(true);
      const res = await getAllActivities();
      setActivities(res.data.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function openCreate(prefilledDate = '') {
    setEditTarget(null);
    setForm({
      ...EMPTY_FORM,
      actDate: prefilledDate || new Date().toISOString().substring(0, 10),
    });
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
    if (!form.actTitle.trim() || !form.actDate || !form.actLocation.trim()) {
      setFormError('กรุณากรอกชื่อกิจกรรม วันที่ และสถานที่ให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);
      if (editTarget) {
        await updateActivity(editTarget.act_id, form);
        toast.success('บันทึกการแก้ไขกิจกรรมเรียบร้อยแล้ว');
      } else {
        await createActivity(form);
        toast.success('เพิ่มกิจกรรมใหม่เรียบร้อยแล้ว');
      }
      closeModal();
      fetchActivities();
    } catch (err) {
      const msg = err.response?.data?.message || 'บันทึกไม่สำเร็จ';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await confirm({
      title: 'ยืนยันลบกิจกรรม',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้ออกจากระบบ?',
      confirmText: 'ลบกิจกรรม',
      cancelText: 'ยกเลิก',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteActivity(id);
      toast.success('ลบกิจกรรมเรียบร้อยแล้ว');
      if (detailTarget?.act_id === id) setDetailTarget(null);
      fetchActivities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  // คัดลอกลิงก์กิจกรรม (LIFF Deep Link)
  function handleCopyLink(actId) {
    const liffId = import.meta.env.VITE_LIFF_ID;
    const url = liffId
      ? `https://liff.line.me/${liffId}/activities/${actId}`
      : `${window.location.origin}/liff/activities/${actId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success('คัดลอกลิงก์กิจกรรมเรียบร้อยแล้ว'))
        .catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast.success('คัดลอกลิงก์กิจกรรมเรียบร้อยแล้ว');
    } catch {
      toast.error('ไม่สามารถคัดลอกลิงก์ได้');
    }
    document.body.removeChild(textarea);
  }

  // แบ่งกิจกรรมเร็วๆ นี้ และที่ผ่านมาแล้ว
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = activities.filter((a) => new Date(a.act_date) >= today);
  const past = activities.filter((a) => new Date(a.act_date) < today);

  // แมปกิจกรรมตามวันที่สำหรับปฏิทิน (key = YYYY-MM-DD)
  const activitiesByDate = useMemo(() => {
    const map = {};
    activities.forEach((act) => {
      if (!act.act_date) return;
      const dateKey = act.act_date.substring(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(act);
    });
    return map;
  }, [activities]);

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
          <h1 className="text-h1 text-text-primary">ปฏิทินกิจกรรม</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            กิจกรรมและงานสำคัญที่จัดขึ้นในชุมชน ({activities.length} รายการ)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* ปุ่มสลับมุมมอง ปฏิทิน / รายการ */}
          <div className="bg-slate-100 p-1 rounded-sm border border-border flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium rounded-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <List className="w-4 h-4" />
              <span>รายการ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-body-sm font-medium rounded-sm transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>ปฏิทิน</span>
            </button>

          </div>

          <Button icon={Plus} variant="primary" onClick={() => openCreate()}>
            เพิ่มกิจกรรม
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <CalendarView
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          activitiesByDate={activitiesByDate}
          onSelectActivity={(act) => setDetailTarget(act)}
          onAddDate={(dateStr) => openCreate(dateStr)}
        />
      ) : (
        <ListView
          upcoming={upcoming}
          past={past}
          isAdmin={user?.roleName === 'Admin'}
          onEdit={openEdit}
          onDelete={handleDelete}
          onCopyLink={handleCopyLink}
        />
      )}

      {/* Modal เพิ่ม/แก้ไขกิจกรรม */}
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
            <div className="p-3 bg-error-soft border border-error/20 rounded-sm text-error text-body-sm">
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
            required
            placeholder="เช่น ศาลาเอนกประสงค์ หรือ หน้าที่ทำการผู้ใหญ่บ้าน"
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

      {/* Modal ดูรายละเอียดกิจกรรม (คลิกจากปฏิทิน) */}
      <Modal
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title="รายละเอียดกิจกรรม"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              icon={Link2}
              onClick={() => handleCopyLink(detailTarget?.act_id)}
            >
              คัดลอกลิงก์
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  const target = detailTarget;
                  setDetailTarget(null);
                  openEdit(target);
                }}
              >
                แก้ไข
              </Button>
              {user?.roleName === 'Admin' && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(detailTarget?.act_id)}
                >
                  ลบ
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailTarget && (
          <div className="space-y-4">
            <div>
              <h2 className="text-h3 font-bold text-text-primary">{detailTarget.act_title}</h2>
              <div className="flex items-center gap-4 mt-2 text-body-sm text-text-secondary flex-wrap">
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatThaiDate(detailTarget.act_date)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-text-muted" />
                  <span>{detailTarget.act_location}</span>
                </span>
              </div>
            </div>

            {detailTarget.act_content ? (
              <div className="p-3.5 bg-slate-50 border border-border rounded-md text-body-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {detailTarget.act_content}
              </div>
            ) : (
              <p className="text-body-sm text-text-muted italic">ไม่มีรายละเอียดเพิ่มเติม</p>
            )}

            {detailTarget.created_by_name && (
              <p className="text-meta text-text-muted flex items-center gap-1 pt-2 border-t border-border">
                <User className="w-3.5 h-3.5" />
                <span>สร้างโดย: {detailTarget.created_by_name}</span>
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// -------------------------------------------------------------
// Component: CalendarView (มุมมองตารางปฏิทินรายเดือน)
// -------------------------------------------------------------
function CalendarView({
  currentMonth,
  setCurrentMonth,
  activitiesByDate,
  onSelectActivity,
  onAddDate,
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  const todayStr = new Date().toISOString().substring(0, 10);

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function goToday() {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  return (
    <Card padding="none" className="overflow-hidden shadow-xs">
      {/* Calendar Top Controls */}
      <div className="p-4 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-h2 font-bold text-text-primary">
            {THAI_MONTHS[month]} {year + 543}
          </h2>
          <Button size="sm" variant="outline" onClick={goToday}>
            วันนี้
          </Button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button size="sm" variant="ghost" icon={ChevronLeft} onClick={prevMonth} title="เดือนก่อนหน้า">
            ก่อนหน้า
          </Button>
          <Button size="sm" variant="ghost" icon={ChevronRight} onClick={nextMonth} title="เดือนถัดไป">
            ถัดไป
          </Button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 border-b border-border bg-slate-50 text-center">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`py-2.5 text-body-sm font-semibold ${
              i === 0 ? 'text-error' : i === 6 ? 'text-secondary' : 'text-text-secondary'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border bg-surface">
        {days.map((day, idx) => {
          const isToday = day.dateStr === todayStr;
          const acts = activitiesByDate[day.dateStr] || [];

          return (
            <div
              key={idx}
              onClick={() => onAddDate(day.dateStr)}
              className={`min-h-[105px] sm:min-h-[120px] p-2 flex flex-col justify-between group cursor-pointer transition-colors ${
                day.isCurrentMonth
                  ? isToday
                    ? 'bg-primary-soft/30 hover:bg-primary-soft/50'
                    : 'bg-surface hover:bg-slate-50/80'
                  : 'bg-slate-50/50 text-text-muted hover:bg-slate-100/60'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-body-sm font-semibold inline-flex items-center justify-center ${
                    isToday
                      ? 'w-7 h-7 rounded-full bg-primary text-white shadow-xs'
                      : day.isCurrentMonth
                      ? 'text-text-primary'
                      : 'text-text-muted'
                  }`}
                >
                  {day.dayNum}
                </span>

                <span className="text-meta text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium hidden sm:inline">
                  + เพิ่ม
                </span>
              </div>

              {/* Activities in this day */}
              <div className="space-y-1 mt-1.5 flex-1">
                {acts.slice(0, 3).map((act) => (
                  <div
                    key={act.act_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectActivity(act);
                    }}
                    className="px-2 py-1 bg-secondary-soft text-secondary border border-secondary/20 rounded text-meta font-medium truncate cursor-pointer hover:bg-secondary/15 transition-colors shadow-xs flex items-center gap-1"
                    title={`${act.act_title} (${act.act_location || ''})`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    <span className="truncate">{act.act_title}</span>
                  </div>
                ))}

                {acts.length > 3 && (
                  <p className="text-meta text-text-muted text-center font-medium">
                    +{acts.length - 3} กิจกรรม
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// -------------------------------------------------------------
// Component: ListView (มุมมองรายการการ์ด)
// -------------------------------------------------------------
function ListView({
  upcoming,
  past,
  isAdmin,
  onEdit,
  onDelete,
  onCopyLink,
}) {
  return (
    <div className="space-y-6">
      {/* Upcoming Activities */}
      <section className="space-y-3">
        <h2 className="text-h3 font-bold text-text-primary">
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
                isAdmin={isAdmin}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.act_id)}
                onCopyLink={() => onCopyLink(item.act_id)}
                upcoming
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Activities */}
      {past.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-h3 font-bold text-text-secondary">
            กิจกรรมที่ผ่านมาแล้ว ({past.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
            {past.map((item) => (
              <ActivityCard
                key={item.act_id}
                item={item}
                isAdmin={isAdmin}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.act_id)}
                onCopyLink={() => onCopyLink(item.act_id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Component: ActivityCard
// -------------------------------------------------------------
function ActivityCard({
  item,
  isAdmin,
  onEdit,
  onDelete,
  onCopyLink,
  upcoming,
}) {
  const dateObj = new Date(item.act_date);
  const dayNum = dateObj.toLocaleDateString('th-TH', { day: 'numeric' });
  const monthStr = dateObj.toLocaleDateString('th-TH', { month: 'short' });
  const yearStr = dateObj.toLocaleDateString('th-TH', { year: 'numeric' });

  return (
    <Card padding="none" className={upcoming ? 'border-primary/30 shadow-xs' : ''}>
      <div
        className={`p-4 flex items-center gap-4 border-b border-border ${
          upcoming ? 'bg-primary-soft/50' : 'bg-slate-50'
        }`}
      >
        <div className="text-center min-w-[2.75rem] px-2 py-1 bg-surface rounded-sm border border-border shrink-0">
          <p className={`text-xl font-bold leading-none ${upcoming ? 'text-primary' : 'text-text-muted'}`}>
            {dayNum}
          </p>
          <p className="text-meta font-semibold text-text-secondary mt-0.5">
            {monthStr} {yearStr}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">{item.act_title}</p>
          {item.act_location && (
            <p className="text-body-sm text-text-secondary flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>{item.act_location}</span>
            </p>
          )}
          {item.created_by_name && (
            <p className="text-meta text-text-muted flex items-center gap-1 mt-1 truncate">
              <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>สร้างโดย: {item.created_by_name}</span>
            </p>
          )}
        </div>
      </div>

      {item.act_content && (
        <div className="px-4 py-2.5 text-body-sm text-text-secondary line-clamp-2 border-b border-border/50 bg-surface/50">
          {item.act_content}
        </div>
      )}

      <div className="p-2.5 bg-surface flex items-center justify-between gap-1">
        <Button
          size="sm"
          variant="ghost"
          icon={Link2}
          onClick={onCopyLink}
          title="คัดลอกลิงก์ LIFF กิจกรรม"
        >
          คัดลอกลิงก์
        </Button>

        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit} title="แก้ไขกิจกรรม">
            <Edit2 className="w-3.5 h-3.5 text-primary" />
          </Button>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={onDelete} title="ลบกิจกรรม">
              <Trash2 className="w-3.5 h-3.5 text-error" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ActivityPage;
