import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { getActivityDetailForVillager } from '../../api/villager.api';
import axiosClient from '../../api/axiosClient';
import { Badge, Card, LoadingSpinner, Button } from '../../components/ui';
import { Calendar, MapPin, User, AlertCircle, ArrowLeft, Home, Share2, Clock, FileText } from 'lucide-react';

function ActivityDetailPage() {
  const { id } = useParams();
  const { liff, isLiffReady, liffError, idToken } = useLiff();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        setErrorMsg('');

        let token = idToken;
        if (!token && liff && liff.isLoggedIn && liff.isLoggedIn()) {
          token = liff.getIDToken();
        }

        let res;
        try {
          res = await getActivityDetailForVillager(id, token || 'guest');
        } catch (apiErr) {
          res = await axiosClient.get(`/api/villager/activities/public/${id}`);
        }

        if (res && res.data && res.data.data) {
          setActivity(res.data.data);
        } else {
          setErrorMsg('ไม่พบข้อมูลกิจกรรมนี้');
        }
      } catch (err) {
        console.error('Failed to load activity detail:', err);
        setErrorMsg(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [id, isLiffReady, liff, idToken]);

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: activity?.act_title || 'กิจกรรมชุมชน',
          text: `กิจกรรม: ${activity?.act_title} วันที่: ${
            activity?.act_date ? new Date(activity.act_date).toLocaleDateString('th-TH') : ''
          } สถานที่: ${activity?.act_location}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('คัดลอกลิงก์กิจกรรมเรียบร้อยแล้ว');
    }
  }

  if (loading) return <LoadingSpinner text="กำลังโหลดรายละเอียดกิจกรรม..." className="min-h-screen" />;

  if (liffError) {
    return (
      <div className="p-6 text-center text-error space-y-2">
        <p className="font-bold">เกิดข้อผิดพลาด LIFF</p>
        <p className="text-xs text-text-secondary">{liffError}</p>
      </div>
    );
  }

  if (errorMsg || !activity) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center max-w-md mx-auto">
        <Card className="text-center space-y-4 py-8 w-full">
          <div className="w-12 h-12 rounded-full bg-error-soft text-error mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">ไม่พบข้อมูลกิจกรรม</h2>
            <p className="text-xs text-text-secondary mt-1">{errorMsg}</p>
          </div>
          <div className="space-y-2">
            <Link to="/liff/activities" className="block w-full">
              <Button variant="primary" fullWidth icon={ArrowLeft}>
                ย้อนกลับไปปฏิทินกิจกรรม
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const actDateObj = new Date(activity.act_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isUpcoming = actDateObj >= today;

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto space-y-4">
      {/* Top Back Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/liff/activities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors bg-surface px-3 py-1.5 rounded-sm border border-border shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ากิจกรรม</span>
        </Link>

        <Button size="sm" variant="ghost" icon={Share2} onClick={handleShare} title="แชร์กิจกรรม">
          แชร์
        </Button>
      </div>

      {/* Main Detail Card */}
      <Card className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant={isUpcoming ? 'success' : 'default'}>
            {isUpcoming ? 'กิจกรรมกำลังจะถึง' : 'ผ่านไปแล้ว'}
          </Badge>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{actDateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-text-primary leading-snug">{activity.act_title}</h1>

        {/* Date & Location Highlight Box */}
        <div className="bg-slate-50 p-4 rounded-sm border border-border space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary-soft text-secondary flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">วันเวลาจัดกิจกรรม</p>
              <p className="text-text-secondary mt-0.5">
                {actDateObj.toLocaleDateString('th-TH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-border/60">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">สถานที่จัดกิจกรรม</p>
              <p className="text-text-secondary mt-0.5">{activity.act_location}</p>
            </div>
          </div>

          {activity.created_by_name && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/60 text-text-muted text-[11px]">
              <User className="w-3.5 h-3.5" />
              <span>ผู้ลงข้อมูลกิจกรรม: {activity.created_by_name}</span>
            </div>
          )}
        </div>

        {/* Detailed Activity Content */}
        {activity.act_content && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              <span>รายละเอียดกิจกรรมเพิ่มเติม</span>
            </h2>
            <div className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap bg-surface p-3 rounded-sm border border-border">
              {activity.act_content}
            </div>
          </div>
        )}

        {/* Bottom Navigation Actions */}
        <div className="pt-4 border-t border-border grid grid-cols-2 gap-2">
          <Link to="/liff/activities" className="block w-full">
            <Button variant="secondary" fullWidth size="sm" icon={ArrowLeft}>
              ปฏิทินกิจกรรม
            </Button>
          </Link>
          <Link to="/liff/home" className="block w-full">
            <Button variant="outline" fullWidth size="sm" icon={Home}>
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default ActivityDetailPage;
