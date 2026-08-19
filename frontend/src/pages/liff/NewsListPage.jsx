import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiff } from '../../context/LiffContext';
import { getNewsListForVillager, getPublicCategories } from '../../api/villager.api';
import axiosClient from '../../api/axiosClient';
import { Badge, Card, EmptyState, LoadingSpinner, Button } from '../../components/ui';
import { Newspaper, Calendar, ArrowRight, Search, AlertCircle, LogIn, Flame, Eye, Layers } from 'lucide-react';

function NewsListPage() {
  const { liff, isLiffReady, liffError, idToken } = useLiff();
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'POPULAR' | category_id
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [needLogin, setNeedLogin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMsg('');

        let token = idToken;
        if (!token && liff && liff.isLoggedIn && liff.isLoggedIn()) {
          token = liff.getIDToken();
        }

        const [newsRes, catRes] = await Promise.allSettled([
          getNewsListForVillager(token || 'guest').catch(() => axiosClient.get('/api/news/public/list')),
          getPublicCategories().catch(() => axiosClient.get('/api/category')),
        ]);

        if (newsRes.status === 'fulfilled' && newsRes.value?.data?.data) {
          setNewsList(newsRes.value.data.data);
        }
        if (catRes.status === 'fulfilled' && catRes.value?.data?.data) {
          setCategories(catRes.value.data.data);
        }
      } catch (err) {
        console.error('Failed to load news list:', err);
        setErrorMsg(err.response?.data?.message || 'ไม่สามารถโหลดรายการข่าวสารได้');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isLiffReady, liff, idToken]);

  // คัดกรองข่าวตามคำค้นหา และ หมวดหมู่ที่เลือกจากแท็บชิป
  const filteredNews = newsList
    .filter((item) => {
      // 1. ค้นหาตามคำในชื่อข่าว หรือ ชื่อหมวดหมู่
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = item.news_title.toLowerCase().includes(term);
        const matchCat = item.category_name && item.category_name.toLowerCase().includes(term);
        if (!matchTitle && !matchCat) return false;
      }

      // 2. หมวดหมู่ที่เลือกจากแท็บชิป
      if (selectedCategory === 'ALL' || selectedCategory === 'POPULAR') return true;
      return String(item.category_id) === String(selectedCategory);
    })
    .sort((a, b) => {
      // ถ้าเลือกแท็บข่าวยอดนิยม ให้เรียงตาม view_count จากมากไปน้อย
      if (selectedCategory === 'POPULAR') {
        return (b.view_count || 0) - (a.view_count || 0);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) {
    return <LoadingSpinner text="กำลังโหลดข่าวสารชุมชน..." className="min-h-screen" />;
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
      <div className="p-6 flex items-center justify-center min-h-[80vh]">
        <Card className="text-center space-y-4 py-8 w-full">
          <div className="w-12 h-12 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">กรุณาล็อกอินผ่าน LINE</h2>
            <p className="text-xs text-text-secondary mt-1">เข้าสู่ระบบเพื่ออ่านข่าวสารประกาศชุมชน</p>
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
      <div className="p-4 m-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>เกิดข้อผิดพลาดในการโหลดข่าว</span>
        </div>
        <p className="text-xs">{errorMsg}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          ลองใหม่อีกครั้ง
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">ข่าวสารและประกาศชุมชน</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          ติดตามข่าวสาร ประกาศด่วน และข้อมูลสำคัญในหมู่บ้าน ({filteredNews.length} ข่าว)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="ค้นหาข่าวสาร หรือหมวดหมู่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-xs bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Category Chips Bar (Horizontal Scrollable) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium px-0.5">
          <Layers className="w-3.5 h-3.5" />
          <span>หมวดหมู่ข่าวสาร:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none text-xs">
          {/* 1. All News Chip */}
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
              selectedCategory === 'ALL'
                ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                : 'bg-surface text-text-secondary border-border hover:bg-slate-50'
            }`}
          >
            ข่าวทั้งหมด
          </button>

          {/* 2. Popular News Chip */}
          <button
            onClick={() => setSelectedCategory('POPULAR')}
            className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1 border ${
              selectedCategory === 'POPULAR'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs font-semibold'
                : 'bg-surface text-amber-600 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>ข่าวยอดนิยม</span>
          </button>

          {/* 3. Dynamic Categories from tb_category */}
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCategory(String(cat.category_id))}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                String(selectedCategory) === String(cat.category_id)
                  ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                  : 'bg-surface text-text-secondary border-border hover:bg-slate-50'
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="ยังไม่มีข่าวสาร"
          description="ไม่พบรายการข่าวสารในหมวดหมู่นี้"
        />
      ) : (
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <Card key={item.news_id} padding="none" className="overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
              {/* Cover Image (Aspect ratio 16:9) */}
              {item.news_image && (
                <div className="w-full aspect-video overflow-hidden border-b border-border bg-slate-100">
                  <img
                    src={item.news_image}
                    alt={item.news_title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 space-y-2.5">
                {/* Category Badge & View count */}
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{item.category_name || 'ข่าวทั่วไป'}</Badge>
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>อ่านแล้ว {item.view_count || 0} ครั้ง</span>
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-bold text-text-primary text-base leading-snug line-clamp-2">
                  {item.news_title}
                </h2>

                {/* Date & Action */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.created_at).toLocaleDateString('th-TH')}</span>
                  </span>
                  <Link
                    to={`/liff/news/${item.news_id}`}
                    className="text-primary font-semibold hover:text-primary-hover flex items-center gap-1 transition-colors"
                  >
                    <span>อ่านต่อ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsListPage;
