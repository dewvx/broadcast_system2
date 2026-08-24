import { useState, useEffect, useMemo } from 'react';
import { getChatbotLogs } from '../../api/chatbotfaq.api';
import { Card, EmptyState, LoadingSpinner, Pagination, Badge, Input, Select, Button } from '../../components/ui';
import {
  History,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Bot,
} from 'lucide-react';

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

  if (loading && page === 1) return <LoadingSpinner text="กำลังโหลดประวัติการสอบถาม..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-soft rounded-md">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">ประวัติการสอบถามแชทบอท</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              ตรวจสอบย้อนหลังว่าลูกบ้านสอบถามอะไรมาบ้าง และบอทตอบกลับด้วยข้อความใด
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          icon={RefreshCw}
          loading={refreshing}
          onClick={fetchLogs}
          className="shrink-0"
        >
          รีเฟรช
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">สอบถามทั้งหมด</p>
            <p className="text-2xl font-bold text-text-primary">{total.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-success-soft rounded-full">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              พบคำตอบ <span className="text-xs text-text-muted">(หน้านี้)</span>
            </p>
            <p className="text-2xl font-bold text-success">{pageStats.matched}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-warning-soft rounded-full">
            <XCircle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              ไม่พบคำตอบ <span className="text-xs text-text-muted">(หน้านี้)</span>
            </p>
            <p className="text-2xl font-bold text-warning">{pageStats.fallback}</p>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <Input
          containerClassName="sm:w-80"
          placeholder="ค้นหาข้อความ / ชื่อผู้สอบถาม..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          containerClassName="sm:w-52"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'สถานะทั้งหมด' },
            { value: 'matched', label: 'พบคำตอบ' },
            { value: 'fallback', label: 'ไม่พบคำตอบ (Fallback)' },
          ]}
        />
      </div>

      {/* Logs Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={search || statusFilter !== 'all' ? Search : History}
            title={search || statusFilter !== 'all' ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีประวัติการสอบถาม'}
            description={
              search || statusFilter !== 'all'
                ? 'ลองเปลี่ยนคำค้นหา หรือเปลี่ยนตัวกรองสถานะ'
                : 'เมื่อมีการสอบถามผ่าน LINE OA ข้อมูลจะมาปรากฏที่นี่'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-border text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 whitespace-nowrap">วัน-เวลา</th>
                  <th className="px-6 py-3.5">ผู้สอบถาม</th>
                  <th className="px-6 py-3.5">ข้อความที่พิมพ์มา</th>
                  <th className="px-6 py-3.5">ข้อความที่ตอบกลับ</th>
                  <th className="px-6 py-3.5 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted align-top">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {getVillagerName(log).charAt(0)}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-text-primary truncate max-w-[160px]">
                            {getVillagerName(log)}
                          </span>
                          <span className="text-xs text-text-muted truncate max-w-[160px]">
                            {log.line_user_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ข้อความผู้ใช้ - ฟองซ้าย */}
                    <td className="px-6 py-4 align-top">
                      <div className="inline-block max-w-[280px] px-3.5 py-2 rounded-md rounded-tl-none bg-slate-100 text-text-primary leading-relaxed break-words">
                        {log.message_text}
                      </div>
                    </td>

                    {/* ข้อความบอทตอบ - ฟองขวา */}
                    <td className="px-6 py-4 align-top">
                      <div
                        className={`flex items-start gap-1.5 ${log.is_matched ? '' : 'opacity-90'}`}
                        title={log.response_text}
                      >
                        <Bot
                          className={`w-4 h-4 mt-1 shrink-0 ${
                            log.is_matched ? 'text-success' : 'text-text-muted'
                          }`}
                        />
                        <div className="max-w-[300px] text-text-secondary leading-relaxed line-clamp-3 break-words">
                          {log.response_text}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center align-top">
                      {log.is_matched ? (
                        <Badge variant="success" icon={CheckCircle2}>
                          พบคำตอบ
                        </Badge>
                      ) : (
                        <Badge variant="warning" icon={XCircle}>
                          ไม่พบ (Fallback)
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center pt-2 pb-8">
          <Pagination current={page} total={total} pageSize={limit} onChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
}

export default ChatbotLogPage;
