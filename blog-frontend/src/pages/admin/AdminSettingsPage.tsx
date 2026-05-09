import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage platform settings</p>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400">Settings panel coming soon.</p>
      </div>
    </div>
  );
}
