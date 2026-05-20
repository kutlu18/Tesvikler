# sgk_tesvik_algoritmasi.py
# SGK / İstihdam / Bordro Teşvikleri Ön Uygunluk Algoritması
# Amaç: Mali müşavirlik / bağımsız denetim ofisi müşteri görüşmesinde
# müşteriye sorulan sorulara göre hangi SGK, istihdam ve bordro teşviklerinden
# faydalanabileceğini tek ekranda ön değerlendirme olarak göstermek.
#
# Not: Bu algoritma hukuki/mali nihai görüş değildir. Nihai uygunluk için
# SGK Potansiyel Teşvik Sorgulama, e-Bildirge, borç durumu, ortalama sigortalı
# sayısı, işe giriş tarihi, belge türü ve müşteri özelinde mevzuat kontrolü yapılmalıdır.

import sys
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class TesvikSonucu:
    ad: str
    durum: str
    mevzuat: str
    fayda: str
    gerekce: List[str] = field(default_factory=list)
    aksiyon: List[str] = field(default_factory=list)
    risk_notu: List[str] = field(default_factory=list)
    nasil_alinir: List[str] = field(default_factory=list)
    neden_saglanmadi: List[str] = field(default_factory=list)
    nasil_saglanabilir: List[str] = field(default_factory=list)


def evet_hayir(soru: str) -> bool:
    while True:
        cevap = input(f"{soru} (E/H): ").strip().lower()
        if cevap in ["e", "evet", "y", "yes"]:
            return True
        if cevap in ["h", "hayir", "hayır", "n", "no"]:
            return False
        print("Lütfen E veya H giriniz.")


def sayi_al(soru: str, varsayilan: int = 0) -> int:
    while True:
        cevap = input(f"{soru} [Varsayılan: {varsayilan}]: ").strip()
        if cevap == "":
            return varsayilan
        try:
            return int(cevap)
        except ValueError:
            print("Lütfen sayı giriniz.")


def secim_al(soru: str, secenekler: List[str]) -> str:
    print(f"\n{soru}")
    for i, secenek in enumerate(secenekler, start=1):
        print(f"{i}. {secenek}")

    while True:
        cevap = input("Seçiminiz: ").strip()
        try:
            index = int(cevap)
            if 1 <= index <= len(secenekler):
                return secenekler[index - 1]
        except ValueError:
            pass
        print("Geçerli bir seçim yapınız.")


def musteri_bilgilerini_al() -> Dict:
    print("\n" + "=" * 80)
    print("SGK / İSTİHDAM / BORDRO TEŞVİKLERİ ÖN UYGUNLUK ALGORİTMASI")
    print("=" * 80)

    bilgiler = {}

    print("\n1) İŞYERİ GENEL BİLGİLERİ")
    bilgiler["ozel_sektor"] = evet_hayir("İşyeri özel sektör işvereni mi?")
    bilgiler["imalat"] = evet_hayir("İşyeri imalat sektöründe mi?")
    bilgiler["sgk_borcu_yok"] = evet_hayir("İşyerinin SGK prim/idari para cezası borcu yok mu veya yapılandırılmış mı?")
    bilgiler["bildirgeler_suresinde"] = evet_hayir("Aylık prim ve hizmet belgeleri / MUHSGK süresinde veriliyor mu?")
    bilgiler["primler_suresinde"] = evet_hayir("SGK primleri süresinde ödeniyor mu?")
    bilgiler["kayit_disi_risk_yok"] = evet_hayir("Kayıt dışı/sahte sigortalı/fiilen çalışmayan kişi bildirimi riski yok mu?")
    bilgiler["kamu_ihalesi_is"] = evet_hayir("İş, kamu ihalesi veya kamu idaresine ait özel bina inşaatı kapsamında mı?")
    bilgiler["calisan_sayisi"] = sayi_al("Toplam sigortalı çalışan sayısı kaç?", 0)
    bilgiler["ortalama_calisan_sayisi"] = sayi_al("Son 6 ay / ilgili dönem ortalama sigortalı sayısı kaç?", 0)

    print("\n2) YATIRIM, YURT DIŞI VE ÖZEL BELGE DURUMU")
    bilgiler["yatirim_tesvik_belgesi"] = evet_hayir("Yatırım Teşvik Belgesi var mı?")
    bilgiler["ytb_tamamlama_vizesi"] = evet_hayir("Yatırım tamamlandı mı / tamamlama vizesi aşamasına gelindi mi?")
    bilgiler["yurtdisina_personel_gonderiyor"] = evet_hayir("Türkiye'den yurt dışındaki işe/şantiyeye/projeye sigortalı gönderiliyor mu?")
    bilgiler["arge_tasarim_merkezi"] = evet_hayir("Ar-Ge merkezi veya tasarım merkezi belgesi var mı?")
    bilgiler["teknokent"] = evet_hayir("Teknoloji geliştirme bölgesi / teknokentte faaliyet var mı?")
    bilgiler["arge_personeli_var"] = evet_hayir("Ar-Ge, tasarım veya destek personeli çalışıyor mu?")
    bilgiler["kultur_belgesi"] = evet_hayir("Kültür yatırım belgesi veya kültür girişim belgesi var mı?")
    bilgiler["cok_tehlikeli"] = evet_hayir("İşyeri çok tehlikeli sınıfta mı?")
    bilgiler["is_kazasi_yok"] = evet_hayir("Son 3 yılda ölümlü veya sürekli iş göremezlikli iş kazası yaşanmadı mı?")

    print("\n3) YENİ İŞE ALINACAK / İNCELENECEK ADAY BİLGİLERİ")
    bilgiler["yeni_ise_alim_var"] = evet_hayir("Yeni işe alım yapılacak mı veya son dönemde işe alınan aday incelenecek mi?")

    if bilgiler["yeni_ise_alim_var"]:
        bilgiler["aday_yas"] = sayi_al("Adayın yaşı kaç?", 0)
        bilgiler["aday_cinsiyet"] = secim_al("Adayın cinsiyeti nedir?", ["Kadın", "Erkek", "Belirtmek istemiyor / bilinmiyor"])
        bilgiler["aday_son_6_ay_issiz"] = evet_hayir("Aday işe girişten önceki son 6 ayda SGK'lı çalışmamış mı?")
        bilgiler["aday_ortalama_ilave"] = evet_hayir("Aday, işyerinin ortalama sigortalı sayısına ilave olarak mı alınacak?")
        bilgiler["aday_mesleki_belge"] = evet_hayir("Adayın mesleki yeterlilik belgesi, mesleki/teknik eğitim diploması veya İŞKUR kurs belgesi var mı?")
        bilgiler["aday_iskur_kayitli"] = evet_hayir("Aday İŞKUR'a kayıtlı işsiz mi?")
        bilgiler["aday_issizlik_odenegi"] = evet_hayir("Aday işsizlik ödeneği alıyor mu?")
        bilgiler["aday_onceki_isyerine_donus"] = evet_hayir("Aday, işsizlik ödeneği aldığı eski işyerine mi dönüyor?")
        bilgiler["aday_engelli"] = evet_hayir("Aday engelli statüsünde mi?")
        bilgiler["aday_2828"] = evet_hayir("Aday 2828 sayılı Kanun kapsamındaki sosyal hizmet modellerinden yararlanmış kişi mi?")
        bilgiler["aday_sosyal_yardim"] = evet_hayir("Adayın hane halkı sosyal yardım alıyor mu / 3294 kapsamına giriyor mu?")
    else:
        bilgiler["aday_yas"] = 0
        bilgiler["aday_cinsiyet"] = "Bilinmiyor"
        bilgiler["aday_son_6_ay_issiz"] = False
        bilgiler["aday_ortalama_ilave"] = False
        bilgiler["aday_mesleki_belge"] = False
        bilgiler["aday_iskur_kayitli"] = False
        bilgiler["aday_issizlik_odenegi"] = False
        bilgiler["aday_onceki_isyerine_donus"] = False
        bilgiler["aday_engelli"] = False
        bilgiler["aday_2828"] = False
        bilgiler["aday_sosyal_yardim"] = False

    print("\n4) 4/B - BAĞ-KUR DURUMU")
    bilgiler["bagkur_mukellefi"] = evet_hayir("Müşteri şahıs işletmesi sahibi / şirket ortağı olarak 4/B Bağ-Kur kapsamında mı?")
    bilgiler["bagkur_borcu_yok"] = evet_hayir("4/B prim borcu yok mu veya yapılandırılmış mı?")

    return bilgiler


def genel_sgk_sartlari_saglandi_mi(b: Dict) -> bool:
    return (
        b["ozel_sektor"]
        and b["sgk_borcu_yok"]
        and b["bildirgeler_suresinde"]
        and b["primler_suresinde"]
        and b["kayit_disi_risk_yok"]
        and not b["kamu_ihalesi_is"]
    )


