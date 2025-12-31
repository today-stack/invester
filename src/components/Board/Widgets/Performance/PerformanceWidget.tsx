import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import "./PerformanceWidget.css";

// Types
interface HistoryPoint {
    Time: string;
    Equity: number;
    SPY_Price: number;
}

interface PerformanceWidgetProps {
    id: string;
}

// Styles
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
`;

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({ id }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/history");
            const json = await response.json();

            if (Array.isArray(json) && json.length > 0) {
                // Normalize Data: Start at 0%
                const startEquity = parseFloat(json[0].Equity);
                const startSpy = parseFloat(json[0].SPY_Price);

                const normalized = json.map(p => {
                    const eq = parseFloat(p.Equity);
                    const spy = parseFloat(p.SPY_Price);
                    return {
                        time: new Date(p.Time).toLocaleDateString(), // or time
                        fullTime: p.Time,
                        equityPct: ((eq - startEquity) / startEquity) * 100,
                        spyPct: ((spy - startSpy) / startSpy) * 100,
                        equity: eq
                    };
                });

                setData(normalized);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Container>Loading Chart...</Container>;
    if (data.length === 0) return <Container>No History Data</Container>;

    return (
        <Container>
            <div className="performance-title">Equity Curve vs SPY Benchmark (%)</div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} minTickGap={30} />
                    <YAxis stroke="#666" tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444', fontSize: '12px' }}
                        formatter={(val: any) => val.toFixed(2) + "%"}
                        labelStyle={{ color: '#888' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="equityPct" name="My Bot" stroke="#4caf50" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="spyPct" name="SPY" stroke="#2196f3" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </Container>
    );
};

export default PerformanceWidget;
