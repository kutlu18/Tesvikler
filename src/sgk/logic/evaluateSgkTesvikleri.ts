import { SgkEvaluationSummary, SgkFormState, SgkTesvikSonucu } from "../types";

const normalizeForEvaluation = (form: SgkFormState): SgkFormState => {
  if (form.yeni_ise_alim_var) {
    return form;
  }

  return {
    ...form,
    aday_yas: 0,
    aday_cinsiyet: "Bilinmiyor",
    aday_son_6_ay_issiz: false,
    aday_ortalama_ilave: false,
    aday_mesleki_belge: false,
    aday_iskur_kayitli: false,
    aday_issizlik_odenegi: false,
    aday_onceki_isyerine_donus: false,
    aday_engelli: false,
    aday_2828: false,
    aday_sosyal_yardim: false,
  };
};

const genelSgkSartlariSaglandiMi = (b: SgkFormState): boolean =>
  b.ozel_sektor &&
  b.sgk_borcu_yok &&
  b.bildirgeler_suresinde &&
  b.primler_suresinde &&
  b.kayit_disi_risk_yok &&
  !b.kamu_ihalesi_is;

const degerlendir5510Indirimi = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "5510 Malulluk, Yaslilik ve Olum Sigortasi Isveren Hissesi Indirimi",
    durum: "UYGUN DEGIL / RISKLI",
    mevzuat: "5510 sayili Kanun md. 81/1-i",
    fayda: "Ozel sektor isverenleri icin MYO isveren hissesi prim indirimi (genel 2 puan, imalatta 2026 sonuna kadar 5 puan kontrolu).",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (genelSgkSartlariSaglandiMi(b)) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Temel SGK tesvik kosullari saglaniyor.");
    sonuc.gerekce.push(
      b.imalat
        ? "Imalat sektorunde oldugu icin 2026 sonuna kadar 5 puan uygulamasi kontrol edilebilir."
        : "Imalat disi sektor oldugu icin genel indirim orani uzerinden degerlendirilmelidir."
    );
    sonuc.aksiyon.push("e-Bildirge/MUHSGK tahakkuklarinda ilgili kanun numarasi kontrol edilmeli.");
    sonuc.aksiyon.push("SGK borc, yapilandirma ve odeme sureleri her ay takip edilmelidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Genel SGK tesvik kosullarindan en az biri saglanmiyor.");
  if (!b.ozel_sektor) sonuc.risk_notu.push("Kamu isverenleri icin bu indirim uygulanmaz.");
  if (!b.sgk_borcu_yok) sonuc.risk_notu.push("SGK borcu veya yapilandirma ihlali tesviki riske sokar.");
  if (!b.bildirgeler_suresinde) sonuc.risk_notu.push("Bildirgenin gec verilmesi tesvik hakkini etkileyebilir.");
  if (!b.primler_suresinde) sonuc.risk_notu.push("Primlerin gec odenmesi tesvikten yararlanmayi engelleyebilir.");
  if (!b.kayit_disi_risk_yok) sonuc.risk_notu.push("Kayit disi/sahte sigortali tespiti tesvik iptal riski dogurur.");
  if (b.kamu_ihalesi_is) sonuc.risk_notu.push("Kamu ihalesi kapsami nedeniyle 5510 indirimi kisitli olabilir.");
  return sonuc;
};

const degerlendirYurtdisi5Puan = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Yurt Disina Goturulen Sigortalilar Icin 5 Puan GSS Isveren Hissesi Indirimi",
    durum: "UYGUN DEGIL",
    mevzuat: "5510 sayili Kanun md. 81/1-i",
    fayda: "Yurt disina goturulen sigortalilar icin GSS isveren hissesi uzerinden 5 puan indirim.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (genelSgkSartlariSaglandiMi(b) && b.yurtdisina_personel_gonderiyor) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Yurt disina sigortali gonderimi ve temel SGK kosullari saglaniyor.");
    sonuc.aksiyon.push("Yurt disi proje/soylesme ve gorevlendirme kayitlari kontrol edilmeli.");
    sonuc.aksiyon.push("Fiili calismayi gosteren bordro/seyahat kayitlari dosyalanmali.");
    return sonuc;
  }

  if (b.yurtdisina_personel_gonderiyor) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Yurt disina personel gonderimi var ancak genel SGK kosullarinda eksik/risk var.");
    sonuc.aksiyon.push("SGK borc, bildirim ve odeme kosullari duzeltilmelidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Yurt disina goturulen sigortali bulunmadigi icin uygulanamaz.");
  return sonuc;
};

