export type SgkSupportStatus = "UYGUN" | "POTANSIYEL" | "UYGUN DEGIL" | "UYGUN DEGIL / RISKLI";

export type AdayCinsiyet = "Kadin" | "Erkek" | "Belirtmek istemiyor / bilinmiyor" | "Bilinmiyor";

export interface SgkFormState {
  ozel_sektor: boolean;
  imalat: boolean;
  sgk_borcu_yok: boolean;
  bildirgeler_suresinde: boolean;
  primler_suresinde: boolean;
  kayit_disi_risk_yok: boolean;
  kamu_ihalesi_is: boolean;
  calisan_sayisi: number;
  ortalama_calisan_sayisi: number;

  yatirim_tesvik_belgesi: boolean;
  ytb_tamamlama_vizesi: boolean;
  yurtdisina_personel_gonderiyor: boolean;
  arge_tasarim_merkezi: boolean;
  teknokent: boolean;
  arge_personeli_var: boolean;
  kultur_belgesi: boolean;
  cok_tehlikeli: boolean;
  is_kazasi_yok: boolean;

  yeni_ise_alim_var: boolean;
  aday_yas: number;
  aday_cinsiyet: AdayCinsiyet;
  aday_son_6_ay_issiz: boolean;
  aday_ortalama_ilave: boolean;
  aday_mesleki_belge: boolean;
  aday_iskur_kayitli: boolean;
  aday_issizlik_odenegi: boolean;
  aday_onceki_isyerine_donus: boolean;
  aday_engelli: boolean;
  aday_2828: boolean;
  aday_sosyal_yardim: boolean;

  bagkur_mukellefi: boolean;
  bagkur_borcu_yok: boolean;
}

export interface SgkTesvikSonucu {
  ad: string;
  durum: SgkSupportStatus;
  mevzuat: string;
  fayda: string;
  gerekce: string[];
  aksiyon: string[];
  risk_notu: string[];
}

export interface SgkEvaluationSummary {
  uygunCount: number;
  potansiyelCount: number;
  riskliCount: number;
  totalCount: number;
}

export const createInitialSgkFormState = (): SgkFormState => ({
  ozel_sektor: true,
  imalat: false,
  sgk_borcu_yok: true,
  bildirgeler_suresinde: true,
  primler_suresinde: true,
  kayit_disi_risk_yok: true,
  kamu_ihalesi_is: false,
  calisan_sayisi: 0,
  ortalama_calisan_sayisi: 0,

  yatirim_tesvik_belgesi: false,
  ytb_tamamlama_vizesi: false,
  yurtdisina_personel_gonderiyor: false,
  arge_tasarim_merkezi: false,
  teknokent: false,
  arge_personeli_var: false,
  kultur_belgesi: false,
  cok_tehlikeli: false,
  is_kazasi_yok: true,

  yeni_ise_alim_var: false,
  aday_yas: 0,
  aday_cinsiyet: "Belirtmek istemiyor / bilinmiyor",
  aday_son_6_ay_issiz: false,
  aday_ortalama_ilave: false,
  aday_mesleki_belge: false,
  aday_iskur_kayitli: false,
  aday_issizlik_odenegi: false,
  aday_onceki_isyerine_donus: false,
  aday_engelli: false,
  aday_2828: false,
  aday_sosyal_yardim: false,

  bagkur_mukellefi: false,
  bagkur_borcu_yok: true,
});

