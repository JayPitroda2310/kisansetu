import { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export function PlatformSettings() {
  const [commission, setCommission] = useState('5');
  const [escrowFee, setEscrowFee] = useState('2');
  const [minPrice, setMinPrice] = useState('1000');
  const [maxDuration, setMaxDuration] = useState('7');
  const [autoVerify, setAutoVerify] = useState(false);

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">Platform Settings</h1>
        <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
          Configure platform rules and parameters
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-sm">
        <div className="space-y-6">
          {/* Commission Settings */}
          <div>
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#64b900]" />
              Financial Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Percentage charged on each transaction
                </p>
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Escrow Fee (%)
                </label>
                <input
                  type="number"
                  value={escrowFee}
                  onChange={(e) => setEscrowFee(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Fee for escrow service
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-black/10 pt-6">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">Listing Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Minimum Listing Price (₹)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Minimum price allowed for listings
                </p>
              </div>

              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Maximum Auction Duration (days)
                </label>
                <input
                  type="number"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Maximum duration for auction listings
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-black/10 pt-6">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">Verification Settings</h2>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoVerify"
                checked={autoVerify}
                onChange={(e) => setAutoVerify(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-black/20 text-[#64b900] focus:ring-[#64b900]"
              />
              <label htmlFor="autoVerify" className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Enable automatic user verification for verified phone numbers
              </label>
            </div>
          </div>

          <div className="border-t-2 border-black/10 pt-6">
            <h2 className="font-['Fraunces',sans-serif] text-xl text-black mb-4">Payment Gateway</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Payment Gateway API Key
                </label>
                <input
                  type="password"
                  value="••••••••••••••••"
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border-2 border-black/10 bg-black/5 font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Configure payment gateway credentials
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t-2 border-black/10 pt-6">
            <button
              onClick={handleSave}
              className="w-full px-6 py-4 bg-[#64b900] text-white rounded-xl hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] flex items-center justify-center gap-2"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
