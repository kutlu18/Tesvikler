# Tesvik Analiz Platformu - Is Analisti UAT ve Hesaplama Tutarlilik Test Dokumani

Hazirlanma tarihi: 2026-05-20  
Rol perspektifi: Is analisti, mevzuat/tesvik danismani, UAT sorumlusu  
Kapsam: Kullanici kabul testi, hesaplama/uygunluk siniflandirmasi tutarliligi, girdi gerekliligi ve is kurali sorgulama.

## 1. Amac

Bu dokumanin amaci, uygulamanin teknik olarak calismasindan ziyade is amacina uygun sonuc uretip uretmedigini dogrulamaktir. Testlerde su sorulara cevap aranir:

- Kullanici girdileri gercek is gorusmesi ve tesvik on analiz sureci icin yeterli mi?
- Her soru hesaplamada veya raporlamada anlamli bir etki yaratiyor mu?
- Uygun / Potansiyel / Riskli sonuc siniflari is kurallariyla tutarli mi?
- Hesaplanan ozet sayilari, skorlar, risk notlari ve aksiyonlar ayni form verisi icin tutarli mi?
- Sonuc dili kullaniciyi kesin mevzuat karari varmis gibi yaniltmadan dogru yonlendiriyor mu?

## 2. UAT Kapsami

Test edilecek ana akislari:

- Kayitli kullanici ile analiz olusturma, kaydetme ve tekrar acma.
- Misafir kullanici ile SGK analizini deneme.
- Her modülde dusuk riskli, potansiyel ve riskli veri setleriyle sonuc uretme.
- Ozet kartlarindaki sayilarin sonuc kartlariyla tutarliligini kontrol etme.
- Analiz arsivinde kaydedilen form, sonuc, not ve musteri bilgilerinin korunmasi.
- Rapor/PDF ciktisinda is aciklamalarinin ve risk notlarinin dogru tasinmasi.

Kapsam disi:

- Nihai resmi mevzuat uygunluk karari.
- Kurum portallariyla entegrasyon testi.
- Gercek basvuru, e-imza, DYS, KAYS, E-TUYS, PRODİS veya Eximbank limit sureci.

## 3. Genel Kabul Kriterleri

Her modül icin kabul kriterleri:

- Uygun sonuc ancak temel uygunluk kosullari saglandiginda verilmeli.
- Eksik belge, acik cagri, borc, onay, yetkilendirme veya kurum kaydi eksikse sonuc cogu durumda "Potansiyel" olmali; dogrudan "Uygun" olmamali.
- Temel blokaj varsa "Riskli / Uygun Degil" olmali. Ornek: Turkiye'de yerlesik olmama, destek konusu ile hic ilgisi olmama, uygun basvuru sahibi olmama.
- Ozet dashboard sayilari sonuc listelerindeki kart sayilariyla birebir tutmali.
- Risk notu, gerekce ve aksiyon metinleri sonuc status'u ile celismemeli.
- "Potansiyel" sonuc, kullaniciya hangi eksiklerin tamamlanmasi gerektigini gostermeli.
- "Riskli" sonuc, kullaniciya uygun hale gelmek icin gereken temel degisiklikleri gostermeli.
- Form reset sonrasi onceki sonuc ve analiz bilgileri temizlenmeli.
- Kaydedilen analiz tekrar acildiginda ayni girdilerle ayni sonuc uretilmeli.

## 4. Hesaplama Tutarliligi Genel Testleri

### UAT-GEN-001 - Sonuc Sayilari Tutarliligi

On kosul: Kayitli kullanici giris yapmis olmali.

Adimlar:

1. Herhangi bir analiz modülünü ac.
2. Formu varsayilan haliyle calistir.
3. Ozet kartlarindaki Uygun, Potansiyel, Riskli sayilarini not al.
4. Sayfadaki sonuc kartlarini manuel say.
5. Bir soruyu sonucu etkilemesi beklenen sekilde degistir.
6. Ozet kartlari ve sonuc kartlarini tekrar say.

Beklenen:

- Ozet sayilari, listelenen sonuc kartlariyla tutmali.
- Bir kart ayni anda iki kategoriye girmemeli.
- Toplam sonuc sayisi negatif veya bos olmamali.
- Degisiklik sonrasi sadece ilgili sonuc kategorileri etkilenmeli.

### UAT-GEN-002 - Ayni Girdi Ayni Sonuc Uretir

