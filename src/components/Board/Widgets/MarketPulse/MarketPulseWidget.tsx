import React, { useEffect, useState } from "react";
import styled from "styled-components";

// Types
interface MarketData {
    vix_data: { regime: string; vix: number; spread: number };
    spy_levels: { weighted_vol: number; hv_21: number; sma_20: number };
    gex: { call_wall: number; put_wall: number; total_gex: number };
}

interface MarketPulseWidgetProps {
    id: string;
}

// Styles
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #1e1e1e; 
  // Assumes theme has background.secondary, else fallback
  overflow: auto;
  color: white;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;

const Value = styled.div<{ status?: 'good' | 'bad' | 'neutral' }>`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => {
        switch (props.status) {
            case 'good': return '#4caf50';
            case 'bad': return '#f44336';
            default: return 'white';
        }
    }};
`;

const Sub = styled.span`
  font-size: 0.75rem;
  color: #666;
  margin-left: 8px;
`;

const MarketPulseWidget: React.FC<MarketPulseWidgetProps> = ({ id }) => {
    const [data, setData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/morning_levels");
            const json = await response.json();
            if (!json.error) setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 5 mins as this doesnt change fast
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <Container>Loading Pulse...</Container>;
    if (!data) return <Container>No Data</Container>;

    // Regimes
    const vixRegime = data.vix_data?.regime || 'UNKNOWN';
    const isContango = data.vix_data?.spread > 0;

    const hv = data.spy_levels?.hv_21 || 0;
    const volStatus = hv > 20 ? 'bad' : (hv < 10 ? 'good' : 'neutral');

    return (
        <Container>
            {/* VIX Regime */}
            <Row>
                <Label>VIX Structure</Label>
                <Value status={isContango ? 'good' : 'bad'}>
                    {vixRegime.toUpperCase()}
                    <Sub>({data.vix_data?.vix.toFixed(2)})</Sub>
                </Value>
            </Row>

            {/* Volatility */}
            <Row>
                <Label>Volatility (HV21)</Label>
                <Value status={volStatus}>
                    {hv.toFixed(1)}%
                    <Sub>{hv > 15 ? 'HIGH' : 'LOW'}</Sub>
                </Value>
            </Row>

            {/* GEX Walls */}
            <Row>
                <Label>GEX Walls</Label>
                <Value>
                    ${data.gex?.put_wall?.toFixed(0)} / ${data.gex?.call_wall?.toFixed(0)}
                </Value>
            </Row>

            {/* Total GEX */}
            <Row>
                <Label>Net GEX</Label>
                <Value status={data.gex?.total_gex > 0 ? 'good' : 'bad'}>
                    ${(data.gex?.total_gex / 1000000).toFixed(1)}M
                </Value>
            </Row>
        </Container>
    );
};

export default MarketPulseWidget;
