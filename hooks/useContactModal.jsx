'use client';

import { useState } from 'react';

/**
 * 문의 모달의 상태와 제어 함수를 관리하는 Custom Hook
 * @returns {object} { isContactModalOpen, handleShowContact, handleCloseContact }
 */
export default function useContactModal() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleShowContact = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactModalOpen(false);
  };

  return {
    isContactModalOpen,
    handleShowContact,
    handleCloseContact,
  };
}
