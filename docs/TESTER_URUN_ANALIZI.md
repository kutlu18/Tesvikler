# Tesvik Analiz Platformu - Tester Urun Analizi ve Test Rehberi

Hazirlanma tarihi: 2026-05-20  
Kapsam: Mevcut React/Vite frontend kodu, route yapisi, auth akislar, dashboard, analiz modulleri, profil ve analiz arsivi.

## 1. Urun Ozeti

Urun, devlet destekleri ve tesvikler icin on uygunluk analizi yapan bir web uygulamasidir. Kullanici misafir olarak sadece SGK modulunu deneyebilir; kayitli kullanici tum analiz modullerine, analiz kaydetme, analiz arsivi, profil ve hareket gecmisi ekranlarina erisebilir.

Ana kullanici tipleri:

- Misafir kullanici: `/auth` uzerinden misafir devam eder, `/app` dashboard ve `/app/sgk` kullanabilir.
- Kayitli kullanici: kayit/giris sonrasi tum modulleri, analiz kaydetmeyi, arsivi ve profili kullanir.
- Tester/admin rolu yok; testler son kullanici perspektifiyle yapilmalidir.

## 2. Ana Route ve Ekran Haritasi

Public ekranlar:

- `/` -> `/auth` yonlendirme
- `/auth` -> urun tanitim/giris/kayit/misafir devam ekrani
- `/auth/login` -> giris formu
- `/auth/register` -> kayit formu

Uygulama ekranlari:

- `/app` -> dashboard, modül kartlari, metrikler, analiz gecmisi CTA
- `/app/sgk` -> SGK Tesvikleri, misafir erisimine acik
- `/app/kosgeb` -> KOSGEB Destekleri, kayitli kullanici
- `/app/tubitak` -> TUBITAK Destekleri, kayitli kullanici
- `/app/yatirim-tesvik` -> Yatirim Tesvikleri, kayitli kullanici
- `/app/ticaret` -> Ticaret Bakanligi Destekleri, kayitli kullanici
- `/app/eximbank` -> Eximbank ve Finansman Destekleri, kayitli kullanici
- `/app/kalkinma-ajansi` -> Kalkinma Ajanslari Destekleri, kayitli kullanici
- `/app/vergisel-tesvik` -> Vergisel Tesvikler ve Istisnalar, kayitli kullanici
- `/app/profile` -> profil genel bilgiler, analizler, hareket gecmisi, ayarlar
- `/app/analyses` -> profil ekraninin Analizlerim tab'i

## 3. Kritik Urun Riskleri

1. Metin encoding bozulmalari var. Kodda ve ekranda "TeÅŸvik", "GiriÅŸ", "KayÄ±t" gibi mojibake gorunebilir. Tester tum public ve app ekranlarinda Turkce karakterleri ozellikle kontrol etmeli.
2. Kayit/giris kaliciligi kritik. Supabase env yoksa sistem localStorage mock auth kullaniyor. Kayitli kullanici sayfa yenileme, tarayici kapat/ac, cikis/giris dongulerinde tekrar kayit olmak zorunda kalmamali.
3. Public ekranlarda oturum varken tekrar `/auth` ekraninin gorunmesi kafa karistirabilir. Oturumlu kullanici `/auth`, `/auth/login`, `/auth/register` acinca beklenen davranis netlestirilmeli: dashboard'a yonlenmeli veya "zaten giris yaptiniz" durumu gorunmeli.
4. Misafir ve kayitli kullanici yetki ayrimi test edilmeli. Misafir SGK disindaki modulleri acamamali, kilit/modal/CTA tutarli calismali.
5. Analiz kaydetme ve arsivleme localStorage/Supabase ayrimina gore degisiyor. Offline/local modda analizler tarayiciya kaydediliyor; farkli tarayici veya localStorage temizleme sonrasi veri kaybi normal olabilir ama kullanici metni net olmali.
6. PDF/Rapor cikti akisi popup veya print penceresi acabilir. Popup engelleyici, bos rapor, eksik Turkce karakter, uzun sonuc listeleri test edilmeli.
7. Formlarda cok fazla kosullu alan var. Secim temizleme, resetleme, tekrar acma ve onceki analizden devam etme akislari regresyona acik.
8. Mevzuat iceriği karar destek niteliginde. Sonuc kartlari "nihai uygunluk" gibi kesin ifade etmemeli; her modül footer uyarisi gorunmeli.

## 4. Test Ortami Notlari

Mevcut makinede Node PATH uzerinde gorunmeyebilir. Bu durumda uygulama Vite dev server yerine `dist` statik ciktisiyle calistirilabilir. Test edilen build'in kaynak kodla ayni oldugu teyit edilmelidir.

