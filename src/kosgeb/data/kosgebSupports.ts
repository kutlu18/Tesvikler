import { KosgebSupportDefinition } from "../types";

export const kosgebSupports: KosgebSupportDefinition[] = [
  {
    id: "girisimci-destek",
    name: "KOSGEB Girişimci Destek Programı (İş Kurma + İş Geliştirme)",
    institution: "KOSGEB",
    supportType: "Hibe / Geri ödemeli destek (program dönemine göre değişebilir)",
    beneficiaries: "Yeni kurulan veya gelişim aşamasındaki KOBİ niteliğindeki girişimler",
    coveredExpenses: "Kuruluş, makine-teçhizat, yazılım, personel, eğitim/danışmanlık, pazarlama ve benzeri uygun giderler",
    estimatedSupportStructure: "Program çağrısı ve başvuru puanına göre değişen oran/tutar yapısı",
    requiredDocuments: [
      "KOSGEB veri tabanı kaydı",
      "Güncel KOBİ beyannamesi",
      "Ticaret sicil ve vergi levhası",
      "Proje/iş planı",
      "Harcama belgeleri (proforma, fatura, dekont vb.)"
    ]
  },
  {
    id: "kredi-finansman",
    name: "KOSGEB Kredi Finansman Desteği",
    institution: "KOSGEB",
    supportType: "Faiz/kâr payı destekli finansman",
    beneficiaries: "Kredi kullanma ihtiyacı olan KOBİ'ler; özel gruplar için ilave avantaj ihtimali",
    coveredExpenses: "İşletme sermayesi, finansman maliyeti ve yatırım finansmanı",
    estimatedSupportStructure: "Anlaşmalı finans kuruluşları ve çağrı koşullarına göre değişken",
    requiredDocuments: [
      "KOSGEB kaydı",
      "KOBİ beyannamesi",
      "Mali tablolar",
      "Kredi talep dokümanları",
      "Teminat/garanti dokümanları"
    ]
  },
  {
    id: "enerji-verimliligi",
    name: "KOSGEB KOBİ Enerji Verimliliği Destek Programı",
    institution: "KOSGEB",
    supportType: "Proje bazlı enerji verimliliği desteği",
    beneficiaries: "Enerji verimliliği yatırımı planlayan KOBİ'ler",
    coveredExpenses: "Enerji etüdü, verimlilik artırıcı giderler, motor değişimi/verimli motor yatırımı",
    estimatedSupportStructure: "Onaylanan proje kapsamına göre oran ve üst limitli destek",
    requiredDocuments: [
      "Enerji etüdü veya mevcut tüketim analizleri",
      "Teknik yatırım planı",
      "Teklif/proforma",
      "KOSGEB kayıt ve beyanname seti"
    ]
  },
  {
    id: "yesil-sanayi",
    name: "KOSGEB Yeşil Sanayi Destek Programı",
    institution: "KOSGEB",
    supportType: "Yeşil dönüşüm ve sürdürülebilirlik odaklı proje desteği",
    beneficiaries: "Karbon azaltımı ve kaynak verimliliği hedefleyen KOBİ'ler",
    coveredExpenses: "Yeşil dönüşüm yatırımları, sürdürülebilir üretim iyileştirmeleri",
    estimatedSupportStructure: "Çağrı özelinde değişen oran/tutar destek modeli",
    requiredDocuments: [
      "Dönüşüm yol haritası",
      "Teknik rapor ve yatırım planı",
      "Karbon/enerji göstergeleri",
      "KOSGEB kaydı ve KOBİ beyannamesi"
    ]
  },
  {
    id: "dijital-donusum",
    name: "KOSGEB KOBİ Dijital Dönüşüm Destekleri",
    institution: "KOSGEB",
    supportType: "Dijitalleşme ve otomasyon odaklı destek",
    beneficiaries: "ERP/MRP/CRM, otomasyon, veri analitiği, AI/IoT yatırımı planlayan KOBİ'ler",
    coveredExpenses: "Yazılım, otomasyon sistemleri, entegrasyon ve dijital altyapı yatırımları",
    estimatedSupportStructure: "Program çağrısına göre hibe/geri ödemeli hibrit yapı olabilir",
    requiredDocuments: [
      "Dijital dönüşüm ihtiyaç analizi",
      "Teknik teklif ve bütçe",
      "Satın alma planı",
      "KOSGEB başvuru evrakı"
    ]
  },
  {
    id: "teknoloji-yenilik",
    name: "KOSGEB Teknoloji ve Yenilik Destekleri",
    institution: "KOSGEB",
    supportType: "Ar-Ge, ürün geliştirme ve ticarileştirme desteği",
    beneficiaries: "Yeni ürün/prototip/teknoloji tabanlı çözüm geliştiren KOBİ'ler",
    coveredExpenses: "Prototip, ürün geliştirme, doğrulama, ticarileştirme ve seri üretime hazırlık giderleri",
    estimatedSupportStructure: "Projeye ve çağrıya göre değişen destek modeli",
    requiredDocuments: [
      "Proje tanımı ve teknik fizibilite",
      "Prototip/ürün geliştirme planı",
      "Bütçe ve zaman planı",
      "Varlık/know-how belgeleri"
    ]
  },
  {
    id: "ihracat-yurtdisi-pazar",
    name: "KOSGEB Yurt Dışı Pazar / İhracat Odaklı Destekler",
    institution: "KOSGEB",
    supportType: "İhracat ve pazara giriş desteği",
    beneficiaries: "İhracat hedefi veya yurt dışı pazar planı olan KOBİ'ler",
    coveredExpenses: "Pazar araştırması, tanıtım, belgelendirme, pazara giriş ve ihracat hazırlığı",
    estimatedSupportStructure: "Destek oranı ve üst limiti çağrı bazında değişir",
    requiredDocuments: [
      "İhracat/pazara giriş planı",
      "Hedef pazar analizi",
      "Tanıtım ve belgelendirme bütçesi",
      "KOSGEB kayıt dokümanları"
    ]
  },
  {
    id: "belgelendirme-test-analiz",
    name: "KOSGEB Belgelendirme, Test ve Analiz Destekleri",
    institution: "KOSGEB",
    supportType: "Uygunluk, kalite ve test odaklı gider desteği",
    beneficiaries: "CE/ISO/test/analiz ihtiyacı bulunan KOBİ'ler",
    coveredExpenses: "Belgelendirme, test/analiz ve ürün uygunluk belgeleri giderleri",
    estimatedSupportStructure: "Belge/test türüne göre değişebilen destek limitleri",
    requiredDocuments: [
      "Belgelendirme planı",
      "Yetkili kurum/akredite laboratuvar teklifleri",
      "Uygunluk testi kapsamı",
      "Başvuru evrak seti"
    ]
  },
  {
    id: "kapasite-kobigel-cagri",
    name: "KOSGEB Kapasite Geliştirme / KOBİGEL Benzeri Çağrı Bazlı Destekler",
    institution: "KOSGEB",
    supportType: "Çağrı bazlı proje desteği",
    beneficiaries: "Çağrı konusuna uyumlu KOBİ'ler",
    coveredExpenses: "Kapasite artışı, kurumsallaşma, verimlilik, dijitalleşme, ihracat hazırlığı giderleri",
    estimatedSupportStructure: "Yalnızca açık çağrı şartlarına bağlı olarak değerlendirilir",
    requiredDocuments: [
      "Güncel çağrı metni uyum analizi",
      "Proje öneri dosyası",
      "Mali/teknik uygunluk evrakı",
      "KOSGEB kayıt/beyanname seti"
    ]
  },
  {
    id: "isbirligi",
    name: "KOSGEB İş Birliği Destekleri",
    institution: "KOSGEB",
    supportType: "Ortak proje ve ölçek ekonomisi desteği",
    beneficiaries: "Birden fazla KOBİ'nin ortak üretim/tasarım/pazarlama projesi",
    coveredExpenses: "Ortak üretim altyapısı, ortak tasarım, ortak pazarlama ve proje giderleri",
    estimatedSupportStructure: "Ortaklık modeline ve çağrı koşullarına göre şekillenir",
    requiredDocuments: [
      "İş birliği protokolü",
      "Ortak proje planı",
      "Görev ve bütçe dağılımı",
      "KOSGEB proje başvuru dokümanları"
    ]
  }
];
