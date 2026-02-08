import './globals.css';
import { AppProvider } from '@/contexts/AppProvider';
import { LoadingProvider } from '@/contexts/useLoadingContext';
import ClientWrapper from '@/components/ClientWrapper';

export const metadata = {
  title: {
    default: '사자사주 (SAZA SAJU) | AI Saju & Tarot Analysis',
    template: '%s | 사자사주 (SAZA SAJU)'
  },
  description: 'AI 사자사주 - 질문하면 바로 답해주는 개인 맞춤 사주, 타로 분석. 연애, 궁합, 직업, 금전운 등 당신의 운명을 명확하게 풀이해 드립니다. | AI-powered personal Saju & Tarot analysis for your destiny.',
  keywords: '사자, 사자사주, 사주, 운세, 신년운세, 인공지능사주, 궁합, 사주분석, 무료사주, 타로, 오늘의운세, SAZA SAJU, AI Saju, Korean Fortune Telling, Tarot Story',
  authors: [{ name: '사자사주 (SAZA SAJU)' }],
  metadataBase: new URL('https://sazasaju.com/'),
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/',
      'en-US': '/',
    },
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: '사자사주 (SAZA SAJU) - 당신의 기운을 찾아서',
    description: '질문하면 바로 답해주는  사주 분석. 오늘의 운세와 사주 리포트를 확인하세요. | Personalized AI Saju & Tarot reading. Check your daily fortune and premium reports.',
    url: 'https://sazasaju.com/',
    siteName: '사자사주 (SAZA SAJU)',
    type: 'website',
    images: [
      {
        url: '/sazashare.jpg',
        width: 1200,
        height: 630,
        alt: '사자사주 (SAZA SAJU)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '사자사주 (SAZA SAJU) | Your Personal AI Fortune Teller',
    description: '한국 정통 사주와 AI의 만남. 당신의 운명을 명확하게 풀이해 드립니다. | Traditional Korean Saju meets Modern AI. Reading the constellations for your path.',
    images: ['/sazashare.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="antialiased font-pretendard">
        <AppProvider>
          <LoadingProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </LoadingProvider>
        </AppProvider>
      </body>
    </html>
  );
}