const degerlendirBagkur5Puan = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "4/B Bag-Kur 5 Puan Prim Indirimi",
    durum: "UYGUN DEGIL",
    mevzuat: "5510 sayili Kanun md. 81/1-j",
    fayda: "4/B kapsaminda borcsuzluk ve duzenli odeme halinde 5 puan indirim.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (b.bagkur_mukellefi && b.bagkur_borcu_yok) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("4/B mukellefiyeti ve borcsuzluk/yapilandirma kosulu olumlu.");
    sonuc.aksiyon.push("4/B tahakkuk ve gecmis borc ekranlari kontrol edilmeli.");
    return sonuc;
  }

  if (b.bagkur_mukellefi) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("4/B kapsaminda ancak borc durumu riskli veya net degil.");
    sonuc.aksiyon.push("Bag-Kur borcu odeme/yapilandirma sureci netlestirilmelidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Musteri 4/B kapsaminda degil.");
  return sonuc;
};

const degerlendirYatirimTesvikSgk = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Yatirim Tesvik Belgesi Kapsaminda SGK Isveren Hissesi Destegi",
    durum: "UYGUN DEGIL",
    mevzuat: "5510 Ek md. 2 ve Yatirim Tesvik Mevzuati",
    fayda: "Yatirim tesvik belgesi kapsaminda bolge/yatirim turune gore SGK isveren hissesi destegi.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (b.yatirim_tesvik_belgesi && genelSgkSartlariSaglandiMi(b)) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Yatirim tesvik belgesi var ve genel SGK kosullari olumlu.");
    if (!b.ytb_tamamlama_vizesi) {
      sonuc.gerekce.push("Yatirimin tamamlama vizesi/asama bilgisi ayrica kontrol edilmelidir.");
    }
    sonuc.aksiyon.push("Belge numarasi, bolge, destek unsurlari ve istihdam listesi dogrulanmali.");
    sonuc.aksiyon.push("Destek baslangic tarihi ve suresi belge uzerinden teyit edilmelidir.");
    return sonuc;
  }

  if (b.yatirim_tesvik_belgesi) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("YTB mevcut ancak genel SGK kosullarinda eksik/risk var.");
    sonuc.aksiyon.push("Borc, bildirim ve odeme kosullari duzeltilmeden uygulamaya gecilmemelidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Yatirim tesvik belgesi olmadigi icin uygulanamaz.");
  return sonuc;
};

const degerlendirAsgariUcretDestegi = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "2026 Asgari Ucret Destegi",
    durum: "UYGUN DEGIL / RISKLI",
    mevzuat: "5510 Gecici md. 112",
    fayda: "2026 icin uygun kosullarda aylik mahsup destegi.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (b.ozel_sektor && b.calisan_sayisi > 0 && b.bildirgeler_suresinde && b.kayit_disi_risk_yok) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Calisan varligi ve temel bildirim kosullari olumlu gorunuyor.");
    sonuc.aksiyon.push("2025-2026 ay bazli karsilastirma ve sinir kontrolleri yapilmalidir.");
    sonuc.aksiyon.push("SGK tahakkukta destek mahsubu kontrol edilmelidir.");
    sonuc.risk_notu.push("Nihai uygunluk ay bazli ve calisan hareketlerine gore degisebilir.");
    return sonuc;
  }

  sonuc.gerekce.push("On uygunluk icin temel kosullar saglanmadi.");
  return sonuc;
};

