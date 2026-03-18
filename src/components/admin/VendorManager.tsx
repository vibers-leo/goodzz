'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Vendor } from '@/types/vendor';

export default function VendorManager() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'suspended' | 'rejected'>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === 'all'
          ? '/api/admin/vendors'
          : `/api/admin/vendors?status=${statusFilter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setVendors(data.vendors);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('판매자 목록을 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (vendorId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '작업에 실패했습니다');
      }

      toast.success(
        action === 'approve'
          ? '판매자가 승인되었습니다'
          : action === 'reject'
          ? '판매자가 거부되었습니다'
          : '판매자가 정지되었습니다'
      );

      fetchVendors();
      setSelectedVendor(null);
    } catch (error: any) {
      console.error('Error handling vendor action:', error);
      toast.error(error.message || '작업 중 오류가 발생했습니다');
    }
  };

  const handleCommissionChange = async (vendorId: string, newRate: number) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commissionRate: newRate }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '수수료율 변경에 실패했습니다');
      }

      toast.success('수수료율이 변경되었습니다');
      fetchVendors();
    } catch (error: any) {
      console.error('Error updating commission:', error);
      toast.error(error.message || '수수료율 변경 중 오류가 발생했습니다');
    }
  };

  const getStatusBadge = (status: Vendor['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            승인됨
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            대기중
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            거부됨
          </span>
        );
      case 'suspended':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full flex items-center gap-1">
            <Ban className="w-3 h-3" />
            정지됨
          </span>
        );
      default:
        return null;
    }
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: '전체', value: stats.total, filter: 'all', color: 'bg-gray-100 text-gray-700' },
          { label: '대기중', value: stats.pending, filter: 'pending', color: 'bg-amber-100 text-amber-700' },
          { label: '승인됨', value: stats.approved, filter: 'approved', color: 'bg-green-100 text-green-700' },
          { label: '정지됨', value: stats.suspended, filter: 'suspended', color: 'bg-gray-100 text-gray-700' },
          { label: '거부됨', value: stats.rejected, filter: 'rejected', color: 'bg-red-100 text-red-700' },
        ].map((stat) => (
          <button
            key={stat.filter}
            onClick={() => setStatusFilter(stat.filter as any)}
            className={`p-4 rounded-xl font-bold text-sm transition-all ${
              statusFilter === stat.filter
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg scale-105'
                : `${stat.color} hover:scale-105`
            }`}
          >
            <div className="text-2xl mb-1">{stat.value}</div>
            <div className="text-xs opacity-90">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Vendors List */}
      {vendors.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-2 border-gray-100">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">판매자가 없습니다</h3>
          <p className="text-gray-600">해당 상태의 판매자가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <motion.div
              key={vendor.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {vendor.businessName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.businessName}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {vendor.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {vendor.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(vendor.status)}
                  <button
                    onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                    className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    상세
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Package className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">{vendor.stats?.totalProducts || 0}</div>
                  <div className="text-xs text-gray-600">상품</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">{vendor.stats?.totalOrders || 0}</div>
                  <div className="text-xs text-gray-600">주문</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">
                    {(vendor.stats?.totalSales || 0).toLocaleString()}원
                  </div>
                  <div className="text-xs text-gray-600">매출</div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedVendor?.id === vendor.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t-2 border-gray-100 pt-4 mt-4"
                  >
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">사업자 정보</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">대표자:</span> {vendor.ownerName}
                          </p>
                          {vendor.businessNumber && (
                            <p>
                              <span className="text-gray-600">사업자번호:</span> {vendor.businessNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">계좌 정보</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">은행:</span> {vendor.bankAccount.bankName}
                          </p>
                          <p>
                            <span className="text-gray-600">계좌번호:</span> {vendor.bankAccount.accountNumber}
                          </p>
                          <p>
                            <span className="text-gray-600">예금주:</span> {vendor.bankAccount.accountHolder}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Commission Rate */}
                    <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-indigo-900 mb-1">수수료율</h4>
                          <p className="text-2xl font-extrabold text-indigo-600">
                            {(vendor.commissionRate * 100).toFixed(0)}%
                          </p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          defaultValue={(vendor.commissionRate * 100).toFixed(0)}
                          onBlur={(e) => {
                            const newRate = parseInt(e.target.value) / 100;
                            if (newRate !== vendor.commissionRate) {
                              handleCommissionChange(vendor.id, newRate);
                            }
                          }}
                          className="w-24 px-3 py-2 bg-white border-2 border-indigo-200 rounded-xl text-center font-bold"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {vendor.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(vendor.id, 'approve')}
                          className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          승인
                        </button>
                        <button
                          onClick={() => handleAction(vendor.id, 'reject')}
                          className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          거부
                        </button>
                      </div>
                    )}

                    {vendor.status === 'approved' && (
                      <button
                        onClick={() => handleAction(vendor.id, 'suspend')}
                        className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Ban className="w-5 h-5" />
                        정지
                      </button>
                    )}

                    {vendor.status === 'suspended' && (
                      <button
                        onClick={() => handleAction(vendor.id, 'approve')}
                        className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        재승인
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
