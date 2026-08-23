# 🏢 TDHP Ledger App (Tek Düzen Hesap Planı)

Modern, yüksek performanslı, atomik fiş motoruna ve gerçek zamanlı WebSocket
mimarisine sahip **Tek Düzen Hesap Planı (TDHP)** tabanlı muhasebe ve defter
yönetim platformu.

![Architecture](https://img.shields.io/badge/Architecture-Monorepo-blue)
![Queue](https://img.shields.io/badge/Queue-RabbitMQ_3-orange)
![Database](https://img.shields.io/badge/Database-PostgreSQL_16-blue)
![Backend](https://img.shields.io/badge/Backend-Elixir_1.18_%7C_Phoenix_1.8-purple)
![Frontend](https://img.shields.io/badge/Frontend-Next.js_15_%7C_Tailwind_CSS-black)
![Desktop](https://img.shields.io/badge/Desktop-Electron_34-teal)

---

## 📐 Sistem Mimarisi & Sorumlulukların Ayrılması (SoC - PaaS Layout)

Sistem PaaS / Cloud-Native prensiplerine uygun olarak Docker Compose konteynerlerinde çalışır:

```
                                 +-------------------------------------+
                                 |  Electron Masaüstü (apps/desktop)   |
                                 +------------------+------------------+
                                                    |
                                 +------------------v------------------+
                                 |    Next.js Web App (apps/web)       |
                                 | (Kasiyer POS + Muhasebe Dashboard)  |
                                 +------------------+------------------+
                                                    | REST API & WebSockets (ws://)
                                                    v
                                 +-------------------------------------+
                                 |  Elixir Phoenix Engine (apps/backend)|
                                 |                                     |
                                 |  • Fiş Motoru (Atomik Ecto.Multi)   |
                                 |  • 9 Sınıflı TDHP Kuralları (D/C)   |
                                 |  • Defter-i Kebir & Muavin Engine   |
                                 |  • Canlı Mizan & KDV Mahsubu        |
                                 |  • Phoenix Channels Real-time Sync  |
                                 |  • Async Queue Event Dispatcher     |
                                 +---------+-----------------+---------+
                                           |                 |
                                 +---------v-------+ +-------v---------+
                                 |   PostgreSQL    | |    RabbitMQ     |
                                 | Database (5433) | | Queue (15672/UI)|
                                 +-----------------+ +-----------------+
```

---

## ❓ Neden Elixir / Phoenix Backend Motoru? (Mimari Değerlendirme)

> **Soru:** API sunucusu Next.js ile mi kurulmalı yoksa Elixir / Phoenix ile mi?

### 💡 Mühendislik Tavsiyesi ve Karşılaştırma:

Muhasebe ve finansal işlem motorlarında **Elixir / Phoenix Framework** kullanmak
en doğru seçimdir:

1. **Finansal Veri Güvenliği ve Fonksiyonel Programlama**: Elixir'in
   immutability (değiştirilemez veri) prensibi, Borç/Alacak hesaplamalarında
   beklenmeyen veri mutasyonlarını ve yan etkileri tamamen engeller.
2. **Atomik Nakil Garantisi (`Ecto.Multi`)**: Bir fiş kesildiğinde; fiş durumu
   güncellemesi, Borç/Alacak hesap bakiyelerinin revizesi ve denetim günlüğü
   (audit log) kaydı tek bir veri tabanı işleminde (transaction) atomik olarak
   gerçekleşir. Ya hepsi başarılır ya da hiçbir şey değişmez.
3. **Gerçek Zamanlı Yüksek Eşzamanlılık (Phoenix Channels)**: Kasiyer
   ekranlarında kesilen bir satış fişi, Phoenix WebSockets ile admin
   panellerindeki **Canlı Mizan** ve **Defter-i Kebir** tablolarına
   milisaniyeler içinde anlık yansır.
4. **Çoklu İstemci Desteği**: Elixir API sunucusu bağımsız bir finans çekirdeği
   olarak çalışır. Next.js Web ve Electron Masaüstü uygulamaları aynı standart
   REST ve WebSocket katmanına bağlanır.

---

## 📊 TDHP 9 Ana Hesap Sınıfı & Bakiye Yönleri

Veritabanında otomatik seed edilen ve yönetilen **9 TDHP Sınıf Yapısı**:

| Sınıf Kodu | Sınıf Adı                         |    Normal Bakiye Yönü     | Açıklama                                            |
| :--------: | :-------------------------------- | :-----------------------: | :-------------------------------------------------- |
|   **1**    | **DÖNEN VARLIKLAR**               |       **Borç (D)**        | Kasa, Bankalar, Alıcılar, Stoklar vb.               |
|   **2**    | **DURAN VARLIKLAR**               |       **Borç (D)**        | Demirbaşlar, Binalar, Amortismanlar vb.             |
|   **3**    | **KISA VADELİ YABANCI KAYNAKLAR** |      **Alacak (C)**       | Satıcılar, Ödenecek Vergiler, Personele Borçlar vb. |
|   **4**    | **UZUN VADELİ YABANCI KAYNAKLAR** |      **Alacak (C)**       | Banka Kredileri vb.                                 |
|   **5**    | **ÖZKAYNAKLAR**                   |      **Alacak (C)**       | Sermaye, Geçmiş Yıl Kârları vb.                     |
|   **6**    | **GELİR TABLOSU HESAPLARI**       | **Alacak (C) / Borç (D)** | Satışlar (C), Satış İadeleri (D), Giderler (D)      |
|   **7**    | **MALİYET HESAPLARI**             |       **Borç (D)**        | Üretim ve Hizmet Maliyetleri                        |
|   **8**    | **SERBEST HESAPLAR**              |       **Borç (D)**        | Yönetimsel Serbest Hesaplar                         |
|   **9**    | **NAZIM HESAPLAR**                |       **Borç (D)**        | Teminat ve Taahhüt Bilgi Hesapları                  |

### 🛠️ Varsayılan Seed Hesaplar:

- `100` Kasa (D)
- `102` Bankalar (D)
- `120` Alıcılar (D)
- `153` Ticari Mallar (D)
- `157` Diğer Stoklar (D)
- `191` İndirilecek KDV (D)
- `320` Satıcılar (C)
- `335` Personele Borçlar (C)
- `360` Ödenecek Vergi ve Fonlar (C)
- `391` Hesaplanan KDV (C)
- `600` Yurtiçi Satışlar (C)
- `610` Satıştan İadeler (D)
- `611` Satış İskontoları (D)

---

## 📁 Proje Yapısı (Monorepo)

```
tdhp-ledger-app/
├── docker-compose.yml           # PostgreSQL 16 container (Port 5433)
├── package.json                 # Monorepo kök tanımı
├── pnpm-workspace.yaml          # PNPM Workspace paket yapılandırması
├── apps/
│   ├── backend/                 # Elixir Phoenix Backend Engine (API + WebSockets)
│   │   ├── lib/tdhp_ledger/     # Core Domain (Accounts, Vouchers, Ledgers, Reports, Audit)
│   │   ├── lib/tdhp_ledger_web/ # Phoenix Controllers & Channels
│   │   └── priv/repo/           # PostgreSQL Migrations & Seeds
│   ├── web/                     # Next.js 15+ App Router (React, Tailwind CSS, Phoenix Socket)
│   │   ├── src/app/kasiyer/     # Kasiyer / POS Terminal Ekranı
│   │   ├── src/app/hesap-plani/ # TDHP Hesap Planı Yönetimi
│   │   ├── src/app/fisler/      # Fiş Motoru Giriş Ekranı
│   │   ├── src/app/defterler/   # Defter-i Kebir, Muavin, Kasa, Banka Defterleri
│   │   └── src/app/mizan/       # Canlı Mizan, KDV Mahsubu, Bilanço & Gelir Tablosu
│   └── desktop/                 # Electron Masaüstü Uygulaması
│       ├── main.js              # Electron Main Process (Sunucu ve API bağlantısı)
│       └── preload.js           # IPC Güvenli Köprü
└── README.md
```

---

## ⚡ Hızlı Kurulum & Çalıştırma Rehberi

### 1. PostgreSQL Konteynerini Başlatın

```bash
docker compose up -d
```

### 2. Elixir Phoenix Backend Sunucusunu Kurun ve Başlatın

```bash
cd apps/backend
mix deps.get
mix ecto.setup
mix phx.server
# API Sunucusu: http://localhost:4000
# WebSocket Endpoint: ws://localhost:4000/socket
```

### 3. Next.js Web Uygulamasını Başlatın

```bash
# Kök dizinden:
pnpm dev:web
# Web Arayüzü: http://localhost:3000
```

### 4. Electron Masaüstü Uygulamasını Başlatın

```bash
# Kök dizinden:
pnpm dev:desktop
```

---

## 🧪 Testleri Çalıştırma

Backend finansal denge ve atomik nakil testleri için:

```bash
pnpm test:backend
# veya: cd apps/backend && mix test
```

---

## 📡 API Endpoints Özeti

| Metot  | Endpoint                                  | Açıklama                                                    |
| :----- | :---------------------------------------- | :---------------------------------------------------------- |
| `GET`  | `/api/accounts`                           | Tüm TDHP Hesap Planını Getirir                              |
| `POST` | `/api/accounts`                           | Yeni Alt Hesap Ekle (Normal Yön Otomatik)                   |
| `GET`  | `/api/current-accounts`                   | Cari Hesapları Getirir (Müşteri/Tedarikçi/Personel/Kasiyer) |
| `GET`  | `/api/vouchers`                           | Tüm Fiş Kayıtlarını Listeler                                |
| `POST` | `/api/vouchers`                           | Yeni Fiş Oluştur (Borç=Alacak Denge Kontrollü)              |
| `POST` | `/api/vouchers/:id/post`                  | Fişi Atomik Olarak Deftere Naklet (`Ecto.Multi`)            |
| `POST` | `/api/vouchers/:id/cancel`                | Fişi İptal Et ve Hareketleri Ters Kaydet                    |
| `GET`  | `/api/ledgers/kebir/:account_id`          | Defter-i Kebir Yürüyen Bakiye Hareketleri                   |
| `GET`  | `/api/ledgers/muavin/:current_account_id` | Cari Muavin Defter Hareketleri                              |
| `GET`  | `/api/ledgers/kasa`                       | 100 Kasa Defteri Hareketleri                                |
| `GET`  | `/api/ledgers/banka`                      | 102 Banka Defteri Hareketleri                               |
| `GET`  | `/api/reports/mizan`                      | Canlı Mizan Tablosu (Açılış, Dönem, Kapanış Bakiyeleri)     |
| `POST` | `/api/reports/kdv-mahsup`                 | Otomatik 191 vs 391 KDV Mahsup Fişi Oluştur                 |
| `GET`  | `/api/reports/income-statement`           | Gelir Tablosu Özet Raporu                                   |
| `GET`  | `/api/reports/balance-sheet`              | Bilanço (Aktif vs Pasif Dengesi)                            |
| `GET`  | `/api/reports/audit-logs`                 | Değiştirilemez Denetim Günlükleri                           |
