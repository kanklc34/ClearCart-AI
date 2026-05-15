import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface MetadataVectorsProps {
    correlationRisk: number;
    uncertainty: number;
    coverage: number;
    evidenceDensity: number;
}

interface VectorMeterProps {
    label: string;
    value: number;
    isInverted?: boolean;
    warningThreshold?: number;
}

const VectorMeter: React.FC<VectorMeterProps> = ({ label, value, isInverted = false, warningThreshold = 0.5 }) => {
    const displayValue = isInverted ? 1 - value : value;
    const isWarning = isInverted ? value > warningThreshold : value < warningThreshold;
    const barColor = isWarning ? 'bg-tertiary' : 'bg-primary';

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-label-caps text-on-surface-variant opacity-60 tracking-wider">
                    {label}
                </span>
                <span className={`text-[11px] font-data-mono ${isWarning ? 'text-tertiary' : 'text-primary'}`}>
                    {(displayValue * 100).toFixed(0)}%
                </span>
            </div>
            <div className="h-1 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${displayValue * 100}%` }}
                ></div>
            </div>
        </div>
    );
};

export const MetadataVectors: React.FC<MetadataVectorsProps> = ({
    correlationRisk,
    uncertainty,
    coverage,
    evidenceDensity,
}) => {
    const highCorrelation = correlationRisk > 0.4;

    return (
        <div className="w-full h-full border border-outline-variant bg-surface-container-low flex flex-col">
            <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center">
                <div className="text-label-caps font-label-caps text-primary tracking-widest">METAVERİ_VEKTÖRLERİ</div>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <div className="w-1 h-1 bg-primary/40 rounded-full"></div>
                </div>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
                <VectorMeter label="Sinyal Kapsamı" value={coverage} />
                <VectorMeter label="Kanıt Yoğunluğu" value={evidenceDensity} />
                <VectorMeter label="Epistemik İstikrar" value={uncertainty} isInverted warningThreshold={0.4} />
                
                {/* Correlation Risk Section */}
                <div className={`mt-2 p-4 border ${highCorrelation ? 'border-tertiary/30 bg-tertiary/5' : 'border-outline-variant/20 bg-surface/30'} transition-all duration-500`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] font-label-caps text-on-surface-variant opacity-70">
                            SİNYAL_KORELASYONU
                        </div>
                        {highCorrelation && <ShieldAlert size={12} className="text-tertiary animate-pulse" />}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="h-1.5 w-full bg-outline-variant/30 rounded-sm overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${highCorrelation ? 'bg-tertiary' : 'bg-primary/50'}`}
                                    style={{ width: `${correlationRisk * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className={`text-xs font-data-mono ${highCorrelation ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                            {(correlationRisk * 100).toFixed(0)}%
                        </div>
                    </div>

                    {highCorrelation && (
                        <div className="mt-3 text-[9px] font-body-sm text-tertiary leading-tight opacity-80">
                            UYARI: Yüksek sinyal korelasyonu algılandı. Bağımsız doğrulama gücü azaldı.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-outline-variant/30 bg-surface/20">
                <div className="text-[9px] font-body-sm text-on-surface-variant/50 italic leading-tight">
                    * Vektörler, ajanlar arası konsensüs varyansı ve özellik bağımlılığı çakışmasından elde edilmiştir.
                </div>
            </div>
        </div>
    );
};
