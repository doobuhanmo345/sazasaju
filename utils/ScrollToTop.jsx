'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지가 바뀔 때마다 스크롤을 (0, 0) 위치로 이동
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
