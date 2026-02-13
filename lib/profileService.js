import { db } from './firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { calculateSaju } from './sajuCalculator';

/**
 * saved_profiles 컬렉션 관리 서비스
 */
export const ProfileService = {
  /**
   * 새로운 프로필 추가
   * @param {string} uid - 현재 사용자 UID
   * @param {object} profileData - 프로필 정보 (이름, 생년월일 등)
   */
  async addSavedProfile(uid, profileData) {
    try {
      if (!uid) throw new Error('User ID is required');

      // 사주 데이터 계산
      const effectiveTime = profileData.isTimeUnknown ? '12:00' : profileData.birthTime || '12:00';
      const inputDateFull = `${profileData.birthDate}T${effectiveTime}`;

      const saju = calculateSaju(
        inputDateFull,
        profileData.isTimeUnknown
      );

      const newProfile = {
        displayName: profileData.displayName,
        birthDate: profileData.birthDate,
        birthTime: effectiveTime,
        isTimeUnknown: !!profileData.isTimeUnknown,
        gender: profileData.gender,
        birthCity: profileData.birthCity,
        relationship: profileData.relationship || 'friend',
        saju,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'users', uid, 'saved_profiles'), newProfile);
      return { id: docRef.id, ...newProfile };
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  },

  /**
   * 저장된 프로필 목록 가져오기
   * @param {string} uid 
   */
  async getSavedProfiles(uid) {
    try {
      if (!uid) return [];

      console.log('✅[getSavedProfiles] Fetching for uid:', uid);
      const q = query(collection(db, 'users', uid, 'saved_profiles'));
      const querySnapshot = await getDocs(q);

      const profiles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort in memory to avoid index requirements
      return profiles.sort((a, b) => {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        return dateB.localeCompare(dateA);
      });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
  },

  /**
   * 프로필 수정
   */
  async updateSavedProfile(uid, profileId, profileData) {
    try {
      const docRef = doc(db, 'users', uid, 'saved_profiles', profileId);

      // 사주 재계산 (날짜 변경되었을 수 있으므로)
      let saju = profileData.saju;
      if (profileData.birthDate) {
        const effectiveTime = profileData.isTimeUnknown ? '12:00' : profileData.birthTime || '12:00';
        const inputDateFull = `${profileData.birthDate}T${effectiveTime}`;
        saju = calculateSaju(inputDateFull, profileData.isTimeUnknown);
      }

      const updateData = {
        ...profileData,
        saju: saju || profileData.saju, // 새로 계산했거나 기존 것 유지
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updateData);
      return { id: profileId, ...updateData };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * 프로필 삭제
   */
  async deleteSavedProfile(uid, profileId) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'saved_profiles', profileId));
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
};
