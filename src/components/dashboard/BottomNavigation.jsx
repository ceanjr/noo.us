/**
 * BottomNavigation - Navegação por abas (Mobile: Bottom Bar / Desktop: Floating Pill)
 *
 * @param {Object} props
 * @param {Array} props.tabs - Array de tabs com {id, label, icon, badge?}
 * @param {string} props.activeTab - ID da tab ativa
 * @param {Function} props.onTabChange - Callback ao mudar de tab
 */
export default function BottomNavigation({ tabs, activeTab, onTabChange}) {
  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-theme-secondary border-t border-theme shadow-lg md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'scale-110' : ''
                  } transition-transform`}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'font-bold' : ''
                  }`}
                >
                  {tab.label}
                </span>
                {tab.badge > 0 && (
                  <span className="absolute top-0 right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-theme-secondary/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-theme p-2 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
