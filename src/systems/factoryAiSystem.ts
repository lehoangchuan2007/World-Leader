/**
 * WORLD LEADER - Giai đoạn 4: Factory AI Automation System
 * AI quản lý tự động xây dựng và nâng cấp nhà máy cho các quốc gia do AI điều hành.
 * Tuân thủ đầy đủ các giới hạn giống người chơi:
 * - Không can thiệp vào quốc gia người chơi.
 * - Tuân thủ thời gian xây dựng, quy tắc loại trừ dầu/lương thực, điều kiện mỏ uranium.
 * - Nâng cấp tuần tự, không nhảy cóc.
 */

import { FactoryInstance, FactoryType } from '../types/factory';
import { getProvincesForCountry } from '../data/provinceData';
import {
  checkCanBuildFactory,
  checkCanUpgradeFactory,
  createNewFactoryInstance,
  startFactoryUpgrade,
} from './factoryConstructionSystem';

export interface AiFactoryCycleResult {
  newFactories: FactoryInstance[];
  upgradedFactories: FactoryInstance[];
}

/**
 * Chạy chu kỳ quyết định xây dựng/nâng cấp của AI cho các quốc gia AI
 * Kích hoạt định kỳ (ví dụ mỗi đầu tháng game) để tối ưu hiệu năng
 */
export function runAiFactoryCycle(
  allFactories: FactoryInstance[],
  aiCountryIds: string[],
  playerCountryId: string | null,
  gameDate: { day: number; month: number; year: number }
): FactoryInstance[] {
  let updatedList = [...allFactories];

  // Lọc danh sách quốc gia AI (tuyệt đối loại trừ quốc gia người chơi)
  const validAiCountries = aiCountryIds.filter((id) => id !== playerCountryId);
  if (validAiCountries.length === 0) return updatedList;

  // Chọn ngẫu nhiên một vài quốc gia AI trong mỗi chu kỳ
  const sampleCount = Math.min(validAiCountries.length, 3);
  const selectedCountries: string[] = [];
  while (selectedCountries.length < sampleCount) {
    const randomId = validAiCountries[Math.floor(Math.random() * validAiCountries.length)];
    if (!selectedCountries.includes(randomId)) {
      selectedCountries.push(randomId);
    }
  }

  for (const cId of selectedCountries) {
    const provinces = getProvincesForCountry(cId, `Quốc gia ${cId}`);
    if (provinces.length === 0) continue;

    const countryFactories = updatedList.filter((f) => f.countryId === cId);

    // Quyết định hành động: 50% nâng cấp nhà máy hiện có (nếu có thể), 50% xây mới
    const shouldTryUpgrade = Math.random() > 0.5 && countryFactories.length > 0;

    let actionTaken = false;

    if (shouldTryUpgrade) {
      // Tìm nhà máy có thể nâng cấp
      for (const fac of countryFactories) {
        const upgradeCheck = checkCanUpgradeFactory(fac);
        if (upgradeCheck.canUpgrade) {
          const upgraded = startFactoryUpgrade(fac, gameDate);
          updatedList = updatedList.map((f) => (f.id === fac.id ? upgraded : f));
          actionTaken = true;
          break;
        }
      }
    }

    // Nếu chưa nâng cấp thì thử tìm một tỉnh để xây mới
    if (!actionTaken) {
      // Xáo trộn danh sách tỉnh để AI lựa chọn tự nhiên
      const shuffledProvinces = [...provinces].sort(() => Math.random() - 0.5);

      for (const prov of shuffledProvinces) {
        const provFactories = countryFactories.filter((f) => f.provinceId === prov.id);

        // 1. Ưu tiên xây Uranium nếu tỉnh có mỏ uranium và chưa có nhà máy uranium
        if (prov.hasUraniumDeposit) {
          const uCheck = checkCanBuildFactory(prov, 'uranium', provFactories);
          if (uCheck.canBuild) {
            const newU = createNewFactoryInstance(cId, prov.id, 'uranium', gameDate);
            updatedList.push(newU);
            actionTaken = true;
            break;
          }
        }

        // 2. Nếu chưa có nhà máy dầu/lương thực thì chọn ngẫu nhiên dầu hoặc lương thực
        const candidateType: FactoryType = Math.random() > 0.5 ? 'oil' : 'food';
        const buildCheck = checkCanBuildFactory(prov, candidateType, provFactories);
        if (buildCheck.canBuild) {
          const newFac = createNewFactoryInstance(cId, prov.id, candidateType, gameDate);
          updatedList.push(newFac);
          actionTaken = true;
          break;
        }
      }
    }
  }

  return updatedList;
}
