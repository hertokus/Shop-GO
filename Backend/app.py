# app.py - Tam Hali
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity

# --- Uygulama ve Eklenti Başlatma ---
app = Flask(__name__)

# CORS Yapılandırması (Geliştirme için *, production'da daha kısıtlı)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Yapılandırma (Configuration) ---
# Veritabanı URI (Sizin ayarlarınız)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123@localhost/smartshopgo_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Gizli Anahtarlar (JWT ve Flask Session için - DEĞİŞTİRİN VE GÜVENDE TUTUN!)
# Ortam değişkenlerinden okumak en iyi pratiktir: os.environ.get('SECRET_KEY', 'varsayilan')
app.config['SECRET_KEY'] = 'cok-guclu-bir-flask-secret-key-olmalı-bunu-degistirin!' 
app.config['JWT_SECRET_KEY'] = 'cok-guclu-bir-jwt-secret-key-olmalı-bunu-da-degistirin!'

# Eklentileri Başlatma
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


# --- Veritabanı Modelleri ---

# Kullanıcı Modeli (Yeni Eklendi)
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False) 

    def __repr__(self):
        return f'<User {self.username}>'

# Ürün Modeli (Mevcut Kodunuzdan)
class Product(db.Model):
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
            'price': float(self.price) if self.price is not None else None, # None kontrolü eklendi
            'image_url': self.image_url
        }

# Market Modeli (Varsayılan - Kendi yapınıza göre güncelleyin!)
class Market(db.Model):
   __tablename__ = 'markets'
   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.String(255), nullable=False)
   address = db.Column(db.String(255))
   # ... diğer market alanları ...

   def to_dict(self):
       return {'id': self.id, 'name': self.name, 'address': self.address}