const degerlendirIssizlikOdenegiIstihdam = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Issizlik Odenegi Alanlarin Istihdami Tesviki",
    durum: "UYGUN DEGIL",
    mevzuat: "4447 sayili Kanun md. 50",
    fayda: "Issizlik odenegi alan kisinin ise alinmasinda kalan sure boyunca belirli prim destekleri.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (!b.yeni_ise_alim_var) {
    sonuc.gerekce.push("Yeni ise alim veya incelenecek aday yok.");
    return sonuc;
  }

  if (b.aday_issizlik_odenegi && !b.aday_onceki_isyerine_donus && genelSgkSartlariSaglandiMi(b)) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Aday issizlik odenegi aliyor ve eski isyerine donus degil.");
    sonuc.aksiyon.push("ISKUR kaydi ve kalan odenek suresi kontrol edilmeli.");
    sonuc.aksiyon.push("SGK ise giris ve kanun numarasi eslestirmesi yapilmalidir.");
    return sonuc;
  }

  if (b.aday_issizlik_odenegi) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Aday issizlik odenegi aliyor ancak donus/genel kosul riski var.");
    sonuc.aksiyon.push("Adayin onceki isyeri ve kalan odenek suresi dogrulanmalidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Aday issizlik odenegi almiyor.");
  return sonuc;
};

const degerlendir6111 = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Genc, Kadin ve Mesleki Belge Sahibi Istihdam Tesviki / 6111",
    durum: "UYGUN DEGIL",
    mevzuat: "4447 sayili Kanun Gecici md. 10",
    fayda: "Uygun sigortalilar icin isveren prim payinin belirli surelerle fondan karsilanmasi.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (!b.yeni_ise_alim_var) {
    sonuc.gerekce.push("Yeni ise alim veya incelenecek aday yok.");
    return sonuc;
  }

  const adayKadin = b.aday_cinsiyet === "Kadin";
  const adayGencErkek = b.aday_cinsiyet === "Erkek" && b.aday_yas >= 18 && b.aday_yas <= 29;
  const adayBelgeli = b.aday_mesleki_belge;

  const temelAdaySarti =
    b.aday_son_6_ay_issiz &&
    b.aday_ortalama_ilave &&
    (adayKadin || adayGencErkek || adayBelgeli || b.aday_iskur_kayitli);

  if (temelAdaySarti && genelSgkSartlariSaglandiMi(b)) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Aday 6111 temel sartlarini sagliyor.");
    if (adayKadin) sonuc.gerekce.push("Aday kadin calisan kategorisine girebilir.");
    if (adayGencErkek) sonuc.gerekce.push("Aday 18-29 yas erkek kategorisinde degerlendirilebilir.");
    if (adayBelgeli) sonuc.gerekce.push("Mesleki belge ile sure avantajlari kontrol edilebilir.");
    if (b.aday_iskur_kayitli) sonuc.gerekce.push("ISKUR kaydi destek suresine etki edebilir.");
    sonuc.aksiyon.push("Adayin son 6 ay SGK hizmet dokumu alinmalidir.");
    sonuc.aksiyon.push("Ortalamaya ilave istihdam hesabi bordrodan dogrulanmalidir.");
    sonuc.aksiyon.push("Belge/diploma/ISKUR kurs kayitlari dosyalanmalidir.");
    return sonuc;
  }

  if (temelAdaySarti) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Aday kosullari uygun ama isyeri genel SGK kosullarinda risk var.");
    sonuc.aksiyon.push("SGK borc, bildirim, odeme ve kayit disi risk alanlari giderilmelidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Aday 6111 icin gerekli on kosullari saglamiyor.");
  if (!b.aday_son_6_ay_issiz) sonuc.risk_notu.push("Son 6 ay issizlik sarti saglanmiyor.");
  if (!b.aday_ortalama_ilave) sonuc.risk_notu.push("Ortalamaya ilave istihdam sarti saglanmiyor.");
  if (!(adayKadin || adayGencErkek || adayBelgeli || b.aday_iskur_kayitli)) {
    sonuc.risk_notu.push("Aday tesvik grubuna giren kategorilerden birinde degil.");
  }
  return sonuc;
};