Kontrol edilecek local URL:

- `http://127.0.0.1:5173/`

Test oncesi onerilen tarayici temizligi:

- Normal test: localStorage korunarak kayit/giris kaliciligi denenmeli.
- Temiz kurulum testi: localStorage temizlenip ilk kullanici deneyimi denenmeli.
- Coklu hesap testi: ayni tarayicida iki farkli e-posta ile kayit/giris denenmeli.

## 5. Auth ve Yetki Testleri

### 5.1 Kayit Ol

Test adimlari:

1. `/auth/register` ac.
2. Ad soyad, e-posta, sifre, sifre tekrar, firma adi, rol doldur.
3. KVKK/kullanim kosulu checkbox'ini isaretlemeden kayit olmayi dene.
4. Checkbox isaretleyip kayit ol.
5. `/app` dashboard'a yonlendigini kontrol et.
6. Topbar'da kullanici adi/firma bilgisi gorunuyor mu kontrol et.
7. Sayfayi yenile.
8. Kullanici oturumu korunuyor mu kontrol et.

Beklenen:

- Zorunlu alan hatalari anlasilir olmali.
- Sifre tekrar farkliysa hata vermeli.
- Ayni e-posta ile ikinci kayit engellenmeli.
- Yenileme sonrasi tekrar kayit istenmemeli.

### 5.2 Giris Yap

Test adimlari:

1. Kayitli e-posta/sifre ile `/auth/login` ac.
2. Bos e-posta ve bos sifre validasyonlarini dene.
3. Hatali sifre dene.
4. Dogru bilgilerle giris yap.
5. `/app` ekranina yonlendirme ve profil bilgilerinin gelmesini kontrol et.

Beklenen:

- Hatali giris mesaji kullaniciyi yonlendirmeli.
- Basarili giris sonrasi tum moduller acik olmali.

### 5.3 Cikis Yap

Test adimlari:

1. Girisli kullaniciyken Topbar'dan Cikis Yap.
2. `/app/profile`, `/app/kosgeb` gibi korumali route'lari direkt URL ile acmayi dene.
3. `/auth` ekranina yonleniyor mu kontrol et.

Beklenen:

- Session temizlenmeli.
- Cikis sonrasi kayitli kullanici ekranlari gorunmemeli.

### 5.4 Misafir Mod

Test adimlari:

1. `/auth` ekranindan Misafir Olarak Devam Et.
2. Dashboard'da Misafir Mod badge'i gorunmeli.
3. SGK modulunu ac.
4. KOSGEB/TUBITAK gibi kilitli modulleri dashboard ve sidebar uzerinden acmayi dene.

Beklenen:

- SGK acilmali.
- Diger moduller acilmamali; kayit/giris CTA veya modal gorunmeli.
- Analiz kaydetme denemesinde giris modal'i veya misafir kayit mesaji tutarli olmali.

## 6. Dashboard ve Navigasyon Testleri

Kontrol listesi:

- Sidebar aktif route'u dogru isaretliyor mu?
- Dashboard metrik kartlari misafir/kayitli kullaniciya gore degisiyor mu?
- Modul kartlarinda kilitli/acik durumlari dogru mu?
- Mobil viewport'ta sidebar/topbar/task kartlari tasma veya ust uste binme yapiyor mu?
- Buton metinleri ve badge'ler Turkce karakter problemi yasiyor mu?
- Bilinmeyen route `*` `/auth` yonlendirmesine dusuyor mu?

## 7. Ortak Analiz Modulu Testleri

Tum analiz modullerinde ortak akış:

1. Analiz Bilgileri alanlarini doldur: baslik, musteri/firma adi, NACE, vergi no, sektor, durum, not.
2. Form sorularindan birkac kritik secim degistir.
3. Analizi Baslat butonuna bas.
4. Ozet dashboard sayilari degisiyor mu kontrol et.
5. Sonuc gruplari kontrol et: Uygun, Potansiyel, Riskli.
6. Analizi Kaydet.
7. `/app/analyses` ekraninda kayit gorunuyor mu kontrol et.
8. Kaydi goruntule, tekrar ac, kopyala, arsivle, sil.
9. PDF / Rapor cikti al butonunu test et.
10. Analizi Sifirla; form ve analiz bilgileri beklenen default'a donuyor mu kontrol et.

Beklenen:

- Kayit sonrasi baslik/musteri/vergi no/NACE/status/not alanlari arsivde korunmali.
- Tekrar acilan analiz form verileriyle birlikte geri yuklenmeli.
- Arsivlenen analiz status'u Arsivlendi olmali.
- Silme onay almali ve onaydan sonra kayit listeden kalkmali.
- Kopyalama yeni Taslak kayit olusturmali.
- Rapor bos olmamali, analiz bilgileri ve sonuc gruplari raporda yer almali.

