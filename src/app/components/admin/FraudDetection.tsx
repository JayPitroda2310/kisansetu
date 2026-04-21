import { AlertTriangle, Flag, Ban, Eye, ChevronDown, XCircle } from 'lucide-react';
import { useState } from 'react';

const fraudAlerts = [
  { id: 'FRD001', user: 'Suspicious User 1', activity: 'Rapid bidding spikes', risk: 'high', detected: '2024-03-16 14:30' },
  { id: 'FRD002', user: 'Suspicious User 2', activity: 'Multiple disputes', risk: 'high', detected: '2024-03-16 12:00' },
  { id: 'FRD003', user: 'Suspicious User 3', activity: 'Price manipulation attempt', risk: 'medium', detected: '2024-03-15 18:45' },
  { id: 'FRD004', user: 'Suspicious User 4', activity: 'Fake listing suspected', risk: 'medium', detected: '2024-03-15 10:20' },
  { id: 'FRD005', user: 'Suspicious User 5', activity: 'Unusual bidding pattern', risk: 'low', detected: '2024-03-14 16:30' },
];

// User-reported fraud from Settings > Report Fraud section
const userReportedFraud = [
  { 
    id: 'UFR001', 
    reportedBy: 'Jay Pitroda', 
    activityType: 'Bid Manipulation', 
    details: 'Noticed unusual bidding patterns on multiple listings from the same seller', 
    reportedOn: '2026-03-25 10:15',
    status: 'pending'
  },
  { 
    id: 'UFR002', 
    reportedBy: 'Priya Sharma', 
    activityType: 'Fake Listings', 
    details: 'Seller posted fake product images and never delivered the items', 
    reportedOn: '2026-03-24 16:30',
    status: 'under_review'
  },
  { 
    id: 'UFR003', 
    reportedBy: 'Amit Patel', 
    activityType: 'Quality Deception', 
    details: 'Received poor quality products that did not match the listing description', 
    reportedOn: '2026-03-24 09:45',
    status: 'resolved'
  },
];

interface FlaggedUser {
  id: string;
  alertId: string;
  user: string;
  activity: string;
  conditions: string[];
  notes: string;
  flaggedDate: string;
}

