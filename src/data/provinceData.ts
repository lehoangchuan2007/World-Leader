/**
 * WORLD LEADER - Giai đoạn 4: Dữ liệu Tỉnh / Đơn vị hành chính cấp 1 thế giới
 * Quy định nghiêm ngặt: Đơn vị xây dựng là TỈNH, không phải thành phố.
 * Sử dụng ID ổn định (stable ID) làm khóa dữ liệu.
 */

import { Province } from '../types/factory';
import { getUraniumDepositForProvince, hasVerifiedUraniumDeposit } from './uraniumDepositsData';

// Danh mục tỉnh/bang xác thực cho các quốc gia chính
export const PRIMARY_PROVINCES: Record<string, { id: string; name: string }[]> = {
  // VIỆT NAM (704)
  '704': [
    { id: 'vn_quangnam', name: 'Quảng Nam' }, // Có mỏ Uranium Nông Sơn
    { id: 'vn_hanoi', name: 'Hà Nội' },
    { id: 'vn_tphcm', name: 'TP. Hồ Chí Minh' },
    { id: 'vn_danang', name: 'Đà Nẵng' },
    { id: 'vn_haiphong', name: 'Hải Phòng' },
    { id: 'vn_quangninh', name: 'Quảng Ninh' },
    { id: 'vn_nghean', name: 'Nghệ An' },
    { id: 'vn_thanhhoa', name: 'Thanh Hóa' },
    { id: 'vn_thuathienhue', name: 'Thừa Thiên Huế' },
    { id: 'vn_khanhhoa', name: 'Khánh Hòa' },
    { id: 'vn_daklak', name: 'Đắk Lắk' },
    { id: 'vn_lamdong', name: 'Lâm Đồng' },
    { id: 'vn_dongnai', name: 'Đồng Nai' },
    { id: 'vn_cantho', name: 'Cần Thơ' },
    { id: 'vn_binhthuan', name: 'Bình Thuận' },
    { id: 'vn_angiang', name: 'An Giang' },
  ],

  // HOA KỲ (840)
  '840': [
    { id: 'us_wyoming', name: 'Wyoming' },         // Mỏ Uranium Powder River
    { id: 'us_new_mexico', name: 'New Mexico' },   // Mỏ Uranium Grants
    { id: 'us_utah', name: 'Utah' },               // Mỏ Uranium Lisbon Valley
    { id: 'us_texas', name: 'Texas' },
    { id: 'us_california', name: 'California' },
    { id: 'us_new_york', name: 'New York' },
    { id: 'us_florida', name: 'Florida' },
    { id: 'us_washington', name: 'Washington' },
    { id: 'us_illinois', name: 'Illinois' },
    { id: 'us_pennsylvania', name: 'Pennsylvania' },
    { id: 'us_ohio', name: 'Ohio' },
    { id: 'us_alaska', name: 'Alaska' },
  ],

  // KAZAKHSTAN (398)
  '398': [
    { id: 'kz_turkistan', name: 'Turkistan' },     // Cụm mỏ Uranium Tortkuduk, Inkai
    { id: 'kz_kyzylorda', name: 'Kyzylorda' },     // Cụm mỏ Uranium Kharasan
    { id: 'kz_akmola', name: 'Akmola' },
    { id: 'kz_almaty', name: 'Almaty' },
    { id: 'kz_karaganda', name: 'Karaganda' },
    { id: 'kz_mangystau', name: 'Mangystau' },
    { id: 'kz_pavlodar', name: 'Pavlodar' },
    { id: 'kz_atyrau', name: 'Atyrau' },
  ],

  // CANADA (124)
  '124': [
    { id: 'ca_saskatchewan', name: 'Saskatchewan' }, // Mỏ Uranium Cigar Lake, McArthur River
    { id: 'ca_ontario', name: 'Ontario' },
    { id: 'ca_quebec', name: 'Quebec' },
    { id: 'ca_alberta', name: 'Alberta' },
    { id: 'ca_british_columbia', name: 'British Columbia' },
    { id: 'ca_manitoba', name: 'Manitoba' },
    { id: 'ca_nova_scotia', name: 'Nova Scotia' },
  ],

  // ÚC (036)
  '036': [
    { id: 'au_south_australia', name: 'Nam Úc (South Australia)' }, // Mỏ Olympic Dam
    { id: 'au_northern_territory', name: 'Lãnh thổ Bắc Úc' },       // Mỏ Ranger, Jabiluka
    { id: 'au_western_australia', name: 'Tây Úc (Western Australia)' },
    { id: 'au_new_south_wales', name: 'New South Wales' },
    { id: 'au_queensland', name: 'Queensland' },
    { id: 'au_victoria', name: 'Victoria' },
    { id: 'au_tasmania', name: 'Tasmania' },
  ],

  // NGA (643)
  '643': [
    { id: 'ru_zabaykalsky', name: 'Zabaykalsky Krai' }, // Mỏ Uranium Priargunsky
    { id: 'ru_kurgan', name: 'Kurgan Oblast' },         // Mỏ Uranium Dalur
    { id: 'ru_buryatia', name: 'Cộng hòa Buryatia' },   // Mỏ Uranium Khiagda
    { id: 'ru_moscow', name: 'Tỉnh Moscow' },
    { id: 'ru_spb', name: 'Tỉnh Leningrad' },
    { id: 'ru_sverdlovsk', name: 'Sverdlovsk Oblast' },
    { id: 'ru_krasnoyarsk', name: 'Krasnoyarsk Krai' },
    { id: 'ru_tyumen', name: 'Tyumen Oblast' },
    { id: 'ru_tatarstan', name: 'Cộng hòa Tatarstan' },
  ],

  // TRUNG QUỐC (156)
  '156': [
    { id: 'cn_xinjiang', name: 'Tân Cương (Xinjiang)' },     // Mỏ Uranium Yining
    { id: 'cn_inner_mongolia', name: 'Nội Mông' },           // Mỏ Uranium Dongsheng
    { id: 'cn_jiangxi', name: 'Giang Tây (Jiangxi)' },       // Mỏ Uranium Xiangshan
    { id: 'cn_guangdong', name: 'Quảng Đông' },
    { id: 'cn_shandong', name: 'Sơn Đông' },
    { id: 'cn_sichuan', name: 'Tứ Xuyên' },
    { id: 'cn_henan', name: 'Hà Nam' },
    { id: 'cn_zhejiang', name: 'Chiết Giang' },
    { id: 'cn_jiangsu', name: 'Giang Tô' },
    { id: 'cn_hubei', name: 'Hồ Bắc' },
  ],

  // PHÁP (250)
  '250': [
    { id: 'fr_nouvelle_aquitaine', name: 'Nouvelle-Aquitaine' }, // Vùng mỏ Limousin
    { id: 'fr_ile_de_france', name: 'Île-de-France' },
    { id: 'fr_auvergne_rhone_alpes', name: 'Auvergne-Rhône-Alpes' },
    { id: 'fr_occitanie', name: 'Occitanie' },
    { id: 'fr_hauts_de_france', name: 'Hauts-de-France' },
    { id: 'fr_paca', name: 'Provence-Alpes-Côte d\'Azur' },
  ],

  // VƯƠNG QUỐC ANH (826)
  '826': [
    { id: 'uk_england_north', name: 'Bắc Anh (North England)' },
    { id: 'uk_scotland', name: 'Scotland' },
    { id: 'uk_wales', name: 'Wales' },
    { id: 'uk_northern_ireland', name: 'Bắc Ireland' },
    { id: 'uk_midlands', name: 'Midlands' },
    { id: 'uk_south_east', name: 'Đông Nam Anh' },
  ],

  // ĐỨC (276)
  '276': [
    { id: 'de_saxony', name: 'Saxony (Sachsen)' }, // Vùng mỏ Wismut
    { id: 'de_bavaria', name: 'Bavaria (Bayern)' },
    { id: 'de_nrw', name: 'Nordrhein-Westfalen' },
    { id: 'de_baden_wuerttemberg', name: 'Baden-Württemberg' },
    { id: 'de_hesse', name: 'Hessen' },
    { id: 'de_niedersachsen', name: 'Niedersachsen' },
  ],

  // NHẬT BẢN (392)
  '392': [
    { id: 'jp_kanto', name: 'Vùng Kanto' },
    { id: 'jp_kansai', name: 'Vùng Kansai' },
    { id: 'jp_chubu', name: 'Vùng Chubu' },
    { id: 'jp_hokkaido', name: 'Hokkaido' },
    { id: 'jp_kyushu', name: 'Kyushu' },
    { id: 'jp_tohoku', name: 'Tohoku' },
  ],

  // Ý (380)
  '380': [
    { id: 'it_lombardia', name: 'Lombardia' },
    { id: 'it_lazio', name: 'Lazio' },
    { id: 'it_piemonte', name: 'Piemonte' },
    { id: 'it_veneto', name: 'Veneto' },
    { id: 'it_sicilia', name: 'Sicilia' },
    { id: 'it_campania', name: 'Campania' },
  ],

  // THÁI LAN (764)
  '764': [
    { id: 'th_central', name: 'Vùng Trung tâm (Bangkok & lân cận)' },
    { id: 'th_north', name: 'Miền Bắc (Chiang Mai)' },
    { id: 'th_northeast', name: 'Isan (Đông Bắc)' },
    { id: 'th_south', name: 'Miền Nam (Phuket & Songkhla)' },
    { id: 'th_east', name: 'Miền Đông (Chonburi)' },
  ],

  // NAMIBIA (516)
  '516': [
    { id: 'na_erongo', name: 'Erongo' }, // Mỏ Rössing, Husab
    { id: 'na_khomas', name: 'Khomas' },
    { id: 'na_oshana', name: 'Oshana' },
    { id: 'na_otjozondjupa', name: 'Otjozondjupa' },
    { id: 'na_hardap', name: 'Hardap' },
  ],

  // NIGER (562)
  '562': [
    { id: 'ne_agadez', name: 'Agadez' }, // Mỏ Arlit, Imouraren
    { id: 'ne_niamey', name: 'Niamey' },
    { id: 'ne_maradi', name: 'Maradi' },
    { id: 'ne_zinder', name: 'Zinder' },
    { id: 'ne_tahoua', name: 'Tahoua' },
  ],
};

