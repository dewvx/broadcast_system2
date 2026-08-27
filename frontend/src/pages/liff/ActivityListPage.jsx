import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { getActivitiesForVillager } from '../../api/villager.api';
import { Card, EmptyState, LoadingSpinner, Button, Badge } from '../../components/ui';
import { FadeStagger, FadeItem } from '../../components/motion';
import { Calendar as CalendarIcon, MapPin, AlertCircle, LogIn, ArrowRight } from 'lucide-react';

function ActivityListPage() {
  const { liff, isLiffReady, liffError, idToken } = useLiff();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        setErrorMsg('');

        let token = idToken;
        if (!token && liff && liff.isLoggedIn && liff.isLoggedIn()) {
          token = liff.getIDToken();
        }

        const res = await getActivitiesForVillager(token || 'guest');
        setActivities(res.data.data);
      } catch (err) {
        console.error('Failed to load activities:', err);
        setErrorMsg(err.response?.data?.message || 'ไม่สามารถโหลดปฏิทินกิจกรรมได้');
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [isLiffReady, liff, idToken]);

  if (loading) {
    return <LoadingSpinner text="กำลังโหลดกิจกรรม..." className="min-h-screen" />;
  }

  if (liffError) {
    return (
      <div className="p-6 text-center text-error space-y-2">
        <p className="font-bold text-body-lg">เกิดข้อผิดพลาด LIFF</p>
        <p className="text-body-sm text-text-secondary">{liffError}</p>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Card className="text-center space-y-4 py-8 w-full">
          <div className="w-14 h-14 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <LogIn className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-h3 font-bold text-text-primary">กรุณาล็อกอินผ่าน LINE</h2>
            <p className="text-body-sm text-text-secondary mt-1">เข้าสู่ระบบเพื่อดูปฏิทินกิจกรรมชุมชน</p>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              if (liff && liff.login) {
                liff.login({ redirectUri: window.location.href });
              }
            }}
          >
            เข้าสู่ระบบด้วย LINE
          </Button>
        </Card>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4 m-4 bg-error-soft border border-error/20 rounded-md text-error flex items-center gap-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-body-sm">{errorMsg}</span>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = activities.filter((a) => new Date(a.act_date) >= today);

  return (
    <FadeStagger className="p-4 pt-5 space-y-4">
      <FadeItem>
        <div>
          <h1 className="text-h2 text-text-primary">ปฏิทินกิจกรรมชุมชน</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            กิจกรรมและงานสำคัญประจำหมู่บ้าน ({activities.length} รายการ)
          </p>
        </div>
      </FadeItem>

      {activities.length === 0 ? (
        <FadeItem>
          <EmptyState
            icon={CalendarIcon}
            title="ไม่มีกิจกรรมเร็วๆ นี้"
            description="ยังไม่มีตารางกิจกรรมชุมชนในขณะนี้"
          />
        </FadeItem>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => {
            const dateObj = new Date(item.act_date);
            const dayNum = dateObj.toLocaleDateString('th-TH', { day: 'numeric' });
            const monthStr = dateObj.toLocaleDateString('th-TH', { month: 'short' });
            const yearStr = dateObj.toLocaleDateString('th-TH', { year: 'numeric' });
            const isUpcoming = new Date(item.act_date) >= today;

            return (
              <FadeItem key={item.act_id}>
                <Link to={`/liff/activities/${item.act_id}`} className="block">
                  <Card padding="none" hoverable>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[3.25rem] px-2.5 py-2 bg-primary-soft rounded-md border border-primary/20 shrink-0">
                          <p className="text-h2 font-bold leading-none text-primary">{dayNum}</p>
                          <p className="text-meta font-semibold text-primary mt-1">
                            {monthStr} {yearStr}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-text-primary text-body leading-snug line-clamp-2">
                            {item.act_title}
                          </p>
                          {item.act_location && (
                            <p className="text-body-sm text-text-secondary flex items-center gap-1 mt-1 truncate">
                              <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                              <span>{item.act_location}</span>
                            </p>
                          )}
                        </div>
                        {isUpcoming && (
                          <Badge variant="secondary" withDot>
                            กำลังจะถึง
                          </Badge>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-border flex justify-end">
                        <span className="text-body-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors duration-fast">
                          <span>ดูรายละเอียด</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </FadeItem>
            );
          })}
        </div>
      )}
    </FadeStagger>
  );
}

export default ActivityListPage;
