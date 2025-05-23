# 📱Shop-GO Mobil Uygulaması

Bu dosya, Shop-GO projesinin mobil uygulamasının mevcut durumunu, kalan işleri ve nasıl çalıştırılacağını açıklamaktadır.

## 📝 Genel Bakış
Shop-GO, kullanıcıların alışveriş listelerine göre en uygun fiyatlı ve en yakın marketi seçmelerine yardımcı olan yenilikçi bir alışveriş planlama uygulamasıdır. Web versiyonunun ardından mobil uygulama geliştirme süreci başlamış ve temel işlevler başarıyla mobil tarafa taşınmıştır.
---

## ✅ Yapılanlar

* **Kullanıcı Arayüzü (UI) Tasarımı:**
    * [ ] Ürün listeleme sayfası tamamlandı.
  
* **Temel Fonksiyonlar:**

    * [ ] Ürünleri listeleme (API'den veri çekme işlemi yapıldı).
  
* **Backend Entegrasyonu:**
    * [ ] Giriş API entegrasyonu yapıldı.
    * [ ] Ürün listeleme API'si bağlandı.
  
* **Diğer:**
    
---

## 🚧 Yapılacaklar / Kalan İşler

* **Kullanıcı Arayüzü (UI) Geliştirmeleri:**
    * [ ] Profil sayfası tasarımı ve geliştirmesi.
    * [ ] Siparişlerim sayfası.
    * [ ] Kullanıcı arayüzü iyileştirmeleri ve animasyonlar.
    * [ ] Sayfa tasarımları
    * [ ]  Ürün detay sayfası 
* **Fonksiyonellik:**
    * [ ] Sepet yönetimi (ürün silme, adet güncelleme).
    * [ ] Ödeme sistemi entegrasyonu.
    * [ ] Kullanıcı yorumları ve puanlama sistemi.
    * [ ] Bildirim sistemi (Push notifications).
    * [ ] Ürün arama fonksiyonu 
* **Backend Entegrasyonu:**
    * [ ] Sipariş oluşturma API entegrasyonu.
    * [ ] Adres yönetimi API'leri.
* **Testler:**
    * [ ] Birim testleri yazılacak.
    * [ ] Entegrasyon testleri yapılacak.
    * [ ] Kullanıcı kabul testleri planlanacak.
* **Diğer:**
    * [ ] Performans optimizasyonları.
    * [ ] Hata takip ve loglama mekanizması.
    * [ ] Çoklu dil desteği (isteğe bağlı).

## 📷 Demo Fotoğraflar
![login](https://github.com/user-attachments/assets/9dad6219-a317-4ee0-b897-b2b8fb6daac1)
![ürünler](https://github.com/user-attachments/assets/8aa58ce4-4bd4-44cf-9711-c29ea9e09787)
![profil](https://github.com/user-attachments/assets/a9d8aaa2-fd66-44bc-b57c-820fcc325327)
![sepet](https://github.com/user-attachments/assets/0ba66ede-010c-4263-ac2a-8a33bd876822)
![ekleme](https://github.com/user-attachments/assets/430cb88b-83f9-4ebd-be70-7b4341919335)
![market](https://github.com/user-attachments/assets/5bd6e6e7-6dde-422a-b0e7-4ad3cc22ec43)




✅ Geliştirme Planı
| Aşama | Açıklama                                         | Durum               |
| ----- | ------------------------------------------------ | ------------------- |
| 1     | Web login ekranının UI yapısını mobilde oluştur  | 🔜 Şimdi başlıyoruz |
| 2     | Renkler, yazı tipleri, buton görünümü birebir    | 🔜 Sonra            |
| 3     | Google login butonunu görsel olarak web'e benzet | 🔜                  |
| 4     | Layout'u responsive yap                          | 🔜                  |
| 5     | Giriş başarılıysa HomeScreen yönlendirmesi       | ✅ Hazır             |
| 6     | AsyncStorage üzerinden login kontrolü            | ✅ Hazır             |
| 7     | Logout ve session kontrolü                       | 🔜 Sonradan         |



## 📄 Notlar
*DOLDURULACAK*

## 📱 MOBİL UYGULAMA NASIL ÇALIŞTIRILIR! 
| Adımlar                          | Açıklama                               |
| -------------------------------- | -------------------------------------- |
| VSCode ya da CMD aç              | Flask projenin olduğu klasörde         |
| `cd` ile `Backend` klasörüne git | Flask `app.py` burada olmalı           |
| Virtualenv'i aktif et            | `venv\Scripts\activate`                |
| Flask başlat                     | `flask run --host=0.0.0.0 --port=5000` |
| Expo Go dan başlat               | npm start                              |
IP ADRESI FARKLI ISE:
💡	ipconfig ile bak
🧠 React Native IP'yi güncelle	fetch("http://YENİ-IP:5000/...")!!
