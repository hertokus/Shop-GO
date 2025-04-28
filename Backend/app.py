# app.py
from flask import Flask, jsonify, request
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123@localhost/smartshopgo_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Product(db.Model):  # Model tanımı - SADECE BURADA OLMALI
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    unit = db.Column(db.String(50))
    category = db.Column(db.String(100))
    price = db.Column(db.Numeric(10, 2))
    image_url = db.Column(db.String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'unit': self.unit,
            'category': self.category,
            'price': float(self.price),
            'image_url': self.image_url
        }

# ... diğer model ve endpoint tanımları

class MarketProduct(db.Model):
    __tablename__ = 'market_products'
    market_id = db.Column(db.Integer, db.ForeignKey('markets.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), primary_key=True)
    price = db.Column(db.Numeric(10, 2))

    def to_dict(self):
        return {
            'market_id': self.market_id,
            'product_id': self.product_id,
            'price': float(self.price)
        }

# Endpoint'ler
@app.route('/api/markets', methods=['GET'])
def get_markets():
    markets = Market.query.all()
    return jsonify([market.to_dict() for market in markets])


@app.route('/api/products/<category>', methods=['GET'])  # Kategoriye göre ürünler
def get_products_by_category(category):
    products = Product.query.filter_by(category=category).all()
    return jsonify([product.to_dict() for product in products])

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@app.route('/api/markets-with-products', methods=['GET'])
def get_markets_with_products():
    query = """
        SELECT m.name, m.address, p.name, p.unit, mp.price
        FROM markets m
        JOIN market_products mp ON m.id = mp.market_id
        JOIN products p ON p.id = mp.product_id;
    """
    rows = db.session.execute(query).fetchall()
    market_dict = {}
    for market_name, address, product_name, unit, price in rows:
        if market_name not in market_dict:
            market_dict[market_name] = {
                "adres": address,
                "urunler": {}
            }
        if product_name not in market_dict[market_name]["urunler"]:
            market_dict[market_name]["urunler"][product_name] = f"{price} ₺ / {unit}"

    response = []
    for market, data in market_dict.items():
        response.append({
            "market": market,
            "adres": data["adres"],
            "urunler": data["urunler"]
        })

    return jsonify(response)

@app.route('/api/markets-with-products/filter', methods=['GET'])
def filter_markets_with_products():
    requested_products = request.args.getlist('product')  # ?product=elma&product=armut

    query = """
        SELECT m.name, m.address, p.name, p.unit, mp.price
        FROM markets m
        JOIN market_products mp ON m.id = mp.market_id
        JOIN products p ON p.id = mp.product_id
        WHERE LOWER(p.name) = ANY(:products);
    """
    result = db.session.execute(query, {'products': [p.lower() for p in requested_products]})
    rows = result.fetchall()

    market_dict = {}
    for market_name, address, product_name, unit, price in rows:
        if market_name not in market_dict:
            market_dict[market_name] = {
                "adres": address,
                "urunler": {}
            }
        if product_name not in market_dict[market_name]["urunler"]:
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