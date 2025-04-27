import React from 'react';

function NearestMarket({ totalAmount }) {
  const handleFindNearestMarket = () => {
    // Burada backend API'ye istek gönderme veya diğer işlemleri gerçekleştirebilirsiniz.
    alert('En uygun market aranıyor...');
    console.log('Sepet Toplamı:', totalAmount);
    // Gerçek uygulamada, backend'den gelen market bilgileri burada gösterilecektir.
  };

  return (
    <div className="nearest-market">
      <h2>En Yakın Market</h2>
      {totalAmount > 0 ? (
        <div>
          <p>Toplam tutarınız: {totalAmount} ₺</p>
          <button onClick={handleFindNearestMarket}>En Uygun Marketi Bul</button>
          {/* Backend'den gelen market bilgileri burada gösterilecektir. */}
        </div>
      ) : (
        <p>Lütfen sepete ürün ekleyin.</p>
      )}
    </div>
  );
}

export default NearestMarket;