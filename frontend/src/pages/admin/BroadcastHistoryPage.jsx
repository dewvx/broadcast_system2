import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getBroadcastHistory } from '../../api/report.api';
import { Card, Badge, Button, Input, Pagination, LoadingSpinner, EmptyState } from '../../components/ui';
import { FadeStagger, FadeItem } from '../../components/motion';
import {
  Send,
  Search,
  RefreshCw,
  Users,
  Clock,
  Eye,
  Radio,
  Newspaper,
  User,
  Calendar,
  X,
} from 'lucide-react';

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BroadcastHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(
    async (currentPage = page, search = searchQuery, isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setErrorMsg('');

        const res = await getBroadcastHistory({
          page: currentPage,
          limit,
          search,
        });

        setLogs(res.data.data || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalRecords(res.data.pagination.total || 0);
        }
      } catch (err) {
        console.error('Failed to load broadcast history:', err);
        setErrorMsg(err.response?.data?.message || 'ไม่สามารถโหลดประวัติการส่งข่าวได้');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [limit, page, searchQuery]
  );

  useEffect(() => {
    fetchHistory(page, searchQuery);
  }, [page, searchQuery, fetchHistory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 text-text-primary">ประวัติการส่งข่าวสาร</h1>
            <Badge variant="primary">{totalRecords.toLocaleString()} ครั้ง</Badge>
          </div>
          <p className="text-body-sm text-text-secondary mt-1">
            ตรวจสอบประวัติและสถิติการกระจายข่าวสารผ่าน LINE Official Account ย้อนหลังทั้งหมด
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchHistory(page, searchQuery, true)}
            disabled={loading || refreshing}
            className="shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            <span>รีเฟรช</span>
          </Button>
          <Link to="/admin/news">
            <Button variant="primary" size="sm" icon={Send} className="shrink-0">
              จัดการข่าวสาร / บรอดแคสต์
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-md p-4 flex items-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-body-sm text-text-muted">จำนวนครั้งที่ส่งทั้งหมด</p>
            <p className="text-h2 font-bold text-text-primary mt-0.5">{totalRecords.toLocaleString()} ครั้ง</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-4 flex items-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-md bg-secondary-soft text-secondary flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-body-sm text-text-muted">ส่งล่าสุด</p>
            <p className="text-h2 font-semibold text-text-primary mt-0.5 truncate">
              {logs.length > 0 ? formatDateTime(logs[0].sent_at) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card padding="sm">

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="ค้นหาตามหัวข้อข่าว หรือชื่อผู้ส่งข่าว..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary rounded-full"
                aria-label="ล้างการค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="primary" size="md" icon={Search} className="shrink-0">
            ค้นหา
          </Button>
          {searchQuery && (
            <Button type="button" variant="outline" size="md" onClick={handleClearSearch} className="shrink-0">
              ล้างตัวกรอง
            </Button>
          )}
        </form>
      </Card>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner text="กำลังโหลดประวัติการส่งข่าวสาร..." />
      ) : errorMsg ? (
        <Card className="text-center py-10">
          <p className="text-body text-error font-medium">{errorMsg}</p>
          <Button variant="outline" size="sm" onClick={() => fetchHistory(page, searchQuery)} className="mt-4">
            ลองใหม่อีกครั้ง
          </Button>
        </Card>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Radio}
          title={searchQuery ? 'ไม่พบประวัติการส่งข่าวที่ตรงกับคำค้นหา' : 'ยังไม่มีประวัติการส่งข่าวสาร'}
          description={
            searchQuery
              ? `ไม่พบข้อมูลที่ตรงกับ "${searchQuery}" กรุณาลองใช้คำค้นหาอื่น`
              : 'เมื่อมีการส่งข่าวสารไปยัง LINE ของลูกบ้าน ประวัติและสถิติจะแสดงขึ้นที่นี่'
          }
          action={
            searchQuery ? (
              <Button variant="outline" onClick={handleClearSearch}>
                ล้างการค้นหา
              </Button>
            ) : (
              <Link to="/admin/news">
                <Button variant="primary" icon={Send}>
                  ไปที่หน้าจัดการข่าวสาร
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <FadeStagger className="space-y-4">
          {/* Desktop Table View */}
          <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-slate-50/80 border-b border-border text-meta font-semibold text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">วันและเวลาที่ส่ง</th>
                    <th className="px-6 py-3.5">หัวข้อข่าวสาร</th>
                    <th className="px-6 py-3.5">หมวดหมู่</th>
                    <th className="px-6 py-3.5">ผู้ส่งข่าว</th>
                    <th className="px-6 py-3.5 text-center">จำนวนผู้รับ</th>
                    <th className="px-6 py-3.5 text-right">ดูข่าว</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((item) => (
                    <tr key={item.log_id} className="hover:bg-slate-50/80 transition-colors duration-fast">
                      {/* Sent At */}
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-text-muted shrink-0" />
                          <span>{formatDateTime(item.sent_at)}</span>
                        </div>
                      </td>

                      {/* News Title */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/news/view/${item.news_id}`}
                          className="font-medium text-text-primary hover:text-primary transition-colors line-clamp-2"
                          title={item.news_title}
                        >
                          {item.news_title}
                        </Link>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-meta font-medium bg-slate-100 text-text-secondary">
                          {item.category_name || 'ทั่วไป'}
                        </span>
                      </td>

                      {/* Sent By */}
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-text-muted shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary leading-tight">{item.sent_by_name}</p>
                            {item.sent_by_username && (
                              <p className="text-meta text-text-muted">@{item.sent_by_username}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total Received */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-meta font-bold bg-success-soft text-success border border-success/20">
                          <Users className="w-3.5 h-3.5" />
                          {Number(item.total_received || 0).toLocaleString()} คน
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link to={`/admin/news/view/${item.news_id}`}>
                          <Button size="sm" variant="ghost" title="ดูข่าวสารฉบับนี้">
                            <Eye className="w-4 h-4 text-primary" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="space-y-3 md:hidden">
            {logs.map((item) => (
              <FadeItem key={item.log_id}>
                <Card padding="sm" className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-meta font-medium bg-slate-100 text-text-secondary">
                          {item.category_name || 'ทั่วไป'}
                        </span>
                        <span className="text-meta text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(item.sent_at)}
                        </span>
                      </div>
                      <Link
                        to={`/admin/news/view/${item.news_id}`}
                        className="text-body font-semibold text-text-primary hover:text-primary transition-colors block line-clamp-2"
                      >
                        {item.news_title}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-meta">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <User className="w-3.5 h-3.5 text-text-muted" />
                      <span>ส่งโดย: {item.sent_by_name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-success-soft text-success">
                      <Users className="w-3 h-3" />
                      {Number(item.total_received || 0).toLocaleString()} คน
                    </span>
                  </div>
                </Card>
              </FadeItem>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-2 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
            </div>
          )}
        </FadeStagger>
      )}
    </div>
  );
}

export default BroadcastHistoryPage;
