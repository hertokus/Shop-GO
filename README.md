# 🛒 Shop&GO – Akıllı Alışveriş ve Ulaşım Planlayıcı

**Shop&GO**, kullanıcıların oluşturduğu alışveriş listesine göre **en uygun fiyatlı** ve **en yakın** marketi öneren bir web ve mobil uygulamadır. Flask tabanlı API ile ürün fiyatları yönetilir, React frontend ile kullanıcı etkileşimi sağlanır. En yakın markete rota önerisi sunar. Artık **mobil uygulama** (Expo + React Native) versiyonu da aktif olarak geliştirilmektedir.

---

## 🚀 Proje Amacı

Bu proje, alışveriş yapan bireylerin **zaman ve bütçe tasarrufu** sağlamasını amaçlar. Kullanıcı, alışveriş listesine ürünleri ekler → sistem, konum bazlı olarak en uygun fiyatlı marketi hesaplar → ulaşım yönlendirmesi sağlar.

---

## 👥 Ekip

| İsim       | Rol                | Teknolojiler                        |
|------------|--------------------|-------------------------------------|
| Ahmetcan Selek | Backend & Mobile Developer | Python, Flask, PostgreSQL, React Native |
| Hasan Ertokuş   | Frontend Developer        | React.js, HTML, CSS, JS             |

---

## 🧩 Temel Özellikler

- 📋 Alışveriş listesi oluşturma (fiyatsız)
- 🔍 Listeye göre en yakın 5 marketin toplam fiyatlarını karşılaştırma
- 📍 Harita üzerinden konum seçme ve kaydetme
- 🧾 Eksik ürünleri belirten kontrol mekanizması
- ✅ Kullanıcı girişi ve kimlik doğrulama (JWT + Firebase Google Auth)
- 💾 Alışveriş listesinin localStorage (web) ve AsyncStorage (mobil) ile korunması
- 🧭 Google Maps yönlendirme ile markete rota alma
- 📱 Mobil uygulama (Expo) sürümü geliştirilmekte
- 🧠 Fiyatsız planlama → fiyatlar butonla alınır
- 🛠️ Ortak GitHub deposunda sürdürülebilir geliştirme

---

## 🛠️ Kullanılan Teknolojiler

| Katman        | Teknoloji                             |
|---------------|----------------------------------------|
| Frontend (Web)| React.js, JavaScript, CSS             |
| Frontend (Mobil) | React Native, Expo, AsyncStorage    |
| Backend       | Python, Flask, RESTful API            |
| Veritabanı    | PostgreSQL                            |
| Harita / Konum| Google Maps API, OpenStreetMap        |
| Auth          | JWT + Firebase Authentication (Google)|
| Geliştirme    | GitHub, VSCode, Postman               |

---

## 📦 Geliştirme Durumu (Güncel – 18 Mayıs 2025)

| Aşama                                                                 | Durum         |
|------------------------------------------------------------------------|---------------|
| ✅ Proje planlaması ve görev dağılımı                                  | Tamamlandı    |
| ✅ React.js frontend ve bileşen yapısı                                 | Tamamlandı    |
| ✅ Flask backend kurulumu, RESTful API’ler                             | Tamamlandı    |
| ✅ PostgreSQL ile ürün ve market veri yapısı                           | Tamamlandı    |
| ✅ Ürün listeleme (fiyatsız)                                           | Tamamlandı    |
| ✅ Alışveriş listesi yönetimi (state + localStorage)                   | Tamamlandı    |
| ✅ Kullanıcı giriş sistemi (JWT destekli)                              | Tamamlandı    |
| ✅ Google Auth (Firebase) entegrasyonu                                 | Tamamlandı    |
| ✅ Harita üzerinden konum kaydı ve market karşılaştırması              | Tamamlandı    |
| ✅ En yakın market hesaplama (mesafe + toplam fiyat)                   | Tamamlandı    |
| ✅ Eksik ürün kontrolü ve bildirimi                                    | Tamamlandı    |
| ✅ Google Maps yönlendirme linki                                       | Tamamlandı    |
| ✅ Mobil uygulama altyapısı (React Native + Expo)                      | Başladı       |
| ✅ Mobilde ürün listeleme ve API bağlantısı                            | Başladı       |
| 🔄 Mobilde alışveriş listesi yönetimi                                  | Sürmekte      |
| 🔄 Mobil UI bileşenleri                                                | Sürmekte      |
| 🔜 Mobil uygulamada market karşılaştırma ve harita yönlendirmesi      | Planlandı     |
| 🔜 Son test ve sunum demosu hazırlığı                                  | Planlandı     |

---

## 📱 Mobil Sürüm

Mobil uygulama, `Expo` kullanılarak geliştirilmekte olup şu an:
- Giriş ekranı ve sayfa geçişleri çalışıyor ✅
- Web'deki backend API'lerine bağlanarak ürün verisi çekilebiliyor ✅
- Aynı ağda çalışan Flask sunucusu üzerinden mobil bağlantı sağlanıyor ✅

> GitHub Mobil klasörü: `ShopGoMobil/`

---

## 📷 Görseller ve Demo

🖼️ (Buraya uygulama ekran görüntüleri veya kısa bir tanıtım gif’i ekleyebilirsin.)

![Ekran Görüntüsü (31)](https://github.com/user-attachments/assets/346aef79-1a52-4eac-956b-26c9f3422770)
![Ekran Görüntüsü (32)](https://github.com/user-attachments/assets/f23e24f4-5ae5-4514-88f9-53553028befe)
![Ekran Görüntüsü (33)](https://github.com/user-attachments/assets/63229e57-fc4c-4a64-a6f9-cff38d888817)
![Ekran Görüntüsü (35)](https://github.com/user-attachments/assets/39b9c02b-daa7-4e53-a30a-77bf8af84efe)
![Ekran Görüntüsü (36)](https://github.com/user-attachments/assets/837ab1a4-8207-4888-bf6e-39a99d441bc2)
![Ekran Görüntüsü (37)](https://github.com/user-attachments/assets/e9219130-7204-4544-a8da-363bd664a32f)

## 🧪 Nasıl Çalıştırılır?

### Web:
```bash
# Frontend ve Backend
cd Frontend
npm install
npm run dev
