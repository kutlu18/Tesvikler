# V2 Modular Architecture

Bu klasor, mevcut SGK/KOSGEB/TUBITAK/Yatirim/Ticaret kodlarini bozmadan sifirdan kurulan yeni nesil mimari iskelettir.

## Hedef
- CRM entegrasyonuna hazir
- SOLID uyumlu katmanlar
- MongoDB code-first
- Moduller eklenebilir (one-many, many-many)

## Klasorler
- `apps`: UI ve API giris katmani
- `services`: domain odakli uygulama servisleri
- `packages`: paylasilan tip, config, db kutuphaneleri
- `infra`: local altyapi (docker, mongodb)
- `docs`: mimari, db ve surec dokumani

## Hizli Baslangic
1. `cd v2`
2. `.env.example` dosyasini `.env.local` olarak kopyala
3. `npm install`
4. `npm run dev:api`

Ayrintilar icin: `docs/ARCHITECTURE.md` ve `docs/PROJECT_TREE.md`