Adimlar:

1. Bir modülde belirli veri setini gir.
2. Analizi kaydet.
3. Sayfayi yenile.
4. Analizi tekrar ac.
5. Sonuclari ve ozet skorlarini ilk sonuc ile karsilastir.

Beklenen:

- Ayni form verisi ayni sonuc kategorilerini ve ayni ozet sayilarini uretmeli.
- Kayit/yenileme sonrasi hesaplama degismemeli.

### UAT-GEN-003 - Gereksiz Girdi Sorgulama

Adimlar:

1. Her modülde form alanlarini listele.
2. Her alan icin "Bu alan hangi sonuc, skor, risk notu veya arsiv/rapor bilgisini etkiliyor?" sorusunu cevapla.
3. Etkisi bulunamayan alanlari "Gerekliligi sorgulanacak" olarak isaretle.

Beklenen:

- Her zorunlu veya one cikan soru ya hesaplamaya ya rapora ya arsiv aramasina anlamli katki sunmali.
- Sadece bilgilendirme amacli alanlar varsa kullaniciya "opsiyonel / rapor bilgisi" gibi net anlatilmali.

## 5. Modul Bazli UAT Senaryolari

## 5.1 SGK Tesvikleri

### Is Kurali Beklentisi

SGK modulunde temel belirleyiciler: ozel sektor, SGK borcu, bildirge/prim sureleri, kayit disi risk, kamu ihalesi durumu, personel/aday bilgileri, yeni ise alim, engelli/ISKUR/issizlik/Bag-Kur gibi ozel durumlar.

### UAT-SGK-001 - Temel 5510 Indirimi Uygun Senaryo

Veri seti:

- Isyeri ozel sektor: Evet
- SGK borcu yok/yapilandirilmis: Evet
- Bildirgeler suresinde: Evet
- Primler suresinde: Evet
- Kayit disi risk yok: Evet
- Kamu ihalesi isi: Hayir
- Calisan sayisi: 10

Beklenen:

- Genel prim indirimi veya benzer temel tesvik "Uygun" gorunmeli.
- Risk notunda borc/bildirim/kayit disi blokaji olmamali.
- Aksiyonlarda resmi SGK sorgulama ve donemsel kontrol hatirlatmasi olabilir.

### UAT-SGK-002 - Borc ve Gec Bildirim Risk Senaryosu

Veri seti:

- Ozel sektor: Evet
- SGK borcu yok: Hayir
- Bildirgeler suresinde: Hayir
- Primler suresinde: Hayir

Beklenen:

- Temel prim tesvikleri "Uygun" olmamali.
- Potansiyel veya Riskli sonuc uretilmeli.
- Risk notlarinda borc, bildirge ve prim odeme riski acikca yazmali.

### UAT-SGK-003 - Yeni Aday Kosullari

Veri seti:

- Yeni ise alim var: Evet
- Aday son 6 ay issiz: Evet
- Ortalamaya ilave: Evet
- ISKUR kayitli: Evet
- Mesleki belge: Evet
- Isyeri genel kosullari olumlu

Beklenen:

- Aday bazli tesviklerde uygun/potansiyel sonuc artmali.
- "Yeni ise alim var" Hayir yapildiginda aday sorulari hesaplamaya dahil olmamali veya sonuc potansiyel/riskli hale gelmeli.

### Girdi Gerekliligi Sorgusu

- "Aday cinsiyeti" hangi tesviklerde fark yaratiyor?
- "Aday yas" yas araliklarinda beklenen farki yaratiyor mu?
- "Ortalama calisan sayisi" ile "calisan sayisi" celiskili girildiginde uyari var mi?

## 5.2 KOSGEB

### Is Kurali Beklentisi

KOSGEB modulunde KOBI statusu, KOSGEB kaydi, KOBI beyannamesi, borc durumu, kurulus yasi, NACE/faaliyet alani, yatirim ve harcama planlari sonuc uzerinde belirleyici olmalidir.

### UAT-KOS-001 - KOBI ve Belge Altyapisi Guclu

Veri seti:

- KOBI: Evet
- KOSGEB veri tabanina kayitli: Evet
- KOBI beyannamesi guncel: Evet
- Vergi/SGK borcu var: Hayir
- Makine/yazilim/personel veya proje butcesi var

Beklenen:

