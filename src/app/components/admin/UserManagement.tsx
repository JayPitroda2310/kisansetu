import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, CheckCircle, Ban, Mail, MapPin, Package, DollarSign } from 'lucide-react';
import { getAllUsers } from '../../utils/supabase/admin';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string;
  location: string;
  role: string;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  total_transactions: number;
  rating: number;
  created_at: string;
  // Computed field
  total_listings?: number;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerification, setFilterVerification] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getAllUsers({
      searchTerm,
      verification: filterVerification as any
    });

    if (error) {
      toast.error('Failed to load users');
      console.error(error);
    } else {
      // Get listings count for each user
      const usersWithCounts = await Promise.all(
        data.map(async (user: any) => {
          const { count } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', user.id);

          return {
            ...user,
            total_listings: count || 0,
          };
        })
      );
      setUsers(usersWithCounts);
    }
    setLoading(false);
  }, [searchTerm, filterVerification]);

  // Load users on mount and when filters change (with debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300); // 300ms debounce for search

    return () => clearTimeout(timer);
  }, [loadUsers]);

  const filteredUsers = users;

  const handleToggleSuspend = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Toggle between verified and rejected as a way to suspend/activate
    // Since there's no status column, we use kyc_status
    const newKycStatus = user.kyc_status === 'verified' ? 'rejected' : 'verified';

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ kyc_status: newKycStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${newKycStatus === 'rejected' ? 'suspended' : 'activated'} successfully`);

      // Update selectedUser state if this user is currently selected
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          kyc_status: newKycStatus
        });
      }

      // Update the users list
      setUsers(users.map(u =>
        u.id === userId ? { ...u, kyc_status: newKycStatus } : u
      ));
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    // Update kyc_status to 'verified'
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ kyc_status: 'verified' })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User verified successfully');

      // Update selectedUser state if this user is currently selected
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          kyc_status: 'verified'
        });
      }

      // Update the users list
      setUsers(users.map(user =>
        user.id === userId ? { ...user, kyc_status: 'verified' as const } : user
      ));
    } catch (error) {
      toast.error('Failed to verify user');
      console.error(error);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">
          User Management
        </h1>
        <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Manage farmers and buyers on the platform
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <input
              type="text"
              placeholder="Search by name or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
          </div>

          {/* Verification Filter */}
          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64b900]/10">
              <tr>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>User ID</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Name</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Location</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Verification</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Listings</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Transactions</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[#64b900] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#64b900]/5 transition-colors">
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{user.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{user.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{user.location || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {user.kyc_status === 'verified' ? (
                        <span className="flex items-center gap-1 text-green-600 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{user.total_listings || 0}</td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{user.total_transactions || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-['Geologica:Regular',sans-serif] ${
                        user.kyc_status === 'verified' ? 'bg-green-100 text-green-700' :
                        user.kyc_status === 'rejected' ? 'bg-red-100 text-red-700' :
                        user.kyc_status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {user.kyc_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-[#64b900]/10 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4 text-black/60" />
                        </button>
                        {user.kyc_status !== 'verified' && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Verify User"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleSuspend(user.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title={user.kyc_status === 'verified' ? 'Suspend Account' : 'Activate Account'}
                        >
                          <Ban className="w-4 h-4 text-red-600" />
                        </button>
                        <button
                          onClick={() => toast.info('Messaging feature coming soon')}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Message User"
                        >
                          <Mail className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-1">
                  {selectedUser.full_name}
                </h2>
                <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedUser.id.substring(0, 8)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-lg font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#64b900]/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-[#64b900]" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Location</p>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedUser.location}</p>
              </div>

              <div className="bg-[#64b900]/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-[#64b900]" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Total Listings</p>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedUser.total_listings || 0}</p>
              </div>

              <div className="bg-[#64b900]/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-[#64b900]" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Transactions</p>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedUser.total_transactions || 0}</p>
              </div>

              <div className="bg-[#64b900]/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#64b900]" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Verification Status</p>
                </div>
                <p className="font-['Geologica:Regular',sans-serif] text-black font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedUser.kyc_status === 'verified' ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedUser.kyc_status !== 'verified' && (
                <button
                  onClick={() => {
                    handleVerifyUser(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-3 bg-[#64b900] text-white rounded-xl hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  Verify User
                </button>
              )}
              <button
                onClick={() => {
                  handleToggleSuspend(selectedUser.id);
                  setSelectedUser(null);
                }}
                className={`flex-1 px-4 py-3 text-white rounded-xl transition-colors font-['Geologica:Regular',sans-serif] ${
                  selectedUser.kyc_status === 'verified'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                {selectedUser.kyc_status === 'verified' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
              <button
                onClick={() => {
                  toast.info('Messaging feature coming soon');
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Message User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}