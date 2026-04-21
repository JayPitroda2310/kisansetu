import { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Package, Download, FileText, ChevronDown } from 'lucide-react';

const commodityData = [
  { id: 'wheat', commodity: 'Wheat', count: 145 },
  { id: 'rice', commodity: 'Rice', count: 123 },
  { id: 'cotton', commodity: 'Cotton', count: 98 },
  { id: 'corn', commodity: 'Corn', count: 87 },
  { id: 'sugarcane', commodity: 'Sugarcane', count: 76 },
];

const monthlyData = [
  { id: 'jan', month: 'Jan', value: 450000 },
  { id: 'feb', month: 'Feb', value: 580000 },
  { id: 'mar', month: 'Mar', value: 720000 },
  { id: 'apr', month: 'Apr', value: 890000 },
  { id: 'may', month: 'May', value: 1050000 },
  { id: 'jun', month: 'Jun', value: 1245000 },
];

const topFarmers = [
  { id: 'farmer-1', name: 'Rajesh Kumar', listings: 25, transactions: 89, revenue: '₹4,56,000' },
  { id: 'farmer-2', name: 'Suresh Yadav', listings: 20, transactions: 67, revenue: '₹3,45,000' },
  { id: 'farmer-3', name: 'Ramesh Patel', listings: 18, transactions: 52, revenue: '₹2,89,000' },
];

const topBuyers = [
  { id: 'buyer-1', name: 'Priya Sharma', purchases: 45, spent: '₹5,67,000' },
  { id: 'buyer-2', name: 'Anita Gupta', purchases: 38, spent: '₹4,23,000' },
  { id: 'buyer-3', name: 'Sunita Devi', purchases: 32, spent: '₹3,45,000' },
];

// Data sections available for download
const dataSections = [
  { id: 'user-management', label: 'User Management Data', icon: Users },
  { id: 'transactions', label: 'Transaction Records', icon: TrendingUp },
  { id: 'commodity-listings', label: 'Commodity Listings', icon: Package },
  { id: 'escrow-payments', label: 'Escrow Payments', icon: TrendingUp },
  { id: 'disputes', label: 'Dispute Records', icon: FileText },
  { id: 'fraud-detection', label: 'Fraud Detection Logs', icon: FileText },
  { id: 'top-performers', label: 'Top Performers Report', icon: TrendingUp },
  { id: 'revenue-analytics', label: 'Revenue Analytics', icon: TrendingUp },
  { id: 'platform-overview', label: 'Platform Overview', icon: FileText },
];

export function ReportsAnalytics() {
  const [selectedSection, setSelectedSection] = useState('user-management');
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  const handleDownloadCSV = () => {
    // In real implementation, this would generate and download CSV
    const section = dataSections.find(s => s.id === selectedSection);
    alert(`Downloading ${section?.label} as CSV...`);
    setDownloadDropdownOpen(false);
  };

  const handleDownloadPDF = () => {
    // In real implementation, this would generate and download PDF
    const section = dataSections.find(s => s.id === selectedSection);
    alert(`Downloading ${section?.label} as PDF...`);
    setDownloadDropdownOpen(false);
  };

  const selectedSectionData = dataSections.find(s => s.id === selectedSection);

  return (
    <div className="space-y-6">
      {/* Header with Download Options */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-['Fraunces',sans-serif] text-3xl text-gray-900 font-semibold mb-2">
            Reports & Analytics
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Platform insights and performance metrics
          </p>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-gradient-to-r from-[#64b900]/10 to-green-50 rounded-xl border-2 border-[#64b900]/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#64b900] rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold">
              Download Reports
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Export data from various sections in CSV or PDF format
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          {/* Section Selector */}
          <div className="flex-1">
            <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-700 mb-2">
              Select Data Section
            </label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-white border-2 border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:outline-none focus:border-[#64b900] cursor-pointer"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                {dataSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-6 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#64b900] text-[#64b900] rounded-lg hover:bg-[#64b900]/5 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Selected Section Info */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            {selectedSectionData && (
              <>
                <selectedSectionData.icon className="w-4 h-4 text-[#64b900]" />
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <span className="font-medium">Selected:</span> {selectedSectionData.label}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Total Users
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                2,847
              </p>
            </div>
          </div>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-green-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            +12% from last month
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Active Listings
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                529
              </p>
            </div>
          </div>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-green-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            +8% from last month
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#64b900]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#64b900]" />
            </div>
            <div>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Monthly Revenue
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                ₹12.45L
              </p>
            </div>
          </div>
          <p className="font-['Geologica:Regular',sans-serif] text-xs text-green-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            +18% from last month
          </p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#64b900]" />
          Revenue Trend (Last 6 Months)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" key="revenue-chart-container">
            <LineChart data={monthlyData} id="revenue-line-chart">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" id="revenue-grid" />
              <XAxis 
                dataKey="month" 
                tick={{ fontFamily: 'Geologica', fontSize: 12 }}
                stroke="#6b7280"
                id="revenue-xaxis"
              />
              <YAxis 
                tick={{ fontFamily: 'Geologica', fontSize: 12 }}
                stroke="#6b7280"
                id="revenue-yaxis"
              />
              <Tooltip 
                contentStyle={{ 
                  fontFamily: 'Geologica', 
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
                id="revenue-tooltip"
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#64b900" 
                strokeWidth={3}
                dot={{ fill: '#64b900', r: 5 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={0}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commodity Distribution */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-[#64b900]" />
          Top Commodities by Listings
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" key="commodity-chart-container">
            <BarChart data={commodityData} id="commodity-bar-chart">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" id="commodity-grid" />
              <XAxis 
                dataKey="commodity" 
                tick={{ fontFamily: 'Geologica', fontSize: 12 }}
                stroke="#6b7280"
                id="commodity-xaxis"
              />
              <YAxis 
                tick={{ fontFamily: 'Geologica', fontSize: 12 }}
                stroke="#6b7280"
                id="commodity-yaxis"
              />
              <Tooltip 
                contentStyle={{ 
                  fontFamily: 'Geologica', 
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
                id="commodity-tooltip"
              />
              <Bar dataKey="count" fill="#64b900" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={1200} animationBegin={0} name="Commodity Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#64b900]" />
            Top Farmers
          </h2>
          <div className="space-y-3">
            {topFarmers.map((farmer) => (
              <div key={farmer.id} className="flex items-center justify-between p-4 bg-[#64b900]/5 rounded-xl border border-[#64b900]/10">
                <div>
                  <p className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{farmer.name}</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {farmer.listings} listings • {farmer.transactions} transactions
                  </p>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{farmer.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#64b900]" />
            Top Buyers
          </h2>
          <div className="space-y-3">
            {topBuyers.map((buyer) => (
              <div key={buyer.id} className="flex items-center justify-between p-4 bg-[#64b900]/5 rounded-xl border border-[#64b900]/10">
                <div>
                  <p className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{buyer.name}</p>
                  <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {buyer.purchases} purchases
                  </p>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{buyer.spent}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}