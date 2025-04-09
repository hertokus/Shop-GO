
    let shoppingList = [];

    function addToList() {
      const name = document.getElementById('productName').value;
      const quantity = document.getElementById('productQuantity').value;

      if (name && quantity) {
        shoppingList.push({ name, quantity: parseInt(quantity) });
        updateUI();
      }
    }

    function updateUI() {
      const list = document.getElementById('shoppingList');
      list.innerHTML = '';
      shoppingList.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.quantity} adet`;

        list.appendChild(li);
      });
    }

    function findMarkets() {
      const resultDiv = document.getElementById('result');
      const loader = document.getElementById('loader');

      resultDiv.textContent = '';
      loader.style.display = 'block';  // Yükleniyor göstergesini aç

      // Verileri toplamak için alışveriş listesinde bulunan ürünleri al
      const shoppingListData = shoppingList.map(item => ({
        name: item.name,
        quantity: item.quantity
      }));

      // API'yi çağırarak market verilerini al
      fetch('http://localhost:5000/api/markets')  // Flask API'nin localhost adresi
        .then(response => response.json())
        .then(data => {
          loader.style.display = 'none';  // Yükleniyor göstergesini kapat

          let resultText = "En uygun fiyatlar:\n";

          // Verileri işleyip ekranda göster
          data.forEach(market => {
            let marketPrice = 0;
            shoppingListData.forEach(product => {
              if (market.urunler[product.name]) {
                marketPrice += market.urunler[product.name] * product.quantity;
              }
            });

            resultText += `${market.market} - Fiyat: ${marketPrice}₺\n`;

          });

          resultDiv.textContent = resultText;  // Sonuçları ekrana yazdır
        })
        .catch(error => {
          loader.style.display = 'none';  // Yükleniyor göstergesini kapat
          resultDiv.textContent = "Bir hata oluştu.";
          console.error("API hatası:", error);
        });
    }

