let shoppingList = [];

// Alışveriş listesine ürün ekleme
function addToList() {
  const name = document.getElementById('productName').value.trim();
  const quantity = parseInt(document.getElementById('productQuantity').value.trim());

  if (name && quantity > 0) {
    shoppingList.push({ name, quantity });
    updateUI();

    // input alanlarını temizle
    document.getElementById('productName').value = '';
    document.getElementById('productQuantity').value = '';
  }
}

// Alışveriş listesini güncelleme (UI)
function updateUI() {
  const list = document.getElementById('shoppingList');
  list.innerHTML = '';

  shoppingList.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      ${item.name} - ${item.quantity} adet
      <button class="btn btn-sm btn-danger" onclick="removeItem(${index})">
        <i class="fa fa-trash"></i>
      </button>
    `;
    list.appendChild(li);
  });
}

// Alışveriş listesinden ürün silme
function removeItem(index) {
  shoppingList.splice(index, 1);
  updateUI();
}

// Uygun marketleri bulma ve fiyatları hesaplama
function findMarkets() {
  const resultDiv = document.getElementById('result');
  const loader = document.getElementById('loader');

  resultDiv.textContent = '';
  loader.style.display = 'block';

  // Alışveriş listesindeki ürünleri API'ye uygun formatta hazırlıyoruz
  const productNames = shoppingList.map(item => item.name); // Ürün isimlerini alıyoruz

  // API'ye, filtreleme parametresi olarak ürün isimlerini gönderiyoruz
  fetch(`http://localhost:5000/api/markets/filter?product=${productNames.join('&product=')}`)
    .then(response => response.json())
    .then(data => {
      loader.style.display = 'none';

      // Eğer veri yoksa kullanıcıyı bilgilendiriyoruz
      if (!data || data.length === 0) {
        resultDiv.textContent = "Market verisi bulunamadı.";
        return;
      }

      let resultText = "";

      data.forEach(market => {
        let total = 0; // Her market için toplam tutar
        let detaylar = ""; // Detayları burada biriktiriyoruz

        shoppingList.forEach(product => {
          const fiyatBilgisi = market.urunler[product.name]; // Market ürünlerinin fiyat bilgisi
          if (fiyatBilgisi) { // Eğer ürün varsa
            const fiyat = parseFloat(fiyatBilgisi.split(' ')[0]); // Fiyatı ayıklıyoruz
            const totalPrice = fiyat * product.quantity; // Ürün fiyatı * adet
            total += totalPrice; // Toplam tutara ekle
            detaylar += `- ${product.name}: ${fiyat}₺ x ${product.quantity} = ${totalPrice.toFixed(2)}₺\n`;
          } else { // Ürün stokta yoksa
            detaylar += `- ${product.name}: Stokta yok\n`;
          }
        });

        // Marketin tüm bilgilerini ekliyoruz
        resultText += `
          <div class="market-card">
            <h5>🏪 ${market.market}</h5>
            <p><strong>Adres:</strong> ${market.adres}</p>
            <pre>${detaylar}</pre>
            <p><strong>Toplam Tutar:</strong> ${total.toFixed(2)}₺</p>
          </div>
        `;
      });

      resultDiv.innerHTML = resultText; // Sonuçları kullanıcıya gösteriyoruz
    })
    .catch(error => {
      loader.style.display = 'none';
      resultDiv.textContent = "❌ Veri alınırken bir hata oluştu.";
      console.error("API hatası:", error);
    });
}
