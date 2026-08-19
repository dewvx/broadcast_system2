import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { getActivitiesForVillager } from '../../api/villager.api';
import { Card, EmptyState, LoadingSpinner, Button } from '../../components/ui';
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
        <p className="font-bold">เกิดข้อผิดพลาด LIFF</p>
        <p className="text-xs text-text-secondary">{liffError}</p>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Card className="text-center space-y-4 py-8 w-full">
          <div className="w-12 h-12 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">กรุณาล็อกอินผ่าน LINE</h2>
            <p className="text-xs text-text-secondary mt-1">เข้าสู่ระบบเพื่อดูปฏิทินกิจกรรมชุมชน</p>
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
      <div className="p-4 m-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = activities.filter((a) => new Date(a.act_date) >= today);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">ปฏิทินกิจกรรมชุมชน</h1>
        <p className="text-xs text-text-secondary mt-0.5">กิจกรรมและงานสำคัญประจำหมู่บ้าน ({activities.length} รายการ)</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="ไม่มีกิจกรรมเร็วๆ นี้"
          description="ยังไม่มีตารางกิจกรรมชุมชนในขณะนี้"
        />
      ) : (
        <div className="space-y-3">
          {activities.map((item) => {
            const dateObj = new Date(item.act_date);
            const dayNum = dateObj.toLocaleDateString('th-TH', { day: 'numeric' });
            const monthStr = dateObj.toLocaleDateString('th-TH', { month: 'short' });
            const yearStr = dateObj.toLocaleDateString('th-TH', { year: 'numeric' });

            return (
              <Card key={item.act_id} padding="none" className="border-primary/30 shadow-xs hover:shadow-sm transition-shadow">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[2.75rem] px-2 py-1.5 bg-primary-soft rounded-sm border border-primary/20 shrink-0">
                      <p className="text-xl font-bold leading-none text-primary">{dayNum}</p>
                      <p className="text-[10px] font-semibold text-primary mt-0.5">
                        {monthStr} {yearStr}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary text-sm leading-snug">{item.act_title}</p>
                      {item.act_location && (
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span>{item.act_location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <Link
                      to={`/liff/activities/${item.act_id}`}
                      className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                    >
                      <span>ดูรายละเอียด</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivityListPage;
