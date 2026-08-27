import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { getNewsListForVillager, getActivitiesForVillager, getDocumentsForVillager } from '../../api/villager.api';
import { Badge, Card, LoadingSpinner, Button } from '../../components/ui';
import { FadeStagger, FadeItem } from '../../components/motion';
import { Calendar, FileText, ArrowRight, Megaphone, MapPin, Download } from 'lucide-react';

function SectionHeader({ icon: Icon, iconColor = 'text-primary', title, to }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-h3 font-bold text-text-primary flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span>{title}</span>
      </h2>
      <Link
        to={to}
        className="text-body-sm font-semibold text-primary hover:text-primary-hover active:text-primary-active flex items-center gap-1 transition-colors duration-fast py-1"
      >
        <span>ดูทั้งหมด</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

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
    <FadeStagger className="p-4 pt-5 space-y-7">
      {/* Welcome Banner */}
      <FadeItem>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-lg shadow-md flex items-center gap-4 relative overflow-hidden">
          <img
            src="/logo.jpg"
            alt="โลโก้หอกระจายข่าวบ้านสี่แยก"
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 shadow-md shrink-0 ring-2 ring-primary/40"
          />
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-h3 font-bold tracking-wide leading-tight">หอกระจายข่าวบ้านสี่แยก</h1>
            <p className="text-body-sm text-slate-300 leading-relaxed">
              ศูนย์รวมข่าวสาร ประกาศ กิจกรรม และแบบฟอร์มเอกสารของชุมชน
            </p>
          </div>
        </div>
      </FadeItem>

      {/* Featured / Hero News */}
      {heroNews && (
        <FadeItem>
          <section className="space-y-3">
            <SectionHeader icon={Megaphone} title="ประกาศล่าสุด" to="/liff/news" />

            <Card padding="none" hoverable className="overflow-hidden border-primary/30 shadow-sm">
              {heroNews.news_image && (
                <div className="w-full aspect-video overflow-hidden bg-slate-100 border-b border-border">
                  <img src={heroNews.news_image} alt={heroNews.news_title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 space-y-2.5">
                <Badge variant="primary">{heroNews.category_name || 'ข่าวสารทั่วไป'}</Badge>
                <h3 className="font-bold text-text-primary text-h3 leading-snug line-clamp-2">
                  {heroNews.news_title}
                </h3>
                <div className="pt-1.5 flex justify-end">
                  <Link to={`/liff/news/${heroNews.news_id}`}>
                    <Button size="md" variant="primary">
                      อ่านประกาศนี้
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        </FadeItem>
      )}

      {/* Upcoming Activities Quick View */}
      <FadeItem>
        <section className="space-y-3">
          <SectionHeader icon={Calendar} iconColor="text-secondary" title="กิจกรรมที่กำลังจะถึง" to="/liff/activities" />

          {upcomingActivities.length === 0 ? (
            <p className="text-body-sm text-text-muted bg-surface p-4 rounded-md border border-border text-center">
              ยังไม่มีกิจกรรมเร็วๆ นี้
            </p>
          ) : (
            <div className="space-y-2.5">
              {upcomingActivities.map((act) => {
                const dateObj = new Date(act.act_date);
                const dayNum = dateObj.toLocaleDateString('th-TH', { day: 'numeric' });
                const monthStr = dateObj.toLocaleDateString('th-TH', { month: 'short' });
                return (
                  <Link key={act.act_id} to={`/liff/activities/${act.act_id}`} className="block">
                    <Card padding="none" hoverable>
                      <div className="p-3.5 flex items-center gap-3.5">
                        <div className="text-center min-w-[3rem] px-2.5 py-1.5 bg-secondary-soft rounded-sm border border-secondary/20 shrink-0">
                          <p className="text-h2 leading-none font-bold text-secondary">{dayNum}</p>
                          <p className="text-meta font-semibold text-secondary mt-1">{monthStr}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-primary text-body truncate">{act.act_title}</p>
                          {act.act_location && (
                            <p className="text-body-sm text-text-secondary flex items-center gap-1 mt-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                              <span>{act.act_location}</span>
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </FadeItem>

      {/* Quick Documents View */}
      <FadeItem>
        <section className="space-y-3">
          <SectionHeader icon={FileText} iconColor="text-warning" title="แบบฟอร์มเอกสาร" to="/liff/documents" />

          {recentDocuments.length === 0 ? (
            <p className="text-body-sm text-text-muted bg-surface p-4 rounded-md border border-border text-center">
              ยังไม่มีแบบฟอร์มเอกสาร
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentDocuments.map((doc) => (
                <Card key={doc.doc_id} padding="sm" className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-text-muted shrink-0" />
                    <span className="text-body-sm font-medium text-text-primary truncate">{doc.doc_name}</span>
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
      </FadeItem>
    </FadeStagger>
  );
}

export default HomePage;
