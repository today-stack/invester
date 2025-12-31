import React, { useEffect, useState } from "react";
import DeleteWidget from "../DeleteWidget";
import "./TraderPiWidget.css";

const TraderPiWidget = ({ id }: { id: string }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using the proxy configured in package.json
                const response = await fetch("/api/history_grouped");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();
                setData(json);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching Trader Pi data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="widget TraderPiWidget trader-pi-widget">
            <div className="header trader-pi-header">
                <div className="widgetTitle">Trader Pi Live</div>
                <DeleteWidget id={id} />
            </div>
            <div className="content trader-pi-content">
                {loading && !data ? (
                    <div>Loading bot data...</div>
                ) : error ? (
                    <div className="trader-pi-error">
                        <p>Error connecting to Trader Pi:</p>
                        <small>{error}</small>
                    </div>
                ) : data ? (
                    <div>
                        <div className="trader-pi-status">
                            <strong>Status:</strong> <span className="trader-pi-online">Online</span>
                        </div>
                        {/* Placeholder for real metrics until we confirm API structure */}
                        <div>
                            <h5>Recent Trades</h5>
                            <div className="trader-pi-recent-trades">
                                {Array.isArray(data) ? (
                                    data.slice(0, 5).map((trade: any, idx: number) => (
                                        <div key={idx} className="trader-pi-trade-item">
                                            {JSON.stringify(trade).slice(0, 60)}...
                                        </div>
                                    ))
                                ) : (
                                    <pre>{JSON.stringify(data, null, 2)}</pre>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>No data available</div>
                )}
            </div>
        </div>
    );
};

export default TraderPiWidget;
