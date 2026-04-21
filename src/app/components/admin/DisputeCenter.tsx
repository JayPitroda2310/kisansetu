import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';

const disputes = [
  { id: 'DIS001', txnId: 'TXN003', buyer: 'Sunita Devi', seller: 'Ramesh Patel', issue: 'Quality Issue', status: 'Open', date: '2024-03-16' },
  { id: 'DIS002', txnId: 'TXN007', buyer: 'Kavita Reddy', seller: 'Amit Singh', issue: 'Quantity Mismatch', status: 'Under Review', date: '2024-03-15' },
  { id: 'DIS003', txnId: 'TXN009', buyer: 'Priya Sharma', seller: 'Suresh Yadav', issue: 'Delivery Delay', status: 'Resolved', date: '2024-03-12' },
  { id: 'DIS004', txnId: 'TXN011', buyer: 'Anita Gupta', seller: 'Rajesh Kumar', issue: 'Payment Dispute', status: 'Open', date: '2024-03-14' },
];

export function DisputeCenter() {
  const [selectedDispute, setSelectedDispute] = useState<typeof disputes[0] | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">Dispute Resolution Center</h1>
        <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Resolve buyer-seller disputes
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#64b900]/10">
              <tr>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Dispute ID</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Transaction ID</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Buyer</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Seller</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Issue Type</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Created Date</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-[#64b900]/5 transition-colors">
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{dispute.id}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{dispute.txnId}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{dispute.buyer}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{dispute.seller}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-['Geologica:Regular',sans-serif] bg-red-100 text-red-700 flex items-center gap-1 w-fit" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      <AlertTriangle className="w-3 h-3" />
                      {dispute.issue}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-['Geologica:Regular',sans-serif] ${
                      dispute.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                      dispute.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{dispute.status}</span>
                  </td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{dispute.date}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedDispute(dispute)}
                      className="px-3 py-1.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors text-xs font-['Geologica:Regular',sans-serif]" 
                      style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedDispute(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '1rem' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-['Fraunces',sans-serif] text-2xl text-black mb-1">Dispute Resolution</h2>
                <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{selectedDispute.id}</p>
              </div>
              <button 
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-lg font-['Geologica:Regular',sans-serif]"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {/* User Dispute */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <h3 className="font-['Geologica:Regular',sans-serif] font-medium text-black mb-2 flex items-center gap-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  User Dispute
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  The commodity received does not match the quality promised in the listing. Several items show signs of damage.
                </p>
              </div>

              {/* Admin Message Box */}
              <div>
                <label className="font-['Geologica:Regular',sans-serif] font-medium text-black mb-2 block" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Send Message to User
                </label>
                <textarea
                  placeholder="Type your message regarding the dispute..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif] resize-none"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-[#64b900] text-white rounded-xl hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Send the Message
                </button>
                <button className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Request More Evidence
                </button>
              </div>
              
              <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-['Geologica:Regular',sans-serif] flex items-center justify-center gap-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                <CheckCircle className="w-5 h-5" />
                Resolve for the User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}