export function FraudDetection() {
  const [selectedAlert, setSelectedAlert] = useState<typeof fraudAlerts[0] | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagConditions, setFlagConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);

  const malpracticeConditions = [
    { id: 'bid_manipulation', label: 'Bid Manipulation', description: 'Artificially inflating or deflating bid prices' },
    { id: 'fake_listings', label: 'Fake Listings', description: 'Creating fraudulent or non-existent product listings' },
    { id: 'payment_fraud', label: 'Payment Fraud', description: 'Attempting to manipulate payment or escrow system' },
    { id: 'identity_fraud', label: 'Identity Fraud', description: 'Using false or stolen identity information' },
    { id: 'quality_deception', label: 'Quality Deception', description: 'Misrepresenting product quality or condition' },
    { id: 'quantity_fraud', label: 'Quantity Fraud', description: 'Delivering less quantity than promised' },
    { id: 'repeat_disputes', label: 'Repeat Disputes', description: 'Consistently involved in buyer-seller disputes' },
    { id: 'shill_bidding', label: 'Shill Bidding', description: 'Bidding on own listings using fake accounts' },
    { id: 'price_fixing', label: 'Price Fixing', description: 'Colluding with others to manipulate market prices' },
    { id: 'harassment', label: 'Harassment', description: 'Harassing or threatening other users' },
    { id: 'spam_activity', label: 'Spam Activity', description: 'Creating excessive or spam listings/bids' },
    { id: 'terms_violation', label: 'Terms of Service Violation', description: 'Violating platform terms and conditions' },
  ];

  const handleToggleCondition = (conditionId: string) => {
    if (flagConditions.includes(conditionId)) {
      setFlagConditions(flagConditions.filter(c => c !== conditionId));
    } else {
      setFlagConditions([...flagConditions, conditionId]);
    }
  };

  const handleFlagUser = () => {
    if (flagConditions.length === 0) {
      alert('Please select at least one malpractice condition');
      return;
    }

    const selectedConditionLabels = malpracticeConditions
      .filter(c => flagConditions.includes(c.id))
      .map(c => c.label)
      .join(', ');

    // Add flagged user to the list
    if (selectedAlert) {
      const newFlaggedUser: FlaggedUser = {
        id: `FLG${Date.now()}`,
        alertId: selectedAlert.id,
        user: selectedAlert.user,
        activity: selectedAlert.activity,
        conditions: flagConditions,
        notes: notes,
        flaggedDate: new Date().toLocaleString(),
      };
      setFlaggedUsers([...flaggedUsers, newFlaggedUser]);
      
      alert(`User flagged successfully!\n\nUser: ${selectedAlert?.user}\nConditions: ${selectedConditionLabels}\nNotes: ${notes || 'None'}`);
    }
    
    // Reset form
    setShowFlagModal(false);
    setFlagConditions([]);
    setNotes('');
    setSeverity('medium');
    setSelectedAlert(null);
  };

  const handleUnflagUser = (userId: string) => {
    if (confirm('Are you sure you want to unflag this user?')) {
      setFlaggedUsers(flaggedUsers.filter(user => user.id !== userId));
      alert('User unflagged successfully!');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">Fraud Detection</h1>
        <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Monitor and investigate suspicious activities
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64b900]/10">
              <tr>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Alert ID</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>User</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Activity Type</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Reporting Time</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {fraudAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#64b900]/5 transition-colors">
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{alert.id}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{alert.user}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{alert.activity}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{alert.detected}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowFlagModal(true);
                        }}
                        className="p-2 hover:bg-orange-100 rounded-lg transition-colors" 
                        title="Flag User"
                      >
                        <Flag className="w-4 h-4 text-orange-600" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Suspend Account">
                        <Ban className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User-Reported Fraud Section */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-1">User-Reported Fraud</h2>
          <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Reports submitted by users from Settings → Report Fraud section
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Report ID</th>
                  <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Reported By</th>
                  <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Activity Type</th>
                  <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Details</th>
                  <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Reported On</th>
                  <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {userReportedFraud.map((report) => (
                  <tr key={report.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{report.id}</td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{report.reportedBy}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {report.activityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80 max-w-xs truncate" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {report.details}
                    </td>
                    <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{report.reportedOn}</td>
                    <td className="px-6 py-4">
                      {report.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Pending
                        </span>
                      )}
                      {report.status === 'under_review' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Under Review
                        </span>
                      )}
                      {report.status === 'resolved' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Flagged Users Table */}
      {flaggedUsers.length > 0 && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-1">Flagged Users</h2>
            <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Users flagged for malpractice
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Flag ID</th>
                    <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>User</th>
                    <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Reported Activity</th>
                    <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Malpractice Conditions</th>
                    <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Flagged Date</th>
                    <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {flaggedUsers.map((flaggedUser) => {
                    const conditionLabels = malpracticeConditions
                      .filter(c => flaggedUser.conditions.includes(c.id))
                      .map(c => c.label)
                      .join(', ');

                    return (
                      <tr key={flaggedUser.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{flaggedUser.id}</td>
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{flaggedUser.user}</td>
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{flaggedUser.activity}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {flaggedUser.conditions.slice(0, 2).map((conditionId) => {
                              const condition = malpracticeConditions.find(c => c.id === conditionId);
                              return (
                                <span key={conditionId} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                  {condition?.label}
                                </span>
                              );
                            })}
                            {flaggedUser.conditions.length > 2 && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                +{flaggedUser.conditions.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{flaggedUser.flaggedDate}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleUnflagUser(flaggedUser.id)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-['Geologica:Regular',sans-serif] flex items-center gap-1" 
                            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                            title="Unflag User"
                          >
                            <XCircle className="w-4 h-4" />
                            Unflag
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Flag User Modal */}
      {showFlagModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowFlagModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-1">
                  Flag User for Malpractice
                </h2>
                <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  User: {selectedAlert.user} • Alert ID: {selectedAlert.id}
                </p>
              </div>
              <button 
                onClick={() => setShowFlagModal(false)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-lg font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Close
              </button>
            </div>

            {/* Reported Activity */}
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Reported Activity
                </h3>
              </div>
              <p className="font-['Geologica:Regular',sans-serif] text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {selectedAlert.activity}
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mt-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Reported: {selectedAlert.detected}
              </p>
            </div>

            {/* Malpractice Conditions Dropdown */}
            <div className="mb-6 relative">
              <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-black mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Select Malpractice Conditions
              </h3>
              
              {/* Custom Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif] flex items-center justify-between bg-white hover:bg-black/5 transition-colors"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                >
                  <span className="text-black/60">
                    {flagConditions.length === 0 
                      ? 'Select conditions...' 
                      : `${flagConditions.length} condition${flagConditions.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-black/60 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-black/10 rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                    {malpracticeConditions.map((condition) => (
                      <label
                        key={condition.id}
                        className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                          flagConditions.includes(condition.id) 
                            ? 'bg-[#64b900]/10' 
                            : 'hover:bg-black/5'
                        } border-b border-black/5 last:border-b-0`}
                      >
                        <input
                          type="checkbox"
                          checked={flagConditions.includes(condition.id)}
                          onChange={() => handleToggleCondition(condition.id)}
                          className="mt-1 w-4 h-4 rounded border-2 border-black/20 text-[#64b900] focus:ring-[#64b900] cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-['Geologica:Regular',sans-serif] font-medium text-black text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {condition.label}
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mt-0.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {condition.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mb-6">
              <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-black mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Admin Notes & Evidence
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add detailed notes about the malpractice, evidence, or actions taken..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleFlagUser}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-['Geologica:Regular',sans-serif] flex items-center justify-center gap-2"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                <Flag className="w-5 h-5" />
                Flag User
              </button>
              <button
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagConditions([]);
                  setNotes('');
                  setSeverity('medium');
                }}
                className="px-6 py-3 bg-black/5 hover:bg-black/10 rounded-xl transition-colors font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}