export interface NaceDivisionOption {
  code: string;
  name: string;
}

export interface NaceSectionOption {
  code: string;
  name: string;
  divisions: NaceDivisionOption[];
}

export const naceSections: NaceSectionOption[] = [
  {
    code: "A",
    name: "Tarim, ormancilik ve balikcilik",
    divisions: [
      { code: "01", name: "Bitkisel ve hayvansal uretim ile avcilik" },
      { code: "02", name: "Ormancilik ve tomrukculuk" },
      { code: "03", name: "Balikcilik ve su urunleri yetistiriciligi" },
    ],
  },
  {
    code: "B",
    name: "Madencilik ve tas ocakciligi",
    divisions: [
      { code: "05", name: "Komur ve linyit cikarma" },
      { code: "06", name: "Ham petrol ve dogal gaz cikarma" },
      { code: "07", name: "Metal cevheri madenciligi" },
      { code: "08", name: "Diger madencilik ve tas ocakciligi" },
      { code: "09", name: "Madenciligi destekleyici hizmet faaliyetleri" },
    ],
  },
  {
    code: "C",
    name: "Imalat",
    divisions: [
      { code: "10", name: "Gida urunlerinin imalati" },
      { code: "11", name: "Iceceklerin imalati" },
      { code: "12", name: "Tütün urunlerinin imalati" },
      { code: "13", name: "Tekstil urunlerinin imalati" },
      { code: "14", name: "Giyim esyalarinin imalati" },
      { code: "15", name: "Deri ve ilgili urunlerin imalati" },
      { code: "16", name: "Agac, mantar ve orman urunleri imalati" },
      { code: "17", name: "Kagit ve kagit urunleri imalati" },
      { code: "18", name: "Kayitli medyanin basimi ve cogaltilmasi" },
      { code: "19", name: "Kok komuru ve rafine petrol urunleri imalati" },
      { code: "20", name: "Kimyasallar ve kimyasal urunlerin imalati" },
      { code: "21", name: "Temel eczacilik urunleri ve preparatlarin imalati" },
      { code: "22", name: "Kaucuk ve plastik urunlerin imalati" },
      { code: "23", name: "Diger metalik olmayan mineral urunlerin imalati" },
      { code: "24", name: "Ana metal sanayii" },
      { code: "25", name: "Fabrikasyon metal urunleri imalati" },
      { code: "26", name: "Bilgisayar, elektronik ve optik urunler imalati" },
      { code: "27", name: "Elektrikli techizat imalati" },
      { code: "28", name: "Baska yerde siniflandirilmamis makine ve ekipman imalati" },
      { code: "29", name: "Motorlu kara tasiti, römork ve yari römork imalati" },
      { code: "30", name: "Diger ulasim araclarinin imalati" },
      { code: "31", name: "Mobilya imalati" },
      { code: "32", name: "Diger imalatlar" },
      { code: "33", name: "Makine ve ekipmanlarin kurulumu ve onarimi" },
    ],
  },
  {
    code: "D",
    name: "Elektrik, gaz, buhar ve iklimlendirme uretimi",
    divisions: [
      { code: "35", name: "Elektrik, gaz, buhar ve iklimlendirme uretimi ve dagitimi" },
    ],
  },
  {
    code: "E",
    name: "Su temini, kanalizasyon ve atik yonetimi",
    divisions: [
      { code: "36", name: "Suyun toplanmasi, aritilmasi ve dagitilmasi" },
      { code: "37", name: "Kanalizasyon" },
      { code: "38", name: "Atik toplama, geri kazanim ve bertaraf faaliyetleri" },
      { code: "39", name: "Iyilestirme ve diger atik yonetimi hizmetleri" },
    ],
  },
  {
    code: "F",
    name: "Insaat",
    divisions: [
      { code: "41", name: "Bina insaati" },
      { code: "42", name: "Bina disi yapilarin insaati" },
      { code: "43", name: "Ozel insaat faaliyetleri" },
    ],
  },
  {
    code: "G",
    name: "Toptan ve perakende ticaret, motorlu tasitlarin onarimi",
    divisions: [
      { code: "45", name: "Motorlu kara tasitlarinin ve motosikletlerin toptan/perakende ticareti ve onarimi" },
      { code: "46", name: "Motorlu kara tasitlari disinda toptan ticaret" },
      { code: "47", name: "Motorlu kara tasitlari disinda perakende ticaret" },
    ],
  },
  {
    code: "H",
    name: "Ulastirma ve depolama",
    divisions: [
      { code: "49", name: "Kara tasimaciligi ve boru hatti tasimaciligi" },
      { code: "50", name: "Su yolu tasimaciligi" },
      { code: "51", name: "Hava yolu tasimaciligi" },
      { code: "52", name: "Depolama ve tasimaciligi destekleyici faaliyetler" },
      { code: "53", name: "Posta ve kurye faaliyetleri" },
    ],
  },
  {
    code: "I",
    name: "Konaklama ve yiyecek hizmetleri",
    divisions: [
      { code: "55", name: "Konaklama" },
      { code: "56", name: "Yiyecek ve icecek hizmeti faaliyetleri" },
    ],
  },
  {
    code: "J",
    name: "Bilgi ve iletisim",
    divisions: [
      { code: "58", name: "Yayimcilik faaliyetleri" },
      { code: "59", name: "Sinema filmi, video ve TV programlari yapimi ile muzik yayimciligi" },
      { code: "60", name: "Programcilik ve yayin faaliyetleri" },
      { code: "61", name: "Telekomunikasyon" },
      { code: "62", name: "Bilgisayar programlama, danismanlik ve ilgili faaliyetler" },
      { code: "63", name: "Bilgi hizmet faaliyetleri" },
    ],
  },
  {
    code: "K",
    name: "Finans ve sigorta faaliyetleri",
    divisions: [
      { code: "64", name: "Finansal hizmet faaliyetleri" },
      { code: "65", name: "Sigorta, reasurans ve emeklilik fonlari" },
      { code: "66", name: "Finansal hizmetler ile sigorta faaliyetleri icin yardimci faaliyetler" },
    ],
  },
  {
    code: "L",
    name: "Gayrimenkul faaliyetleri",
    divisions: [{ code: "68", name: "Gayrimenkul faaliyetleri" }],
  },
  {
    code: "M",
    name: "Mesleki, bilimsel ve teknik faaliyetler",
    divisions: [
      { code: "69", name: "Hukuk ve muhasebe faaliyetleri" },
      { code: "70", name: "Idare merkezi faaliyetleri ve isletme yonetimi danismanligi" },
      { code: "71", name: "Mimarlik, muhendislik ve ilgili teknik danismanlik" },
      { code: "72", name: "Bilimsel arastirma ve gelistirme faaliyetleri" },
      { code: "73", name: "Reklamcilik ve pazar arastirmasi" },
      { code: "74", name: "Diger mesleki, bilimsel ve teknik faaliyetler" },
      { code: "75", name: "Veterinerlik hizmetleri" },
    ],
  },
  {
    code: "N",
    name: "Idari ve destek hizmet faaliyetleri",
    divisions: [
      { code: "77", name: "Kiralama ve leasing faaliyetleri" },
      { code: "78", name: "Istihdam faaliyetleri" },
      { code: "79", name: "Seyahat acentesi, tur operatoru ve rezervasyon hizmetleri" },
      { code: "80", name: "Guvenlik ve sorusturma faaliyetleri" },
      { code: "81", name: "Binalar ile cevre duzenlemesi faaliyetleri" },
      { code: "82", name: "Buro yonetimi, buro destek ve is destek faaliyetleri" },
    ],
  },
  {
    code: "O",
    name: "Kamu yonetimi ve savunma, zorunlu sosyal guvenlik",
    divisions: [{ code: "84", name: "Kamu yonetimi ve savunma, zorunlu sosyal guvenlik" }],
  },
  {
    code: "P",
    name: "Egitim",
    divisions: [{ code: "85", name: "Egitim" }],
  },
  {
    code: "Q",
    name: "Insan sagligi ve sosyal hizmet faaliyetleri",
    divisions: [
      { code: "86", name: "Insan sagligi hizmetleri" },
      { code: "87", name: "Yatili bakim faaliyetleri" },
      { code: "88", name: "Barinacak yer saglanmaksizin verilen sosyal hizmetler" },
    ],
  },
  {
    code: "R",
    name: "Kultur, sanat, eglence, dinlence ve spor",
    divisions: [
      { code: "90", name: "Yaratici sanatlar, gosteri sanatlari ve eglence faaliyetleri" },
      { code: "91", name: "Kutuphane, arsiv, muze ve diger kulturel faaliyetler" },
      { code: "92", name: "Sans oyunlari ve musterek bahis faaliyetleri" },
      { code: "93", name: "Spor faaliyetleri, eglence ve dinlence faaliyetleri" },
    ],
  },
  {
    code: "S",
    name: "Diger hizmet faaliyetleri",
    divisions: [
      { code: "94", name: "Uyelik kuruluslarinin faaliyetleri" },
      { code: "95", name: "Bilgisayarlarin, kisisel esyalarin ve ev esyalarinin onarimi" },
      { code: "96", name: "Diger hizmet faaliyetleri" },
    ],
  },
  {
    code: "T",
    name: "Hanehalklarinin isverenler olarak faaliyetleri",
    divisions: [
      { code: "97", name: "Ev ici personel calistiran hanehalklarinin faaliyetleri" },
      { code: "98", name: "Kendi kullanimina yonelik mal ve hizmet ureten hanehalklari" },
    ],
  },
  {
    code: "U",
    name: "Uluslararasi orgutler ve temsilciliklerin faaliyetleri",
    divisions: [{ code: "99", name: "Uluslararasi orgutler ve temsilciliklerin faaliyetleri" }],
  },
];

export const findNaceSectionByDivisionCode = (divisionCode: string): NaceSectionOption | null => {
  for (const section of naceSections) {
    if (section.divisions.some((division) => division.code === divisionCode)) {
      return section;
    }
  }

  return null;
};

export const findNaceDivisionByCode = (divisionCode: string): NaceDivisionOption | null => {
  for (const section of naceSections) {
    const match = section.divisions.find((division) => division.code === divisionCode);
    if (match) {
      return match;
    }
  }

  return null;
};

export const extractNaceDivisionCode = (value: string): string => {
  const match = value.trim().match(/^(\d{2})/);
  return match ? match[1] : "";
};