- Ilgili destekler "Uygun" veya "Potansiyel" gorunmeli.
- KOSGEB kaydi/beyanname eksigi risk notu gorunmemeli.
- Ozet uygun sayisi, form degisiklikleriyle anlamli artmali.

### UAT-KOS-002 - KOBI Degil

Veri seti:

- KOBI: Hayir
- Diger alanlar olumlu

Beklenen:

- KOBI odakli destekler "Riskli / Uygun Degil" olmali.
- Buyuk olcekli firmaya uygun olmayan destekler uygun gorunmemeli.

### UAT-KOS-003 - Cagriya Bagli Destek

Veri seti:

- KOBI: Evet
- Kayit/beyanname olumlu
- Cagriya bagli yatirim veya kapasite artisi sinyali var

Beklenen:

- Acik cagri gerektiren destekler kesin "Uygun" yerine "Potansiyel" kalmali.
- Metinde acik cagri/program kosulu dogrulanmalidir denmeli.

### Girdi Gerekliligi Sorgusu

- Kurulus tarihi hangi desteklerde sirket yasi etkisi yaratiyor?
- Yillik net satis ve bilanco buyuklugu KOBI kontrolunde kullaniliyor mu?
- NACE secimi destek filtrelemede etkili mi, yoksa sadece rapor bilgisinde mi kaliyor?

## 5.3 TUBITAK

### Is Kurali Beklentisi

TUBITAK modulunde Ar-Ge niteliği, teknik belirsizlik, ozgun deger, prototip/MVP, TRL, proje butcesi, firma tipi, PRODİS kaydi ve basvuru evraklari belirleyici olmalidir. Ar-Ge skoru 0-100 bandinda tutarli olmalidir.

### UAT-TUB-001 - Guclu Ar-Ge Projesi

Veri seti:

- Turkiye'de yerlesik: Evet
- Sermaye sirketi: Limited veya Anonim
- Teknik belirsizlik: Evet
- Ozgun deger: Evet
- Prototip/MVP: Evet
- Ticarilesme plani: Evet
- Personel/makine/yazilim/test giderleri var
- PRODİS kaydi ve evraklar hazir

Beklenen:

- Ar-Ge skoru yuksek, yorum "guclu aday" bandinda olmali.
- Uygun destek sayisi artmali.
- Rutin/ticari faaliyet risk notu olmamali.

### UAT-TUB-002 - Rutin Ticari Proje

Veri seti:

- Rutin ticari proje: Evet
- Teknik belirsizlik: Hayir
- Ozgun deger: Hayir
- Prototip: Hayir

Beklenen:

- Ar-Ge destekleri "Riskli / Uygun Degil" olmali.
- Sonuc gerekcesi teknik belirsizlik ve yenilik eksigini aciklamali.

### UAT-TUB-003 - Cagri/Idari Eksik

Veri seti:

- Ar-Ge niteligi guclu
- PRODİS kaydi: Hayir
- On kayit evraklari: Hayir
- Vergi/SGK borcu: Evet

Beklenen:

- Teknik olarak uygun gorunen programlar "Potansiyel" kalmali.
- Idari eksikler risk notu ve aksiyonda gorunmeli.

### Girdi Gerekliligi Sorgusu

- Hedef TRL ve mevcut TRL arasindaki fark skor veya sonuc diline yansiyor mu?
- Oncelikli teknoloji alani sadece bonus mu, yoksa program eslestirmesinde belirleyici mi?
- Sahis sirketi secimi hangi programlari blokluyor?

## 5.4 Yatirim Tesvik

### Is Kurali Beklentisi

Yatirim Tesvik modulunde yatırım yeri, konu, asgari sabit yatırım, E-TUYS, harcama zamanlaması, belge seti, OSB/bolge, teknoloji/stratejik uyum ve istihdam etkisi belirleyicidir.

### UAT-YAT-001 - Guclu Basvuru Adayi

Veri seti:

- Turkiye'de yerlesik: Evet
- Yatirim yeri belli, il/ilce secili
- Yatirim konusu secili
- Asgari sabit yatirim tutari saglaniyor: Evet
- E-TUYS yetkilendirmesi: Evet
- Makine listesi, proforma, kapasite raporu/fizibilite hazir
- Harcama zamanlamasi: Belge sonrasi

Beklenen:

- Uygun veya guclu potansiyel sonuc uretmeli.
- Hazirlik skoru 70-100 bandina yaklasmali.
- Belge oncesi harcama riski gorunmemeli.

