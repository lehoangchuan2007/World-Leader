/**
 * WORLD LEADER - Giai đoạn 4: Dữ liệu mỏ Uranium thế giới (Cập nhật 2026)
 * Nguồn tư liệu: IAEA Red Book (Uranium Resources, Production and Demand),
 * World Nuclear Association (WNA), USGS (U.S. Geological Survey) và các cơ quan địa chất quốc gia.
 * Đầy đủ thông tin: Quốc gia, Tỉnh, Tên mỏ, Tình trạng, Nguồn dữ liệu, Trạng thái xác minh.
 */

import { UraniumDeposit } from '../types/factory';

export const VERIFIED_URANIUM_DEPOSITS: UraniumDeposit[] = [
  // 1. VIỆT NAM (Vietnam - 704)
  {
    countryId: '704',
    countryName: 'Việt Nam',
    provinceId: 'vn_quangnam',
    provinceName: 'Quảng Nam',
    depositName: 'Cụm mỏ Nông Sơn - Bến Giằng (Pơ-lô, Khe Hoa)',
    status: 'unexploited',
    source: 'Cục Địa chất và Khoáng sản Việt Nam / Báo cáo IAEA Red Book',
    isVerified: true,
    notes: 'Trữ lượng sa khoáng và quặng uranium sa thạch tại Quảng Nam được khảo sát kỹ lưỡng trong các chương trình địa chất quốc gia.',
  },

  // 2. KAZAKHSTAN (Quốc gia khai thác uranium lớn nhất thế giới)
  {
    countryId: '398',
    countryName: 'Kazakhstan',
    provinceId: 'kz_turkistan',
    provinceName: 'Turkistan',
    depositName: 'Cụm mỏ Tortkuduk, Mynkuduk, Inkai, Budenovskoye',
    status: 'active',
    source: 'Kazatomprom / IAEA Red Book 2024-2026',
    isVerified: true,
    notes: 'Khu vực khai thác công nghệ ISL có sản lượng hàng đầu thế giới.',
  },
  {
    countryId: '398',
    countryName: 'Kazakhstan',
    provinceId: 'kz_kyzylorda',
    provinceName: 'Kyzylorda',
    depositName: 'Mỏ Kharasan, South Inkai, Baiken-U',
    status: 'active',
    source: 'Kazatomprom / WNA (World Nuclear Association)',
    isVerified: true,
  },

  // 3. CANADA (Trữ lượng phẩm cấp cao nhất)
  {
    countryId: '124',
    countryName: 'Canada',
    provinceId: 'ca_saskatchewan',
    provinceName: 'Saskatchewan',
    depositName: 'Bồn địa Athabasca (Mỏ Cigar Lake, McArthur River, Rabbit Lake)',
    status: 'active',
    source: 'Cameco / Natural Resources Canada / WNA',
    isVerified: true,
    notes: 'Cigar Lake và McArthur River sở hữu quặng uranium có hàm lượng U3O8 cao gấp 100 lần trung bình toàn cầu.',
  },

  // 4. ÚC (Australia - Trữ lượng tài nguyên lớn nhất thế giới)
  {
    countryId: '036',
    countryName: 'Úc',
    provinceId: 'au_south_australia',
    provinceName: 'Nam Úc (South Australia)',
    depositName: 'Mỏ Olympic Dam (BHP), Beverley, Four Mile',
    status: 'active',
    source: 'Geoscience Australia / BHP / IAEA',
    isVerified: true,
    notes: 'Olympic Dam là mỏ mỏ đa kim đồng-uranium-vàng có trữ lượng uranium lớn nhất thế giới.',
  },
  {
    countryId: '036',
    countryName: 'Úc',
    provinceId: 'au_northern_territory',
    provinceName: 'Lãnh thổ phía Bắc (Northern Territory)',
    depositName: 'Mỏ Ranger, Mỏ Jabiluka',
    status: 'inactive',
    source: 'Energy Resources of Australia / Geoscience Australia',
    isVerified: true,
    notes: 'Mỏ Ranger đã kết thúc khai thác năm 2021 và đang trong giai đoạn phục hồi môi trường, mỏ Jabiluka chưa khai thác.',
  },

  // 5. NAMIBIA (Châu Phi)
  {
    countryId: '516',
    countryName: 'Namibia',
    provinceId: 'na_erongo',
    provinceName: 'Erongo',
    depositName: 'Mỏ Husab, Mỏ Rössing, Mỏ Langer Heinrich',
    status: 'active',
    source: 'Ministry of Mines and Energy Namibia / WNA',
    isVerified: true,
    notes: 'Husab là một trong những mỏ lộ thiên lớn nhất thế giới do CGN vận hành.',
  },

  // 6. NIGER (Châu Phi)
  {
    countryId: '562',
    countryName: 'Niger',
    provinceId: 'ne_agadez',
    provinceName: 'Agadez',
    depositName: 'Mỏ Arlit (SOMAIR), Mỏ Akouta (COMINAK), Mỏ Imouraren',
    status: 'active',
    source: 'Orano / IAEA Red Book / Bộ Dầu khí và Khoáng sản Niger',
    isVerified: true,
  },

  // 7. NGA (Russia - 643)
  {
    countryId: '643',
    countryName: 'Nga',
    provinceId: 'ru_zabaykalsky',
    provinceName: 'Zabaykalsky Krai',
    depositName: 'Khu liên hợp khai thác quặng Priargunsky (Krasnokamensk)',
    status: 'active',
    source: 'ARMZ Uranium Holding / Rosatom / IAEA',
    isVerified: true,
    notes: 'Trung tâm khai thác mỏ hầm lò uranium truyền thống và lớn nhất của Nga.',
  },
  {
    countryId: '643',
    countryName: 'Nga',
    provinceId: 'ru_kurgan',
    provinceName: 'Kurgan Oblast',
    depositName: 'Mỏ Dalur (Zatobolskoye, Ukhoboy)',
    status: 'active',
    source: 'Rosatom / ARMZ',
    isVerified: true,
  },
  {
    countryId: '643',
    countryName: 'Nga',
    provinceId: 'ru_buryatia',
    provinceName: 'Cộng hòa Buryatia',
    depositName: 'Mỏ Khiagda',
    status: 'active',
    source: 'ARMZ / WNA',
    isVerified: true,
  },

  // 8. TRUNG QUỐC (China - 156)
  {
    countryId: '156',
    countryName: 'Trung Quốc',
    provinceId: 'cn_xinjiang',
    provinceName: 'Tân Cương (Xinjiang)',
    depositName: 'Mỏ Yining, bồn địa Ili',
    status: 'active',
    source: 'CNNC (China National Nuclear Corp) / IAEA',
    isVerified: true,
  },
  {
    countryId: '156',
    countryName: 'Trung Quốc',
    provinceId: 'cn_inner_mongolia',
    provinceName: 'Nội Mông (Inner Mongolia)',
    depositName: 'Mỏ Dongsheng, Mỏ Daying (Bồn địa Ordos)',
    status: 'active',
    source: 'CNNC / WNA',
    isVerified: true,
  },
  {
    countryId: '156',
    countryName: 'Trung Quốc',
    provinceId: 'cn_jiangxi',
    provinceName: 'Giang Tây (Jiangxi)',
    depositName: 'Mỏ Xiangshan (Huyện Lạc An)',
    status: 'active',
    source: 'CNNC / IAEA Red Book',
    isVerified: true,
  },

  // 9. HOA KỲ (United States of America - 840)
  {
    countryId: '840',
    countryName: 'Hoa Kỳ',
    provinceId: 'us_wyoming',
    provinceName: 'Wyoming',
    depositName: 'Bồn địa Powder River (Smith Ranch-Highland, Lost Creek)',
    status: 'active',
    source: 'USGS / US EIA / Cameco / Ur-Energy',
    isVerified: true,
  },
  {
    countryId: '840',
    countryName: 'Hoa Kỳ',
    provinceId: 'us_new_mexico',
    provinceName: 'New Mexico',
    depositName: 'Vành đai khoáng sản Grants (Mỏ Mt. Taylor, Ambrosia Lake)',
    status: 'inactive',
    source: 'USGS Bulletin / New Mexico Bureau of Geology',
    isVerified: true,
    notes: 'Khu vực từng là nguồn cung cấp uranium lớn nhất lịch sử nước Mỹ trong thế kỷ 20.',
  },
  {
    countryId: '840',
    countryName: 'Hoa Kỳ',
    provinceId: 'us_utah',
    provinceName: 'Utah',
    depositName: 'Mỏ White Mesa / Thung lũng Lisbon',
    status: 'active',
    source: 'Energy Fuels / USGS',
    isVerified: true,
  },

  // 10. UZBEKISTAN
  {
    countryId: '860',
    countryName: 'Uzbekistan',
    provinceId: 'uz_navoiy',
    provinceName: 'Navoiy',
    depositName: 'Cụm mỏ sa thạch Uchkuduk, Muruntau, Sugraly',
    status: 'active',
    source: 'Navoi Mining / IAEA Red Book',
    isVerified: true,
  },

  // 11. NAM PHI (South Africa - 710)
  {
    countryId: '710',
    countryName: 'Nam Phi',
    provinceId: 'za_gauteng',
    provinceName: 'Gauteng',
    depositName: 'Bồn địa Witwatersrand (Khai thác đồng hành cùng vàng)',
    status: 'active',
    source: 'Minerals Council South Africa / IAEA',
    isVerified: true,
  },

  // 12. UKRAINE
  {
    countryId: '804',
    countryName: 'Ukraine',
    provinceId: 'ua_kirovohrad',
    provinceName: 'Kirovohrad',
    depositName: 'Mỏ Novokostyantynivka, Mỏ Smolinske',
    status: 'active',
    source: 'VostGOK / IAEA Red Book',
    isVerified: true,
  },

  // 13. BRAZIL
  {
    countryId: '076',
    countryName: 'Brazil',
    provinceId: 'br_bahia',
    provinceName: 'Bahia',
    depositName: 'Mỏ Caetité (Lagoa Real)',
    status: 'active',
    source: 'INB (Indústrias Nucleares do Brasil) / IAEA',
    isVerified: true,
  },

  // 14. ẤN ĐỘ (India - 356)
  {
    countryId: '356',
    countryName: 'Ấn Độ',
    provinceId: 'in_jharkhand',
    provinceName: 'Jharkhand',
    depositName: 'Vành đai quặng Singhbhum (Jaduguda, Narwapahar, Turamdih)',
    status: 'active',
    source: 'UCIL (Uranium Corp of India) / DAE India',
    isVerified: true,
  },
  {
    countryId: '356',
    countryName: 'Ấn Độ',
    provinceId: 'in_andhra_pradesh',
    provinceName: 'Andhra Pradesh',
    depositName: 'Mỏ Tummalapalle',
    status: 'active',
    source: 'UCIL / IAEA Red Book',
    isVerified: true,
  },

  // 15. ĐỨC (Germany - 276)
  {
    countryId: '276',
    countryName: 'Đức',
    provinceId: 'de_saxony',
    provinceName: 'Saxony (Sachsen)',
    depositName: 'Mỏ Wismut / Vùng Erzgebirge (Schlema-Alberoda, Königstein)',
    status: 'depleted',
    source: 'Wismut GmbH / BGR (Federal Institute for Geosciences and Natural Resources)',
    isVerified: true,
    notes: 'Khu mỏ lịch sử khổng lồ thời kỳ Chiến tranh Lạnh, hiện đã kết thúc khai thác và cải tạo.',
  },

  // 16. PHÁP (France - 250)
  {
    countryId: '250',
    countryName: 'Pháp',
    provinceId: 'fr_nouvelle_aquitaine',
    provinceName: 'Nouvelle-Aquitaine',
    depositName: 'Mỏ mỏ vùng Limousin (Bellezane, Jouac, Margnac)',
    status: 'depleted',
    source: 'IRSN (Institut de Radioprotection et de Sûreté Nucléaire) / Orano',
    isVerified: true,
    notes: 'Đã ngừng khai thác năm 2001 sau khi cung cấp hơn 70.000 tấn uranium cho chương trình hạt nhân Pháp.',
  },

  // 17. CỘNG HÒA SÉC (Czech Republic - 203)
  {
    countryId: '203',
    countryName: 'Cộng hòa Séc',
    provinceId: 'cz_vysocina',
    provinceName: 'Vysočina',
    depositName: 'Mỏ Rožná I',
    status: 'depleted',
    source: 'DIAMO / IAEA',
    isVerified: true,
    notes: 'Mỏ uranium cuối cùng tại Trung Âu, kết thúc khai thác năm 2017.',
  },
];

/**
 * Tra cứu mỏ uranium theo mã tỉnh
 */
export function getUraniumDepositForProvince(provinceId: string): UraniumDeposit | undefined {
  return VERIFIED_URANIUM_DEPOSITS.find((d) => d.provinceId === provinceId);
}

/**
 * Kiểm tra tỉnh có mỏ uranium được xác minh hay không
 */
export function hasVerifiedUraniumDeposit(provinceId: string): boolean {
  return VERIFIED_URANIUM_DEPOSITS.some((d) => d.provinceId === provinceId && d.isVerified);
}
