/**
 * WORLD LEADER - Giai đoạn 2: Government System
 * Điều phối hoạt động bổ nhiệm (thuê) và miễn nhiệm (sa thải) nhân sự
 * cho đúng 3 chức vụ: Thủ tướng, Bộ trưởng Bộ Tài chính, Bộ trưởng Bộ Quốc phòng.
 * Đảm bảo:
 * - Mỗi chức vụ chỉ có tối đa 1 người đảm nhiệm.
 * - Khi sa thải: chức vụ trở về trạng thái trống (null - CHƯA BỔ NHIỆM).
 * - Không tự động bổ nhiệm người thay thế khi sa thải.
 * - Cơ chế AI tối thiểu cho các quốc gia do AI quản lý, không can thiệp vào người chơi.
 */

import {
  Candidate,
  CountryPoliticalData,
  Government,
  GovernmentPosition,
  Personnel,
} from '../types/politics';
import { createPersonnelFromCandidate } from './personnelSystem';
import { generateCandidateList } from './candidateGenerator';

export interface HireResult {
  success: boolean;
  message: string;
  updatedGovernment?: Government;
}

export interface FireResult {
  success: boolean;
  message: string;
  firedPersonnel?: Personnel;
  updatedGovernment?: Government;
}

/**
 * Kiểm tra chức vụ có đang trống không
 */
export function isPositionVacant(
  government: Government,
  position: GovernmentPosition
): boolean {
  return government[position] === null;
}

/**
 * Thuê nhân sự (bổ nhiệm ứng viên vào chức vụ)
 */
export function hirePersonnelForPosition(
  government: Government,
  position: GovernmentPosition,
  candidate: Candidate
): HireResult {
  // Kiểm tra chức vụ đã có người đảm nhiệm chưa
  if (!isPositionVacant(government, position)) {
    return {
      success: false,
      message: 'Chức vụ này hiện đã có người đảm nhiệm. Không thể bổ nhiệm người thứ hai.',
    };
  }

  // Chuyển ứng viên thành nhân sự chính thức
  const newPersonnel = createPersonnelFromCandidate(candidate);

  const updatedGovernment: Government = {
    ...government,
    [position]: newPersonnel,
  };

  return {
    success: true,
    message: `Đã bổ nhiệm thành công ${newPersonnel.fullName} vào chức vụ.`,
    updatedGovernment,
  };
}

/**
 * Sa thải nhân sự (miễn nhiệm vị trí)
 * Sau khi sa thải, vị trí chuyển thành null ("CHƯA BỔ NHIỆM"), không tự động tuyển thay thế.
 */
export function firePersonnelFromPosition(
  government: Government,
  position: GovernmentPosition
): FireResult {
  const currentPersonnel = government[position];

  if (!currentPersonnel) {
    return {
      success: false,
      message: 'Chức vụ này hiện đang trống, không có nhân sự để sa thải.',
    };
  }

  const updatedGovernment: Government = {
    ...government,
    [position]: null,
  };

  return {
    success: true,
    message: `Đã sa thải ${currentPersonnel.fullName} khỏi chức vụ.`,
    firedPersonnel: currentPersonnel,
    updatedGovernment,
  };
}

/**
 * Cơ chế quản lý nhân sự tự động tối thiểu của AI cho các quốc gia do AI quản lý
 * - AI kiểm tra các chức vụ trống của mình và thuê nhân sự mới từ danh sách ứng viên
 * - Đôi khi AI có thể sa thải một nhân sự có tuổi quá cao (> 72 tuổi) hoặc năng lực rất thấp (< 35)
 * - Tuyệt đối không can thiệp vào quốc gia của người chơi
 */
export function runAiGovernmentTick(
  countriesData: Record<string, CountryPoliticalData>,
  playerCountryId: string | null
): {
  updatedCountries: Record<string, CountryPoliticalData>;
  changedCountryIds: string[];
} {
  const updated = { ...countriesData };
  const changedCountryIds: string[] = [];

  const countryIds = Object.keys(updated);
  if (countryIds.length === 0) {
    return { updatedCountries: updated, changedCountryIds };
  }

  // Chọn ngẫu nhiên một vài quốc gia AI để xử lý mỗi chu kỳ nhằm tiết kiệm tài nguyên
  const sampleCount = Math.min(countryIds.length, 3);
  for (let i = 0; i < sampleCount; i++) {
    const randomId = countryIds[Math.floor(Math.random() * countryIds.length)];

    // BỎ QUA NẾU LÀ QUỐC GIA NGƯỜI CHƠI
    if (playerCountryId && randomId === playerCountryId) {
      continue;
    }

    const country = updated[randomId];
    if (!country) continue;

    let gov = { ...country.government };
    let hasChange = false;
    const positions: GovernmentPosition[] = ['primeMinister', 'financeMinister', 'defenseMinister'];

    for (const pos of positions) {
      const current = gov[pos];

      // Nếu vị trí trống, AI tự động sinh ứng viên và thuê nhân sự tốt nhất
      if (!current) {
        const candidates = generateCandidateList(country.countryName, country.countryName, pos, 3);
        if (candidates.length > 0) {
          // AI chọn ứng viên có năng lực quản lý cao nhất
          candidates.sort((a, b) => b.managementAbility - a.managementAbility);
          const bestCandidate = candidates[0];
          const result = hirePersonnelForPosition(gov, pos, bestCandidate);
          if (result.success && result.updatedGovernment) {
            gov = result.updatedGovernment;
            hasChange = true;
          }
        }
      } else {
        // Trường hợp rất hiếm (khoảng 1% mỗi chu kỳ tick): AI sa thải nhân sự quá cao tuổi (> 75)
        if (current.age > 75 && Math.random() < 0.05) {
          const fireRes = firePersonnelFromPosition(gov, pos);
          if (fireRes.success && fireRes.updatedGovernment) {
            gov = fireRes.updatedGovernment;
            hasChange = true;
          }
        }
      }
    }

    if (hasChange) {
      updated[randomId] = {
        ...country,
        government: gov,
      };
      changedCountryIds.push(randomId);
    }
  }

  return { updatedCountries: updated, changedCountryIds };
}
