import { useState } from 'react';
import { Shield, DollarSign, RefreshCcw, Search, ChevronDown, MoreHorizontal, Eye, Ban } from 'lucide-react';

interface Transaction {
  id: string;
  transactionId: string;
  buyer: string;
  seller: string;
  commodity: string;
  amount: number;
  escrowStatus: 'in-escrow' | 'payment-pending' | 'released' | 'awaiting-confirmation' | 'disputed';
  paymentMethod: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'TXN001',
    buyer: 'Priya Sharma',
    seller: 'Rajesh Kumar',
    commodity: 'Wheat',
    amount: 28500,
    escrowStatus: 'in-escrow',
    paymentMethod: 'UPI',
    date: '2024-03-16'
  },
  {
    id: '2',
    transactionId: 'TXN002',
    buyer: 'Anita Gupta',
    seller: 'Suresh Yadav',
    commodity: 'Rice',
    amount: 47200,
    escrowStatus: 'payment-pending',
    paymentMethod: 'UPI',
    date: '2024-03-15'
  },
  {
    id: '3',
    transactionId: 'TXN003',
    buyer: 'Sunita Devi',
    seller: 'Ramesh Patel',
    commodity: 'Cotton',
    amount: 36800,
    escrowStatus: 'released',
    paymentMethod: 'UPI',
    date: '2024-03-14'
  },
  {
    id: '4',
    transactionId: 'TXN004',
    buyer: 'Kavita Reddy',
    seller: 'Amit Singh',
    commodity: 'Corn',
    amount: 19500,
    escrowStatus: 'awaiting-confirmation',
    paymentMethod: 'UPI',
    date: '2024-03-13'
  },
  {
    id: '5',
    transactionId: 'TXN005',
    buyer: 'Priya Sharma',
    seller: 'Rajesh Kumar',
    commodity: 'Sugarcane',
    amount: 58300,
    escrowStatus: 'released',
    paymentMethod: 'Bank Transfer',
    date: '2024-03-10'
  },
  {
    id: '6',
    transactionId: 'TXN006',
    buyer: 'Manoj Yadav',
    seller: 'Vikas Sharma',
    commodity: 'Potatoes',
    amount: 24000,
    escrowStatus: 'in-escrow',
    paymentMethod: 'UPI',
    date: '2024-03-09'
  },
  {
    id: '7',
    transactionId: 'TXN007',
    buyer: 'Rakesh Kumar',
    seller: 'Deepak Patel',
    commodity: 'Tomatoes',
    amount: 15600,
    escrowStatus: 'disputed',
    paymentMethod: 'Card',
    date: '2024-03-08'
  },
  {
    id: '8',
    transactionId: 'TXN008',
    buyer: 'Neha Singh',
    seller: 'Arun Kumar',
    commodity: 'Onions',
    amount: 12300,
    escrowStatus: 'released',
    paymentMethod: 'Net Banking',
    date: '2024-03-05'
  }
];

export function TransactionEscrowManagement() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-escrow' | 'released' | 'pending' | 'disputed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState('this-month');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getEscrowStatusBadge = (status: string) => {
    const styles = {
      'in-escrow': 'bg-blue-100 text-blue-700',
      'payment-pending': 'bg-yellow-100 text-yellow-700',
      'released': 'bg-green-100 text-green-700',
      'awaiting-confirmation': 'bg-orange-100 text-orange-700',
      'disputed': 'bg-red-100 text-red-700'
    };

    const labels = {
      'in-escrow': 'Funds in Escrow',
      'payment-pending': 'Payment Pending',
      'released': 'Funds Released',
      'awaiting-confirmation': 'Awaiting Buyer Confirmation',
      'disputed': 'Disputed'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium ${styles[status as keyof typeof styles]}`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'in-escrow' && transaction.escrowStatus === 'in-escrow') ||
      (filterStatus === 'released' && transaction.escrowStatus === 'released') ||
      (filterStatus === 'pending' && (transaction.escrowStatus === 'payment-pending' || transaction.escrowStatus === 'awaiting-confirmation')) ||
      (filterStatus === 'disputed' && transaction.escrowStatus === 'disputed');
    
    const matchesSearch = searchQuery === '' ||
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.commodity.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalInEscrow = mockTransactions
    .filter(t => t.escrowStatus === 'in-escrow')
    .reduce((sum, t) => sum + t.amount, 0);

  const releasedToday = mockTransactions
    .filter(t => t.escrowStatus === 'released' && t.date === '2024-03-16')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = mockTransactions
    .filter(t => t.escrowStatus === 'payment-pending' || t.escrowStatus === 'awaiting-confirmation')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-['Fraunces',sans-serif] text-3xl text-gray-900 font-semibold mb-2">
          Transaction & Escrow Management
        </h1>
        <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Combine totals and manage more transactions and escrow payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Total in Escrow
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {formatCurrency(totalInEscrow)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#64b900]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#64b900]" />
            </div>
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Released Today
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {formatCurrency(releasedToday)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Pending
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-red-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Status Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#64b900] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('in-escrow')}
              className={`px-4 py-2 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === 'in-escrow'
                  ? 'bg-[#64b900] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Escrow
            </button>
            <button
              onClick={() => setFilterStatus('released')}
              className={`px-4 py-2 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === 'released'
                  ? 'bg-[#64b900] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Released
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === 'pending'
                  ? 'bg-[#64b900] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('disputed')}
              className={`px-4 py-2 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === 'disputed'
                  ? 'bg-[#64b900] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Disputed
            </button>
          </div>

          <div className="flex gap-3 ml-auto">
            {/* Time Period Dropdown */}
            <div className="relative">
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:outline-none focus:border-[#64b900] cursor-pointer"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:outline-none focus:border-[#64b900] w-64"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Order ID
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Buyer
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Seller
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Commodity
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Amount
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Escrow Status
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Payment Mode
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Date
                </th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm font-semibold text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {transaction.transactionId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {transaction.buyer}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {transaction.seller}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {transaction.commodity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getEscrowStatusBadge(transaction.escrowStatus)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {transaction.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {transaction.escrowStatus === 'awaiting-confirmation' && (
                        <>
                          <button className="px-3 py-1.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-xs font-medium">
                            Release
                          </button>
                          <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-['Geologica:Regular',sans-serif] text-xs font-medium">
                            Refund
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Ban className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="font-['Geologica:Regular',sans-serif] text-gray-500" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              No transactions found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}