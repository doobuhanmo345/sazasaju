const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();

// 보안을 위해 Secret Manager에 저장된 API 키를 가져옵니다.
const GEMINI_API_KEY = defineSecret('NEW_GEMINI_KEY');

// 모든 2세대(v2) 함수의 기본 리전을 서울(asia-northeast3)로 설정
setGlobalOptions({ region: "asia-northeast3" });

/**
 * 기존 saju-app에서 사용하던 Gemini 분석 함수입니다.
 */
exports.fetchGeminiAnalysis = onCall(
  {
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 540,
    memory: '1024MiB',
  },
  async (request) => {
    try {
      const { prompt } = request.data;
      if (!prompt) {
        throw new HttpsError('invalid-argument', '프롬프트 내용이 없습니다.');
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash', // 기존 saju-app 프로젝트 설정 유지 (필요시 gemini-2.0-flash 등으로 변경 가능)
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return { text };
    } catch (error) {
      console.error('Gemini 서버 에러 상세:', error);
      throw new HttpsError('internal', error.message || 'AI 분석 중 알 수 없는 오류가 발생했습니다.');
    }
  }
);

/**
 * 5분마다 실행되어 Gemini 인스턴스를 따뜻하게 유지하는 하트비트 함수입니다. (웜업 방식)
 */
exports.warmupGemini = onSchedule(
  {
    schedule: "every 5 minutes",
    secrets: [GEMINI_API_KEY],
    region: "asia-northeast3",
  },
  async (event) => {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      // 아주 짧은 프롬프트를 보내 인스턴스를 활성화 상태로 유지합니다.
      await model.generateContent("ping");
      console.log('Gemini Warm-up successful');
    } catch (error) {
      console.error('Gemini Warm-up failed:', error);
    }
  }
);

/**
 * Naver Access Token을 Firebase Custom Token으로 교환합니다.
 */
exports.verifyNaverToken = onCall(async (request) => {
  const { accessToken } = request.data;

  if (!accessToken) {
    throw new HttpsError('invalid-argument', 'Missing accessToken');
  }

  try {
    const naverProfileRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = naverProfileRes.data.response;
    if (!profile || !profile.id) {
      throw new Error('Invalid Naver profile data');
    }

    const uid = `naver:${profile.id}`;
    const email = profile.email || `${profile.id}@naver.user`;
    const displayName = profile.name || profile.nickname || 'Naver User';
    const photoURL = profile.profile_image || '';

    const customToken = await admin.auth().createCustomToken(uid, {
      provider: 'naver.com'
    });

    return { customToken, email, displayName, photoURL };
  } catch (error) {
    console.error('Naver verification error:', error);
    throw new HttpsError('internal', 'Authentication failed');
  }
});

/**
 * Kakao Access Token을 Firebase Custom Token으로 교환합니다.
 */
exports.verifyKakaoToken = onCall(async (request) => {
  const { accessToken } = request.data;

  if (!accessToken) {
    throw new HttpsError('invalid-argument', 'Missing accessToken');
  }

  try {
    const kakaoProfileRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = kakaoProfileRes.data;
    if (!profile || !profile.id) {
      throw new Error('Invalid Kakao profile data');
    }

    const uid = `kakao:${profile.id}`;
    const kakaoAccount = profile.kakao_account || {};
    const email = kakaoAccount.email || `${profile.id}@kakao.user`;
    const displayName = kakaoAccount.profile?.nickname || 'Kakao User';
    const photoURL = kakaoAccount.profile?.profile_image_url || '';

    const customToken = await admin.auth().createCustomToken(uid, {
      provider: 'kakao.com'
    });

    return { customToken, email, displayName, photoURL };
  } catch (error) {
    console.error('Kakao verification error:', error.response?.data || error.message);
    throw new HttpsError('internal', 'Kakao authentication failed');
  }
});

/**
 * Analysis Queue Processor
 * Firestore 트리거: analysis_queue 컬렉션에 새 문서 생성 시 자동 실행
 * 스트리밍 없이 단순 처리 (성능 최적화)
 */
