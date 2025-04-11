from flask import Flask, jsonify, request
from flask_cors import CORS  # CORS modülünü import et

app = Flask(__name__)
CORS(app)  # CORS'u aktif et

@app.route('/api/markets', methods=['GET'])
def get_markets():
    # Örnek market verisi
    markets_data = [
        {
            "market": "A101",
            "adres": "AKKAPI MAH",
            "urunler": {
                "Elma": "5.00",
                "Armut": "4.50"
            }
        },
        {
            "market": "BIM",
            "adres": "HADIRLI MAH",
            "urunler": {
                "Elma": "4.80",
                "Armut": "4.00"
            }
        }
    ]

    # Frontend'den gelen ürün adlarını al
    requested_products = request.args.get('products')
    if requested_products:
        # Ürün isimlerini al, JSON olarak gelmişse çözümle
        requested_products = eval(requested_products)  # Güvenlik açısından bu yerine json.loads kullanılabilir

        # Küçük harfe dönüştürerek karşılaştırma yapalım
        requested_products = [product.lower() for product in requested_products]

        filtered_markets = []
        for market in markets_data:
            # Ürünleri küçük harfe dönüştürerek karşılaştırma yapalım
            filtered_urunler = {urun: fiyat for urun, fiyat in market["urunler"].items() if urun.lower() in requested_products}
            if filtered_urunler:  # Eğer bu markette istenen ürünler varsa
                filtered_markets.append({
                    "market": market["market"],
                    "adres": market["adres"],
                    "urunler": filtered_urunler
                })
        return jsonify(filtered_markets)

    # Eğer ürün listesi boşsa tüm market verilerini döndür
    return jsonify(markets_data)

if __name__ == '__main__':
    app.run(debug=True)