const degerlendirEngelli = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Engelli Sigortali Istihdam Tesviki",
    durum: "UYGUN DEGIL",
    mevzuat: "4857 sayili Is Kanunu md. 30",
    fayda: "Engelli sigortalilar icin isveren hissesinin belirli seviyede kamu tarafindan karsilanmasi.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (!b.yeni_ise_alim_var) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Yeni aday yok; mevcut personelde engelli statusu varsa ayrica kontrol edilmelidir.");
    sonuc.aksiyon.push("Mevcut calisan listesinde engelli raporu ve kayitlar kontrol edilmelidir.");
    return sonuc;
  }

  if (b.aday_engelli && b.ozel_sektor) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Aday engelli statusunde ve isyeri ozel sektor.");
    sonuc.aksiyon.push("Engelli raporu, ISKUR kaydi ve SGK tesvik tanimlari dogrulanmalidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Aday engelli statusunde degil veya isyeri ozel sektor degil.");
  return sonuc;
};

const degerlendirArgeTeknokent = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Ar-Ge, Tasarim Merkezi ve Teknokent SGK Isveren Hissesi Tesviki",
    durum: "UYGUN DEGIL",
    mevzuat: "5746 md. 3 ve 4691 Gecici md. 2",
    fayda: "Ar-Ge/tasarim/destek personeli veya teknokent kapsamindaki personel icin SGK isveren hissesi destegi.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  const kapsamVar = b.arge_tasarim_merkezi || b.teknokent;

  if (kapsamVar && b.arge_personeli_var && b.ozel_sektor) {
    sonuc.durum = "UYGUN";
    if (b.arge_tasarim_merkezi) sonuc.gerekce.push("Ar-Ge/tasarim merkezi belgesi oldugu beyan edildi.");
    if (b.teknokent) sonuc.gerekce.push("Teknokent faaliyeti oldugu beyan edildi.");
    sonuc.gerekce.push("Ar-Ge/tasarim/destek personeli mevcut.");
    sonuc.aksiyon.push("Personel proje kayitlari ve calisma sureleri bordro ile uyumlu kontrol edilmelidir.");
    return sonuc;
  }

  if (kapsamVar) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Kapsam var ancak personel bilgisi net degil.");
    sonuc.aksiyon.push("Personel listesi ve proje bazli calisma kayitlari netlestirilmelidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Ar-Ge/tasarim merkezi veya teknokent kapsami yok.");
  return sonuc;
};

const degerlendirKultur = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Kultur Yatirimlari ve Kultur Girisimleri SGK Tesviki",
    durum: "UYGUN DEGIL",
    mevzuat: "5225 sayili Kanun md. 5",
    fayda: "Kultur yatirim/girisim belgesi kapsaminda isveren hissesi destegi.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (b.kultur_belgesi && b.ozel_sektor) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Kultur yatirim/girisim belgesi mevcut.");
    sonuc.aksiyon.push("Belge turu, tarihi ve sureleri dogrulanmalidir.");
    sonuc.aksiyon.push("Belge kapsami ile calisan/bordro eslestirmesi yapilmalidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Kultur belgesi yok veya isyeri ozel sektor degil.");
  return sonuc;
};

const degerlendirCokTehlikeliIsg = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Cok Tehlikeli Sinifta Is Kazasizlik Tesviki",
    durum: "UYGUN DEGIL",
    mevzuat: "4447 sayili Kanun Ek md. 4",
    fayda: "Cok tehlikeli sinifta belirli kosullarda issizlik sigortasi isveren hissesi tesviki.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (b.cok_tehlikeli && b.calisan_sayisi >= 10 && b.is_kazasi_yok && b.sgk_borcu_yok) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Cok tehlikeli sinif, min. 10 calisan ve kaza kayitsiz donem kosulu olumlu.");
    sonuc.aksiyon.push("Tehlike sinifi, 3 yil kaza kayitlari ve borc durumu teyit edilmelidir.");
    return sonuc;
  }

  if (b.cok_tehlikeli) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Cok tehlikeli sinifta ancak calisan/kaza/borc kosullari net degil.");
    sonuc.aksiyon.push("10+ calisan, kaza gecmisi ve borc kosullari netlestirilmelidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Isyeri cok tehlikeli sinifta degil.");
  return sonuc;
};

