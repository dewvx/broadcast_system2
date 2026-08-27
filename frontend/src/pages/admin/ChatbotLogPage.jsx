import { useState, useEffect, useMemo } from 'react';
import { getChatbotLogs } from '../../api/chatbotfaq.api';
import { EmptyState, LoadingSpinner, Pagination, Badge, Input, Select, Button } from '../../components/ui';
import { FadeStagger, FadeItem } from '../../components/motion';
import { toast } from '../../components/ui';
import {
  History,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Bot,
  User,
} from 'lucide-react';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getVillagerName(log) {
  if (log.first_name || log.last_name) {
    return `${log.first_name || ''} ${log.last_name || ''}`.trim();
  }
  return log.display_name || 'ไม่ระบุชื่อ';
}

/* ---------- Stat Card (uniform style) ---------- */
function StatCard({ label, hint, value, icon: Icon, colorClass, bgClass }) {
  return (
    <div className="bg-surface border border-border rounded-md shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-md ${bgClass} flex items-center justify-center ${colorClass} shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-body-sm font-medium text-text-secondary truncate">
          {label}
          {hint && <span className="text-text-muted font-normal"> · {hint}</span>}
        </p>
        <p className={`text-h1 mt-0.5 ${colorClass}`}>{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

/* ---------- Log Item (conversation card) ---------- */
function LogItem({ log }) {
  const isMatched = Boolean(log.is_matched);

  return (
    <FadeItem>
      <div
        className={`bg-surface border rounded-md shadow-sm overflow-hidden transition-shadow duration-base hover:shadow-md ${
          isMatched ? 'border-border' : 'border-warning/35'
        }`}
      >
        {/* Header: villager identity + status + time */}
        <div className="px-4 sm:px-5 py-3.5 flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
            <span className="text-body font-semibold text-primary-active">
              {getVillagerName(log).charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary truncate">{getVillagerName(log)}</p>
            <p className="text-meta text-text-muted truncate">{log.line_user_id}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isMatched ? (
              <Badge variant="success" withDot>
                พบคำตอบ
              </Badge>
            ) : (
              <Badge variant="warning" withDot>
                ไม่พบ (Fallback)
              </Badge>
            )}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-meta text-text-muted whitespace-nowrap">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(log.created_at)}
            </span>
          </div>
          <span className="sm:hidden basis-full text-meta text-text-muted inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(log.created_at)}
          </span>
        </div>

        {/* Conversation: question | answer */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3.5 border-t border-border grid md:grid-cols-2 gap-3 md:gap-5">
          <div className="space-y-1.5">
            <p className="text-meta font-semibold text-text-muted flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              คำถามจากลูกบ้าน
            </p>
            <div className="inline-block max-w-full px-3.5 py-2.5 rounded-md rounded-tl-sm bg-slate-100 text-body-sm text-text-primary leading-relaxed break-words">
              {log.message_text}
            </div>
          </div>

          <div className="space-y-1.5">
            <p
              className={`text-meta font-semibold flex items-center gap-1.5 ${
                isMatched ? 'text-success' : 'text-warning-hover'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              คำตอบจากบอท
            </p>
            <div
              className={`inline-block max-w-full px-3.5 py-2.5 rounded-md rounded-tl-sm border text-body-sm leading-relaxed break-words ${
                isMatched
                  ? 'bg-secondary-soft/50 border-secondary/15 text-text-primary'
                  : 'bg-warning-soft border-warning/25 text-text-primary'
              }`}
            >
              {log.response_text}
            </div>
          </div>
        </div>
      </div>
    </FadeItem>
  );
}

/* ---------- Page ---------- */
function ChatbotLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const limit = 20;

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchLogs() {
    try {
      if (page === 1) setLoading(true);
      else setRefreshing(true);

      const res = await getChatbotLogs({
        limit,
        offset: (page - 1) * limit,
      });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch chatbot logs:', err);
      toast.error('ไม่สามารถโหลดประวัติการสอบถามได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // filter/search ทำที่ client เฉพาะรายการในหน้าปัจจุบัน
  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return logs.filter((log) => {
      if (statusFilter === 'matched' && !log.is_matched) return false;
      if (statusFilter === 'fallback' && log.is_matched) return false;

      if (!keyword) return true;
      const haystack = [log.message_text, log.response_text, log.first_name, log.last_name, log.display_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [logs, search, statusFilter]);

  const pageStats = useMemo(
    () => ({
      matched: logs.filter((l) => l.is_matched).length,
      fallback: logs.filter((l) => !l.is_matched).length,
    }),
    [logs]
  );

  const hasFilters = search.trim() !== '' || statusFilter !== 'all';

  if (loading && page === 1) return <LoadingSpinner text="กำลังโหลดประวัติการสอบถาม..." />;

  return (
    <FadeStagger className="space-y-6">
      {/* Header */}
      <FadeItem>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 bg-primary-soft rounded-md hidden sm:flex items-center justify-center shrink-0">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-h1 text-text-primary">ประวัติการสอบถามแชทบอท</h1>
              <p className="text-body-sm text-text-secondary mt-0.5">
                ตรวจสอบย้อนหลังว่าลูกบ้านสอบถามอะไร และบอทตอบกลับด้วยข้อความใด
              </p>
            </div>
          </div>
          <Button variant="outline" icon={RefreshCw} loading={refreshing} onClick={fetchLogs} className="shrink-0">
            รีเฟรช
          </Button>
        </div>
      </FadeItem>

      {/* Stats Summary */}
      <FadeItem>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="สอบถามทั้งหมด"
            value={total}
            icon={MessageSquare}
            colorClass="text-primary"
            bgClass="bg-primary-soft"
          />
          <StatCard
            label="พบคำตอบ"
            hint="หน้านี้"
            value={pageStats.matched}
            icon={CheckCircle2}
            colorClass="text-success"
            bgClass="bg-success-soft"
          />
          <StatCard
            label="ไม่พบคำตอบ"
            hint="หน้านี้"
            value={pageStats.fallback}
            icon={XCircle}
            colorClass="text-warning-hover"
            bgClass="bg-warning-soft"
          />
        </div>
      </FadeItem>

      {/* Filter Bar */}
      <FadeItem>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Input
            containerClassName="sm:w-80"
            placeholder="ค้นหาข้อความ / ชื่อผู้สอบถาม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            containerClassName="sm:w-56"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'สถานะทั้งหมด' },
              { value: 'matched', label: 'พบคำตอบ' },
              { value: 'fallback', label: 'ไม่พบคำตอบ (Fallback)' },
            ]}
          />
          <p className="text-body-sm text-text-muted sm:ml-auto whitespace-nowrap">
            พบ {filteredLogs.length} รายการ{hasFilters ? ' (จากหน้านี้)' : ''}
          </p>
        </div>
      </FadeItem>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={hasFilters ? Search : History}
            title={hasFilters ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีประวัติการสอบถาม'}
            description={
              hasFilters
                ? 'ลองเปลี่ยนคำค้นหา หรือเปลี่ยนตัวกรองสถานะ'
                : 'เมื่อมีการสอบถามผ่าน LINE OA ข้อมูลจะมาปรากฏที่นี่'
            }
          />
        ) : (
          <>
            {filteredLogs.map((log) => (
              <LogItem key={log.log_id} log={log} />
            ))}

            {/* Pagination */}
            {total > limit && (
              <FadeItem>
                <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
                  <Pagination
                    currentPage={page}
                    totalItems={total}
                    itemsPerPage={limit}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              </FadeItem>
            )}
          </>
        )}
      </div>
    </FadeStagger>
  );
}

export default ChatbotLogPage;
