import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getTopNews, getBroadcastHistory } from '../../api/report.api';
import { Card, LoadingSpinner } from '../../components/ui';
import { FadeStagger, FadeItem } from '../../components/motion';
import { Newspaper, Users, Radio, Eye, TrendingUp, Send, AlertCircle } from 'lucide-react';

function StatCard({ label, value, icon: Icon, colorClass, bgClass }) {
  return (
    <Card padding="sm" hoverable className="relative overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body-sm font-medium text-text-secondary truncate">{label}</p>
          <p className={`text-h1 mt-1 ${colorClass}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-md ${bgClass} flex items-center justify-center ${colorClass} shrink-0`}>
          <Icon className="w-6 h-6" />
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
      <div className="p-4 bg-error-soft border border-error/20 rounded-md text-error flex items-center gap-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-body-sm">{errorMsg}</span>
      </div>
    );
  }

  return (
    <FadeStagger className="space-y-8">
      {/* Header */}
      <FadeItem>
        <div>
          <h1 className="text-h1 text-text-primary">ภาพรวมระบบ</h1>
          <p className="text-body text-text-secondary mt-1">สรุปสถานะการทำงานและสถิติข้อมูลสำคัญในชุมชน</p>
        </div>
      </FadeItem>

      {/* Summary Cards Grid */}
      <FadeItem>
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
            colorClass="text-warning-hover"
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
      </FadeItem>

      {/* Two Column Grid */}
      <FadeItem>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Viewed News */}
          <Card
            header={
              <span className="flex items-center gap-2.5">
                <TrendingUp className="w-[18px] h-[18px] text-primary" />
                ข่าวยอดนิยม (เข้าชมมากสุด)
              </span>
            }
          >
            {topNews.length === 0 ? (
              <p className="text-text-muted text-body-sm py-4 text-center">ยังไม่มีข้อมูลข่าวสาร</p>
            ) : (
              <ul className="divide-y divide-border -my-2">
                {topNews.map((item) => (
                  <li key={item.news_id} className="py-3 flex items-center justify-between gap-4">
                    <Link
                      to={`/admin/news/edit/${item.news_id}`}
                      className="text-body-sm font-medium text-text-primary hover:text-primary active:text-primary-active transition-colors duration-fast truncate py-1"
                    >
                      {item.news_title}
                    </Link>
                    <span className="inline-flex items-center gap-1.5 text-meta font-semibold text-text-secondary bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
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
              <span className="flex items-center gap-2.5">
                <Send className="w-[18px] h-[18px] text-success" />
                ประวัติการส่งข่าวล่าสุด
              </span>
            }
          >
            {history.length === 0 ? (
              <p className="text-text-muted text-body-sm py-4 text-center">ยังไม่เคยส่งข่าวผ่าน LINE</p>
            ) : (
              <ul className="divide-y divide-border -my-2">
                {history.map((log) => (
                  <li key={log.log_id} className="py-3 space-y-1">
                    <p className="text-body-sm font-medium text-text-primary truncate">{log.news_title}</p>
                    <p className="text-meta text-text-secondary flex items-center justify-between">
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
      </FadeItem>
    </FadeStagger>
  );
}

export default DashboardPage;
