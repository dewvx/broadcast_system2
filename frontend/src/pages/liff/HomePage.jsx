import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { getNewsListForVillager, getActivitiesForVillager, getDocumentsForVillager } from '../../api/villager.api';
import { Badge, Card, LoadingSpinner, Button } from '../../components/ui';
import { Newspaper, Calendar, FileText, ArrowRight, Radio, Megaphone, MapPin, Download } from 'lucide-react';

function HomePage() {
  const { liff, isLiffReady, idToken } = useLiff();
  const [latestNews, setLatestNews] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const token = idToken || (liff?.getIDToken ? liff.getIDToken() : 'guest');

        const [newsRes, actRes, docRes] = await Promise.allSettled([
          getNewsListForVillager(token),
          getActivitiesForVillager(token),
          getDocumentsForVillager(token),
        ]);

        if (newsRes.status === 'fulfilled' && newsRes.value?.data?.data) {
          setLatestNews(newsRes.value.data.data.slice(0, 3));
        }
        if (actRes.status === 'fulfilled' && actRes.value?.data?.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcoming = actRes.value.data.data
            .filter((a) => new Date(a.act_date) >= today)
            .slice(0, 2);
          setUpcomingActivities(upcoming);
        }
        if (docRes.status === 'fulfilled' && docRes.value?.data?.data) {
          setRecentDocuments(docRes.value.data.data.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isLiffReady, liff, idToken]);

  if (loading) return <LoadingSpinner text="กำลังโหลดหน้าหลัก..." className="min-h-screen" />;

  const heroNews = latestNews[0];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-md shadow-sm space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-primary/20 text-primary rounded-sm">
            <Radio className="w-5 h-5" />
          </span>
          <h1 className="text-base font-bold tracking-wide">ยินดีต้อนรับสู่หอกระจายข่าว</h1>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          ศูนย์รวมข้อมูลข่าวสาร ประกาศด่วน กิจกรรม และแบบฟอร์มเอกสารประจำหมู่บ้าน
        </p>
      </div>

      {/* Featured / Hero News */}
      {heroNews && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-primary" />
              <span>ประกาศล่าสุด</span>
            </h2>
            <Link to="/liff/news" className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5">
              <span>ดูข่าวทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card padding="none" className="overflow-hidden border-primary/30 shadow-xs">
            {heroNews.news_image && (
              <div className="w-full aspect-video overflow-hidden bg-slate-100 border-b border-border">
                <img src={heroNews.news_image} alt={heroNews.news_title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <Badge variant="primary">{heroNews.category_name || 'ข่าวสารทั่วไป'}</Badge>
              <h3 className="font-bold text-text-primary text-base leading-snug line-clamp-2">
                {heroNews.news_title}
              </h3>
              <div className="pt-2 flex justify-end">
                <Link to={`/liff/news/${heroNews.news_id}`}>
                  <Button size="sm" variant="primary">
                    อ่านประกาศนี้
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Upcoming Activities Quick View */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-secondary" />
            <span>กิจกรรมที่กำลังจะถึง</span>
          </h2>
          <Link to="/liff/activities" className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5">
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingActivities.length === 0 ? (
          <p className="text-xs text-text-muted bg-surface p-4 rounded-md border border-border text-center">
            ยังไม่มีกิจกรรมเร็วๆ นี้
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingActivities.map((act) => {
              const dateObj = new Date(act.act_date);
              const dayNum = dateObj.toLocaleDateString('th-TH', { day: 'numeric' });
              const monthStr = dateObj.toLocaleDateString('th-TH', { month: 'short' });
              return (
                <Card key={act.act_id} padding="none">
                  <div className="p-3 flex items-center gap-3">
                    <div className="text-center min-w-[2.5rem] px-2 py-1 bg-secondary-soft rounded-sm border border-secondary/20 shrink-0">
                      <p className="text-lg font-bold leading-none text-secondary">{dayNum}</p>
                      <p className="text-[10px] font-semibold text-secondary mt-0.5">{monthStr}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary text-xs truncate">{act.act_title}</p>
                      {act.act_location && (
                        <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                          <span>{act.act_location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Documents View */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-warning" />
            <span>เอกสารและแบบฟอร์มด่วน</span>
          </h2>
          <Link to="/liff/documents" className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5">
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDocuments.length === 0 ? (
          <p className="text-xs text-text-muted bg-surface p-4 rounded-md border border-border text-center">
            ยังไม่มีแบบฟอร์มเอกสาร
          </p>
        ) : (
          <div className="space-y-2">
            {recentDocuments.map((doc) => (
              <Card key={doc.doc_id} padding="sm" className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="text-xs font-medium text-text-primary truncate">{doc.doc_name}</span>
                </div>
                <a href={doc.doc_file_path} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Button size="sm" variant="outline" icon={Download}>
                    ดาวน์โหลด
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
