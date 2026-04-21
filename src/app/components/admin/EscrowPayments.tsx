import { useState, useEffect, useCallback } from 'react';
import { Search, DollarSign, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import { getEscrowPayments, releaseFunds } from '../../utils/supabase/admin';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export function EscrowPayments() {
  const [escrowPayments, setEscrowPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalInEscrow: 0,
    releasedToday: 0,
    pending: 0
  });

  const loadEscrowPayments = useCallback(async () => {
    setLoading(true);
    console.log('📥 Loading escrow payments...');

    const { data, error } = await getEscrowPayments();

    if (error) {
      toast.error('Failed to load escrow payments', {
        description: 'Check console for details'
      });
      console.error('❌ Error loading escrow payments:', error);
      setEscrowPayments([]);
    } else {
      console.log('✅ Escrow payments loaded:', data?.length || 0, 'found');
      setEscrowPayments(data || []);

      // Calculate stats
      const totalInEscrow = (data || [])
        .filter(p => p.status === 'in_escrow' || p.status === 'pending')
        .reduce((sum, p) => sum + (p.total_amount || 0), 0);

      const today = new Date().toISOString().split('T')[0];
      const releasedToday = (data || [])
        .filter(p => p.status === 'completed' && p.escrow_released_at?.startsWith(today))
        .reduce((sum, p) => sum + (p.total_amount || 0), 0);

      const pending = (data || [])
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.total_amount || 0), 0);

      setStats({
        totalInEscrow,
        releasedToday,
        pending
      });
    }
    setLoading(false);
  }, []);

  // Load escrow payments on mount
  useEffect(() => {
    loadEscrowPayments();
  }, [loadEscrowPayments]);

  // Real-time subscription for order changes
  useEffect(() => {
    const channel = supabase
      .channel('escrow-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('💰 Escrow change detected:', payload);
          if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            if (newRecord.status === 'completed' && newRecord.escrow_released_at) {
              toast.success('Funds released successfully');
            }
          }
          loadEscrowPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadEscrowPayments]);

  // Filter escrow payments by search term
  const filteredPayments = escrowPayments.filter(payment => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      payment.id?.toLowerCase().includes(term) ||
      payment.buyer?.full_name?.toLowerCase().includes(term) ||
      payment.seller?.full_name?.toLowerCase().includes(term) ||
      payment.listing?.product_name?.toLowerCase().includes(term)
    );
  });

  const handleReleaseFunds = async (orderId: string, sellerName: string) => {
    if (!confirm(`Release funds to ${sellerName}?`)) return;

    try {
      const { success, error } = await releaseFunds(orderId);

      if (error || !success) {
        throw error;
      }

      toast.success('Funds released successfully', {
        description: `Funds have been released to ${sellerName}`
      });

      // Update local state immediately
      setEscrowPayments(payments =>
        payments.map(p =>
          p.id === orderId
            ? { ...p, status: 'completed', escrow_released_at: new Date().toISOString() }
            : p
        )
      );

      // Reload to get accurate stats
      setTimeout(() => loadEscrowPayments(), 500);
    } catch (error) {
      toast.error('Failed to release funds');
      console.error(error);
    }
  };

  const handleRefund = async (orderId: string, buyerName: string) => {
    if (!confirm(`Issue refund to ${buyerName}?`)) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          escrow_released_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Refund processed successfully', {
        description: `Funds have been refunded to ${buyerName}`
      });

      // Update local state
      setEscrowPayments(payments =>
        payments.filter(p => p.id !== orderId)
      );

      loadEscrowPayments();
    } catch (error) {
      toast.error('Failed to process refund');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_escrow':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">Escrow Payments</h1>
            <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Monitor and manage escrow payment system
            </p>
          </div>
          <button
            onClick={() => loadEscrowPayments()}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border-2 border-black/10 hover:border-[#64b900] hover:bg-[#64b900]/5 transition-colors disabled:opacity-50"
            title="Refresh escrow payments"
          >
            <RefreshCw className={`w-5 h-5 text-black/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-[#64b900]" />
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Total in Escrow</p>
          </div>
          <p className="font-['Fraunces',sans-serif] text-3xl text-black">
            ₹{stats.totalInEscrow.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Released Today</p>
          </div>
          <p className="font-['Fraunces',sans-serif] text-3xl text-green-600">
            ₹{stats.releasedToday.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Pending</p>
          </div>
          <p className="font-['Fraunces',sans-serif] text-3xl text-orange-600">
            ₹{stats.pending.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
          <input
            type="text"
            placeholder="Search by escrow ID, buyer, seller, or commodity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          />
        </div>
      </div>

      {/* Escrow Payments Table */}
      <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64b900]/10">
              <tr>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Escrow ID</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Buyer</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Seller</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Commodity</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Amount</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Date</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#64b900] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading escrow payments...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No escrow payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((escrow) => (
                  <tr key={escrow.id} className="hover:bg-[#64b900]/5 transition-colors">
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {escrow.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {escrow.buyer?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {escrow.seller?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {escrow.listing?.product_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      ₹{escrow.total_amount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-['Geologica:Regular',sans-serif] ${getStatusColor(escrow.status)}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {escrow.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {new Date(escrow.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {escrow.status !== 'completed' && escrow.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleReleaseFunds(escrow.id, escrow.seller?.full_name || 'seller')}
                              className="px-3 py-1.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors text-xs font-['Geologica:Regular',sans-serif]"
                              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                            >
                              Release
                            </button>
                            <button
                              onClick={() => handleRefund(escrow.id, escrow.buyer?.full_name || 'buyer')}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-['Geologica:Regular',sans-serif]"
                              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                            >
                              Refund
                            </button>
                          </>
                        )}
                        {escrow.status === 'completed' && (
                          <span className="px-3 py-1.5 text-green-600 text-xs font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            ✓ Released
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
