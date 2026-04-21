import { useState } from 'react';
import { Send, Bell } from 'lucide-react';

const notificationHistory = [
  { id: 'NOT001', title: 'Platform Maintenance', audience: 'All Users', sentDate: '2024-03-15', status: 'Sent' },
  { id: 'NOT002', title: 'New Feature Launch', audience: 'All Users', sentDate: '2024-03-10', status: 'Sent' },
  { id: 'NOT003', title: 'Payment Gateway Update', audience: 'Buyers', sentDate: '2024-03-08', status: 'Sent' },
  { id: 'NOT004', title: 'Quality Guidelines', audience: 'Farmers', sentDate: '2024-03-05', status: 'Sent' },
];

export function NotificationsManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');

  const handleSend = () => {
    alert(`Notification sent to ${audience}:\n\nTitle: ${title}\nMessage: ${message}`);
    setTitle('');
    setMessage('');
    setAudience('all');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">Notifications</h1>
        <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Send announcements and notifications to users
        </p>
      </div>

      {/* Notification Composer */}
      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 mb-6 shadow-sm">
        <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-[#64b900]" />
          Compose Notification
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title..."
              className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
          </div>

          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            />
          </div>

          <div>
            <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              <option value="all">All Users</option>
              <option value="farmers">Farmers Only</option>
              <option value="buyers">Buyers Only</option>
            </select>
          </div>

          <button
            onClick={handleSend}
            className="w-full px-6 py-4 bg-[#64b900] text-white rounded-xl hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] flex items-center justify-center gap-2"
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            <Send className="w-5 h-5" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-2xl border-2 border-black/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#64b900]/10">
          <h2 className="font-['Fraunces',sans-serif] text-xl text-black flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/5">
              <tr>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Notification ID</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Title</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Audience</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Sent Date</th>
                <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {notificationHistory.map((notif) => (
                <tr key={notif.id} className="hover:bg-[#64b900]/5 transition-colors">
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{notif.id}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{notif.title}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{notif.audience}</td>
                  <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>{notif.sentDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-['Geologica:Regular',sans-serif] bg-green-100 text-green-700" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {notif.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
