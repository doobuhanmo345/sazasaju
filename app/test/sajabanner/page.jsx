'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import AnalyzeButton from '@/ui/AnalyzeButton';
import style from '@/data/styleConstants';
import BasicAna from '../../../components/notusing/BasicAna';

const SazaTalkBanner = () => {

    const language = 'ko';
    const loading = false;
    const isAnalysisDone = false;
    const isDisabled = false;
    const isDisabled2 = false;
    const handleStartClick = () => {
        console.log('handleStartClick');
    };

    return (
        <BasicAna />
    );
};

export default SazaTalkBanner;