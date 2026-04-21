import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Ban, RefreshCw, Filter } from 'lucide-react';
import { getAllTransactions } from '../../utils/supabase/admin';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export function TransactionsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    console.log('📥 Loading transactions with filter:', filterStatus);

    const { data, error } = await getAllTransactions({
      status: filterStatus
    });

    if (error) {
      toast.error('Failed to load transactions', {
        description: 'Check console for details'
      });
      console.error('❌ Error loading transactions:', error);
      setTransactions([]);
    } else {
      console.log('✅ Transactions loaded:', data?.length || 0, 'found');
      setTransactions(data || []);
    }
    setLoading(false);
  }, [filterStatus]);

  // Load transactions on mount and when filter changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Real-time subscription for transaction changes
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('📦 Order change detected:', payload);
          if (payload.eventType === 'INSERT') {
            toast.info('New transaction created');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Transaction updated');
          }
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTransactions]);

  // Filter transactions by search term
  const filteredTransactions = transactions.filter(txn => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      txn.id?.toLowerCase().includes(term) ||
      txn.buyer?.full_name?.toLowerCase().includes(term) ||
      txn.seller?.full_name?.toLowerCase().includes(term) ||
      txn.listing?.product_name?.toLowerCase().includes(term)
    );
  });

  const handleCancelTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to cancel this transaction?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', transactionId);

      if (error) throw error;

      toast.success('Transaction cancelled successfully');
      loadTransactions();
    } catch (error) {
      toast.error('Failed to cancel transaction');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_escrow':
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
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
            <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">Transactions</h1>
            <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Track all marketplace transactions
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Total Transactions
            </p>
            <p className="font-['Fraunces',sans-serif] text-2xl text-black">
              {filteredTransactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <input
              type="text"
              placeholder="Search by transaction ID, buyer, seller, or commodity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_escrow">In Escrow</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => loadTransactions()}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border-2 border-black/10 hover:border-[#64b900] hover:bg-[#64b900]/5 transition-colors disabled:opacity-50"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-5 h-5 text-black/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64b900]/10">
              <tr>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Transaction ID</th>
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
                    <p className="mt-2 text-sm text-gray-500">Loading transactions...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-[#64b900]/5 transition-colors">
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {txn.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {txn.buyer?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {txn.seller?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {txn.listing?.product_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      ₹{txn.total_amount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-['Geologica:Regular',sans-serif] ${getStatusColor(txn.status)}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {txn.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {new Date(txn.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTransaction(txn)}
                          className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors"
                          title="View Transaction"
                        >
                          <Eye className="w-4 h-4 text-black/60" />
                        </button>
                        {txn.status !== 'completed' && txn.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelTransaction(txn.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Cancel Transaction"
                          >
                            <Ban className="w-4 h-4 text-red-600" />
                          </button>
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

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedTransaction(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-1">
                  Transaction Details
                </h2>
                <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  ID: {selectedTransaction.id.substring(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-lg font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#64b900]/5 rounded-xl p-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Buyer</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {selectedTransaction.buyer?.full_name || 'N/A'}
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {selectedTransaction.buyer?.phone || 'N/A'}
                  </p>
                </div>

                <div className="bg-[#64b900]/5 rounded-xl p-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Seller</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {selectedTransaction.seller?.full_name || 'N/A'}
                  </p>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {selectedTransaction.seller?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-[#64b900]/5 rounded-xl p-4">
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Commodity</p>
                <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedTransaction.listing?.product_name || 'N/A'} - {selectedTransaction.listing?.quantity || '0'} {selectedTransaction.listing?.unit || ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#64b900]/5 rounded-xl p-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Total Amount</p>
                  <p className="font-['Fraunces',sans-serif] text-2xl text-[#64b900]">
                    ₹{selectedTransaction.total_amount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>

                <div className="bg-[#64b900]/5 rounded-xl p-4">
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-['Geologica:Regular',sans-serif] ${getStatusColor(selectedTransaction.status)}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {selectedTransaction.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="bg-[#64b900]/5 rounded-xl p-4">
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Created</p>
                <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {new Date(selectedTransaction.created_at).toLocaleString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