### UAT-YAT-002 - Belge Oncesi Harcama Riski

Veri seti:

- Yatirima baslanmis: Evet
- Harcamalar belge oncesi: Evet
- Faturalar/ithalat baslamis: Evet

Beklenen:

- KDV/gumruk/vergi avantajlari icin risk notu uretilmeli.
- Kesin "Uygun" ifadesi yerine potansiyel/riskli dil tercih edilmeli.

### UAT-YAT-003 - E-TUYS Yok

Veri seti:

- E-TUYS yetkilendirmesi: Hayir
- Diger alanlar olumlu

Beklenen:

- Basvuru hazirligi potansiyel veya eksik gorunmeli.
- Aksiyonlarda E-TUYS yetkilendirmesi net olarak istenmeli.

### Girdi Gerekliligi Sorgusu

- Il/ilce secimi gercek bolgesel destek hesabina etki ediyor mu, yoksa yalniz rapor bilgisi mi?
- Regional category secimi il/ilce ile celisirse sistem uyariyor mu?
- Yatirim tutari sifir veya cok dusukse asgari sabit yatirim sorusu ile celiski yakalaniyor mu?

## 5.5 Ticaret Bakanligi

### Is Kurali Beklentisi

Ticaret modulunde mal ihracati, e-ihracat ve hizmet ihracati destek tipleri ayrismali; DYS, KEP, e-imza, ihracatci birligi, belge/harcama ispatlari ve mukerrer destek riski belirleyici olmalidir.

### UAT-TIC-001 - Mal Ihracati Guclu Aday

Veri seti:

- Mal ihracati secili
- Turkiye'de yerlesik: Evet
- Uretici/imalatci-ihracatci: Evet
- Ihracatci birligi uyesi: Evet
- DYS/KEP/e-imza var
- Fatura/dekont/sozlesme belgeleri var
- Harcama hedef pazara yonelik ve sure icinde
- Baska kamu destegi yok

Beklenen:

- Mal ihracati desteklerinde uygun veya guclu potansiyel sonuc uretilmeli.
- Belge ve DYS eksigi risk notu olmamali.

### UAT-TIC-002 - Mukerrer Destek Riski

Veri seti:

- Gider baska kamu destegiyle destekleniyor: Evet

Beklenen:

- Ilgili destekler riskli veya uygun degil olmali.
- Risk notunda mukerrer destek/cifte finansman acikca belirtilmeli.

### UAT-TIC-003 - Secim Bazli Soru Bloklari

Adimlar:

1. Sadece mal ihracati sec.
2. Sonra sadece e-ihracat sec.
3. Sonra sadece hizmet ihracati sec.

Beklenen:

- Her secimde yalniz ilgili soru bloklari gorunmeli.
- Secili olmayan destek siniflari sonuc uretmemeli veya riskli gorunmemeli.

### Girdi Gerekliligi Sorgusu

- Yillik ihracat bandi sonuc karari mi etkiliyor, yoksa sadece profil bilgisi mi?
- Hizmet ihracati sektoru destek siniflandirmasinda kullaniliyor mu?
- Hedef pazar ve yabanci dilde materyal sorulari hangi desteklere etki ediyor?

## 5.6 Eximbank

### Is Kurali Beklentisi

Eximbank modulunde sonuc "hibe" gibi sunulmamali; kredi, sigorta, kefalet ve garanti urunleri oldugu net kalmalidir. Ihracat profili, siparis/sozlesme, finansal belgeler, ihracat taahhudu, alici/ulke riski ve teminat ihtiyaci belirleyicidir.

### UAT-EXI-001 - Ihracat Kredisi Guclu Aday

Veri seti:

- Ihracatci: Evet
- Son 12 ayda ihracat yapti: Evet
- Ihracat siparisi/sozlesmesi var
- Finansal tablolar ve mizan hazir
- Ihracat taahhudu verilebilir
- Basvuru kanali belli

Beklenen:

- Kredi araclari uygun veya potansiyel gorunmeli.
- Eksik belge sayisi dusuk olmali.
- Sonuc dili geri odemeli finansman oldugunu belirtmeli.

### UAT-EXI-002 - Alacak Sigortasi Adayi

Veri seti:

- Vadeli satis var
- Alici/ulke riski biliniyor
- Alici listesi ve alacak yaslandirma var
- Yeni ulke/musteri riski var

