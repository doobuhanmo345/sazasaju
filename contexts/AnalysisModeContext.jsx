'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AnalysisModeContext = createContext();

export function AnalysisModeProvider({ children }) {
    const [analysisMode, setAnalysisMode] = useState('background'); // 'direct' or 'background'

    // Load from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('saza_analysis_mode');
        if (savedMode === 'background' || savedMode === 'direct') {
            setAnalysisMode(savedMode);
        }
    }, []);

    // Sync to localStorage
    const updateMode = (mode) => {
        setAnalysisMode(mode);
        localStorage.setItem('saza_analysis_mode', mode);
    };

    const value = {
        analysisMode,
        setAnalysisMode: updateMode,
    };

    return <AnalysisModeContext.Provider value={value}>{children}</AnalysisModeContext.Provider>;
}

export const useAnalysisMode = () => {
    const context = useContext(AnalysisModeContext);
    if (context === undefined) {
        throw new Error('useAnalysisMode must be used within an AnalysisModeProvider');
    }
    return context;
};
