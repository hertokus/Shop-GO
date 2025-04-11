from flask import Flask, jsonify, request
from flask_cors import CORS
import json  # Güvenli JSON ayrıştırma

app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir

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

# Tüm marketleri döndürür veya ürünlere göre filtreleme yapar
@app.route('/api/markets', methods=['GET'])
def get_markets():
    requested_products = request.args.get('products')

    if requested_products:
        try:
            requested_products = json.loads(requested_products)  # Güvenli JSON ayrıştırma
        except Exception:
            return jsonify({"error": "Geçersiz ürün formatı"}), 400

        requested_products = [p.lower() for p in requested_products]

        filtered_markets = []
        for market in markets_data:
            filtered_urunler = {
                urun: fiyat
                for urun, fiyat in market["urunler"].items()
                if urun.lower() in requested_products
            }
            if filtered_urunler:
                filtered_markets.append({
                    "market": market["market"],
                    "adres": market["adres"],
                    "urunler": filtered_urunler
                })
        return jsonify(filtered_markets)

    return jsonify(markets_data)

# Belirli bir ürünün tüm marketlerdeki fiyatlarını döndürür
@app.route('/api/markets/urun', methods=['GET'])
def get_product_price():
    urun_adi = request.args.get('isim')  # Örnek: /api/markets/urun?isim=Elma

    if not urun_adi:
        return jsonify({"error": "Ürün adı (isim) parametresi gerekli"}), 400

    filtered = []
    for market in markets_data:
        if urun_adi in market['urunler']:
            filtered.append({
                "market": market["market"],
                "adres": market["adres"],
                "urun": urun_adi,
                "fiyat": market["urunler"][urun_adi]
            })

    return jsonify(filtered)

if __name__ == '__main__':
    app.run(debug=True)
