import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getTopNews, getBroadcastHistory } from '../../api/report.api';
import { Card, LoadingSpinner, Badge, Button } from '../../components/ui';
import { Newspaper, Users, Radio, Eye, TrendingUp, Send, AlertCircle } from 'lucide-react';

function StatCard({ label, value, icon: Icon, colorClass, bgClass }) {
  return (
    <Card padding="sm" className="relative overflow-hidden border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-sm ${bgClass} flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topNews, setTopNews] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([getSummary(), getTopNews(5), getBroadcastHistory(5)])
      .then(([summaryRes, topNewsRes, historyRes]) => {
        setSummary(summaryRes.data.data);
        setTopNews(topNewsRes.data.data);
        setHistory(historyRes.data.data);
      })
      .catch((err) => setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลภาพรวม..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">ภาพรวมระบบ</h1>
        <p className="text-sm text-text-secondary mt-1">สรุปสถานะการทำงานและสถิติข้อมูลสำคัญในชุมชน</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="ข่าวทั้งหมด"
          value={summary?.news?.total || 0}
          icon={Newspaper}
          colorClass="text-primary"
          bgClass="bg-primary-soft"
        />
        <StatCard
          label="ข่าวรออนุมัติ"
          value={summary?.news?.pending || 0}
          icon={AlertCircle}
          colorClass="text-warning"
          bgClass="bg-warning-soft"
        />
        <StatCard
          label="ลูกบ้านลงทะเบียน"
          value={summary?.totalVillagers || 0}
          icon={Users}
          colorClass="text-secondary"
          bgClass="bg-secondary-soft"
        />
        <StatCard
          label="จำนวนครั้งส่งข่าว"
          value={summary?.totalBroadcasts || 0}
          icon={Radio}
          colorClass="text-success"
          bgClass="bg-success-soft"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Viewed News */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>ข่าวยอดนิยม (เข้าชมมากสุด)</span>
            </div>
          }
        >
          {topNews.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">ยังไม่มีข้อมูลข่าวสาร</p>
          ) : (
            <ul className="divide-y divide-border">
              {topNews.map((item) => (
                <li key={item.news_id} className="py-3 flex items-center justify-between gap-4">
                  <Link
                    to={`/admin/news/edit/${item.news_id}`}
                    className="text-sm font-medium text-text-primary hover:text-primary transition-colors truncate"
                  >
                    {item.news_title}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                    <Eye className="w-3.5 h-3.5 text-text-muted" />
                    {item.view_count} ครั้ง
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Broadcast History */}
        <Card
          header={
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-success" />
              <span>ประวัติการส่งข่าวล่าสุด</span>
            </div>
          }
        >
          {history.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">ยังไม่เคยส่งข่าวผ่าน LINE</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((log) => (
                <li key={log.log_id} className="py-3 space-y-1">
                  <p className="text-sm font-medium text-text-primary truncate">{log.news_title}</p>
                  <p className="text-xs text-text-secondary flex items-center justify-between">
                    <span>ส่งโดย {log.sent_by_name}</span>
                    <span className="text-text-muted">
                      {new Date(log.sent_at).toLocaleDateString('th-TH')}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;