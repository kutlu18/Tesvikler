# Tesvik Analiz Platformu - UAT Hesaplama Test Kosum Raporu

Hazirlanma tarihi: 2026-05-20
Test tipi: Is analisti UAT hesaplama ve is kurali tutarlilik testleri
Kosan dosya: `tests/uat-business-rules.ts`

## Ozet

Toplam 32 otomatik UAT senaryosu kosuldu.

Son durum:

- PASS: 32
- FAIL: 0

Kapsanan alanlar:

- SGK: temel uygunluk, borc/gec bildirim riski, yeni aday/6111 etkisi
- KOSGEB: KOBI uygunlugu, KOBI degil blokaji, cagri bazli destek potansiyeli
- TUBITAK: Ar-Ge skoru, rutin ticari proje blokaji, idari eksiklerin potansiyele dusurmesi
- Yatirim Tesvik: guclu aday, belge oncesi harcama riski, E-TUYS eksigi
- Ticaret Bakanligi: mal ihracati guclu aday, mukerrer destek riski, destek sinifi filtreleme
- Eximbank: ihracat kredisi, alacak sigortasi/risk yonetimi ayrimi, ihracatci profili yok blokaji
- Kalkinma Ajansi: mali destek adayi, cagri yoksa kesin uygun verilmemesi, cifte finansman riski
- Vergisel Tesvikler: Teknokent/4691 guclu aday, belge/proje onayi eksigi, borc ve vergi risk gecmisi

## Ilk Kosum Bulgulari

Ilk kosum sonucu 29 PASS / 3 FAIL idi.

FAIL olan senaryolar:

- `UAT-TIC-001`: Mal ihracati guclu aday potansiyelde kaldi. Koken neden test veri setinde banka tahsilat kaniti alaninin eksik kalmasiydi; UAT veri seti duzeltildi.
- `UAT-EXI-002`: Alacak sigortasi seciminde kredi urunleri de listeleniyordu. Koken neden Eximbank sonuc listesinin secili ihtiyac tipine gore filtrelenmemesiydi; kod iyilestirildi.
- `UAT-VER-001`: Teknokent/4691 guclu aday potansiyelde kaldi. Koken neden test veri setinde muhasebe/belge arsivi alaninin eksik kalmasiydi; UAT veri seti duzeltildi.

## Yapilan Kod Iyilestirmesi

Eximbank hesaplama mantiginda secili ihtiyac tipiyle ilgili olmayan urunler artik sonuc listesine alinmiyor.

Degisen dosya:

- `src/eximbank/logic/evaluateEximbankSupports.ts`

Degisiklik etkisi:

- Sadece `alacakSigortasi` secildiginde kredi, yesil finansman, kefalet veya genel finansman urunleri gereksiz potansiyel olarak listelenmiyor.
- Katilim esasli ve serbest bolge finansmani gibi genel finansman urunleri artik sadece kredi/finansman ihtiyaci secildiginde ilgili kabul ediliyor.
- Alacak sigortasi senaryosunda sigorta/garanti risk yonetimi urunleri kredi urunleriyle karismadan donuyor.

## Test Kosum Komutu

Portable Node kullanilan ortamda:

```powershell
$node="$env:TEMP\node-v20.20.2-win-x64\node.exe"
& $node .\node_modules\esbuild\bin\esbuild .\tests\uat-business-rules.ts --bundle --platform=node --format=esm --outfile=.\tests\uat-business-rules.mjs
& $node .\tests\uat-business-rules.mjs
```

## Build Dogrulamasi

Asagidaki komutlar basariyla calisti:

```powershell
& $node --preserve-symlinks --preserve-symlinks-main .\node_modules\typescript\lib\tsc.js
& $node --preserve-symlinks --preserve-symlinks-main .\node_modules\vite\bin\vite.js build --mode publish
```

Not:

- Vite build sirasinda React Router ve lucide paketlerinden gelen `use client` uyarilari devam ediyor; build'i engellemiyor.
- Bundle boyutu icin mevcut Vite chunk size uyarisi devam ediyor; bu UAT hesaplama sonucunu etkilemedi.

## Kalan Is Analisti Notlari

- Bu kosum hesaplama fonksiyonlarina karsi otomatik UAT kontroludur; nihai mevzuat dogrulama yerine on uygunluk mantigini test eder.
- Skorlarin 0-100 bandinda kalmasi ve ozet sayilarinin sonuc kartlariyla tutarliligi her modulde kontrol edildi.
- Daha ileri UAT icin ayni veri setleri UI uzerinden kaydetme/tekrar acma/PDF raporu ile de uc uca kosulabilir.
