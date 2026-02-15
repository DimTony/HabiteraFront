import { Home, Menu, ArrowLeftRight, Settings, Building2 } from 'lucide-react';
import { useSafeArea } from '../hooks/useSafeAreaView';
// import { useSafeArea } from '../services/useSafeArea';

type Tab = 'home' | 'transactions' | 'menu' | 'settings';
type UserRole = 'agent' | 'user';

interface BottomNavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  userRole: UserRole;
  isBusinessOwner?: boolean;
}

export function BottomNavigation({ currentTab, onTabChange, userRole, isBusinessOwner = false }: BottomNavigationProps) {
  const { safeArea } = useSafeArea();
  
  // All tabs available to all users - stores moved to menu
  const tabs = [
    { id: 'home' as Tab, name: 'Home', icon: Home },
    { id: 'transactions' as Tab, name: 'Transactions', icon: ArrowLeftRight },
    { id: 'menu' as Tab, name: 'Menu', icon: Menu },
    { id: 'settings' as Tab, name: 'Settings', icon: Settings },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 font-medium"
      style={{ paddingBottom: `${safeArea.bottom}px` }}>
      <div className="max-w-md mx-auto px-2 py-1">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-2 px-3 transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
        {/* Home indicator */}
        {/* <div className="w-36 h-1 bg-gray-900 rounded-full mx-auto mt-2 mb-1"></div> */}
      </div>
    </div>
  );
}