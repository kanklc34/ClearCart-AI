import React from 'react';

interface TopNavItem {
    label: string;
    id: string;
}

const navItems: TopNavItem[] = [
    { label: 'Denetim', id: 'Audit Engine' },
    { label: 'Risk Matrisleri', id: 'Risk Matrices' },
    { label: 'Mantık', id: 'Logic Explorer' },
    { label: 'Loglar', id: 'API Logs' },
];

interface TopAppBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isAnalyzing?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ activeTab, onTabChange, isAnalyzing = false }) => {
    return (
        <header className="flex justify-between items-center w-full px-6 h-16 bg-background border-b border-outline-variant shrink-0 relative z-50">
            {/* Sol: Logo + Nav */}
            <div className="flex items-center gap-4 md:gap-8 h-full">
                <div className="text-headline-md font-headline-md font-black tracking-tighter text-primary">
                    CLEARCART
                </div>
                <nav className="hidden md:flex h-full gap-6">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex items-center h-full text-label-caps font-label-caps uppercase pt-1 border-b transition-all ${activeTab === item.id
                                ? 'text-primary border-primary opacity-100'
                                : 'text-on-surface-variant border-transparent hover:text-primary'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Sağ: Sistem durumu */}
            <div className="flex items-center gap-4 text-label-caps font-label-caps">
                {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse inline-block" />
                        ANALİZ EDİLİYOR
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-on-surface-variant opacity-40">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block" />
                        IDLE
                    </div>
                )}
                <div className="hidden md:flex items-center gap-1 text-on-surface-variant opacity-30 text-[10px]">
                    <span>gemini-2.5-flash-lite</span>
                    <span className="mx-1">·</span>
                    <span>3 agents</span>
                </div>
            </div>
        </header>
    );
};