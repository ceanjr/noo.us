import { Bell, Settings, LogOut } from 'lucide-react';

/**
 * DashboardHeader - Header fixo no topo do Dashboard
 *
 * @param {Object} props
 * @param {number} props.pendingNotificationsCount - Número de notificações pendentes
 * @param {Function} props.onNotificationsClick - Callback ao clicar no sino de notificações
 * @param {Function} props.onSettingsClick - Callback ao clicar em configurações
 * @param {Function} props.onLogout - Callback ao fazer logout
 */
export default function DashboardHeader({
  pendingNotificationsCount,
  onNotificationsClick,
  onSettingsClick,
  onLogout,
}) {
  return (
    <div className="sticky top-0 z-40 bg-theme-secondary/95 backdrop-blur-lg border-b border-border-color shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo com App Icon e Title */}
          <div className="flex items-center gap-3">
            <img
              src="/images/app-icon.svg"
              alt="noo.us"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <img
              src="/images/app-title.svg"
              alt="noo.us"
              className="h-7 sm:h-9"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {pendingNotificationsCount > 0 && (
              <button
                onClick={onNotificationsClick}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-primary-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {pendingNotificationsCount}
                </span>
              </button>
            )}

            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