const degerlendir2828 = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "2828 Kapsamindaki Kisilerin Istihdami Tesviki",
    durum: "UYGUN DEGIL",
    mevzuat: "2828 sayili Kanun Ek md. 1",
    fayda: "Sosyal hizmet modellerinden yararlanan kisilerin istihdaminda prim destegi.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (!b.yeni_ise_alim_var) {
    sonuc.gerekce.push("Yeni ise alim veya incelenecek aday yok.");
    return sonuc;
  }

  if (b.aday_2828 && b.ozel_sektor) {
    sonuc.durum = "UYGUN";
    sonuc.gerekce.push("Adayin 2828 kapsaminda oldugu beyan edildi.");
    sonuc.aksiyon.push("Ilgili kamu kayitlari ve SGK tanimlari dogrulanmalidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Aday 2828 kapsaminda degil veya isyeri ozel sektor degil.");
  return sonuc;
};

const degerlendirSosyalYardim = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Sosyal Yardim Alanlarin Istihdami Tesviki",
    durum: "UYGUN DEGIL",
    mevzuat: "3294 sayili Kanun Ek md. 5",
    fayda: "Sosyal yardim alan hanelerdeki kisilerin istihdaminda prim destekleri.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (!b.yeni_ise_alim_var) {
    sonuc.gerekce.push("Yeni ise alim veya incelenecek aday yok.");
    return sonuc;
  }

  if (b.aday_sosyal_yardim && b.ozel_sektor) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Adayin sosyal yardim kapsaminda olma ihtimali var.");
    sonuc.aksiyon.push("Sosyal yardim kaydi ve aday uygunlugu resmi kayitlarla kontrol edilmelidir.");
    sonuc.risk_notu.push("Sozlu beyanla degil, kamu kayitlariyla dogrulama yapilmalidir.");
    return sonuc;
  }

  sonuc.gerekce.push("Aday sosyal yardim kapsaminda degil veya isyeri ozel sektor degil.");
  return sonuc;
};

const degerlendirIsgHizmetDestegi = (b: SgkFormState): SgkTesvikSonucu => {
  const sonuc: SgkTesvikSonucu = {
    ad: "Is Sagligi ve Guvenligi Hizmetlerinin Desteklenmesi",
    durum: "UYGUN DEGIL",
    mevzuat: "6331 sayili Kanun md. 7",
    fayda: "Belirli kosullarda is sagligi ve guvenligi hizmetleri icin destek.",
    gerekce: [],
    aksiyon: [],
    risk_notu: [],
  };

  if (b.calisan_sayisi > 0) {
    sonuc.durum = "POTANSIYEL";
    sonuc.gerekce.push("Calisan varligi nedeniyle ISG yukumlulugu ve destek ihtimali kontrol edilebilir.");
    sonuc.aksiyon.push("Tehlike sinifi, calisan sayisi ve ISG hizmet sozlesmeleri incelenmelidir.");
    sonuc.risk_notu.push("Nihai uygunluk tehlike sinifi ve calisan sayisina gore degisir.");
    return sonuc;
  }

  sonuc.gerekce.push("Calisan olmadigi icin ISG destek on uygunlugu yok.");
  return sonuc;
};

export const evaluateSgkTesvikleri = (form: SgkFormState): SgkTesvikSonucu[] => {
  const b = normalizeForEvaluation(form);

  return [
    degerlendir5510Indirimi(b),
    degerlendirYurtdisi5Puan(b),
    degerlendirBagkur5Puan(b),
    degerlendirYatirimTesvikSgk(b),
    degerlendirAsgariUcretDestegi(b),
    degerlendirIssizlikOdenegiIstihdam(b),
    degerlendir6111(b),
    degerlendirEngelli(b),
    degerlendirArgeTeknokent(b),
    degerlendirKultur(b),
    degerlendirCokTehlikeliIsg(b),
    degerlendir2828(b),
    degerlendirSosyalYardim(b),
    degerlendirIsgHizmetDestegi(b),
  ];
};

export const summarizeSgkResults = (results: SgkTesvikSonucu[]): SgkEvaluationSummary => {
  const uygunCount = results.filter((item) => item.durum === "UYGUN").length;
  const potansiyelCount = results.filter((item) => item.durum === "POTANSIYEL").length;
  const riskliCount = results.length - uygunCount - potansiyelCount;

  return {
    uygunCount,
    potansiyelCount,
    riskliCount,
    totalCount: results.length,
  };
};