## 8. Modul Bazli Test Odaklari

### SGK Tesvikleri

- Misafir erisimine acik tek modul oldugunu dogrula.
- Yeni ise alim sorusu "Evet" olunca aday alanlari aciliyor mu?
- Calisan sayisi ve ortalama calisan sayisi negatif girilebiliyor mu kontrol et.
- SGK borcu, bildirge, prim odeme, kayit disi risk cevaplari sonuc gruplarini etkiliyor mu?
- 4/B Bag-Kur alanlari risk/uygunluk sonuclarina yansiyor mu?

### KOSGEB

- Analiz baslatilmadan sonuc kartlari yerine bilgi mesaji gorunmeli.
- Isletme kurulus tarihi sirket yasini hesaplamali.
- NACE selector calismali.
- KOBI, borc, KOSGEB kaydi, KOBI beyannamesi cevaplari sonuc skorunu etkilemeli.
- Yatirim butcesi ve harcama planlari sonuc kartlarina yansimali.

### TUBITAK

- Form state localStorage'a yaziliyor; sayfa yenilemede form korunuyor mu?
- Reset butonu onay almali ve formu temizlemeli.
- Mevcut TRL ve oncelikli teknoloji tooltip'leri hover/focus ile acilmali.
- TRL, proje suresi, proje butcesi, Ar-Ge riski ve ticari faaliyet sorulari sonuc dagilimini etkilemeli.

### Yatirim Tesvik

- Il secilmeden ilce select'i disabled olmali.
- Il degisince onceki ilce temizlenmeli.
- Analiz Bilgileri karti diger modullerle ayni sekilde gorunuyor mu kontrol edilmeli. Mevcut kodda bu modülde AnalysisInfoCard render edilmemis olabilir; kayit basligi ve musteri bilgileri girilemiyorsa bug ac.
- Yatirim tutari, OSB, bolge tipi, E-TUYS, belge oncesi harcama secimleri sonuc risklerine yansimali.

### Ticaret Bakanligi

- Destek tipi seciminde en az bir tip secili kalmali; son secim kapatilmak istenirse davranis tutarli olmali.
- Mal ihracati, e-ihracat, hizmet ihracati secimleri ilgili soru bloklarini acip kapatmali.
- Yillik ihracat bandi, ulke sayisi, DYS/KEP/e-imza, belge durumlari sonuc kartlarini etkilemeli.

### Eximbank

- Finansman ihtiyaci seciminde Tumu/Temizle calismali.
- Hic ihtiyac secilmezse sari uyari gorunmeli.
- Hedef ulkeler dropdown'u acilmali, coklu secim yapilmali, disari tiklayinca kapanmali.
- Kisa/uzun vadeli finansman, alacak sigortasi, IGE, yesil finansman secimlerine gore ilgili bolumler acilmali.

### Kalkinma Ajansi

- Proje/destek ihtiyaci secimleri ilgili soru bloklarini acip kapatmali.
- Proje konusu preset'leri secilince form alanlari otomatik isaretlenmeli ve proje konusu metni birlesmeli.
- Il/ilce bagimli secimlerde il degisince ilce temizlenmeli.
- Hic ihtiyac secilmezse uyari gorunmeli.

### Vergisel Tesvikler

- Vergi avantaji tipi secimleri ilgili soru bloklarini acip kapatmali.
- Hic ihtiyac secilmezse uyari gorunmeli.
- Teknogirisim/Ar-Ge/YTB/Serbest Bolge/Ihracat/KDV/OSB/Bordro secimleri sonuc gruplarini etkilemeli.
- Vergisel risk uyari footer'i gorunmeli.

## 9. Profil ve Analizlerim Testleri

Profil genel bilgiler:

- Ad soyad, e-posta, firma, rol, son giris, toplam analiz dogru gorunmeli.
- Profil ayarlari guncellenince Topbar ve profil ozeti yenilenmeli.
- Guncelleme sonrasi sayfa yenilemede bilgiler korunmali.

Analizlerim:

- Kaydedilen analizler guncellenme tarihine gore siralanmali.
- Modul/status/musteri/NACE/tarih/arama filtreleri dogru calismali.
- Detay modal'i form verisi, sonuc ve notlari gostermeli.
- Not ekleme kayitli kullanici icin calismali.
- Tekrar acma ilgili modül route'una goturmeli ve formu doldurmali.

Hareket gecmisi:

- Kayit, giris, cikis, analiz kaydetme/guncelleme, arsivleme, silme, kopyalama, rapor alma olaylari gorunmeli.
- Tarih siralamasi yeni -> eski olmali.

