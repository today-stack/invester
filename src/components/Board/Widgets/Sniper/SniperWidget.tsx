import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell as BarCell } from "recharts";
import "./SniperWidget.css";

interface SniperWidgetProps {
    id: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
`;

const SniperWidget: React.FC<SniperWidgetProps> = ({ id }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/conviction");
            const json = await response.json();

            // Transform generic generic json structure into chart data
            // Structure expected: { 'strategies': { 'ORB': { 'HIGH': {wins, total}... } } } or similar
            // Actually `conviction_scorer.py` saves straight buckets under strategy keys.
            // { 'ORB': {'HIGH':...}, 'trades': [...] }

            const strategies = ['ORB', 'RSI', 'CoinToss'];
            const chartData: any[] = [];

            strategies.forEach(strat => {
                if (json[strat]) {
                    ['HIGH', 'MEDIUM', 'LOW'].forEach(bucket => {
                        const stats = json[strat][bucket];
                        if (stats && stats.total > 0) {
                            chartData.push({
                                name: `${strat} ${bucket}`,
                                winRate: (stats.wins / stats.total) * 100,
                                total: stats.total,
                                bucket: bucket, // for coloring
                                strategy: strat
                            });
                        }
                    });
                }
            });

            setData(chartData);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Container>Loading Sniper...</Container>;

    return (
        <Container>
            <div className="sniper-title">Conviction Verification (Win Rate %)</div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" stroke="#666" unit="%" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={90} tick={{ fontSize: 10 }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                    />
                    <Bar dataKey="winRate" name="Win Rate %" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <BarCell key={`cell-${index}`} fill={
                                entry.bucket === 'HIGH' ? '#4caf50' :
                                    entry.bucket === 'MEDIUM' ? '#ff9800' :
                                        '#f44336'
                            } />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Container>
    );
};

export default SniperWidget;