def genel_sgk_eksikleri(b: Dict) -> List[str]:
    eksikler = []

    if not b["ozel_sektor"]:
        eksikler.append("İşyeri özel sektör işvereni değil.")

    if not b["sgk_borcu_yok"]:
        eksikler.append("SGK prim/idari para cezası borcu bulunuyor veya yapılandırma durumu uygun değil.")

    if not b["bildirgeler_suresinde"]:
        eksikler.append("Aylık prim ve hizmet belgeleri / MUHSGK süresinde verilmiyor.")

    if not b["primler_suresinde"]:
        eksikler.append("SGK primleri süresinde ödenmiyor.")

    if not b["kayit_disi_risk_yok"]:
        eksikler.append("Kayıt dışı, sahte sigortalı veya fiilen çalışmayan kişi bildirimi riski bulunuyor.")

    if b["kamu_ihalesi_is"]:
        eksikler.append("İş kamu ihalesi veya kamu idaresine ait özel bina inşaatı kapsamında olabilir.")

    return eksikler


def genel_sgk_eksikleri_nasil_giderilir(b: Dict) -> List[str]:
    oneriler = []

    if not b["sgk_borcu_yok"]:
        oneriler.append("SGK borç dökümü alınmalı; borç ödenmeli veya yapılandırma/tecil işlemi yapılmalı.")

    if not b["bildirgeler_suresinde"]:
        oneriler.append("MUHSGK ve aylık prim hizmet bildirgesi süreçleri takvime bağlanmalı; bildirgeler yasal sürede verilmelidir.")

    if not b["primler_suresinde"]:
        oneriler.append("Prim ödeme takvimi oluşturulmalı; teşvikten yararlanılacak aylarda primler süresinde ödenmelidir.")

    if not b["kayit_disi_risk_yok"]:
        oneriler.append("Fiili çalışma, bordro, puantaj, işe giriş ve görev kayıtları temizlenmeli; sahte/fiili olmayan bildirim riski giderilmelidir.")

    if b["kamu_ihalesi_is"]:
        oneriler.append("İşin kamu ihalesi kapsamında olup olmadığı sözleşme ve hakediş belgeleriyle netleştirilmeli; uygun teşvik kanun numarası ayrıca kontrol edilmelidir.")

    if not b["ozel_sektor"]:
        oneriler.append("Bu desteklerin çoğu özel sektör işverenleri için tasarlandığından kamu/özel işveren statüsü netleştirilmelidir.")

    return oneriler


def degerlendir_5510_indirimi(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="5510 Malullük, Yaşlılık ve Ölüm Sigortası İşveren Hissesi İndirimi",
        durum="",
        mevzuat="5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu md. 81/1-ı",
        fayda="Özel sektör işverenleri için MYÖ işveren hissesi prim indirimi. Genel uygulamada 2 puan; imalat sektöründe 2026 sonuna kadar 5 puan uygulanabilir."
    )

    if genel_sgk_sartlari_saglandi_mi(b):
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Özel sektör işvereni, SGK borç/bildirge/ödeme ve kayıt dışı risk açısından temel şartları sağlıyor.")
        if b["imalat"]:
            sonuc.gerekce.append("İmalat sektöründe olduğu için 2026 sonuna kadar 5 puanlık uygulama kontrol edilebilir.")
        else:
            sonuc.gerekce.append("İmalat dışı sektör olduğu için genel indirim oranı üzerinden değerlendirilmelidir.")
        sonuc.nasil_alinir.extend([
            "SGK işveren sistemi üzerinden ilgili ay için MUHSGK / e-Bildirge tahakkuku hazırlanır.",
            "5510 sayılı Kanun md. 81/1-ı kapsamındaki uygun kanun numarası seçilerek bildirim yapılır.",
            "Prim tahakkuku oluşturulduktan sonra indirimli prim tutarı kontrol edilir.",
            "İlgili aya ait primler yasal süresi içinde ödenir.",
            "Her ay SGK borcu, bildirge süresi ve ödeme şartları yeniden kontrol edilir."
        ])
        sonuc.aksiyon.append("e-Bildirge / MUHSGK tahakkuklarında ilgili kanun numarası ile uygulanıp uygulanmadığı kontrol edilmeli.")
        sonuc.aksiyon.append("SGK borcu, yapılandırma ve ödeme süreleri her ay kontrol edilmeli.")
    else:
        sonuc.durum = "UYGUN DEĞİL / RİSKLİ"
        sonuc.gerekce.append("Genel SGK teşvik şartlarından en az biri sağlanmıyor.")
        sonuc.neden_saglanmadi.extend(genel_sgk_eksikleri(b))
        sonuc.nasil_saglanabilir.extend(genel_sgk_eksikleri_nasil_giderilir(b))
        sonuc.risk_notu.append(
            "Bu şartlar sağlanmadan teşvik uygulanırsa SGK denetiminde teşvik iptali, gecikme zammı ve ceza riski doğabilir."
        )

    return sonuc


