import { useState, useEffect } from 'react';
import { getAllVillagers } from '../../api/admin-villager.api';
import { Button, Input, Select, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import { Users, Search, Filter, ShieldAlert } from 'lucide-react';

function VillagerPage() {
  const [villagers, setVillagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('');

  useEffect(() => {
    async function fetchVillagers() {
      try {
        const res = await getAllVillagers();
        setVillagers(res.data.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }
    fetchVillagers();
  }, []);

  const zones = [...new Set(villagers.map((v) => v.zone_name).filter(Boolean))].sort();

  const filtered = villagers.filter((v) => {
    const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
    const matchSearch =
      searchTerm === '' ||
      fullName.includes(searchTerm.toLowerCase()) ||
      v.house_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchZone = filterZone === '' || v.zone_name === filterZone;
    return matchSearch && matchZone;
  });

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลลูกบ้าน..." />;

  if (errorMsg) {
    return (
      <div className="p-4 bg-error-soft border border-error/20 rounded-sm text-error text-sm flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">ข้อมูลลูกบ้าน</h1>
          <p className="text-sm text-text-secondary mt-1">
            ลูกบ้านที่ลงทะเบียนผ่าน LINE ทั้งหมด{' '}
            <strong className="text-text-primary">{villagers.length}</strong> คน
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-border p-4 rounded-md shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ นามสกุล หรือบ้านเลขที่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-surface border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
          >
            <option value="">ทุกโซน</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-md shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="ไม่พบข้อมูลลูกบ้าน"
            description="ไม่พบลูกบ้านที่ตรงกับเงื่อนไขการค้นหาในขณะนี้"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-border text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-3.5">ชื่อ LINE</th>
                  <th className="px-6 py-3.5">บ้านเลขที่</th>
                  <th className="px-6 py-3.5">โซน</th>
                  <th className="px-6 py-3.5">วันที่ลงทะเบียน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v, idx) => (
                  <tr key={v.villager_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-text-muted">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {v.first_name} {v.last_name}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{v.display_name || '—'}</td>
                    <td className="px-6 py-4 text-text-secondary">{v.house_number || '—'}</td>
                    <td className="px-6 py-4">
                      {v.zone_name ? (
                        <Badge variant="primary">{v.zone_name}</Badge>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {new Date(v.join_date).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default VillagerPage;
