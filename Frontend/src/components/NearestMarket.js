import React, { useState, useEffect } from 'react';
import './NearestMarket.css';

function NearestMarket() {
    const [nearestMarkets, setNearestMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Kullanıcı konumu SABİT
    const userLocation = {
        latitude: 36.9618781,
        longitude: 35.3103008
    };

    useEffect(() => {
        const fetchNearestMarkets = async () => {
            try {
                console.log("Fetching with userLocation:", userLocation); // LOG

                const response = await fetch(
                    `http://127.0.0.1:5000/api/nearest-markets?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`
                );

                if (!response.ok) {
                    throw new Error('Marketler alınamadı.');
                }

                const data = await response.json();
                setNearestMarkets(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNearestMarkets();
    }, []);

    if (loading) {
        return <div>Konum alınıyor ve marketler aranıyor...</div>;
    }

    if (error) {
        return <div>Hata: {error}</div>;
    }

    return (
        <div className="nearest-market-container">
            <h2>En Yakın Marketler</h2>
            {nearestMarkets.length > 0 ? (
                <ul className="nearest-market-list">
                    {nearestMarkets.map((item) => (
                        <li key={item.market.id} className="nearest-market-item">
                            <h3>{item.market.name}</h3>
                            <p>Adres: {item.market.address}</p>
                            <p>Uzaklık: {item.distance.toFixed(2)} km</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div>Yakınlarda market bulunamadı.</div>
            )}
        </div>
    );
}

export default NearestMarket;