def degerlendir_yurtdisi_5_puan(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Yurt Dışına Götürülen Sigortalılar İçin 5 Puan GSS İşveren Hissesi İndirimi",
        durum="",
        mevzuat="5510 sayılı Kanun md. 81/1-i",
        fayda="Türkiye'den yurt dışındaki işyerlerine çalıştırılmak üzere götürülen sigortalılar için GSS işveren hissesi üzerinden 5 puan indirim."
    )

    if genel_sgk_sartlari_saglandi_mi(b) and b["yurtdisina_personel_gonderiyor"]:
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("İşyeri yurt dışına sigortalı gönderdiğini beyan ediyor ve temel SGK şartları sağlanıyor.")
        sonuc.nasil_alinir.extend([
            "Yurt dışı hizmet sözleşmesi ve görevlendirme yazısı hazırlanır.",
            "Sigortalı personel için yurt dışı görev yazısı ve bordro kaydı yapılır.",
            "Yurt dışına hareket, dönüş ve çalışma belgeleri saklanır.",
            "SGK bildirimi yurt dışı istisnası kapsamında uygun kanun numarasıyla yapılır."
        ])
        sonuc.aksiyon.append("Yurt dışı proje/şantiye/hizmet sözleşmesi ve sigortalı görevlendirme kayıtları kontrol edilmeli.")
        sonuc.aksiyon.append("Sigortalının gerçekten yurt dışı işte çalıştığını gösteren görevlendirme, bordro ve seyahat belgeleri saklanmalı.")
    elif b["yurtdisina_personel_gonderiyor"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("Yurt dışına personel gönderimi var ancak genel SGK şartlarında eksik/risk bulunuyor.")
        sonuc.neden_saglanmadi.append("Temel SGK şartları veya bildirim/ödeme düzeni yurt dışı indirim için tam sağlanmamış.")
        sonuc.nasil_saglanabilir.append("SGK borcu, bildirim ve ödeme şartları düzeltilmeli; yurt dışı görevlendirme belgeleri eksiksiz hazırlanmalıdır.")
        sonuc.aksiyon.append("Önce SGK borcu, bildirim ve ödeme şartları düzeltilmeli.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Yurt dışına götürülen sigortalı bulunmadığı için bu teşvik uygulanamaz.")
        sonuc.neden_saglanmadi.append("Yurt dışı görevlendirme kapsamı bulunmuyor.")
        sonuc.nasil_saglanabilir.append("Yurt dışı projeye personel gönderilmesi ve bununla ilgili yasal belgelerin hazırlanması durumunda yeniden değerlendirme yapılabilir.")

    return sonuc


def degerlendir_bagkur_5_puan(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="4/B Bağ-Kur 5 Puan Prim İndirimi",
        durum="",
        mevzuat="5510 sayılı Kanun md. 81/1-j",
        fayda="4/B kapsamındaki sigortalılar için primlerin düzenli ödenmesi ve borç bulunmaması halinde 5 puan indirim."
    )

    if b["bagkur_mukellefi"] and b["bagkur_borcu_yok"]:
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Müşteri 4/B kapsamında ve Bağ-Kur borcu bulunmadığını/yapılandırıldığını beyan ediyor.")
        sonuc.nasil_alinir.extend([
            "4/B prim tahakkukları düzenli olarak kontrol edilir.",
            "Bağ-Kur kayıtlarında doğru sigortalı bilgilerinin yer aldığı doğrulanır.",
            "Prim borcu yoksa teşvikli prim tarifesi üzerinden ödeme yapılır."
        ])
        sonuc.aksiyon.append("4/B prim tahakkukları ve geçmiş borç ekranı kontrol edilmeli.")
    elif b["bagkur_mukellefi"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("Müşteri 4/B kapsamında ancak prim borcu var veya borç durumu net değil.")
        sonuc.neden_saglanmadi.append("Bağ-Kur prim borcu var veya borç durumu eksik/yetersiz bildirildi.")
        sonuc.nasil_saglanabilir.append("Borç ödenmeli veya yapılandırma şartları netleştirilmeli; 4/B prim durumunun temiz olması sağlanmalıdır.")
        sonuc.aksiyon.append("Bağ-Kur borcu ödenmeli veya yapılandırma şartları incelenmeli.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Müşteri 4/B kapsamında olmadığını beyan ediyor.")
        sonuc.neden_saglanmadi.append("4/B kapsamı dışında olduğu için bu prim indirimine uygun değil.")
        sonuc.nasil_saglanabilir.append("4/B kapsamına giren bir kişiyi istihdam etmek veya statü değerlendirmesi yapmak gerekebilir.")

    return sonuc


def degerlendir_yatirim_tesvik_sgk(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Yatırım Teşvik Belgesi Kapsamında SGK İşveren Hissesi Desteği",
        durum="",
        mevzuat="5510 sayılı Kanun Ek md. 2 ve Yatırım Teşvik Mevzuatı",
        fayda="Yatırım Teşvik Belgesi kapsamındaki yatırımda, bölge ve yatırım türüne göre SGK işveren hissesi desteği."
    )

    if b["yatirim_tesvik_belgesi"] and genel_sgk_sartlari_saglandi_mi(b):
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Yatırım Teşvik Belgesi mevcut ve genel SGK şartları sağlanıyor.")
        if not b["ytb_tamamlama_vizesi"]:
            sonuc.gerekce.append("Yatırım henüz tamamlama vizesi aşamasında olmayabilir; destek başlama zamanı ayrıca kontrol edilmeli.")
        sonuc.nasil_alinir.extend([
            "YTB belge numarası, yatırım konusu ve bölge bilgileri teyit edilir.",
            "İstihdam listesi ve destek unsurları belgeye göre eşleştirilir.",
            "SGK işveren hissesi desteği için uygun kanun numarasıyla bildirim yapılır.",
            "Destek süresi ve başlangıç tarihi belge üzerinden doğrulanır."
        ])
        sonuc.aksiyon.append("YTB belge numarası, yatırım konusu, bölgesi, destek unsurları ve istihdam listesi kontrol edilmeli.")
        sonuc.aksiyon.append("SGK işveren hissesi desteğinin başlangıç tarihi ve süresi belge üzerinden doğrulanmalı.")
    elif b["yatirim_tesvik_belgesi"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("YTB mevcut ancak genel SGK şartlarında eksik/risk var.")
        sonuc.neden_saglanmadi.append("Genel SGK şartları veya YTB destek koşulları tam sağlanmamış.")
        sonuc.nasil_saglanabilir.append("Borç, bildirge ve ödeme şartları düzeltilmeli; YTB yatırım ve istihdam belgeleri eksiksiz hazırlanmalıdır.")
        sonuc.aksiyon.append("Borç, bildirge ve ödeme şartları düzeltilmeden destek güvenli uygulanmamalı.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Yatırım Teşvik Belgesi bulunmadığı için bu destek uygulanamaz.")
        sonuc.neden_saglanmadi.append("Yatırım Teşvik Belgesi mevcut değil.")
        sonuc.nasil_saglanabilir.append("Yatırım teşvik belgesi alındığında ve belge kapsamında istihdam sağlandığında destek yeniden değerlendirilebilir.")

    return sonuc


def degerlendir_asgari_ucret_destegi(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="2026 Asgari Ücret Desteği",
        durum="",
        mevzuat="5510 sayılı Kanun Geçici md. 112",
        fayda="2026 yılı için şartları sağlayan işyerlerinde günlük 42,33 TL, aylık 1.270 TL tutarında destek mahsubu."
    )

    if b["ozel_sektor"] and b["calisan_sayisi"] > 0 and b["bildirgeler_suresinde"] and b["kayit_disi_risk_yok"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("İşyerinde sigortalı çalışan var ve temel bildirim şartları olumlu görünüyor.")
        sonuc.nasil_saglanabilir.extend([
            "2025 aynı ay sigortalı sayısı, prime esas kazanç sınırı ve 2026 ay bazlı çalışan sayısı doğrulanmalı.",
            "Çalışan listesi ve bordro kayıtları asgari ücret desteği için karşılaştırılmalı.",
            "Eksik gün ve düşük çalışan sayısı riskleri azaltılmalı."
        ])
        sonuc.aksiyon.append("2025 aynı ay sigortalı sayısı, prime esas kazanç sınırı ve 2026 ay bazlı çalışan sayısı kontrol edilmeli.")
        sonuc.aksiyon.append("SGK tahakkuk fişlerinde asgari ücret desteği mahsubu yapılıp yapılmadığı kontrol edilmeli.")
        sonuc.risk_notu.append("Yeni işyeri, eksik gün, düşük çalışan sayısı ve geçmiş dönem karşılaştırması nedeniyle nihai uygunluk ay bazında değişebilir.")
    else:
        sonuc.durum = "UYGUN DEĞİL / RİSKLİ"
        sonuc.gerekce.append("Çalışan bulunmaması, kamu işyeri olması veya temel bildirim/kayıt dışı risk nedeniyle ön uygunluk sağlanmadı.")
        if b["calisan_sayisi"] == 0:
            sonuc.neden_saglanmadi.append("İşyerinde sigortalı çalışan bulunmuyor.")
        if not b["ozel_sektor"]:
            sonuc.neden_saglanmadi.append("Asgari ücret desteği kamu işyerleri için bu kapsamda uygun olmayabilir.")
        if not b["bildirgeler_suresinde"] or not b["kayit_disi_risk_yok"]:
            sonuc.neden_saglanmadi.append("Temel bildirim veya kayıt dışı risk şartları sağlanmıyor.")
        sonuc.nasil_saglanabilir.extend([
            "İşyeri özel sektör statüsünde olmalı ve sigortalı çalışan bulunmalıdır.",
            "Bildirgeler süresinde verilmeli ve kayıt dışı riskler giderilmelidir.",
            "Asgari ücret desteği kapsamında bordro kayıtları ve prim ödemeleri yeniden gözden geçirilmelidir."
        ])

    return sonuc


def degerlendir_issizlik_odenegi_istihdam(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="İşsizlik Ödeneği Alanların İstihdamı Teşviki",
        durum="",
        mevzuat="4447 sayılı İşsizlik Sigortası Kanunu md. 50",
        fayda="İşsizlik ödeneği alan kişinin işe alınması halinde, kalan işsizlik ödeneği süresince belirli primlerin fondan karşılanması."
    )

    if not b["yeni_ise_alim_var"]:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Yeni işe alım veya incelenecek aday yok.")
    elif b["aday_issizlik_odenegi"] and not b["aday_onceki_isyerine_donus"] and genel_sgk_sartlari_saglandi_mi(b):
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Aday işsizlik ödeneği alıyor ve eski işyerine dönüş olmadığı beyan ediliyor.")
        sonuc.aksiyon.append("İŞKUR işsizlik ödeneği kaydı ve kalan ödenek süresi kontrol edilmeli.")
        sonuc.aksiyon.append("SGK işe giriş ve teşvik kanun numarası eşleştirmesi yapılmalı.")
    elif b["aday_issizlik_odenegi"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("Aday işsizlik ödeneği alıyor ancak eski işyerine dönüş veya genel SGK şartlarında risk var.")
        sonuc.aksiyon.append("Adayın önceki işyeri, kalan işsizlik ödeneği süresi ve SGK şartları doğrulanmalı.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Aday işsizlik ödeneği almıyor.")

    return sonuc


def degerlendir_6111(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Genç, Kadın ve Mesleki Belge Sahibi İstihdam Teşviki / 6111",
        durum="",
        mevzuat="4447 sayılı Kanun Geçici md. 10",
        fayda="Uygun sigortalılar için işveren prim payının tamamının belirli sürelerle İşsizlik Sigortası Fonundan karşılanması."
    )

    if not b["yeni_ise_alim_var"]:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Yeni işe alım veya incelenecek aday yok.")
        sonuc.neden_saglanmadi.append("Bu teşvik aday bazlı olduğundan uygun bir aday bilgisi olmadan uygulanamaz.")
        sonuc.nasil_saglanabilir.append("Uygun yaş, cinsiyet, mesleki belge veya İŞKUR kayıt kriterlerine sahip bir aday bulunduğunda değerlendirme yapılmalıdır.")
        return sonuc

    aday_kadin = b["aday_cinsiyet"] == "Kadın"
    aday_genc_erkek = b["aday_cinsiyet"] == "Erkek" and 18 <= b["aday_yas"] <= 29
    aday_belgeli = b["aday_mesleki_belge"]

    temel_aday_sarti = (
        b["aday_son_6_ay_issiz"]
        and b["aday_ortalama_ilave"]
        and (aday_kadin or aday_genc_erkek or aday_belgeli or b["aday_iskur_kayitli"])
    )

    if temel_aday_sarti and genel_sgk_sartlari_saglandi_mi(b):
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Aday son 6 ay işsiz, ortalama sigortalı sayısına ilave ve teşvik grubuna giriyor.")
        if aday_kadin:
            sonuc.gerekce.append("Aday kadın çalışan kategorisinde değerlendirilebilir.")
        if aday_genc_erkek:
            sonuc.gerekce.append("Aday 18-29 yaş erkek çalışan kategorisinde değerlendirilebilir.")
        if aday_belgeli:
            sonuc.gerekce.append("Aday mesleki belge/eğitim/kurs belgesi nedeniyle daha uzun süreli teşvik potansiyeline sahip olabilir.")
        if b["aday_iskur_kayitli"]:
            sonuc.gerekce.append("İŞKUR kaydı varsa destek süresi açısından ilave avantaj doğabilir.")
        sonuc.nasil_alinir.extend([
            "Adayın son 6 ay SGK hizmet dökümü alınır.",
            "Ortalama sigortalı sayısına ilave istihdam şartı bordro kayıtlarıyla doğrulanır.",
            "Mesleki belge, diploma veya İŞKUR kurs belgesi varsa dosyalanır.",
            "SGK Potansiyel Teşvik Sorgulama ekranından aday bazlı uygunluk kontrol edilir.",
            "Uygun kanun numarasıyla MUHSGK/e-Bildirge bildirimi yapılır."
        ])
        sonuc.aksiyon.append("Adayın son 6 ay SGK hizmet dökümü alınmalı.")
        sonuc.aksiyon.append("Ortalama sigortalı sayısına ilave istihdam şartı bordro üzerinden hesaplanmalı.")
        sonuc.aksiyon.append("Mesleki belge, diploma veya İŞKUR kurs belgesi varsa dosyalanmalı.")
    elif temel_aday_sarti:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("Aday şartları uygun görünüyor ancak işyeri genel SGK şartlarında eksik/risk var.")
        sonuc.nasil_saglanabilir.append("SGK borcu, bildirge, prim ödeme ve kayıt dışı risk alanları giderilmeli.")
        sonuc.aksiyon.append("SGK borcu, bildirge, prim ödeme ve kayıt dışı risk alanları giderilmeli.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Aday 6111 için gerekli ön şartları sağlamıyor.")
        if not b["aday_son_6_ay_issiz"]:
            sonuc.risk_notu.append("Son 6 ay işsiz olmayan aday için teşvik riske girer.")
            sonuc.neden_saglanmadi.append("Son 6 ay işsiz olmayan aday için 6111 şartları sağlanmıyor.")
            sonuc.nasil_saglanabilir.append("6111 için son 6 ay SGK'sız uygun bir aday tercih edilmelidir.")
        if not b["aday_ortalama_ilave"]:
            sonuc.risk_notu.append("Ortalama sigortalı sayısına ilave olmayan aday için teşvik uygulanamaz.")
            sonuc.neden_saglanmadi.append("Aday, işyerinin ortalama sigortalı sayısına ilave olarak alınmamış.")
            sonuc.nasil_saglanabilir.append("Teşvikten yararlanmak için adayın ortalama çalışan sayısına ek istihdam olarak alınması gerekir.")
        if not (aday_kadin or aday_genc_erkek or aday_belgeli or b["aday_iskur_kayitli"]):
            sonuc.risk_notu.append("Aday kadın/genç erkek/mesleki belgeli/İŞKUR kayıtlı kategorilerinden birine girmiyor.")
            sonuc.neden_saglanmadi.append("Aday uygun teşvik grubuna girmiyor.")
            sonuc.nasil_saglanabilir.append("Adayın İŞKUR kaydı yapılabilir veya mesleki belge/eğitim durumu kontrol edilebilir.")
        if not genel_sgk_sartlari_saglandi_mi(b):
            sonuc.neden_saglanmadi.extend(genel_sgk_eksikleri(b))
            sonuc.nasil_saglanabilir.extend(genel_sgk_eksikleri_nasil_giderilir(b))

    return sonuc


def degerlendir_engelli(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Engelli Sigortalı İstihdam Teşviki",
        durum="",
        mevzuat="4857 sayılı İş Kanunu md. 30",
        fayda="Engelli sigortalılar için prime esas kazanç alt sınırı üzerinden hesaplanan işveren hissesinin tamamının Hazinece karşılanması."
    )

    if not b["yeni_ise_alim_var"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("Yeni aday bilgisi yok; mevcut çalışanlar içinde engelli statüsünde çalışan varsa ayrıca kontrol edilmeli.")
        sonuc.neden_saglanmadi.append("Mevcut algoritmada incelenecek aday bilgisi girilmediği için doğrudan uygunluk tespiti yapılamadı.")
        sonuc.nasil_saglanabilir.append("Mevcut çalışan listesinde engelli raporu bulunan personel varsa ayrı aday/çalışan bazlı analiz yapılmalıdır.")
        sonuc.aksiyon.append("Mevcut çalışan listesinde engelli statüsü ve rapor bilgisi kontrol edilmeli.")
    elif b["aday_engelli"] and b["ozel_sektor"]:
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Aday engelli statüsünde ve işyeri özel sektör.")
        sonuc.nasil_alinir.extend([
            "Adayın engelli sağlık kurulu raporu ve engellilik statüsü doğrulanır.",
            "Adayın İŞKUR engelli kaydı kontrol edilir.",
            "İşe giriş bildirgesi yasal süresinde yapılır.",
            "SGK sisteminde ilgili engelli teşvik kanun numarasıyla bildirim yapılır.",
            "Teşvik tutarı prime esas kazanç alt sınırı üzerinden hesaplanan işveren hissesi kesinleştirilir."
        ])
        sonuc.aksiyon.append("Engelli raporu, İŞKUR kaydı ve SGK teşvik tanımı kontrol edilmeli.")
        sonuc.aksiyon.append("Zorunlu engelli kontenjanı ve kontenjan fazlası ayrımı ayrıca analiz edilmeli.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Aday engelli statüsünde değil veya işyeri özel sektör değil.")
        if not b["aday_engelli"]:
            sonuc.neden_saglanmadi.append("Aday engelli statüsünde olmadığı için engelli istihdam teşviki uygulanamaz.")
            sonuc.nasil_saglanabilir.append("Engelli statüsünde bir çalışan istihdam edilirse bu teşvik yeniden değerlendirilebilir.")
        if not b["ozel_sektor"]:
            sonuc.neden_saglanmadi.append("İşyeri özel sektör işvereni olmadığı için teşvik uygulanamaz.")
            sonuc.nasil_saglanabilir.append("İşveren statüsü özel sektör kapsamında ise SGK tescil ve işyeri dosyası üzerinden yeniden kontrol yapılmalıdır.")

    return sonuc


def degerlendir_arge_teknokent(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Ar-Ge, Tasarım Merkezi ve Teknokent SGK İşveren Hissesi Teşviki",
        durum="",
        mevzuat="5746 sayılı Kanun md. 3 ve 4691 sayılı Kanun Geçici md. 2",
        fayda="Ar-Ge/tasarım/destek personeli veya teknokentte gelir vergisi istisnalı personel için işveren SGK hissesinin yarısının desteklenmesi."
    )

    kapsam_var = b["arge_tasarim_merkezi"] or b["teknokent"]

    if kapsam_var and b["arge_personeli_var"] and b["ozel_sektor"]:
        sonuc.durum = "UYGUN"
        if b["arge_tasarim_merkezi"]:
            sonuc.gerekce.append("Ar-Ge veya tasarım merkezi bulunduğu beyan edildi.")
        if b["teknokent"]:
            sonuc.gerekce.append("Teknokent faaliyetinin bulunduğu beyan edildi.")
        sonuc.gerekce.append("Ar-Ge/tasarım/destek personeli mevcut.")
        sonuc.nasil_alinir.extend([
            "Ar-Ge merkezi, tasarım merkezi veya teknokent kapsam belgesi kontrol edilir.",
            "Personelin Ar-Ge, tasarım veya destek personeli niteliği belirlenir.",
            "Personelin proje bazlı çalışma süresi ve teşvik kapsamındaki gün/saat hesabı yapılır.",
            "Bordroda gelir vergisi, damga vergisi ve SGK teşvik hesaplamaları uyumlu şekilde uygulanır.",
            "SGK bildirimi ilgili kanun numarasıyla yapılır."
        ])
        sonuc.aksiyon.append("Personelin fiili çalışma süresi, proje kaydı, bölge içi/bölge dışı çalışma ve bordro kodları kontrol edilmeli.")
        sonuc.aksiyon.append("Gelir vergisi istisnası, damga vergisi ve SGK teşviki birlikte bordroda tutarlı uygulanmalı.")
    elif kapsam_var:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("Ar-Ge merkezi/tasarım merkezi/teknokent kapsamı var ancak personel bilgisi net değil.")
        sonuc.neden_saglanmadi.append("Teşvik uygulanacak Ar-Ge, tasarım veya destek personeli bilgisi doğrulanmadı.")
        sonuc.nasil_saglanabilir.append("Personel listesi, görev tanımları, proje kayıtları ve çalışma süreleri çıkarılarak teşvik kapsamı netleştirilmelidir.")
        sonuc.aksiyon.append("Ar-Ge/tasarım/destek personeli listesi ve proje bazlı çalışma kayıtları çıkarılmalı.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Ar-Ge merkezi, tasarım merkezi veya teknokent kapsamı bulunmuyor.")
        sonuc.neden_saglanmadi.append("5746 veya 4691 kapsamına giren bir statü bulunmadığı için teşvik uygulanamaz.")
        sonuc.nasil_saglanabilir.extend([
            "Şirket Ar-Ge merkezi veya tasarım merkezi kurma şartlarını sağlayıp sağlamadığını analiz edebilir.",
            "Teknokentte faaliyet göstermek uygunsa teknoloji geliştirme bölgesi başvurusu değerlendirilebilir.",
            "Ar-Ge projesi ve teknik personel yapısı oluşturulduktan sonra teşvik yeniden analiz edilmelidir."
        ])

    return sonuc


def degerlendir_kultur(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Kültür Yatırımları ve Kültür Girişimleri SGK Teşviki",
        durum="",
        mevzuat="5225 sayılı Kültür Yatırımları ve Girişimlerini Teşvik Kanunu md. 5",
        fayda="Kültür yatırım belgesi kapsamında belirli süre %50; kültür girişim belgesi kapsamında belirli süre %25 işveren hissesi desteği."
    )

    if b["kultur_belgesi"] and b["ozel_sektor"]:
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Kültür yatırım/girişim belgesi bulunduğu beyan edildi.")
        sonuc.nasil_alinir.extend([
            "Kültür yatırım/girişim belgesi ve kapsamı doğrulanır.",
            "Teşvik süresi ve sağlanan destek oranı belirlenir.",
            "Çalışanların bordro eşleştirmesi gerçekleştirilir.",
            "SGK bildirimi uygun kanun numarasıyla yapılır."
        ])
        sonuc.aksiyon.append("Belge türü, belge tarihi ve teşvik süresi kontrol edilmeli.")
        sonuc.aksiyon.append("Belge kapsamındaki işyeri ve çalışanların bordro eşleştirmesi yapılmalı.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Kültür yatırım/girişim belgesi bulunmuyor veya işyeri özel sektör değil.")
        sonuc.neden_saglanmadi.append("Kültür yatırım/girişim belgesi mevcut değil veya işyeri özel sektör statüsünde değil.")
        sonuc.nasil_saglanabilir.append("Kültür yatırım belgesi alınması veya uygun statüde özel sektör kapsamında başvuru yapılması durumunda yeniden değerlendirme yapılabilir.")

    return sonuc


def degerlendir_cok_tehlikeli_isg(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Çok Tehlikeli Sınıfta İş Kazasızlık Teşviki",
        durum="",
        mevzuat="4447 sayılı Kanun Ek md. 4",
        fayda="Çok tehlikeli sınıfta yer alan ve şartları sağlayan işyerlerinde işsizlik sigortası işveren hissesi teşviki."
    )

    if b["cok_tehlikeli"] and b["calisan_sayisi"] >= 10 and b["is_kazasi_yok"] and b["sgk_borcu_yok"]:
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("İşyeri çok tehlikeli sınıfta, en az 10 çalışan var ve ağır iş kazası olmadığı beyan edildi.")
        sonuc.nasil_alinir.extend([
            "Çok tehlikeli sınıfı için SGK tehlike sınıfı kaydı doğrulanır.",
            "Çalışan sayısı ve iş kazası geçmişi kontrol edilir.",
            "SGK borç durumu temizse teşvikli tarife üzerinden bildirim yapılır."
        ])
        sonuc.aksiyon.append("İşyeri tehlike sınıfı, son 3 yıl iş kazası kayıtları ve SGK borç durumu kontrol edilmeli.")
    elif b["cok_tehlikeli"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("İşyeri çok tehlikeli sınıfta ancak çalışan sayısı, kaza geçmişi veya borç şartı eksik olabilir.")
        sonuc.neden_saglanmadi.append("Çok tehlikeli sınıf için gerekli çalışan sayısı veya SGK borç durumu tam sağlanmamış olabilir.")
        sonuc.nasil_saglanabilir.append("Çalışan sayısı, kaza geçmişi ve SGK borç durumu netleştirildikten sonra yeniden değerlendirme yapılmalıdır.")
        sonuc.aksiyon.append("Çalışan sayısı 10 ve üzeri mi, son 3 yıl kaza geçmişi var mı, borç durumu nedir kontrol edilmeli.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("İşyeri çok tehlikeli sınıfta değil.")
        sonuc.neden_saglanmadi.append("Çok tehlikeli sınıf statüsü bulunmuyor.")
        sonuc.nasil_saglanabilir.append("Bu teşvik için işyerinin çok tehlikeli sınıfta olması ve SGK şartlarının sağlanması gerekir.")

    return sonuc


def degerlendir_2828(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="2828 Kapsamındaki Kişilerin İstihdamı Teşviki",
        durum="",
        mevzuat="2828 sayılı Sosyal Hizmetler Kanunu Ek md. 1",
        fayda="Sosyal hizmet modellerinden yararlanan kişilerin istihdamında belirli prim destekleri."
    )

    if not b["yeni_ise_alim_var"]:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Yeni işe alım veya incelenecek aday yok.")
        sonuc.neden_saglanmadi.append("2828 kapsamında bir aday bilgisi girilmedi.")
        sonuc.nasil_saglanabilir.append("2828 kapsamındaki adaylar için Aile ve Sosyal Hizmetler Bakanlığı / ilgili kurum kayıtları kontrol edilmelidir.")
    elif b["aday_2828"] and b["ozel_sektor"]:
        sonuc.durum = "UYGUN"
        sonuc.gerekce.append("Adayın 2828 kapsamındaki kişilerden olduğu beyan edildi.")
        sonuc.nasil_alinir.extend([
            "Adayın 2828 kapsam statüsü doğrulanır.",
            "İlgili kurum kayıtları ve SGK tanımlamaları kontrol edilir.",
            "İşe giriş bildirgesi uygun kanun numarasıyla yapılır.",
            "Teşvik süresi ve şartları belgeyle eşleştirilir."
        ])
        sonuc.aksiyon.append("Aile ve Sosyal Hizmetler Bakanlığı / ilgili kurum kayıtları ve SGK tanımlamaları kontrol edilmeli.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Aday 2828 kapsamında değil veya işyeri özel sektör değil.")
        sonuc.neden_saglanmadi.append("Aday 2828 kapsamında değil veya işyeri özel sektör statüsünde değil.")
        sonuc.nasil_saglanabilir.append("2828 kapsamındaki uygun adayların tespiti ve ilgili kurum onaylarının alınması gerekir.")

    return sonuc


def degerlendir_sosyal_yardim(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="Sosyal Yardım Alanların İstihdamı Teşviki",
        durum="",
        mevzuat="3294 sayılı Sosyal Yardımlaşma ve Dayanışmayı Teşvik Kanunu Ek md. 5",
        fayda="Sosyal yardım alan hanelerdeki kişilerin istihdamında belirli prim destekleri."
    )

    if not b["yeni_ise_alim_var"]:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Yeni işe alım veya incelenecek aday yok.")
        sonuc.neden_saglanmadi.append("Aday bazlı sosyal yardım destekli istihdam için uygun aday bilgisi girilmedi.")
        sonuc.nasil_saglanabilir.append("Sosyal yardım kaydı olan adaylar için uygunluk ve SGK kayıtları kontrol edilmelidir.")
    elif b["aday_sosyal_yardim"] and b["ozel_sektor"]:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("Adayın hane halkının sosyal yardım aldığı beyan edildi.")
        sonuc.neden_saglanmadi.append("Aday sosyal yardım kapsamında ancak bu tür teşvikler aday bazında dikkatle doğrulanmalıdır.")
        sonuc.nasil_saglanabilir.append("Sosyal yardım kaydı, adayın uygunluğu ve SGK sistem tanımı kontrol edilmeli; resmi belge ile kanıtlanmalıdır.")
        sonuc.aksiyon.append("Sosyal yardım kaydı, adayın uygunluğu ve SGK sistem tanımı kontrol edilmeli.")
        sonuc.risk_notu.append("Bu teşvikte aday bazlı kamu kayıtları belirleyici olduğundan sözlü beyanla uygulanmamalıdır.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Aday sosyal yardım kapsamına girmiyor veya işyeri özel sektör değil.")
        sonuc.neden_saglanmadi.append("Aday sosyal yardım kapsamına girmiyor veya işyeri özel sektör statüsünde değil.")
        sonuc.nasil_saglanabilir.append("Sosyal yardım durumu resmi kayıtlarla desteklenmeli ve aday uygunluğu yeniden değerlendirilmelidir.")

    return sonuc


def degerlendir_isg_hizmet_destegi(b: Dict) -> TesvikSonucu:
    sonuc = TesvikSonucu(
        ad="İş Sağlığı ve Güvenliği Hizmetlerinin Desteklenmesi",
        durum="",
        mevzuat="6331 sayılı İş Sağlığı ve Güvenliği Kanunu md. 7",
        fayda="Belirli şartları sağlayan işyerlerinde iş sağlığı ve güvenliği hizmetleri için destek."
    )

    if b["calisan_sayisi"] > 0:
        sonuc.durum = "POTANSİYEL"
        sonuc.gerekce.append("İşyerinde çalışan bulunduğu için İSG hizmet yükümlülüğü ve destek ihtimali kontrol edilebilir.")
        sonuc.nasil_saglanabilir.extend([
            "İşyerinin tehlike sınıfı tespit edilir.",
            "Çalışan sayısı ve İSG hizmet sözleşmeleri incelenir.",
            "Uygun İSG hizmet sağlayıcıları ve sözleşmeler hazırlanır."
        ])
        sonuc.aksiyon.append("İşyerinin tehlike sınıfı, çalışan sayısı ve İSG hizmet sözleşmeleri kontrol edilmeli.")
        sonuc.risk_notu.append("Bu destek işyerinin tehlike sınıfı ve çalışan sayısına göre değiştiğinden ayrıca mevzuat kontrolü gerekir.")
    else:
        sonuc.durum = "UYGUN DEĞİL"
        sonuc.gerekce.append("Çalışan bulunmadığı için İSG hizmet desteği açısından ön uygunluk yok.")
        sonuc.neden_saglanmadi.append("İSG hizmet desteği için çalışan sayısı şartı sağlanmıyor.")
        sonuc.nasil_saglanabilir.append("Çalışan sayısı arttığında ve İSG hizmet sözleşmesi düzenlendiğinde destek yeniden değerlendirilmelidir.")

    return sonuc


def tum_tesvikleri_degerlendir(b: Dict) -> List[TesvikSonucu]:
    return [
        degerlendir_5510_indirimi(b),
        degerlendir_yurtdisi_5_puan(b),
        degerlendir_bagkur_5_puan(b),
        degerlendir_yatirim_tesvik_sgk(b),
        degerlendir_asgari_ucret_destegi(b),
        degerlendir_issizlik_odenegi_istihdam(b),
        degerlendir_6111(b),
        degerlendir_engelli(b),
        degerlendir_arge_teknokent(b),
        degerlendir_kultur(b),
        degerlendir_cok_tehlikeli_isg(b),
        degerlendir_2828(b),
        degerlendir_sosyal_yardim(b),
        degerlendir_isg_hizmet_destegi(b),
    ]


def satir_yaz(karakter: str = "-", uzunluk: int = 100):
    print(karakter * uzunluk)


def sonuc_yazdir(sonuclar: List[TesvikSonucu]):
    uygunlar = [s for s in sonuclar if s.durum == "UYGUN"]
    potansiyeller = [s for s in sonuclar if s.durum == "POTANSİYEL"]
    uygun_degil = [s for s in sonuclar if s.durum not in ["UYGUN", "POTANSİYEL"]]

    print("\n\n" + "=" * 100)
    print("TEK EKRAN TEŞVİK ÖN UYGUNLUK SONUCU")
    print("=" * 100)

    print(f"\nÖZET:")
    print(f"- Uygun görünen teşvik sayısı: {len(uygunlar)}")
    print(f"- Potansiyel / ek belgeyle incelenecek teşvik sayısı: {len(potansiyeller)}")
    print(f"- Uygun görünmeyen / riskli teşvik sayısı: {len(uygun_degil)}")

    print("\n" + "=" * 100)
    print("1) UYGUN GÖRÜNEN DESTEKLER")
    print("=" * 100)

    if not uygunlar:
        print("Bu aşamada doğrudan uygun görünen destek bulunmadı.")
    else:
        for s in uygunlar:
            tesvik_detay_yazdir(s)

    print("\n" + "=" * 100)
    print("2) POTANSİYEL / EK BELGEYLE İNCELENECEK DESTEKLER")
    print("=" * 100)

    if not potansiyeller:
        print("Bu aşamada potansiyel destek bulunmadı.")
    else:
        for s in potansiyeller:
            tesvik_detay_yazdir(s)

    print("\n" + "=" * 100)
    print("3) UYGUN GÖRÜNMEYEN / RİSKLİ DESTEKLER")
    print("=" * 100)

    if not uygun_degil:
        print("Uygun görünmeyen destek bulunmadı.")
    else:
        for s in uygun_degil:
            tesvik_detay_yazdir(s, kisa=True)

    print("\n" + "=" * 100)
    print("GENEL UYARI")
    print("=" * 100)
    print(
        "Bu çıktı ön değerlendirme niteliğindedir. Nihai uygulama öncesinde SGK Potansiyel Teşvik "
        "Sorgulama, e-Bildirge/MUHSGK, borç durumu, işe giriş bildirgesi, hizmet dökümü, ortalama "
        "sigortalı sayısı, belge türü ve müşteri özelindeki güncel mevzuat ayrıca kontrol edilmelidir."
    )


def tesvik_detay_yazdir(s: TesvikSonucu, kisa: bool = False):
    satir_yaz("-")
    print(f"Destek: {s.ad}")
    print(f"Durum: {s.durum}")
    print(f"Mevzuat: {s.mevzuat}")

    if not kisa:
        print(f"Fayda: {s.fayda}")

    if s.gerekce:
        print("Gerekçe:")
        for madde in s.gerekce:
            print(f"  - {madde}")

    if s.nasil_alinir:
        print("Destek nasıl alınır?:")
        for madde in s.nasil_alinir:
            print(f"  - {madde}")

    if s.neden_saglanmadi:
        print("Neden sağlanmadı?:")
        for madde in s.neden_saglanmadi:
            print(f"  - {madde}")

    if s.nasil_saglanabilir:
        print("Nasıl sağlanabilir?:")
        for madde in s.nasil_saglanabilir:
            print(f"  - {madde}")

    if not kisa and s.aksiyon:
        print("Sonraki aksiyon:")
        for madde in s.aksiyon:
            print(f"  - {madde}")

    if s.risk_notu:
        print("Risk notu:")
        for madde in s.risk_notu:
            print(f"  - {madde}")


def format_tesvik_detay(s: TesvikSonucu, kisa: bool = False) -> str:
    lines = ["-" * 80, f"Destek: {s.ad}", f"Durum: {s.durum}", f"Mevzuat: {s.mevzuat}"]
    if not kisa:
        lines.append(f"Fayda: {s.fayda}")

    if s.gerekce:
        lines.append("Gerekçe:")
        lines.extend(f"  - {madde}" for madde in s.gerekce)

    if s.nasil_alinir:
        lines.append("Destek nasıl alınır?:")
        lines.extend(f"  - {madde}" for madde in s.nasil_alinir)

    if s.neden_saglanmadi:
        lines.append("Neden sağlanmadı?:")
        lines.extend(f"  - {madde}" for madde in s.neden_saglanmadi)

    if s.nasil_saglanabilir:
        lines.append("Nasıl sağlanabilir?:")
        lines.extend(f"  - {madde}" for madde in s.nasil_saglanabilir)

    if not kisa and s.aksiyon:
        lines.append("Sonraki aksiyon:")
        lines.extend(f"  - {madde}" for madde in s.aksiyon)

    if s.risk_notu:
        lines.append("Risk notu:")
        lines.extend(f"  - {madde}" for madde in s.risk_notu)

    return "\n".join(lines)


def format_sonuc(sonuclar: List[TesvikSonucu]) -> str:
    uygunlar = [s for s in sonuclar if s.durum == "UYGUN"]
    potansiyeller = [s for s in sonuclar if s.durum == "POTANSİYEL"]
    uygun_degil = [s for s in sonuclar if s.durum not in ["UYGUN", "POTANSİYEL"]]

    lines = ["=" * 100, "TEK EKRAN TEŞVİK ÖN UYGUNLUK SONUCU", "=" * 100, "", "ÖZET:",
             f"- Uygun görünen teşvik sayısı: {len(uygunlar)}",
             f"- Potansiyel / ek belgeyle incelenecek teşvik sayısı: {len(potansiyeller)}",
             f"- Uygun görünmeyen / riskli teşvik sayısı: {len(uygun_degil)}", "", "=" * 100,
             "1) UYGUN GÖRÜNEN DESTEKLER", "=" * 100]

    if uygunlar:
        for s in uygunlar:
            lines.append(format_tesvik_detay(s))
    else:
        lines.append("Bu aşamada doğrudan uygun görünen destek bulunmadı.")

    lines.extend(["", "=" * 100, "2) POTANSİYEL / EK BELGEYLE İNCELENECEK DESTEKLER", "=" * 100])
    if potansiyeller:
        for s in potansiyeller:
            lines.append(format_tesvik_detay(s))
    else:
        lines.append("Bu aşamada potansiyel destek bulunmadı.")

    lines.extend(["", "=" * 100, "3) UYGUN GÖRÜNMEYEN / RİSKLİ DESTEKLER", "=" * 100])
    if uygun_degil:
        for s in uygun_degil:
            lines.append(format_tesvik_detay(s, kisa=True))
    else:
        lines.append("Uygun görünmeyen destek bulunmadı.")

    lines.extend(["", "=" * 100, "GENEL UYARI", "=" * 100,
                  "Bu çıktı ön değerlendirme niteliğindedir. Nihai uygulama öncesinde SGK Potansiyel Teşvik "
                  "Sorgulama, e-Bildirge/MUHSGK, borç durumu, işe giriş bildirgesi, hizmet dökümü, ortalama "
                  "sigortalı sayısı, belge türü ve müşteri özelindeki güncel mevzuat ayrıca kontrol edilmelidir."])
    return "\n".join(lines)


def parse_int_var(var: tk.StringVar, default: int = 0) -> int:
    value = var.get().strip()
    if value == "":
        return default
    try:
        return int(value)
    except ValueError:
        raise ValueError(f"Geçersiz sayı girişi: {value}")


class SGKTesvikApp:
    def __init__(self, root: tk.Tk):
        root.title("SGK Teşvik Ön Uygunluk")
        root.geometry("1100x700")
        root.minsize(900, 600)

        # Ana container - scroll destekli
        main_container = ttk.Frame(root)
        main_container.pack(fill="both", expand=True, padx=0, pady=0)

        # Canvas ve scrollbar
        canvas = tk.Canvas(main_container, bg="white", highlightthickness=0)
        scrollbar = ttk.Scrollbar(main_container, orient="vertical", command=canvas.yview)
        
        self.scrollable_frame = ttk.Frame(canvas)
        self.scrollable_frame.bind(
            "<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas_window = canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Mouse wheel scroll desteği
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)

        # Frame width'ini canvas width'yle senkronize et
        def _on_canvas_configure(event):
            canvas.itemconfig(canvas_window, width=event.width)
        canvas.bind("<Configure>", _on_canvas_configure)

        self.vars = {}
        self.candidate_widgets = []
        self.build_ui()

    def build_ui(self):
        # Padding frame
        padding_frame = ttk.Frame(self.scrollable_frame, padding=10)
        padding_frame.pack(fill="both", expand=True)

        self.add_section_title(padding_frame, "SGK / İSTİHDAM / BORDRO TEŞVİKLERİ ÖN UYGUNLUK ALGORİTMASI")

        işyeri_frame = self.add_fieldset(padding_frame, "1) İŞYERİ GENEL BİLGİLERİ")
        self.add_checkbox(işyeri_frame, "İşyeri özel sektör işvereni mi?", "ozel_sektor", True)
        self.add_checkbox(işyeri_frame, "İşyeri imalat sektöründe mi?", "imalat", False)
        self.add_checkbox(işyeri_frame, "SGK prim/idari para cezası borcu yok mu veya yapılandırılmış mı?", "sgk_borcu_yok", True)
        self.add_checkbox(işyeri_frame, "Aylık prim ve hizmet belgeleri / MUHSGK süresinde veriliyor mu?", "bildirgeler_suresinde", True)
        self.add_checkbox(işyeri_frame, "SGK primleri süresinde ödeniyor mu?", "primler_suresinde", True)
        self.add_checkbox(işyeri_frame, "Kayıt dışı/sahte sigortalı/fiilen çalışmayan kişi bildirimi riski yok mu?", "kayit_disi_risk_yok", True)
        self.add_checkbox(işyeri_frame, "İş, kamu ihalesi veya kamu idaresine ait özel bina inşaatı kapsamında mı?", "kamu_ihalesi_is", False)
        self.add_number(işyeri_frame, "Toplam sigortalı çalışan sayısı kaç?", "calisan_sayisi", 0)
        self.add_number(işyeri_frame, "Son 6 ay / ilgili dönem ortalama sigortalı sayısı kaç?", "ortalama_calisan_sayisi", 0)

        belge_frame = self.add_fieldset(padding_frame, "2) YATIRIM, YURT DIŞI VE ÖZEL BELGE DURUMU")
        self.add_checkbox(belge_frame, "Yatırım Teşvik Belgesi var mı?", "yatirim_tesvik_belgesi", False)
        self.add_checkbox(belge_frame, "Yatırım tamamlandı mı / tamamlama vizesi aşamasına gelindi mi?", "ytb_tamamlama_vizesi", False)
        self.add_checkbox(belge_frame, "Türkiye'den yurt dışındaki işe/şantiyeye/projeye sigortalı gönderiliyor mu?", "yurtdisina_personel_gonderiyor", False)
        self.add_checkbox(belge_frame, "Ar-Ge merkezi veya tasarım merkezi belgesi var mı?", "arge_tasarim_merkezi", False)
        self.add_checkbox(belge_frame, "Teknoloji geliştirme bölgesi / teknokentte faaliyet var mı?", "teknokent", False)
        self.add_checkbox(belge_frame, "Ar-Ge, tasarım veya destek personeli çalışıyor mu?", "arge_personeli_var", False)
        self.add_checkbox(belge_frame, "Kültür yatırım belgesi veya kültür girişim belgesi var mı?", "kultur_belgesi", False)
        self.add_checkbox(belge_frame, "İşyeri çok tehlikeli sınıfta mı?", "cok_tehlikeli", False)
        self.add_checkbox(belge_frame, "Son 3 yılda ölümlü veya sürekli iş göremezlikli iş kazası yaşanmadı mı?", "is_kazasi_yok", True)

        aday_frame = self.add_fieldset(padding_frame, "3) YENİ İŞE ALINACAK / İNCELENECEK ADAY BİLGİLERİ")
        self.add_checkbox(aday_frame, "Yeni işe alım yapılacak mı veya son dönemde işe alınan aday incelenecek mi?", "yeni_ise_alim_var", False)
        self.add_number(aday_frame, "Adayın yaşı kaç?", "aday_yas", 0)
        self.add_radio_group(aday_frame, "Adayın cinsiyeti nedir?", "aday_cinsiyet", 
                            ["Kadın", "Erkek", "Belirtmek istemiyor / bilinmiyor"], 
                            "Belirtmek istemiyor / bilinmiyor")
        self.add_checkbox(aday_frame, "Aday işe girişten önceki son 6 ayda SGK'lı çalışmamış mı?", "aday_son_6_ay_issiz", False)
        self.add_checkbox(aday_frame, "Aday, işyerinin ortalama sigortalı sayısına ilave olarak mı alınacak?", "aday_ortalama_ilave", False)
        self.add_checkbox(aday_frame, "Adayın mesleki yeterlilik belgesi, mesleki/teknik eğitim diploması veya İŞKUR kurs belgesi var mı?", "aday_mesleki_belge", False)
        self.add_checkbox(aday_frame, "Aday İŞKUR'a kayıtlı işsiz mi?", "aday_iskur_kayitli", False)
        self.add_checkbox(aday_frame, "Aday işsizlik ödeneği alıyor mu?", "aday_issizlik_odenegi", False)
        self.add_checkbox(aday_frame, "Aday, işsizlik ödeneği aldığı eski işyerine mi dönüyor?", "aday_onceki_isyerine_donus", False)
        self.add_checkbox(aday_frame, "Aday engelli statüsünde mi?", "aday_engelli", False)
        self.add_checkbox(aday_frame, "Aday 2828 sayılı Kanun kapsamındaki sosyal hizmet modellerinden yararlanmış kişi mi?", "aday_2828", False)
        self.add_checkbox(aday_frame, "Adayın hane halkı sosyal yardım alıyor mu / 3294 kapsamına giriyor mu?", "aday_sosyal_yardim", False)

        bagkur_frame = self.add_fieldset(padding_frame, "4) 4/B - BAĞ-KUR DURUMU")
        self.add_checkbox(bagkur_frame, "Müşteri şahıs işletmesi sahibi / şirket ortağı olarak 4/B Bağ-Kur kapsamında mı?", "bagkur_mukellefi", False)
        self.add_checkbox(bagkur_frame, "4/B prim borcu yok mu veya yapılandırılmış mı?", "bagkur_borcu_yok", False)

        kontrol_frame = ttk.Frame(padding_frame)
        kontrol_frame.pack(fill="x", pady=10)
        evaluate_button = ttk.Button(kontrol_frame, text="Değerlendir", command=self.evaluate)
        evaluate_button.pack(side="left")
        reset_button = ttk.Button(kontrol_frame, text="Formu Sıfırla", command=self.reset_form)
        reset_button.pack(side="left", padx=(10, 0))

        output_frame = self.add_fieldset(padding_frame, "Sonuçlar")
        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, height=20, state="disabled")
        self.output_text.pack(fill="both", expand=True)

        self.vars["yeni_ise_alim_var"].trace_add("write", self.toggle_candidate_widgets)
        self.toggle_candidate_widgets()

    def add_section_title(self, parent: tk.Widget, text: str):
        label = ttk.Label(parent, text=text, font=(None, 14, "bold"))
        label.pack(anchor="w", pady=(0, 6))

    def add_fieldset(self, parent: tk.Widget, title: str) -> ttk.Labelframe:
        frame = ttk.Labelframe(parent, text=title, padding=10)
        frame.pack(fill="x", pady=4)
        return frame

    def add_checkbox(self, parent: tk.Widget, label: str, key: str, default: bool = False):
        var = tk.BooleanVar(value=default)
        self.vars[key] = var
        check = ttk.Checkbutton(parent, text=label, variable=var)
        check.pack(anchor="w", pady=2)
        if key.startswith("aday_") and key != "yeni_ise_alim_var":
            self.candidate_widgets.append(check)

    def add_number(self, parent: tk.Widget, label: str, key: str, default: int = 0):
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=2)
        ttk.Label(frame, text=label).pack(side="left")
        var = tk.StringVar(value=str(default))
        self.vars[key] = var
        
        def validate_numeric(var_name, index, mode):
            value = var.get()
            # Sadece rakamlar izin ver
            if value and not value.isdigit():
                var.set(''.join(c for c in value if c.isdigit()))
        
        entry = ttk.Entry(frame, textvariable=var, width=10)
        entry.pack(side="right")
        var.trace_add("write", validate_numeric)
        if key.startswith("aday_"):
            self.candidate_widgets.append(entry)

    def add_radio_group(self, parent: tk.Widget, label: str, key: str, options: List[str], default: str):
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=4)
        ttk.Label(frame, text=label).pack(anchor="w")
        
        var = tk.StringVar(value=default)
        self.vars[key] = var
        
        radio_frame = ttk.Frame(frame)
        radio_frame.pack(fill="x", padx=(20, 0))
        
        for option in options:
            radio = ttk.Radiobutton(radio_frame, text=option, variable=var, value=option)
            radio.pack(anchor="w", pady=2)
            if key.startswith("aday_"):
                self.candidate_widgets.append(radio)

    def toggle_candidate_widgets(self, *args):
        active = self.vars["yeni_ise_alim_var"].get()
        state = "normal" if active else "disabled"
        for widget in self.candidate_widgets:
            # Radio button ve Checkbutton için state ayarı
            if isinstance(widget, (ttk.Radiobutton, ttk.Checkbutton)):
                widget.configure(state=state)
            # Entry için state ayarı
            elif isinstance(widget, ttk.Entry):
                widget.configure(state=state)

    def collect_data(self) -> Dict:
        bilgiler = {
            "ozel_sektor": self.vars["ozel_sektor"].get(),
            "imalat": self.vars["imalat"].get(),
            "sgk_borcu_yok": self.vars["sgk_borcu_yok"].get(),
            "bildirgeler_suresinde": self.vars["bildirgeler_suresinde"].get(),
            "primler_suresinde": self.vars["primler_suresinde"].get(),
            "kayit_disi_risk_yok": self.vars["kayit_disi_risk_yok"].get(),
            "kamu_ihalesi_is": self.vars["kamu_ihalesi_is"].get(),
            "calisan_sayisi": parse_int_var(self.vars["calisan_sayisi"]),
            "ortalama_calisan_sayisi": parse_int_var(self.vars["ortalama_calisan_sayisi"]),
            "yatirim_tesvik_belgesi": self.vars["yatirim_tesvik_belgesi"].get(),
            "ytb_tamamlama_vizesi": self.vars["ytb_tamamlama_vizesi"].get(),
            "yurtdisina_personel_gonderiyor": self.vars["yurtdisina_personel_gonderiyor"].get(),
            "arge_tasarim_merkezi": self.vars["arge_tasarim_merkezi"].get(),
            "teknokent": self.vars["teknokent"].get(),
            "arge_personeli_var": self.vars["arge_personeli_var"].get(),
            "kultur_belgesi": self.vars["kultur_belgesi"].get(),
            "cok_tehlikeli": self.vars["cok_tehlikeli"].get(),
            "is_kazasi_yok": self.vars["is_kazasi_yok"].get(),
            "yeni_ise_alim_var": self.vars["yeni_ise_alim_var"].get(),
            "aday_yas": parse_int_var(self.vars["aday_yas"]),
            "aday_cinsiyet": self.vars["aday_cinsiyet"].get(),
            "aday_son_6_ay_issiz": self.vars["aday_son_6_ay_issiz"].get(),
            "aday_ortalama_ilave": self.vars["aday_ortalama_ilave"].get(),
            "aday_mesleki_belge": self.vars["aday_mesleki_belge"].get(),
            "aday_iskur_kayitli": self.vars["aday_iskur_kayitli"].get(),
            "aday_issizlik_odenegi": self.vars["aday_issizlik_odenegi"].get(),
            "aday_onceki_isyerine_donus": self.vars["aday_onceki_isyerine_donus"].get(),
            "aday_engelli": self.vars["aday_engelli"].get(),
            "aday_2828": self.vars["aday_2828"].get(),
            "aday_sosyal_yardim": self.vars["aday_sosyal_yardim"].get(),
            "bagkur_mukellefi": self.vars["bagkur_mukellefi"].get(),
            "bagkur_borcu_yok": self.vars["bagkur_borcu_yok"].get(),
        }

        if not bilgiler["yeni_ise_alim_var"]:
            bilgiler.update({
                "aday_yas": 0,
                "aday_cinsiyet": "Bilinmiyor",
                "aday_son_6_ay_issiz": False,
                "aday_ortalama_ilave": False,
                "aday_mesleki_belge": False,
                "aday_iskur_kayitli": False,
                "aday_issizlik_odenegi": False,
                "aday_onceki_isyerine_donus": False,
                "aday_engelli": False,
                "aday_2828": False,
                "aday_sosyal_yardim": False,
            })

        return bilgiler

    def evaluate(self):
        try:
            bilgiler = self.collect_data()
        except ValueError as exc:
            messagebox.showerror("Geçersiz Giriş", str(exc))
            return

        sonuclar = tum_tesvikleri_degerlendir(bilgiler)
        self.output_text.configure(state="normal")
        self.output_text.delete("1.0", tk.END)
        self.output_text.insert(tk.END, format_sonuc(sonuclar))
        self.output_text.configure(state="disabled")

    def reset_form(self):
        for key, var in self.vars.items():
            if isinstance(var, tk.BooleanVar):
                var.set(False)
            elif key in ["calisan_sayisi", "ortalama_calisan_sayisi", "aday_yas"]:
                var.set("0")
            elif key == "aday_cinsiyet":
                var.set("Belirtmek istemiyor / bilinmiyor")
            else:
                var.set("")

        self.vars["ozel_sektor"].set(True)
        self.vars["sgk_borcu_yok"].set(True)
        self.vars["bildirgeler_suresinde"].set(True)
        self.vars["primler_suresinde"].set(True)
        self.vars["kayit_disi_risk_yok"].set(True)
        self.vars["is_kazasi_yok"].set(True)
        self.output_text.configure(state="normal")
        self.output_text.delete("1.0", tk.END)
        self.output_text.configure(state="disabled")


def run_gui():
    root = tk.Tk()
    SGKTesvikApp(root)
    root.mainloop()


def main():
    if len(sys.argv) > 1 and sys.argv[1].lower() == "--cli":
        bilgiler = musteri_bilgilerini_al()
        sonuclar = tum_tesvikleri_degerlendir(bilgiler)
        sonuc_yazdir(sonuclar)
    else:
        run_gui()


if __name__ == "__main__":
    main()