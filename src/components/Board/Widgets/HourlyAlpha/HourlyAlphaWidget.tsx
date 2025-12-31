import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import "./HourlyAlphaWidget.css";

interface HourlyAlphaWidgetProps {
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

const HourlyAlphaWidget: React.FC<HourlyAlphaWidgetProps> = ({ id }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/analytics/hourly");
            const json = await response.json();
            if (Array.isArray(json)) {
                setData(json);
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

    if (loading) return <Container>Loading Hourly...</Container>;

    return (
        <Container>
            <div className="hourly-alpha-title">Hourly Performance (P&L $)</div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="label" stroke="#666" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#666" tick={{ fontSize: 10 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                        formatter={(val: any) => `$${Number(val).toFixed(2)}`}
                    />
                    <ReferenceLine y={0} stroke="#666" />
                    <Bar dataKey="pnl" fill="#2196f3">
                        {data.map((entry, index) => (
                            <text key={`val-${index}`}>{/* Custom Coloring could go here */}</text>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Container>
    );
};

export default HourlyAlphaWidget;