/**
 * Lấy danh sách đầy đủ các tỉnh của một quốc gia, tích hợp thông tin mỏ Uranium 2026
 */
export function getProvincesForCountry(countryId: string, countryName: string): Province[] {
  const registered = PRIMARY_PROVINCES[countryId];

  let rawList: { id: string; name: string }[] = [];

  if (registered && registered.length > 0) {
    rawList = registered;
  } else {
    // Đối với các quốc gia chưa có danh mục tỉnh chi tiết trong hệ thống,
    // khởi tạo 4 phân khu hành chính tiêu chuẩn (Bắc, Nam, Đông, Tây / Trung tâm)
    const prefix = countryId ? `c_${countryId.toLowerCase().replace(/[^a-z0-9]/g, '')}` : 'c_prov';
    rawList = [
      { id: `${prefix}_prov_1`, name: `Tỉnh Bắc ${countryName}` },
      { id: `${prefix}_prov_2`, name: `Tỉnh Nam ${countryName}` },
      { id: `${prefix}_prov_3`, name: `Tỉnh Đông ${countryName}` },
      { id: `${prefix}_prov_4`, name: `Tỉnh Tây ${countryName}` },
    ];
  }

  return rawList.map((item) => {
    const hasU = hasVerifiedUraniumDeposit(item.id);
    const uInfo = getUraniumDepositForProvince(item.id);

    return {
      id: item.id,
      name: item.name,
      countryId,
      countryName,
      hasUraniumDeposit: hasU,
      uraniumDepositInfo: uInfo,
    };
  });
}