exports.processAnalysisQueue = onDocumentCreated(
  {
    document: "analysis_queue/{docId}",
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 540,
    memory: '1024MiB',
    region: "asia-northeast3",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const data = snapshot.data();
    const docId = event.params.docId;
    console.log(`[processAnalysisQueue] Processing document: ${docId}`);

    // 이미 처리 중이거나 완료된 경우 스킵
    if (data.status !== 'pending') {
      console.log(`[processAnalysisQueue] Skipping document ${docId} with status: ${data.status}`);
      return;
    }

    try {
      // 1. 상태 업데이트: processing
      console.log(`[processAnalysisQueue] Updating status to 'processing' for ${docId}`);
      await snapshot.ref.update({
        status: 'processing',
        startedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const { prompt } = data;
      if (!prompt) {
        throw new Error('No prompt provided');
      }

      // 2. Gemini API 호출 (스트리밍 없이)
      console.log(`[processAnalysisQueue] Calling Gemini API for ${docId}`);
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`[processAnalysisQueue] Gemini API call successful for ${docId}`);

      // 3. 결과 저장 및 상태 완료 처리
      console.log(`[processAnalysisQueue] Updating status to 'completed' for ${docId}`);
      await snapshot.ref.update({
        status: 'completed',
        result: text,
        airesult: text, // Keep for backward compatibility
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Release isAnalyzing lock and persist results if necessary
      const userId = data.userId;
      const type = data.analysisType;
      const params = data.params;

      if (userId) {
        try {
          const userRef = admin.firestore().collection('users').doc(userId);
          const now = new Date();
          // KST (UTC+9) date string for dailyUsage
          const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
          const todayStr = kstDate.toISOString().split('T')[0];
          const timestamp = now.toISOString();

          // Prepare basic user updates
          const userUpdates = {
            isAnalyzing: false,
            analysisStartedAt: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastEditDate: todayStr,
            [`dailyUsage.${todayStr}`]: admin.firestore.FieldValue.increment(1),
          };

          // Decide whether to increment editCount (free) or deduct credit (paid)
          if (params?.useCredit) {
            userUpdates.credits = admin.firestore.FieldValue.increment(-1);
          } else {
            userUpdates.editCount = admin.firestore.FieldValue.increment(1);
          }

          // Specific persistence logic based on type
          if (type === 'saza' && params?.question) {
            // 1. Save to sazatalk_messages
            await admin.firestore().collection('sazatalk_messages').add({
              userId,
              question: params.question,
              result: text,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // 2. Update user history
            userUpdates['usageHistory.Zsazatalk'] = {
              question: params.question,
              result: text,
              timestamp: timestamp,
            };
            userUpdates['usageHistory.question_history'] = admin.firestore.FieldValue.arrayUnion({
              question: params.question,
              timestamp: timestamp,
            });
          } else {
            // 2. All other Saju & Tarot types
            const finalCacheKey = data.cacheKey || (type && type.startsWith('tarot') ? type : 'ZApiAnalysis');

            // Build a comprehensive history entry
            const historyEntry = {
              result: text,
              saju: params?.saju || null,
              language: params?.language || 'ko',
              gender: params?.gender || null,
              timestamp: timestamp,
            };

            // Add variety of possible params (merging what different presets use)
            if (params?.question) historyEntry.question = params.question;
            if (params?.ques) historyEntry.ques = params.ques;
            if (params?.ques2) historyEntry.ques2 = params.ques2;
            if (params?.saju2) historyEntry.saju2 = params.saju2;
            if (params?.gender2) historyEntry.gender2 = params.gender2;
            if (params?.relationship) historyEntry.relationship = params.relationship;
            if (params?.startDate) historyEntry.startDate = params.startDate;
            if (params?.endDate) historyEntry.endDate = params.endDate;
            if (params?.purpose) historyEntry.purpose = params.purpose;
            if (params?.selectedDate) historyEntry.selectedDate = params.selectedDate;
            if (params?.date) historyEntry.date = params.date;
            if (params?.sajuDate) historyEntry.sajuDate = params.sajuDate;
            if (params?.partnerSaju) historyEntry.partnerSaju = params.partnerSaju;
            if (params?.partnerGender) historyEntry.partnerGender = params.partnerGender;

            if (type && type.startsWith('tarot')) {
              // Tarot usually has a nested date structure
              userUpdates[`usageHistory.${finalCacheKey}`] = {
                [todayStr]: admin.firestore.FieldValue.increment(1),
                result: text,
                ...historyEntry
              };
            } else {
              // Standard Saju mapping
              userUpdates[`usageHistory.${finalCacheKey}`] = historyEntry;
            }
          }

          await userRef.update(userUpdates);
          console.log(`[processAnalysisQueue] Successfully persisted results for user ${userId}`);
        } catch (lockError) {
          console.error(`[processAnalysisQueue] Failed to update user ${userId}:`, lockError);
        }

        // 5. Create notification
        try {
          const typeLabel = data.analysisTitle || '사주/타로 분석';
          await admin.firestore().collection('notifications').add({
            userId: userId,
            type: 'analysis',
            message: `${typeLabel}이 완료되었습니다.`,
            targetPath: data.targetPath || '/saju/basic/result', // Add navigation path
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`[processAnalysisQueue] Created notification for user ${userId} with targetPath: ${data.targetPath}`);
        } catch (notifError) {
          console.error(`[processAnalysisQueue] Failed to create notification for user ${userId}:`, notifError);
        }
      }

      /*
      // 6. Delete completed queue document to prevent stale UI
      try {
        await snapshot.ref.delete();
        console.log(`[processAnalysisQueue] Deleted completed queue document ${docId}`);
      } catch (deleteError) {
        console.error(`[processAnalysisQueue] Failed to delete queue document ${docId}:`, deleteError);
      }
      */
      console.log(`[processAnalysisQueue] Successfully processed ${docId}`);
    } catch (error) {
      console.error(`[processAnalysisQueue] Error processing ${docId}:`, error);

      // 5. 에러 처리
      await snapshot.ref.update({
        status: 'failed',
        error: error.message || 'Unknown error occurred',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 6. Release isAnalyzing lock on error
      const userId = data.userId;
      if (userId) {
        try {
          await admin.firestore().collection('users').doc(userId).update({
            isAnalyzing: false,
            analysisStartedAt: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`[processAnalysisQueue] Released isAnalyzing lock after error for user ${userId}`);
        } catch (lockError) {
          console.error(`[processAnalysisQueue] Failed to release lock after error for user ${userId}:`, lockError);
        }
      }
    }
  }
);

/**
 * Firestore 트리거: notifications 컬렉션에 새 문서 생성 시 FCM 발송
 */
exports.onNotificationCreated = onDocumentCreated(
  {
    document: "notifications/{docId}",
    region: "asia-northeast3",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const { userId, targetRole, message, targetPath, title } = data;

    // Extract string path if targetPath is an object
    const finalPath = typeof targetPath === 'object' ? targetPath.path : targetPath;

    if (!userId && targetRole !== 'admin') {
      console.log('No userId or targetRole=admin found in notification document');
      return;
    }

    try {
      let tokens = [];

      // 1. 발송 대상 토큰 모으기
      if (userId) {
        // 특정 유저에게 발송
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          tokens = userDoc.data().fcmTokens || [];
        }
      } else if (targetRole === 'admin') {
        // 모든 관리자에게 발송
        const adminDocs = await admin.firestore().collection('users')
          .where('role', 'in', ['admin', 'super_admin'])
          .get();

        adminDocs.forEach(doc => {
          const t = doc.data().fcmTokens || [];
          tokens = [...tokens, ...t];
        });
        // 중복 제거
        tokens = [...new Set(tokens)];
      }

      if (tokens.length === 0) {
        console.log(`No FCM tokens found for the target`);
        return;
      }

      // 2. FCM 메시지 구성
      const payload = {
        notification: {
          title: title || '사자사주 알림',
          body: message || '새로운 알림이 도착했습니다.',
        },
        data: {
          url: finalPath || '/',
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // For some older native integrations
        },
      };

      // 3. 각 토큰으로 발송 (Multicast)
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: payload.notification,
        data: payload.data,
        android: {
          notification: {
            sound: 'default',
            clickAction: 'TOP_STORY_ACTIVITY',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
        webpush: {
          fcmOptions: {
            link: finalPath || '/',
          },
        },
      });

      console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} messages failed.`);

      // 4. 실패한 토큰 정리 (만료된 토큰 등)
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
              failedTokens.push(tokens[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          await admin.firestore().collection('users').doc(userId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens)
          });
          console.log(`Cleaned up ${failedTokens.length} expired tokens for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
);
