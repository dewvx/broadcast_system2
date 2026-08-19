import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { getNewsDetailForVillager } from '../../api/villager.api';
import axiosClient from '../../api/axiosClient';
import { Badge, Card, LoadingSpinner, Button } from '../../components/ui';
import { Calendar, Eye, AlertCircle, Home, Newspaper, ArrowLeft, Share2 } from 'lucide-react';

function NewsDetailPage() {
  const { id } = useParams();
  const { liff, isLiffReady, liffError, idToken } = useLiff();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const handleShare = async () => {
    const shareData = {
      title: news.news_title,
      text: news.news_title,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      window.alert('คัดลอกลิงก์ข่าวแล้ว');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to share news:', error);
      }
    }
  };
  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        setErrorMsg('');

        let token = idToken;
        if (!token && liff && liff.isLoggedIn && liff.isLoggedIn()) {
          token = liff.getIDToken();
        }

        let res;
        try {
          res = await getNewsDetailForVillager(id, token || 'guest');
        } catch (apiErr) {
          console.warn('Villager news detail API failed, trying public endpoint fallback:', apiErr);
          res = await axiosClient.get(`/api/news/public/${id}`);
        }

        if (res && res.data && res.data.data) {
          setNews(res.data.data);
        } else {
          setErrorMsg(`ไม่พบข่าวสาร (ID: ${id}) ข่าวนี้อาจถูกลบหรือยังไม่ได้รับการอนุมัติ`);
        }
      } catch (err) {
        console.error('Failed to load news detail:', err);
        setErrorMsg(err.response?.data?.message || `ไม่พบข่าวสาร (ID: ${id}) ข่าวนี้อาจถูกลบหรือยังไม่ได้รับการอนุมัติ`);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [id, isLiffReady, liff, idToken]);

  if (loading) {
    return <LoadingSpinner text="กำลังโหลดเนื้อหาข่าว..." className="min-h-screen" />;
  }

  if (liffError) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
        <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex flex-col gap-2 max-w-md w-full">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>เกิดข้อผิดพลาดในการเชื่อมต่อ LINE</span>
          </div>
          <p className="text-xs text-text-secondary">{liffError}</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center max-w-md mx-auto">
        <Card className="text-center space-y-4 py-8 w-full">
          <div className="w-12 h-12 rounded-full bg-error-soft text-error mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">ไม่สามารถเปิดข่าวสารได้</h2>
            <p className="text-xs text-text-secondary mt-1">{errorMsg}</p>
          </div>
          <div className="space-y-2">
            <Link to="/liff/home" className="block w-full">
              <Button variant="primary" fullWidth icon={Home}>
                กลับสู่หน้าหลัก
              </Button>
            </Link>
            <Link to="/liff/news" className="block w-full">
              <Button variant="outline" fullWidth icon={Newspaper}>
                ดูรายการข่าวทั้งหมด
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto space-y-4">
      {/* Navigation Header Actions */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/liff/home"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary transition-colors bg-surface px-3 py-1.5 rounded-sm border border-border shadow-2xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>หน้าหลัก</span>
        </Link>

        <Link
          to="/liff/news"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors bg-surface px-3 py-1.5 rounded-sm border border-border shadow-2xs"
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>ข่าวทั้งหมด</span>
        </Link>
      </div>

      {/* Article Detail Card */}
      <Card className="space-y-4">
        {/* Category */}
        <div>
          <Badge variant="primary">{news.category_name || 'ข่าวสารชุมชน'}</Badge>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-text-primary leading-snug">{news.news_title}</h1>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-text-muted border-y border-border py-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(news.created_at).toLocaleDateString('th-TH')}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>อ่านแล้ว {news.view_count || 0} ครั้ง</span>
          </span>
        </div>

        {/* Image */}
        {news.news_image && (
          <div className="w-full aspect-video rounded-sm overflow-hidden border border-border">
            <img src={news.news_image} alt={news.news_title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
          {news.news_content}
        </div>

        {/* Bottom Back Actions */}
        <div className="pt-4 border-t border-border grid grid-cols-2 gap-2">
          <Link to="/liff/news" className="block w-full">
            <Button variant="primary" fullWidth size="sm" icon={ArrowLeft}>
              ย้อนกลับ
            </Button>
          </Link>
          <Link to="/liff/news" className="block w-full">
            <Button variant="outline" fullWidth size="sm" icon={Newspaper}>
              ดูข่าวทั้งหมด
            </Button>
          </Link>
          <Button
            variant="outline"
            fullWidth
            size="sm"
            icon={Share2}
            className="col-span-2"
            onClick={handleShare}
          >
            แชร์ข่าวนี้
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default NewsDetailPage;