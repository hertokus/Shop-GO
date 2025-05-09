# app.py - Tam Hali (Detaylı Ürün ID Takibi için Güncellenmiş)
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from unidecode import unidecode 
from math import radians, cos, sin, asin, sqrt 

# --- Uygulama ve Eklenti Başlatma ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# --- Yapılandırma ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:123@localhost/smartshopgo_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'cok-guclu-bir-flask-secret-key-olmali-bunu-degistirin!') 
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'cok-guclu-bir-jwt-secret-key-olmali-bunu-da-degistirin!')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

def haversine(lon1, lat1, lon2, lat2):
    R = 6371 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

# --- Veritabanı Modelleri ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False) 
    def __repr__(self): return f'<User {self.username}>'

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True) # Bu ID'nin frontend'e doğru gittiğinden emin olmalıyız
    name = db.Column(db.String(255), nullable=False)
    unit = db.Column(db.String(50))
    category = db.Column(db.String(100))
    image_url = db.Column(db.String(255))
    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'unit': self.unit, 'category': self.category, 'image_url': self.image_url}

class Market(db.Model):
    __tablename__ = 'markets'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255))
    city = db.Column(db.String(50))
    district = db.Column(db.String(50))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'address': self.address, 'city': self.city, 'district': self.district, 'latitude': self.latitude, 'longitude': self.longitude}