# Market-Ürün İlişki Modeli (Mevcut Kodunuzdan)
class MarketProduct(db.Model):
    __tablename__ = 'market_products'
    market_id = db.Column(db.Integer, db.ForeignKey('markets.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), primary_key=True)
    price = db.Column(db.Numeric(10, 2))

    # İlişkileri tanımlamak ORM sorgularını kolaylaştırabilir (opsiyonel ama önerilir)
    # market = db.relationship('Market', backref=db.backref('market_products', lazy=True))
    # product = db.relationship('Product', backref=db.backref('market_products', lazy=True))


    def to_dict(self):
        return {
            'market_id': self.market_id,
            'product_id': self.product_id,
            'price': float(self.price) if self.price is not None else None # None kontrolü eklendi
        }


# --- API Endpoint'leri ---

# --- Kullanıcı Kimlik Doğrulama Endpoint'leri (Yeni Eklendi) ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": "Kullanıcı adı, e-posta ve şifre gereklidir"}), 400

    existing_user_email = User.query.filter_by(email=email).first()
    if existing_user_email:
        return jsonify({"message": "Bu e-posta adresi zaten kayıtlı"}), 409
    existing_user_username = User.query.filter_by(username=username).first()
    if existing_user_username:
        return jsonify({"message": "Bu kullanıcı adı zaten alınmış"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Kullanıcı başarıyla kaydedildi"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Register Error: {e}") # Hata loglama
        return jsonify({"message": "Kayıt sırasında bir hata oluştu"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "E-posta ve şifre gereklidir"}), 400

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id) # Kimlik olarak user.id kullanıldı
        return jsonify(
            access_token=access_token,
            user_id=user.id,
            username=user.username,
            email=user.email
        ), 200
    else:
        return jsonify({"message": "Geçersiz e-posta veya şifre"}), 401

# Örnek Korumalı Rota (JWT gerektirir)
@app.route('/api/profile', methods=['GET'])
@jwt_required() # Bu decorator, geçerli bir JWT Bearer token gerektirir
def get_profile():
    current_user_id = get_jwt_identity() # Token içerisinden kimliği (user.id) alır
    user = User.query.get(current_user_id)
    if not user:
         return jsonify({"message": "Kullanıcı bulunamadı"}), 404
    # Şifre hash'i DAHİL ETMEDEN kullanıcı bilgilerini döndür
    return jsonify(id=user.id, username=user.username, email=user.email), 200


# --- Mevcut Market ve Ürün Endpoint'leri ---

@app.route('/api/markets', methods=['GET'])
def get_markets():
    try:
        markets = Market.query.all()
        return jsonify([market.to_dict() for market in markets])
    except Exception as e:
        print(f"Get Markets Error: {e}")
        return jsonify({"message": "Marketler getirilirken hata oluştu"}), 500


@app.route('/api/products/<category>', methods=['GET'])
def get_products_by_category(category):
    try:
        # Kategori ismini büyük/küçük harf duyarsız hale getirmek iyi olabilir
        products = Product.query.filter(db.func.lower(Product.category) == category.lower()).all()
        return jsonify([product.to_dict() for product in products])
    except Exception as e:
        print(f"Get Products by Category Error: {e}")
        return jsonify({"message": "Ürünler getirilirken hata oluştu"}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        return jsonify([product.to_dict() for product in products])
    except Exception as e:
        print(f"Get Products Error: {e}")
        return jsonify({"message": "Ürünler getirilirken hata oluştu"}), 500


# Bu endpoint'ler için SQL sorgularını kullanmaya devam edebilirsiniz
# veya SQLAlchemy ilişkilerini (relationships) kullanarak ORM sorguları yazabilirsiniz.
@app.route('/api/markets-with-products', methods=['GET'])
def get_markets_with_products():
    query = """
        SELECT m.name, m.address, p.name, p.unit, mp.price
        FROM markets m
        JOIN market_products mp ON m.id = mp.market_id
        JOIN products p ON p.id = mp.product_id;
    """
    try:
        result = db.session.execute(db.text(query)) # db.text() kullanmak daha güvenli
        rows = result.fetchall()
        # ... (Geri kalan işleme kodunuz aynı) ...
        market_dict = {}
        for market_name, address, product_name, unit, price in rows:
            if market_name not in market_dict:
                market_dict[market_name] = {"adres": address, "urunler": {}}
            if product_name not in market_dict[market_name]["urunler"]:
                 # Fiyat None ise veya formatlama hatası verirse kontrol ekle
                price_str = f"{float(price):.2f} ₺" if price is not None else "N/A"
                market_dict[market_name]["urunler"][product_name] = f"{price_str} / {unit}"

        response = [{"market": market, "adres": data["adres"], "urunler": data["urunler"]}
                    for market, data in market_dict.items()]
        return jsonify(response)
    except Exception as e:
        print(f"Markets with Products Error: {e}")
        return jsonify({"message": "Market ve ürünler getirilirken hata oluştu"}), 500


@app.route('/api/markets-with-products/filter', methods=['GET'])
def filter_markets_with_products():
    requested_products = request.args.getlist('product') 

    if not requested_products:
         return jsonify({"message": "Filtrelemek için en az bir ürün adı gereklidir ('product' parametresi)"}), 400

    # SQL Injection'a karşı parametreleri doğru kullanmak önemli!
    # ANY() PostgreSQL'e özgü olabilir, başka DB'ler için IN kullanmak gerekebilir.
    query = db.text("""
        SELECT m.name, m.address, p.name, p.unit, mp.price
        FROM markets m
        JOIN market_products mp ON m.id = mp.market_id
        JOIN products p ON p.id = mp.product_id
        WHERE LOWER(p.name) = ANY(:products)
    """) # ANY(:products) yerine IN :products kullanmak daha genel olabilir

    try:
        result = db.session.execute(query, {'products': [p.lower() for p in requested_products]})
        rows = result.fetchall()
        # ... (Geri kalan işleme kodunuz aynı) ...
        market_dict = {}
        for market_name, address, product_name, unit, price in rows:
            if market_name not in market_dict:
                 market_dict[market_name] = {"adres": address, "urunler": {}}
            if product_name not in market_dict[market_name]["urunler"]:
                 price_str = f"{float(price):.2f} ₺" if price is not None else "N/A"
                 market_dict[market_name]["urunler"][product_name] = f"{price_str} / {unit}"

        response = [{"market": market, "adres": data["adres"], "urunler": data["urunler"]}
                     for market, data in market_dict.items()]
        return jsonify(response)

    except Exception as e:
        print(f"Filter Markets Error: {e}")
        return jsonify({"message": "Marketler filtrelenirken hata oluştu"}), 500


# --- Uygulamayı Çalıştırma ---
if __name__ == '__main__':
    # Veritabanı tablolarının oluşturulması (eğer yoksa)
    # Production'da Flask-Migrate kullanmak daha iyidir.
    with app.app_context():
         db.create_all() 
    app.run(debug=True) # debug=True geliştirme aşamasında kullanışlıdır, production'da False olmalı