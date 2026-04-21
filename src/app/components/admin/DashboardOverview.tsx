import { TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import {
  getAdminDashboardStats,
  getTransactionVolumeData,
  getTopCommoditiesData,
  getUserGrowthData
} from '../../utils/supabase/admin';

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

interface TimeFilterProps {
  selected: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

function TimeFilter({ selected, onChange }: TimeFilterProps) {
  const periods: TimePeriod[] = ['weekly', 'monthly', 'yearly'];
  
  return (
    <div className="flex gap-2 mb-4">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-3 py-1.5 rounded-lg text-sm font-['Geologica:Regular',sans-serif] transition-all ${
            selected === period
              ? 'bg-[#64b900] text-white'
              : 'bg-black/5 text-black/60 hover:bg-black/10'
          }`}
          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
        >
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function DashboardOverview() {
  const [transactionPeriod, setTransactionPeriod] = useState<TimePeriod>('weekly');
  const [commodityPeriod, setCommodityPeriod] = useState<TimePeriod>('weekly');
  const [userGrowthPeriod, setUserGrowthPeriod] = useState<TimePeriod>('yearly');
  const [escrowPeriod, setEscrowPeriod] = useState<TimePeriod>('yearly');

  // Debug function
  const runDatabaseCheck = async () => {
    console.log('🔍 Running comprehensive database check...');

    try {
      // Check listings
      const { data: listings, error: listingsError, count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact' });

      console.log('📊 Listings Check:', {
        count: listingsCount,
        error: listingsError,
        sample: listings?.[0]
      });

      // Check users
      const { count: usersCount, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      console.log('👥 Users Check:', {
        count: usersCount,
        error: usersError
      });

      // Check RLS status
      const { data: rlsStatus, error: rlsError } = await supabase
        .rpc('pg_tables')
        .select('tablename, rowsecurity')
        .in('tablename', ['listings', 'user_profiles', 'orders', 'bids']);

      console.log('🔒 RLS Status:', {
        data: rlsStatus,
        error: rlsError
      });

      toast.success('Database check complete', {
        description: `Found ${listingsCount || 0} listings, ${usersCount || 0} users. Check console for details.`
      });

    } catch (error) {
      console.error('❌ Database check failed:', error);
      toast.error('Database check failed', {
        description: 'Check console for error details'
      });
    }
  };

  // Real-time stats from Supabase
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', change: '+10%', trend: 'up' as const },
    { label: 'Active Listings', value: '0', change: '+23%', trend: 'up' as const },
    { label: 'Active Auctions', value: '0', change: '-5%', trend: 'down' as const },
    { label: 'Transactions Completed', value: '0', change: '+15%', trend: 'up' as const },
    { label: 'Escrow Funds Holding', value: '₹0', change: '+8%', trend: 'up' as const },
    { label: 'Platform Revenue', value: '₹0', change: '+18%', trend: 'up' as const },
  ]);

  // Chart data with loading states
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [commodityData, setCommodityData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [escrowData, setEscrowData] = useState<any[]>([]);

  // Load dashboard stats
  useEffect(() => {
    async function loadStats() {
      console.log('📊 Loading dashboard stats...');
      const data = await getAdminDashboardStats();
      console.log('📊 Dashboard data received:', data);

      setStats([
        { label: 'Total Users', value: data.totalUsers.toLocaleString(), change: '+10%', trend: 'up' },
        { label: 'Active Listings', value: data.activeListings.toLocaleString(), change: '+23%', trend: 'up' },
        { label: 'Active Auctions', value: data.activeAuctions.toLocaleString(), change: '-5%', trend: 'down' },
        { label: 'Transactions Completed', value: data.completedTransactions.toLocaleString(), change: '+15%', trend: 'up' },
        { label: 'Escrow Funds Holding', value: `₹${data.escrowFunds.toLocaleString('en-IN')}`, change: '+8%', trend: 'up' },
        { label: 'Platform Revenue', value: `₹${Math.floor(data.platformRevenue).toLocaleString('en-IN')}`, change: '+18%', trend: 'up' },
      ]);
    }
    loadStats();
  }, []);

  // Load transaction volume data
  useEffect(() => {
    async function loadData() {
      const data = await getTransactionVolumeData(transactionPeriod);
      setTransactionData(data);
    }
    loadData();
  }, [transactionPeriod]);

  // Load commodity data
  useEffect(() => {
    async function loadData() {
      const data = await getTopCommoditiesData(commodityPeriod);
      setCommodityData(data);
    }
    loadData();
  }, [commodityPeriod]);

  // Load user growth data
  useEffect(() => {
    async function loadData() {
      const data = await getUserGrowthData(userGrowthPeriod);
      setUserGrowthData(data);
    }
    loadData();
  }, [userGrowthPeriod]);

  // Load escrow data (placeholder until proper function is implemented)
  useEffect(() => {
    // Generate placeholder data based on period
    const generateEscrowData = () => {
      if (escrowPeriod === 'weekly') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map((label, index) => ({
          id: `escrow-day-${index}`,
          label,
          amount: Math.floor(Math.random() * 50000) + 10000
        }));
      } else if (escrowPeriod === 'monthly') {
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        return weeks.map((label, index) => ({
          id: `escrow-week-${index}`,
          label,
          amount: Math.floor(Math.random() * 200000) + 50000
        }));
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((label, index) => ({
          id: `escrow-month-${index}`,
          label,
          amount: Math.floor(Math.random() * 500000) + 100000
        }));
      }
    };
    setEscrowData(generateEscrowData());
  }, [escrowPeriod]);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">
              Dashboard Overview
            </h1>
            <p
              className="font-['Geologica:Regular',sans-serif] text-black/60"
              style={{
                fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
              }}
            >
              Monitor and manage the KisanSetu marketplace platform
            </p>
          </div>
          <button
            onClick={runDatabaseCheck}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors font-['Geologica:Regular',sans-serif] text-sm"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            title="Run database diagnostics"
          >
            <AlertCircle className="w-4 h-4" />
            🔍 Debug Database
          </button>
        </div>
      </div>

      {/* Statistics Grid - 2 rows x 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={`stat-${stat.label}-${index}`}
            className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <p
              className="font-['Geologica:Regular',sans-serif] text-sm text-black/60 mb-2"
              style={{
                fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
              }}
            >
              {stat.label}
            </p>
            <p className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">
              {stat.value}
            </p>
            <p
              className={`font-['Geologica:Regular',sans-serif] text-sm flex items-center gap-1 ${
                stat.trend === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              style={{
                fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
              }}
            >
              <TrendingUp
                className={`w-4 h-4 ${stat.trend === "down" ? "rotate-180" : ""}`}
              />
              {stat.change} this week
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Transaction Volume Chart */}
        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black">
              Transaction Volume
            </h2>
          </div>
          <TimeFilter selected={transactionPeriod} onChange={setTransactionPeriod} />
          {transactionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250} key={`transaction-chart-${transactionPeriod}`}>
            <LineChart data={transactionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                id="transaction-grid"
              />
              <XAxis
                dataKey="label"
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="transaction-xaxis"
              />
              <YAxis
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="transaction-yaxis"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid #e5e5e5",
                  borderRadius: "12px",
                  fontFamily: "Geologica",
                }}
                id="transaction-tooltip"
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#64b900"
                strokeWidth={3}
                dot={{ fill: "#64b900", r: 5 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={0}
                name="Transaction Volume"
              />
            </LineChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-black/40">
              <p className="font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                No transaction data available
              </p>
            </div>
          )}
        </div>

        {/* Top Commodities Chart */}
        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black">
              Top Traded Commodities
            </h2>
          </div>
          <TimeFilter selected={commodityPeriod} onChange={setCommodityPeriod} />
          {commodityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250} key={`commodity-chart-${commodityPeriod}`}>
            <BarChart data={commodityData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                id="commodity-grid"
              />
              <XAxis
                dataKey="commodity"
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="commodity-xaxis"
              />
              <YAxis
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="commodity-yaxis"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid #e5e5e5",
                  borderRadius: "12px",
                  fontFamily: "Geologica",
                }}
                id="commodity-tooltip"
              />
              <Bar
                dataKey="count"
                fill="#64b900"
                radius={[8, 8, 0, 0]}
                isAnimationActive={true}
                animationDuration={1200}
                animationBegin={0}
                name="Commodity Count"
              />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-black/40">
              <p className="font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                No commodity data available
              </p>
            </div>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black">
              User Growth
            </h2>
          </div>
          <TimeFilter selected={userGrowthPeriod} onChange={setUserGrowthPeriod} />
          {userGrowthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250} key={`user-growth-chart-${userGrowthPeriod}`}>
            <LineChart data={userGrowthData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                id="user-growth-grid"
              />
              <XAxis
                dataKey="label"
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="user-growth-xaxis"
              />
              <YAxis
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="user-growth-yaxis"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid #e5e5e5",
                  borderRadius: "12px",
                  fontFamily: "Geologica",
                }}
                id="user-growth-tooltip"
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#64b900"
                strokeWidth={3}
                dot={{ fill: "#64b900", r: 5 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={0}
                name="User Count"
              />
            </LineChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-black/40">
              <p className="font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                No user growth data available
              </p>
            </div>
          )}
        </div>

        {/* Escrow Fund Growth Chart */}
        <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black">
              Escrow Fund Growth
            </h2>
          </div>
          <TimeFilter selected={escrowPeriod} onChange={setEscrowPeriod} />
          {escrowData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250} key={`escrow-chart-${escrowPeriod}`}>
            <AreaChart data={escrowData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient
                  id="escrowGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#64b900"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#64b900"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                id="escrow-grid"
              />
              <XAxis
                dataKey="label"
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="escrow-xaxis"
              />
              <YAxis
                stroke="#666"
                style={{
                  fontSize: "12px",
                  fontFamily: "Geologica",
                }}
                id="escrow-yaxis"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid #e5e5e5",
                  borderRadius: "12px",
                  fontFamily: "Geologica",
                }}
                id="escrow-tooltip"
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#64b900"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#escrowGradient)"
                isAnimationActive={true}
                animationDuration={1800}
                animationBegin={0}
                name="Escrow Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-black/40">
              <p className="font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                No escrow data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}