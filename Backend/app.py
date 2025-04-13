from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# PostgreSQL bağlantı ayarları
conn = psycopg2.connect(
    dbname="smartshopgo_db",
    user="postgres",
    password="123",  # Şifreni buraya yaz
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# 🔹 Tüm marketleri ve ürünleri çek
@app.route('/api/markets', methods=['GET'])
def get_all_market_data():
    query = """
        SELECT m.name, m.address, p.name, p.unit, mp.price
        FROM markets m
        JOIN market_products mp ON m.id = mp.market_id
        JOIN products p ON p.id = mp.product_id;
    """
    cursor.execute(query)
    rows = cursor.fetchall()

    # Verileri yapılandır
    market_dict = {}
    for market_name, address, product_name, unit, price in rows:
        if market_name not in market_dict:
            market_dict[market_name] = {
                "adres": address,
                "urunler": {}
            }
        market_dict[market_name]["urunler"][product_name] = f"{price} ₺ / {unit}"

    # Sözlükleri listeye çevir
    response = []
    for market, data in market_dict.items():
        response.append({
            "market": market,
            "adres": data["adres"],
            "urunler": data["urunler"]
        })

    return jsonify(response)

# 🔹 Belirli bir ürüne göre filtrele
@app.route('/api/markets/filter', methods=['GET'])
def filter_by_product():
    requested_products = request.args.getlist('product')  # ?product=elma&product=armut

    query = """
        SELECT m.name, m.address, p.name, p.unit, mp.price
        FROM markets m
        JOIN market_products mp ON m.id = mp.market_id
        JOIN products p ON p.id = mp.product_id
        WHERE LOWER(p.name) = ANY(%s);
    """
    lowercase_products = [p.lower() for p in requested_products]
    cursor.execute(query, (lowercase_products,))
    rows = cursor.fetchall()

    # Aynı yapıda dönüştür
    market_dict = {}
    for market_name, address, product_name, unit, price in rows:
        if market_name not in market_dict:
            market_dict[market_name] = {
                "adres": address,
                "urunler": {}
            }
        market_dict[market_name]["urunler"][product_name] = f"{price} ₺ / {unit}"

    response = []
    for market, data in market_dict.items():
        response.append({
            "market": market,
            "adres": data["adres"],
            "urunler": data["urunler"]
        })

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