Beklenen:

- Alacak sigortasi veya risk yonetimi urunleri uygun/potansiyel olmali.
- Kredi urunleri ile sigorta urunleri karismamali.

### UAT-EXI-003 - Ihracatci Profili Yok

Veri seti:

- Ihracatci: Hayir
- Son 12 ay ihracat: Hayir
- Doviz kazandirici hizmet yok

Beklenen:

- Eximbank kredi/sigorta urunleri riskli veya uygun degil olmali.
- Sadece genel/IGE gibi farkli kosullara bagli araclar potansiyel kalabilir.

### Girdi Gerekliligi Sorgusu

- Hedef ulke secimi sonuc hesaplamasinda risk sinifini etkiliyor mu?
- Kredi tutari veya ihracat tutari sifirsa sistem anlamli risk uretiyor mu?
- Kredi sicili riskli ise uygun sonuc potansiyele dusuyor mu?

## 5.7 Kalkinma Ajansi

### Is Kurali Beklentisi

Kalkinma Ajansi modulunde acik cagri, ajans bolgesi, basvuru sahibi tipi, proje konusu, bolgesel/yerel etki, es finansman, KAYS ve belge hazirligi belirleyicidir.

### UAT-KAL-001 - Mali Destek Guclu Aday

Veri seti:

- Mali destek secili
- Basvuru sahibi uygun
- Turkiye'de yerlesik
- Proje ili/ajans bolgesi net
- Acik mali destek cagrisi var
- Program oncelikleriyle uyumlu
- Es finansman ve KAYS belgeleri hazir

Beklenen:

- Mali destek sonucu uygun veya guclu potansiyel olmali.
- Cagri ve es finansman kosullari gerekcede gorunmeli.

### UAT-KAL-002 - Cagri Yok / Rehber Incelenmemis

Veri seti:

- Proje iyi tanimli
- Acik cagri yok veya rehber incelenmedi

Beklenen:

- Kesin "Uygun" verilmemeli; sonuc potansiyel kalmali.
- Aksiyonlarda acik cagri rehberi ve ajans duyurusu kontrolu istenmeli.

### UAT-KAL-003 - Cifte Finansman Riski

Veri seti:

- Proje baska kamu destegiyle finanse ediliyor: Evet

Beklenen:

- Risk notunda cifte finansman belirtilmeli.
- Uygun sonuc varsa bile aksiyon/risk uyarisiyla dengelenmeli; gerekli hallerde potansiyel/riskli olmali.

### Girdi Gerekliligi Sorgusu

- Proje konusu preset'leri hangi boolean alanlari otomatik etkiliyor?
- Il/ilce ve ajans bolgesi uyumsuzlugu yakalaniyor mu?
- Basvuru sahibi tipi destek sinifini gercekten filtreliyor mu?

## 5.8 Vergisel Tesvikler

### Is Kurali Beklentisi

Vergisel Tesvik modulunde mukellef turu, belge/proje/onay durumu, muhasebe ayrimi, puantaj/personel takibi, beyanname duzeni, borc/risk gecmisi ve SMMM/YMM kontrolu sonuc uzerinde belirleyici olmalidir.

### UAT-VER-001 - Teknokent / 4691 Guclu Aday

Veri seti:

- Teknokent ihtiyaci secili
- Teknokent faaliyet belgesi ve proje onayi var
- Gelir proje kaynakli
- Bolge ici/disi faaliyet ayrimi var
- Personel zaman kaydi ve muhasebe ayrimi var
- Beyannameler duzenli

Beklenen:

- Teknokent destekleri uygun veya guclu potansiyel olmali.
- Risk notunda proje disi gelir ayrimi ve puantaj kontrolleri yer almali.

### UAT-VER-002 - Belge/Proje Onayi Yok

Veri seti:

- Ilgili vergi avantaji secili
- Belge/proje/onay yok
- Muhasebe ayrimi yok

Beklenen:

- Uygun sonuc verilmemeli.
- Riskli veya potansiyel sonuc, eksik belge ve muhasebe altyapisini aciklamali.

### UAT-VER-003 - Borc ve Vergi Risk Gecmisi

Veri seti:

- Vergi borcu: Evet
- SGK borcu: Evet
- Vergi incelemesi/ozel esas/riskli islem gecmisi: Evet

Beklenen:

