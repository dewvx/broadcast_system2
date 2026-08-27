import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllNews, approveNews, rejectNews, deleteNews } from '../../api/news.api';
import {
  getZones,
  broadcastNews,
  scheduleBroadcast,
  getScheduledBroadcasts,
  cancelScheduledBroadcast,
} from '../../api/broadcast.api';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Modal, Select, EmptyState, LoadingSpinner, Pagination } from '../../components/ui';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  Radio,
  Search,
  Clock,
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

function NewsManagementPage() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [broadcastData, setBroadcastData] = useState({
    newsId: null,
    zoneName: '',
    mode: 'now',
    scheduledAt: '',
  });
  const [zones, setZones] = useState([]);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [scheduledList, setScheduledList] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchZones();
    fetchScheduled();
  }, []);

  // เมื่อเปลี่ยน search หรือ filter ให้รีเซ็ตกลับหน้า 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  async function fetchNews() {
    try {
      setLoading(true);
      const res = await getAllNews();
      setNews(res.data.data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchZones() {
    try {
      const res = await getZones();
      setZones(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  }

  async function fetchScheduled() {
    try {
      const res = await getScheduledBroadcasts('Pending');
      setScheduledList(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch scheduled broadcasts:', err);
    }
  }

  async function handleApprove(id) {
    try {
      await approveNews(id);
      fetchNews();
    } catch (err) {
      alert(err.response?.data?.message || 'อนุมัติไม่สำเร็จ');
    }
  }

  async function handleReject(id) {
    try {
      await rejectNews(id);
      fetchNews();
    } catch (err) {
      alert(err.response?.data?.message || 'ปฏิเสธไม่สำเร็จ');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('ยืนยันลบข่าวนี้? การลบไม่สามารถย้อนคืนได้')) return;
    try {
      await deleteNews(id);
      fetchNews();
    } catch (err) {
      alert(err.response?.data?.message || 'ลบไม่สำเร็จ');
    }
  }

  async function handleBroadcast() {
    try {
      setSendingBroadcast(true);
      if (broadcastData.mode === 'schedule') {
        if (!broadcastData.scheduledAt) {
          alert('กรุณาเลือกวันและเวลาที่ต้องการส่ง');
          return;
        }
        const res = await scheduleBroadcast(
          broadcastData.newsId,
          broadcastData.zoneName,
          broadcastData.scheduledAt
        );
        setBroadcastData({ newsId: null, zoneName: '', mode: 'now', scheduledAt: '' });
        alert(res.data?.message || 'ตั้งเวลาส่งข่าวสำเร็จ');
        fetchScheduled();
      } else {
        const res = await broadcastNews(broadcastData.newsId, broadcastData.zoneName);
        setBroadcastData({ newsId: null, zoneName: '', mode: 'now', scheduledAt: '' });
        alert(res.data?.message || 'ส่งข่าวผ่าน LINE เรียบร้อยแล้ว');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'ส่งข่าวไม่สำเร็จ');
    } finally {
      setSendingBroadcast(false);
    }
  }

  async function handleCancelSchedule(scheduleId) {
    if (!window.confirm('ยืนยันยกเลิกตารางส่งข่าวนี้?')) return;
    try {
      await cancelScheduledBroadcast(scheduleId);
      fetchScheduled();
    } catch (err) {
      alert(err.response?.data?.message || 'ยกเลิกไม่สำเร็จ');
    }
  }

  function closeBroadcastModal() {
    setBroadcastData({ newsId: null, zoneName: '', mode: 'now', scheduledAt: '' });
  }

  function canEdit(item) {
    if (user.roleName === 'Admin') return true;
    return item.created_by === user.userId && item.news_status !== 'Approved';
  }

  const filteredNews = news.filter((item) => {
    const matchFilter = filter === 'All' || item.news_status === filter;
    const matchSearch =
      searchTerm === '' ||
      item.news_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category_name && item.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <LoadingSpinner text="กำลังโหลดรายการข่าวสาร..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">จัดการข่าวสาร</h1>
          <p className="text-sm text-text-secondary mt-1">รายการข่าว ประกาศ และกิจกรรมชุมชนทั้งหมด</p>
        </div>
        <Link to="/admin/news/create">
          <Button icon={Plus} variant="primary">
            เพิ่มข่าวใหม่
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-border p-4 rounded-md shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาหัวข้อข่าว หรือหมวดหมู่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { label: 'สถานะทั้งหมด', value: 'All' },
              { label: 'รออนุมัติ (Pending)', value: 'Pending' },
              { label: 'อนุมัติแล้ว (Approved)', value: 'Approved' },
              { label: 'ถูกปฏิเสธ (Rejected)', value: 'Rejected' },
            ]}
          />
        </div>
      </div>

      {/* News Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {filteredNews.length === 0 ? (
          <EmptyState
            title="ไม่พบข่าวสาร"
            description="ไม่มีรายการข่าวสารที่ตรงกับเงื่อนไขการค้นหาในขณะนี้"
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-border text-body-sm text-text-secondary font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">หัวข้อข่าว</th>
                    <th className="px-6 py-3.5">หมวดหมู่</th>
                    <th className="px-6 py-3.5">สถานะ</th>
                    <th className="px-6 py-3.5">ยอดดู</th>
                    <th className="px-6 py-3.5">วันที่สร้าง</th>
                    <th className="px-6 py-3.5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedNews.map((item) => (
                    <tr key={item.news_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary max-w-xs truncate">
                        {item.news_title}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{item.category_name || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge status={item.news_status} />
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-medium">
                        {item.view_count || 0} ครั้ง
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {new Date(item.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link to={`/admin/news/view/${item.news_id}`}>
                          <Button size="sm" variant="ghost" title="ดูข่าว">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {canEdit(item) && (
                          <Link to={`/admin/news/edit/${item.news_id}`}>
                            <Button size="sm" variant="ghost" title="แก้ไข">
                              <Edit2 className="w-4 h-4 text-primary" />
                            </Button>
                          </Link>
                        )}

                        {user.roleName === 'Admin' && item.news_status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(item.news_id)}
                              title="อนุมัติ"
                            >
                              <CheckCircle className="w-4 h-4 text-success" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(item.news_id)}
                              title="ปฏิเสธ"
                            >
                              <XCircle className="w-4 h-4 text-error" />
                            </Button>
                          </>
                        )}

                        {item.news_status === 'Approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setBroadcastData({
                                newsId: item.news_id,
                                zoneName: '',
                                mode: 'now',
                                scheduledAt: '',
                              });
                            }}
                            title="ส่งข่าวหาลูกบ้านผ่าน LINE"
                          >
                            <Send className="w-4 h-4 text-secondary" />
                          </Button>
                        )}

                        {user.roleName === 'Admin' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.news_id)}
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4 text-text-muted hover:text-error" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredNews.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={Boolean(broadcastData.newsId)}
        onClose={closeBroadcastModal}
        title="ส่งข่าวสารผ่าน LINE Official Account"
        footer={
          <>
            <Button variant="secondary" onClick={closeBroadcastModal}>
              ยกเลิก
            </Button>
            <Button
              variant="primary"
              icon={broadcastData.mode === 'schedule' ? Clock : Send}
              loading={sendingBroadcast}
              onClick={handleBroadcast}
            >
              {broadcastData.mode === 'schedule' ? 'ตั้งเวลาส่ง' : 'ส่งข่าวทันที'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-primary-soft border border-primary/20 rounded-md text-primary-active text-body-sm flex items-center gap-2.5">
            <Radio className="w-[18px] h-[18px] shrink-0" />
            <span>ข่าวสารจะถูกส่งเป็น Flex Message แบบการ์ดไปยัง LINE ของลูกบ้าน</span>
          </div>

          {/* เลือกโหมด: ส่งทันที / ตั้งเวลา */}
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="เลือกโหมดการส่งข่าว">
            <button
              type="button"
              onClick={() => setBroadcastData({ ...broadcastData, mode: 'now' })}
              className={`h-11 text-sm font-medium border rounded-sm transition-colors ${
                broadcastData.mode === 'now'
                  ? 'bg-primary-soft border-primary text-primary'
                  : 'bg-surface border-border text-text-secondary hover:border-border-strong'
              }`}
            >
              ส่งทันที
            </button>
            <button
              type="button"
              onClick={() => setBroadcastData({ ...broadcastData, mode: 'schedule' })}
              className={`h-11 text-sm font-medium border rounded-sm transition-colors flex items-center justify-center gap-1.5 ${
                broadcastData.mode === 'schedule'
                  ? 'bg-primary-soft border-primary text-primary'
                  : 'bg-surface border-border text-text-secondary hover:border-border-strong'
              }`}
            >
              <Clock className="w-4 h-4" />
              ตั้งเวลาส่ง
            </button>
          </div>

          {broadcastData.mode === 'schedule' && (
            <div>
              <label
                htmlFor="scheduled-at"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                วันและเวลาที่ต้องการส่ง
              </label>
              <input
                id="scheduled-at"
                type="datetime-local"
                value={broadcastData.scheduledAt}
                onChange={(e) => setBroadcastData({ ...broadcastData, scheduledAt: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-body-sm text-text-muted mt-1">
                * ระบบจะส่งข่าวอัตโนมัติในเวลาที่กำหนด (เช็คทุก 1 นาที)
              </p>
            </div>
          )}

          <Select
            label="เลือกกลุ่มเป้าหมาย (โซน/หมู่บ้าน)"
            value={broadcastData.zoneName}
            onChange={(e) => setBroadcastData({ ...broadcastData, zoneName: e.target.value })}
          >
            <option value="">ทั้งหมด (ลูกบ้านทุกคนทุกโซน)</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.startsWith('หมู่') ? z : `หมู่ ${z}`}
              </option>
            ))}
          </Select>
          <p className="text-body-sm text-text-muted">
            * ดึงรายชื่อโซนเฉพาะที่มีลูกบ้านลงทะเบียนจริงในระบบ
          </p>
        </div>
      </Modal>

      {/* Scheduled Broadcasts */}
      {user.roleName === 'Admin' && (
        <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Clock className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary">ตารางส่งข่าวล่วงหน้า (รอส่ง)</h2>
          </div>
          {scheduledList.length === 0 ? (
            <EmptyState
              title="ไม่มีตารางส่งข่าวที่รออยู่"
              description="กดปุ่มส่งข่าว แล้วเลือก “ตั้งเวลาส่ง” เพื่อกำหนดเวลาส่งล่วงหน้า"
            />
          ) : (
            <ul className="divide-y divide-border">
              {scheduledList.map((item) => (
                <li
                  key={item.schedule_id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 px-6 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{item.news_title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      ส่ง{' '}
                      {new Date(item.scheduled_at).toLocaleString('th-TH', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}{' '}
                      · ผู้รับ: {item.zone_name ? item.zone_name : 'ทั้งหมด'} · ตั้งโดย{' '}
                      {item.sent_by_name}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleCancelSchedule(item.schedule_id)}>
                    ยกเลิก
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsManagementPage;