import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface PipelineStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed';
}

interface SignalPipelineProps {
    steps: PipelineStep[];
}

export const SignalPipeline: React.FC<SignalPipelineProps> = ({ steps }) => {
    return (
        <div className="flex flex-col gap-6 py-4">
            {steps.map((step, idx) => (
                <div key={step.id} className="relative flex items-start gap-4">
                    {/* Line connection */}
                    {idx < steps.length - 1 && (
                        <div 
                            className={`absolute left-[11px] top-6 w-[2px] h-[calc(100%+8px)] 
                            ${step.status === 'completed' ? 'bg-primary' : 'bg-outline-variant'}`}
                        ></div>
                    )}

                    {/* Icon */}
                    <div className="z-10 mt-1">
                        {step.status === 'completed' ? (
                            <CheckCircle2 size={24} className="text-primary fill-background" />
                        ) : step.status === 'active' ? (
                            <div className="relative">
                                <Loader2 size={24} className="text-primary animate-spin" />
                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <Circle size={24} className="text-outline-variant fill-background" />
                        )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 pt-0.5">
                        <div className={`text-label-caps font-label-caps tracking-wider
                            ${step.status === 'active' ? 'text-primary' : 
                              step.status === 'completed' ? 'text-on-surface' : 'text-on-surface-variant'}`}
                        >
                            {step.label}
                        </div>
                        {step.status === 'active' && (
                            <div className="text-body-sm text-on-surface-variant mt-1 animate-pulse">
                                Nöral çıkarım işleniyor...
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
