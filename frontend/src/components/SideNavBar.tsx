import React from 'react';

interface NavItem {
    label: string;
    icon: string;
    id: string;
}

const navItems: NavItem[] = [
    { id: 'Audit Engine', label: 'Denetim Motoru', icon: 'analytics' },
    { id: 'Risk Matrices', label: 'Risk Matrisleri', icon: 'grid_view' },
    { id: 'Logic Explorer', label: 'Mantık Gezgini', icon: 'terminal' },
    { id: 'API Logs', label: 'API Logları', icon: 'list_alt' },
];


interface SideNavBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ activeTab, onTabChange }) => {
    return (
        <aside className="hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 bg-surface-container-lowest w-64 border-r border-outline-variant">
            {/* Header */}
            <div className="p-4 border-b border-outline-variant flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-variant flex items-center justify-center border border-outline-variant">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                        account_tree
                    </span>
                </div>
                <div>
                    <div className="text-label-caps font-label-caps font-bold text-primary">
                        DENETİM ÇEKİRDEĞİ V1
                    </div>
                    <div className="text-label-caps font-label-caps text-on-surface-variant mt-1">
                        Örnek: CC-082
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`flex items-center gap-3 px-3 py-2 text-label-caps font-label-caps transition-all border w-full text-left
                            ${activeTab === item.id
                                ? 'bg-primary text-on-primary font-bold translate-x-1 border-primary'
                                : 'text-on-surface-variant hover:bg-surface-container-high border-transparent hover:border-outline-variant'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {item.icon}
                        </span>
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Footer Removed for Minimalism */}
        </aside>
    );
};
