'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SettlementLog {
  id: string;
  vendorId: string;
  vendorName?: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  vendorAmount: number;
  portoneTransferId?: string;
  status: 'pending' | 'transferred' | 'failed';
  transferredAt?: Date;
  createdAt: Date;
}

export default function SettlementManager() {
  const [settlements, setSettlements] = useState<SettlementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'transferred' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    transferred: 0,
    failed: 0,
    totalAmount: 0,
    totalCommission: 0,
  });

  useEffect(() => {
    fetchSettlements();
  }, [statusFilter]);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const settlementsRef = collection(db, 'settlement_logs');

      let q;
      if (statusFilter === 'all') {
        q = query(settlementsRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(
          settlementsRef,
          where('status', '==', statusFilter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);

      const logs: SettlementLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          vendorId: data.vendorId,
          vendorName: data.vendorName,
          orderId: data.orderId,
          orderAmount: data.orderAmount || 0,
          commission: data.commission || 0,
          vendorAmount: data.vendorAmount || 0,
          portoneTransferId: data.portoneTransferId,
          status: data.status || 'pending',
          transferredAt: data.transferredAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      setSettlements(logs);

      // 통계 계산
      const totalAmount = logs.reduce((sum, log) => sum + log.vendorAmount, 0);
      const totalCommission = logs.reduce((sum, log) => sum + log.commission, 0);

      setStats({
        total: logs.length,
        pending: logs.filter((l) => l.status === 'pending').length,
        transferred: logs.filter((l) => l.status === 'transferred').length,
        failed: logs.filter((l) => l.status === 'failed').length,
        totalAmount,
        totalCommission,
      });
    } catch (error) {
      console.error('Error fetching settlements:', error);
      toast.error('정산 내역을 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const filteredSettlements = settlements.filter(
    (settlement) =>
      settlement.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.vendorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: SettlementLog['status']) => {
    switch (status) {
      case 'transferred':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            정산완료
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            대기중
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            실패
          </span>
        );
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const headers = ['정산ID', '판매자ID', '판매자명', '주문ID', '주문금액', '수수료', '정산금액', '상태', '정산일시', '생성일시'];

    const rows = filteredSettlements.map((s) => [
      s.id,
      s.vendorId,
      s.vendorName || '',
      s.orderId,
      s.orderAmount,
      s.commission,
      s.vendorAmount,
      s.status,
      s.transferredAt ? s.transferredAt.toISOString() : '',
      s.createdAt.toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `settlements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('CSV 파일이 다운로드되었습니다');
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: '전체', value: stats.total, filter: 'all', color: 'bg-gray-100 text-gray-700' },
          { label: '대기중', value: stats.pending, filter: 'pending', color: 'bg-amber-100 text-amber-700' },
          { label: '완료', value: stats.transferred, filter: 'transferred', color: 'bg-green-100 text-green-700' },
          { label: '실패', value: stats.failed, filter: 'failed', color: 'bg-red-100 text-red-700' },
          {
            label: '총 정산액',
            value: `${(stats.totalAmount / 10000).toFixed(0)}만`,
            filter: null,
            color: 'bg-indigo-100 text-indigo-700',
          },
          {
            label: '총 수수료',
            value: `${(stats.totalCommission / 10000).toFixed(0)}만`,
            filter: null,
            color: 'bg-purple-100 text-purple-700',
          },
        ].map((stat, index) => (
          <button
            key={index}
            onClick={() => stat.filter && setStatusFilter(stat.filter as any)}
            disabled={!stat.filter}
            className={`p-4 rounded-xl font-bold text-sm transition-all ${
              statusFilter === stat.filter
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg scale-105'
                : `${stat.color} ${stat.filter ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`
            }`}
          >
            <div className="text-2xl mb-1">{stat.value}</div>
            <div className="text-xs opacity-90">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="주문ID, 판매자ID 검색..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={fetchSettlements}
          className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>

        <button
          onClick={exportToCSV}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          CSV 내보내기
        </button>
      </div>

      {/* Settlements Table */}
      {filteredSettlements.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-2 border-gray-100">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">정산 내역이 없습니다</h3>
          <p className="text-gray-600">주문이 완료되면 정산 내역이 표시됩니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">주문ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">판매자</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">주문금액</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">수수료</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">정산금액</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">정산일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSettlements.map((settlement, index) => (
                  <motion.tr
                    key={settlement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">{settlement.orderId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{settlement.vendorName || settlement.vendorId}</p>
                        <p className="text-xs text-gray-500 font-mono">{settlement.vendorId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900">{settlement.orderAmount.toLocaleString()}원</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-red-600">-{settlement.commission.toLocaleString()}원</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-green-600">{settlement.vendorAmount.toLocaleString()}원</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">{getStatusBadge(settlement.status)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {settlement.transferredAt ? (
                        <span className="text-sm text-gray-600">
                          {settlement.transferredAt.toLocaleDateString('ko-KR')}
                          <br />
                          <span className="text-xs text-gray-400">
                            {settlement.transferredAt.toLocaleTimeString('ko-KR')}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