## 10. UI/UX ve Responsive Test Listesi

Viewport'lar:

- Mobile: 360x800, 390x844
- Tablet: 768x1024
- Desktop: 1366x768, 1440x900, 1920x1080

Kontrol edilecekler:

- Buton metinleri kutudan tasmiyor mu?
- Uzun modul basliklari kartlarda tasma/ust uste binme yapiyor mu?
- Sidebar mobilde kullanilabilir mi? Dar ekranda cok uzun liste nasil davraniyor?
- Form grid'leri dar ekranda tek kolona iniyor mu?
- Dropdown ve tooltip'ler ekran disina tasiyor mu?
- Modal ve popup'lar scroll edilebilir mi?
- Disabled butonlar gorunur ve anlasilir mi?
- Hover/focus state'leri klavye ile erisilebilir mi?

## 11. Veri Kaliciligi Testleri

LocalStorage ana alanlari:

- `mockAuthUsers`
- `mockAuthSession`
- `guestModeEnabled`
- `savedAnalyses:<userId>`
- `guestAnalyses`
- `analysisInfo:<analysisType>`
- `analysisResume:<analysisType>`
- `activityLogs:<userId>`
- `tubitakEligibilityFormState`

Senaryolar:

- Kayit ol -> yenile -> kullanici korunur.
- Cikis yap -> yenile -> kullanici cikmis kalir.
- Giris yap -> analiz kaydet -> yenile -> analiz korunur.
- Profil guncelle -> yenile -> profil korunur.
- Analiz tekrar ac -> form verileri gelir -> storage resume anahtari tuketilir.
- localStorage temizle -> sistem ilk kurulum gibi davranir.

## 12. Guvenlik ve Negatif Testler

- Korumali route'lara girissiz direkt URL ile erisim engellenmeli.
- Misafir kullanici kilitli modulleri direkt URL ile acamamali.
- Ayni e-posta ile tekrar kayit engellenmeli.
- Hatali localStorage JSON'u uygulamayi cokertmemeli.
- Cok uzun metinler analiz basligi/not alanlarinda UI'i bozmamali.
- Sayisal alanlara negatif, cok buyuk, bos, ondalikli degerler girildiginde davranis kontrol edilmeli.
- PDF raporda XSS/HTML enjeksiyon gibi gorunur script calismasi olmamali.

## 13. Onceliklendirilmis Eksik/Risk Listesi

P0 - Kritik:

- Kayitli kullanici bilgileri ve analizleri sayfa yenileme/tarayici yeniden acma sonrasi korunmali.
- Misafir/kayitli yetki ayrimi asilmamali.
- Analiz kaydetme ve tekrar acma veri kaybi yaratmamali.

P1 - Yuksek:

- Turkce karakter/encoding bozukluklari giderilmeli.
- Public auth sayfalari oturumlu kullanicida kafa karistirmamali.
- Yatirim Tesvik modulunde analiz bilgileri karti yoksa kaydedilen analizin baslik/musteri bilgisi eksik kalabilir.
- Node/Vite calisma ortami netlestirilmeli; tester hangi build'i test ettigini bilmeli.

P2 - Orta:

- Tooltip/dropdown responsive davranislari.
- PDF/print penceresi popup blocker durumlari.
- Cok uzun sonuc listelerinde performans ve scroll davranisi.
- Formlarda negatif/sinir disi sayisal input validasyonu.

## 14. Smoke Test Seti

Her build oncesi hizli kontrol:

1. `/auth` aciliyor.
2. Yeni kullanici kayit olabiliyor.
3. Sayfa yenilemede oturum korunuyor.
4. Dashboard aciliyor.
5. SGK analizi baslatilip sonuc gorunuyor.
6. Kayitli kullanici KOSGEB modulunu acabiliyor.
7. Analiz kaydediliyor ve `/app/analyses` listesinde gorunuyor.
8. Analiz tekrar aciliyor.
9. PDF/Rapor cikti butonu bos olmayan rapor uretiyor.
10. Cikis yapiliyor ve korumali route'a erisim engelleniyor.

## 15. Bug Kayit Sablonu

Baslik:

- Kisa ve eylem odakli yazin. Ornek: "Misafir kullanici direkt URL ile KOSGEB modulunu acabiliyor"

Alanlar:

- Ortam: browser, viewport, URL, build/commit
- Kullanici tipi: misafir/kayitli
- On kosul: localStorage durumu, giris bilgisi, secili modul
- Adimlar:
- Beklenen sonuc:
- Gerceklesen sonuc:
- Ekran goruntusu/video:
- Console hatasi:
- Network/localStorage notu:
- Oncelik: P0/P1/P2/P3