class MarketProduct(db.Model):
    __tablename__ = 'market_products'
    market_id = db.Column(db.Integer, db.ForeignKey('markets.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), primary_key=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    market = db.relationship('Market', backref=db.backref('market_product_entries', lazy='dynamic'))
    product = db.relationship('Product', backref=db.backref('market_product_entries', lazy='dynamic'))
    def to_dict(self):
        return {'market_id': self.market_id, 'product_id': self.product_id, 'price': float(self.price) if self.price is not None else None}

# --- API Endpoint'leri ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password: return jsonify({"message": "Kullanıcı adı, e-posta ve şifre gereklidir"}), 400
    if User.query.filter_by(email=email).first(): return jsonify({"message": "Bu e-posta adresi zaten kayıtlı"}), 409
    if User.query.filter_by(username=username).first(): return jsonify({"message": "Bu kullanıcı adı zaten alınmış"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=hashed_password)
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Kullanıcı başarıyla kaydedildi"}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Register Error: {e}")
        return jsonify({"message": "Kayıt sırasında bir sunucu hatası oluştu"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password: return jsonify({"message": "E-posta ve şifre gereklidir"}), 400
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, user_id=user.id, username=user.username, fullName=user.username ), 200
    else: return jsonify({"message": "Geçersiz e-posta veya şifre"}), 401

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user: return jsonify({"message": "Kullanıcı bulunamadı"}), 404
    return jsonify(id=user.id, username=user.username, email=user.email), 200

@app.route('/api/products', methods=['GET'])
def get_all_products():
    try:
        products = Product.query.all()
        products_to_send = []
        print(f"\n--- [DEBUG API /api/products] ---") # Endpoint başlangıç logu
        for product_obj in products:
            product_dict = product_obj.to_dict()
            # DEBUG: Her ürünün veritabanındaki ID'sini ve frontend'e gönderilecek dict içindeki ID'yi logla
            print(f"  Product DB ID: {product_obj.id}, Sent Dict ID: {product_dict.get('id')}, Name: {product_dict.get('name')}")
            products_to_send.append(product_dict)
        print(f"--- [DEBUG API /api/products] Yanıt gönderiliyor, toplam {len(products_to_send)} ürün. ---")
        return jsonify(products_to_send)
    except Exception as e:
        app.logger.error(f"Get All Products Error: {e}")
        return jsonify({"message": "Tüm ürünler getirilirken hata oluştu"}), 500

@app.route('/api/products/category/<path:category_name_from_url>', methods=['GET'])
def get_products_by_category_slug(category_name_from_url):
    try:
        products_in_category = Product.query.filter(Product.category == category_name_from_url).all()
        products_to_send = []
        print(f"\n--- [DEBUG API /api/products/category/{category_name_from_url}] ---") # Endpoint başlangıç logu
        for product_obj in products_in_category:
            product_dict = product_obj.to_dict()
            # DEBUG: Her ürünün veritabanındaki ID'sini ve frontend'e gönderilecek dict içindeki ID'yi logla
            print(f"  Product DB ID: {product_obj.id}, Sent Dict ID: {product_dict.get('id')}, Name: {product_dict.get('name')}")
            products_to_send.append(product_dict)
        print(f"--- [DEBUG API /api/products/category/{category_name_from_url}] Yanıt gönderiliyor, toplam {len(products_to_send)} ürün. ---")
        return jsonify(products_to_send)
    except Exception as e:
        app.logger.error(f"Get Products by Category Error ({category_name_from_url}): {e}")
        return jsonify({"message": f"'{category_name_from_url}' kategorisindeki ürünler getirilirken hata oluştu"}), 500

@app.route('/api/markets', methods=['GET'])
def get_markets():
    try:
        markets = Market.query.all()
        return jsonify([market.to_dict() for market in markets])
    except Exception as e:
        app.logger.error(f"Get Markets Error: {e}")
        return jsonify({"message": "Marketler getirilirken hata oluştu"}), 500

@app.route('/api/nearest-markets', methods=['GET'])
def get_nearest_markets():
    try:
        user_lat_str = request.args.get('latitude')
        user_lon_str = request.args.get('longitude')
        if user_lat_str is None or user_lon_str is None: return jsonify({"message": "Enlem ve boylam parametreleri gereklidir."}), 400
        user_lat = float(user_lat_str)
        user_lon = float(user_lon_str)
    except (TypeError, ValueError): return jsonify({"message": "Geçerli enlem ve boylam (sayısal) bilgisi gereklidir."}), 400
    try:
        all_markets = Market.query.all()
        markets_with_distance = []
        for market in all_markets:
            if market.latitude is not None and market.longitude is not None:
                distance = haversine(user_lon, user_lat, market.longitude, market.latitude)
                markets_with_distance.append({'market': market.to_dict(), 'distance': round(distance, 2)})
        markets_with_distance.sort(key=lambda x: x['distance'])
        return jsonify(markets_with_distance[:5]) 
    except Exception as e:
        app.logger.error(f"Nearest market hesaplama hatası: {e}")
        return jsonify({"message": "Market verileri alınırken bir hata oluştu."}), 500

@app.route('/api/calculate-list-prices', methods=['POST'])
def calculate_list_prices():
    data = request.get_json()
    if not data:
        app.logger.error("Calculate List Prices: İstek gövdesi (JSON) boş.")
        return jsonify({"message": "İstek gövdesi boş olamaz."}), 400
    user_lat_str = data.get('latitude')
    user_lon_str = data.get('longitude')
    shopping_list_items = data.get('shopping_list')
    
    print(f"\n--- [DEBUG API /api/calculate-list-prices] ---") # Endpoint başlangıç logu
    print(f"  Gelen İstek: latitude={user_lat_str}, longitude={user_lon_str}, shopping_list_count={len(shopping_list_items) if shopping_list_items else 0}")
    if shopping_list_items:
        for i, s_item in enumerate(shopping_list_items):
            print(f"    Shopping List Item {i+1}: {s_item}")


    if user_lat_str is None or user_lon_str is None or shopping_list_items is None:
        app.logger.error("Calculate List Prices: Eksik parametreler.")
        return jsonify({"message": "Eksik parametreler: latitude, longitude ve shopping_list gereklidir."}), 400
    if not isinstance(shopping_list_items, list):
        app.logger.error("Calculate List Prices: shopping_list bir dizi değil.")
        return jsonify({"message": "shopping_list bir dizi olmalıdır."}), 400
    try:
        user_lat = float(user_lat_str)
        user_lon = float(user_lon_str)
    except ValueError:
        app.logger.error("Calculate List Prices: Latitude/Longitude sayısal değil.")
        return jsonify({"message": "Latitude ve longitude sayısal değer olmalıdır."}), 400
    try:
        all_db_markets = Market.query.all()
        markets_with_distance = []
        for market_obj in all_db_markets:
            if market_obj.latitude is not None and market_obj.longitude is not None:
                distance = haversine(user_lon, user_lat, market_obj.longitude, market_obj.latitude)
                markets_with_distance.append({'id': market_obj.id, 'name': market_obj.name, 'distance': round(distance, 2), 'latitude': market_obj.latitude, 'longitude': market_obj.longitude})
        markets_with_distance.sort(key=lambda x: x['distance'])
        nearest_top_markets = markets_with_distance[:5]
        print(f"  En yakın {len(nearest_top_markets)} market bulundu.")

        response_data = []
        for market_info in nearest_top_markets:
            market_id = market_info['id']
            current_market_total_list_price = 0.0
            unavailable_items_count = 0
            unavailable_item_details_list = [] 
            print(f"    Processing Market ID: {market_id}, Name: {market_info['name']}")
            for item in shopping_list_items:
                product_id_str = item.get('productId') # Frontend'den 'productId' olarak geldiğini varsayıyoruz
                quantity_str = item.get('quantity')
                print(f"      İşlenen Liste Ürünü: Gelen productId='{product_id_str}', quantity='{quantity_str}'")
                
                if product_id_str is None or product_id_str == 'None' or quantity_str is None: # 'None' string kontrolü eklendi
                    app.logger.warning(f"Calculate List Prices: Alışveriş listesinde eksik veya 'None' productId veya quantity: {item} (Market ID: {market_id})")
                    print(f"        EKSİK/NONE BİLGİ: productId veya quantity. Bu ürün atlanıyor.")
                    unavailable_items_count += 1
                    unavailable_item_details_list.append({"productId": product_id_str, "name": "Bilinmeyen Ürün (Eksik/None ID)"})
                    continue 
                try:
                    product_id = int(product_id_str) # Burası 'None' string ise hata verecektir, yukarıda kontrol edildi.
                    quantity = int(quantity_str)
                    if quantity <= 0:
                        app.logger.warning(f"Calculate List Prices: Geçersiz miktar (quantity <= 0): {item} (Market ID: {market_id})")
                        print(f"        GEÇERSİZ MİKTAR: quantity={quantity}. Bu ürün atlanıyor.")
                        unavailable_items_count += 1
                        product_name_for_log = Product.query.get(product_id).name if Product.query.get(product_id) else f"ID:{product_id}"
                        unavailable_item_details_list.append({"productId": product_id, "name": f"{product_name_for_log} (Geçersiz Miktar)"})
                        continue
                except ValueError:
                    app.logger.warning(f"Calculate List Prices: Geçersiz productId veya quantity formatı (int'e çevrilemedi): {item} (Market ID: {market_id})")
                    print(f"        GEÇERSİZ FORMAT: productId veya quantity. Bu ürün atlanıyor.")
                    unavailable_items_count += 1
                    unavailable_item_details_list.append({"productId": product_id_str, "name": "Bilinmeyen Ürün (Format Hatası)"})
                    continue
                
                print(f"        Sorgu için: market_id={market_id}, product_id={product_id}")
                market_product_entry = MarketProduct.query.filter_by(market_id=market_id, product_id=product_id).first()
                
                if market_product_entry and market_product_entry.price is not None:
                    price_value = float(market_product_entry.price)
                    item_total = price_value * quantity
                    current_market_total_list_price += item_total
                    print(f"        MarketProduct Bulundu: Fiyat={price_value}, Miktar={quantity}, Ürün Toplamı={item_total:.2f}, Kümülatif Toplam={current_market_total_list_price:.2f}")
                else:
                    unavailable_items_count += 1
                    product_detail = Product.query.get(product_id)
                    product_name = product_detail.name if product_detail else f"Bilinmeyen Ürün (ID: {product_id})"
                    unavailable_item_details_list.append({"productId": product_id, "name": product_name})
                    print(f"        MarketProduct BULUNAMADI veya Fiyatı Yok. Ürün Adı: {product_name}")
            
            print(f"    Market {market_info['name']} için Nihai Liste Toplamı: {current_market_total_list_price:.2f}")
            response_data.append({"market_id": market_id, "market_name": market_info['name'], "distance": market_info['distance'], "latitude": market_info['latitude'], "longitude": market_info['longitude'], "total_list_price": round(current_market_total_list_price, 2), "currency": "₺", "unavailable_items_count": unavailable_items_count, "unavailable_item_details": unavailable_item_details_list})
        
        print(f"--- [DEBUG API /api/calculate-list-prices] Yanıt gönderiliyor, {len(response_data)} market için. ---")
        return jsonify(response_data), 200
    except ValueError as ve: 
        app.logger.error(f"Calculate List Prices - Value Error: {ve}")
        return jsonify({"message": f"Geçersiz veri formatı: {ve}"}), 400
    except Exception as e:
        app.logger.error(f"Calculate List Prices Genel Hata: {e}", exc_info=True)
        return jsonify({"message": "Alışveriş listesi fiyatları hesaplanırken bir sunucu hatası oluştu."}), 500

@app.route('/api/markets-with-products', methods=['GET'])
def get_markets_with_products():
    app.logger.warning("DEPRECATED: '/api/markets-with-products' endpoint'i çağrıldı.")
    return jsonify({"message": "Bu endpoint kullanımdan kaldırılmıştır veya güncellenmelidir."}), 501

@app.route('/api/markets-with-products/filter', methods=['GET'])
def filter_markets_with_products():
    app.logger.warning("DEPRECATED: '/api/markets-with-products/filter' endpoint'i çağrıldı.")
    return jsonify({"message": "Bu endpoint kullanımdan kaldırılmıştır veya güncellenmelidir."}), 501

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all() 
            app.logger.info("Veritabanı tabloları başarıyla kontrol edildi/oluşturuldu.")
        except Exception as e:
            app.logger.error(f"Veritabanı oluşturulurken hata: {e}")
    app.run(debug=True, host='0.0.0.0', port=5000)
