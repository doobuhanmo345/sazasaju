'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 모달의 열림/닫힘 상태를 관리하고, 모달 상태에 따라 배경 스크롤을 제어하는 커스텀 훅입니다.
 * @returns {{isModalOpen: boolean, openModal: function, closeModal: function, toggleModal: function}}
 */
export function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return { isModalOpen, openModal, closeModal, toggleModal };
}
