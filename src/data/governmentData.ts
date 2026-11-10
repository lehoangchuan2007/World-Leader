/**
 * WORLD LEADER - Giai đoạn 2: Dữ liệu bộ máy nhà nước ban đầu
 * Khởi tạo bộ máy nhà nước cho các quốc gia với đúng 3 chức vụ:
 * Thủ tướng, Bộ trưởng Bộ Tài chính, Bộ trưởng Bộ Quốc phòng.
 */

import { Government, CountryPoliticalData } from '../types/politics';
import { getCountryPoliticalRegime } from './politicalData';
import { generateCandidateList } from '../systems/candidateGenerator';
import { createPersonnelFromCandidate } from '../systems/personnelSystem';

/**
 * Tạo một bộ máy nhà nước trống (3 chức vụ đều chưa bổ nhiệm)
 */
export function createEmptyGovernment(): Government {
  return {
    primeMinister: null,
    financeMinister: null,
    defenseMinister: null,
  };
}

/**
 * Khởi tạo bộ máy nhà nước hoàn chỉnh với các nhân sự hư cấu ban đầu
 * Dùng cho quốc gia khởi đầu hoặc các quốc gia AI
 */
export function createPopulatedGovernment(
  countryName: string,
  nationality: string
): Government {
  const pmCandidates = generateCandidateList(countryName, nationality, 'primeMinister', 1);
  const finCandidates = generateCandidateList(countryName, nationality, 'financeMinister', 1);
  const defCandidates = generateCandidateList(countryName, nationality, 'defenseMinister', 1);

  return {
    primeMinister: createPersonnelFromCandidate(pmCandidates[0]),
    financeMinister: createPersonnelFromCandidate(finCandidates[0]),
    defenseMinister: createPersonnelFromCandidate(defCandidates[0]),
  };
}

/**
 * Khởi tạo dữ liệu chính trị và bộ máy nhà nước cho một quốc gia
 */
export function initializeCountryPoliticalData(
  countryId: string,
  countryName: string,
  nationality: string,
  populateMinisters: boolean = true
): CountryPoliticalData {
  const metadata = getCountryPoliticalRegime(countryId, countryName);
  const government = populateMinisters
    ? createPopulatedGovernment(countryName, nationality)
    : createEmptyGovernment();

  return {
    countryId,
    countryName,
    politicalRegime: metadata.regime,
    historicalBasis: metadata.historicalBasis,
    isVerified: metadata.isVerified,
    government,
  };
}