- Vergisel avantajlar dogrudan uygun olmamali veya risk notu ciddi sekilde gorunmeli.
- SMMM/YMM kontrolu aksiyonu yazmali.

### Girdi Gerekliligi Sorgusu

- Muhasebe ayrimi sorulari hangi desteklerde uygun sonucu potansiyele dusuruyor?
- Bordro optimizasyonu sorulari vergi tesviki sonucunu mu yoksa sadece rapor tavsiyesini mi etkiliyor?
- Genc girisimci yas ve ilk mukellefiyet sartlari net ayrisiyor mu?

## 6. Hesaplama Skoru Kabul Kriterleri

Skorlu moduller icin genel kabul:

- 0-39: ciddi eksik veya zayif aday.
- 40-69: potansiyel, eksikler tamamlanmali.
- 70-100: guclu aday.

Kontrol edilecekler:

- Skor hicbir zaman 0 altina veya 100 ustune cikmamali.
- Skor artisi, kullanicinin olumlu belge/uygunluk girdileriyle uyumlu olmali.
- Kritik blokaj varken skor yuksek olsa bile sonuc dili "kesin uygun" olmamali.
- Skor yorumu ve kart status'u celismemeli. Ornek: skor 85 ama tum sonuc kartlari riskli ise gerekce aciklanmali.

## 7. Girdi Gerekliligi Analiz Tablosu

Tester her modül icin asagidaki tabloyu doldurmalidir:

| Alan / Soru | Kullanici icin anlasilir mi? | Hesaplamaya etkisi var mi? | Rapor/arsiv etkisi var mi? | Zorunlu olmali mi? | Not |
| --- | --- | --- | --- | --- | --- |
| Ornek: Vergi/SGK borcu | Evet | Evet, riski artirir | Evet | Evet | Tum modullerde kritik risk alanı |
| Ornek: Firma adi | Evet | Hayir | Evet | Opsiyonel/Zorunlu tartisilir | Arsiv arama icin yararli |

Kabul karari:

- Hem hesaplama hem rapor/arsiv etkisi olmayan soru kaldirilir veya aciklama eklenir.
- Kullanici icin belirsiz soru varsa tooltip veya yardim metni eklenir.
- Hesaplamada kritik olan soru varsayilan degeriyle yaniltici sonuc uretmemeli.

## 8. Is Analisti Onay Kontrol Listesi

- Her modülde en az 1 uygun, 1 potansiyel, 1 riskli veri seti test edildi.
- Her modülde sonuc sayilari manuel kart sayimiyla tutarli.
- Her modülde en az 3 kritik soru degistirilerek sonuc etkisi dogrulandi.
- Hesaplama sonucunda kullaniciya "ne yapmali?" aksiyonu veriliyor.
- Mevzuat kesin karari gibi gorunen ifadeler yok.
- Eksik belge durumlari "potansiyel" sonuc mantigina uygun.
- Temel blokajlar "riskli/uygun degil" sonuc mantigina uygun.
- Kaydedilen analiz tekrar acildiginda ayni sonuc uretiliyor.
- Rapor ciktisi sonuc/gerekce/risk/aksiyon metinlerini tasiyor.
- Gereksiz veya etkisiz gorunen sorular listeye alindi.

## 9. UAT Bug / Degisiklik Talebi Sablonu

Baslik:

- Ornek: "TUBITAK rutin ticari proje seciliyken destek uygun gorunuyor"

Alanlar:

- Modul:
- Veri seti:
- Beklenen is sonucu:
- Gerceklesen sonuc:
- Hangi is kuralina aykiri:
- Etkilenen kullanici:
- Risk seviyesi: Kritik / Yuksek / Orta / Dusuk
- Onerilen duzeltme:
- Mevzuat veya is referansi:

## 10. UAT Tamamlanma Kriteri

UAT tamamlandi sayilmasi icin:

- P0/Kritik is kurali hatasi kalmamali.
- P1/Yuksek hesaplama tutarsizliklari giderilmeli veya is sahibi tarafindan kabul edilmeli.
- Her modül icin onaylanan minimum veri setleri dokumante edilmeli.
- Hesaplamada kullanilan kritik sorular ve etki mantigi is sahibi tarafindan onaylanmali.
- "Potansiyel" ve "Riskli" sonuc dillerinin kullanici beklentisiyle uyumlu oldugu kabul edilmeli.

