import React, { useState, useEffect } from 'react';
import './NearestMarket.css';

function NearestMarket() {
    const [nearestMarkets, setNearestMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNearestMarkets = () => {
            if (!navigator.geolocation) {
                setError("Tarayıcı konum desteği sunmuyor.");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const response = await fetch('http://127.0.0.1:5000/api/nearest_market', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Market bilgileri alınamadı.');
                        }

                        const data = await response.json();
                        setNearestMarkets(data);
                    } catch (err) {
                        setError(err.message);
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    setError("Konum alınamadı: " + err.message);
                    setLoading(false);
                }
            );
        };

        fetchNearestMarkets();
    }, []);

    if (loading) return <div>Konum alınıyor ve marketler aranıyor...</div>;
    if (error) return <div>Hata: {error}</div>;

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
