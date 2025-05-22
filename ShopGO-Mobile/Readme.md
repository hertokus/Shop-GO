# Shop-GO Mobil Uygulaması

Bu dosya, Shop-GO projesinin mobil uygulamasının mevcut durumunu, kalan işleri ve nasıl çalıştırılacağını açıklamaktadır.

## 📝 Genel Bakış

*DOLDURULACAK*
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
![2](https://github.com/user-attachments/assets/35073ffa-6fe0-4d51-9ca2-13f3b8929b13)
![3](https://github.com/user-attachments/assets/d2bd9630-0009-4807-ae06-3f7aeef1131b)
![4](https://github.com/user-attachments/assets/5726410e-dda6-4082-830e-968ddb80c5f3)![ekleme](https://github.com/user-attachments/assets/0267248c-98f6-480e-b603-70718683770d)
![ekleme 2](https://github.com/user-attachments/assets/4aaa2b29-3506-4b94-8e1b-935854ed7905)
![çıkış yap](https://github.com/user-attachments/assets/767ef581-af2d-466a-9387-1bb95152b01c)
![çıkış mesajı](https://github.com/user-attachments/assets/573a7a66-ad94-4cd5-acd1-0beb3acf3fd8)




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
