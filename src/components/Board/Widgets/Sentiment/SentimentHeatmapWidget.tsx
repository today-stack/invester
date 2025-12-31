import React, { useEffect, useState } from "react";
import styled from "styled-components";

// Types
interface SentimentData {
    sentiment: number;
    details: Record<string, number | { score: number }>;
    model: string;
}

interface SentimentHeatmapWidgetProps {
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
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #aaaaaa;
  font-size: 0.8rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 4px;
  flex: 1;
`;

const Cell = styled.div<{ score: number }>`
  background-color: ${props => getScoreColor(props.score)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
  position: relative;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Ticker = styled.span`
  font-weight: bold;
  font-size: 0.7rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
`;

const Score = styled.span`
  font-size: 0.6rem;
  color: rgba(255,255,255,0.9);
`;

// Helper to get color from score (-1.0 to 1.0)
const getScoreColor = (score: number) => {
    if (score > 0.5) return "#00aa00"; // Strong Buy (Dark Green)
    if (score > 0.1) return "#4caf50"; // Buy (Green)
    if (score < -0.5) return "#cc0000"; // Strong Sell (Dark Red)
    if (score < -0.1) return "#f44336"; // Sell (Red)
    return "#757575"; // Neutral (Grey)
};

const SentimentHeatmapWidget: React.FC<SentimentHeatmapWidgetProps> = ({ id }) => {
    const [data, setData] = useState<SentimentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/morning_levels");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json = await response.json();

            // Extract sentiment part
            if (json.error) throw new Error(json.error);

            const sentData = json.sentiment;
            if (!sentData) throw new Error("No sentiment data found");

            setData(sentData);
            setError(null);
        } catch (err: any) {
            console.error("Sentiment fetch failed:", err);
            setError("Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) return <Container>Loading Heatmap...</Container>;
    if (error) return <Container>Error: {error}</Container>;
    if (!data || !data.details) return <Container>No Data</Container>;

    // Convert details map to array and sort by ticker or weight?
    // Let's sort alphabetically for stability
    const tickers = Object.keys(data.details).sort();

    // Take top 25 if more
    const displayTickers = tickers.slice(0, 25);

    return (
        <Container>
            <Header>
                <span>FINBERT SENTIMENT (Top 25)</span>
                <span>Agg: {data.sentiment.toFixed(2)}</span>
            </Header>
            <Grid>
                {displayTickers.map(ticker => {
                    let score = data.details[ticker];
                    // Handle object form if present
                    if (typeof score === 'object') score = score.score;

                    return (
                        <Cell key={ticker} score={score} title={`${ticker}: ${score}`}>
                            <Ticker>{ticker}</Ticker>
                            <Score>{score > 0 ? '+' : ''}{score.toFixed(2)}</Score>
                        </Cell>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default SentimentHeatmapWidget;
