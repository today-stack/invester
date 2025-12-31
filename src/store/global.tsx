import { createSlice } from "@reduxjs/toolkit";
import { Layout } from "react-grid-layout";
import { Widget, WidgetInfo } from "../components/Board/Board";
export type GlobalData = {
    modalOpen: boolean;
    widgets: Widget[];
    layouts: Layout[];
    board: WidgetInfo[];
    layout_changed: boolean;
    theme: "dark" | "light";
    activeDashboard: string;
    dashboards: Dashboard[];
};

const initialState: GlobalData = {
    modalOpen: false,
    widgets: [
        { i: "trader_pi", type: "TraderPiWidget", symbol: "BTCUSDT" },
        { i: "market_pulse", type: "MarketPulseWidget", symbol: "BTCUSDT" },
        { i: "sentiment", type: "SentimentHeatmapWidget", symbol: "BTCUSDT" },
        { i: "sniper", type: "SniperWidget", symbol: "BTCUSDT" },
        { i: "performance", type: "PerformanceWidget", symbol: "BTCUSDT" },
        { i: "hourly_alpha", type: "HourlyAlphaWidget", symbol: "BTCUSDT" }
    ],
    layouts: [
        { i: "trader_pi", x: 0, y: 0, w: 24, h: 4, moved: false, static: false },
        { i: "market_pulse", x: 0, y: 4, w: 8, h: 8, moved: false, static: false },
        { i: "sentiment", x: 8, y: 4, w: 8, h: 8, moved: false, static: false },
        { i: "sniper", x: 16, y: 4, w: 8, h: 8, moved: false, static: false },
        { i: "performance", x: 0, y: 12, w: 12, h: 8, moved: false, static: false },
        { i: "hourly_alpha", x: 12, y: 12, w: 12, h: 8, moved: false, static: false }
    ],
    board: [],
    layout_changed: false,
    theme: "light",
    activeDashboard: "home",
    dashboards: [],
};

const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        toggleModalOpen: (state, action) => {
            state.modalOpen = action.payload;
            localStorage.setItem("modalOpen", JSON.stringify(action.payload));
        },
        setWidgets: (state, action) => {
            state.widgets = action.payload;
            localStorage.setItem("widgets", JSON.stringify(action.payload));
        },
        setLayouts: (state, action) => {
            state.layouts = action.payload;
            localStorage.setItem("layouts", JSON.stringify(action.payload));
        },
        setBoard: (state, action) => {
            state.board = action.payload;
            localStorage.setItem("board", JSON.stringify(action.payload));
        },
        toggleLayoutChanged: (state, action) => {
            state.layout_changed = true;
            localStorage.setItem("layout_changed", JSON.stringify(true));
        },
        toggleTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem("theme", action.payload);
        },
        setActiveDashboard: (state, action) => {
            state.activeDashboard = action.payload;
            localStorage.setItem("activeDashboard", action.payload);
        },
        setDashboards: (state, action) => {
            state.dashboards = action.payload;
            localStorage.setItem("dashboards", JSON.stringify(action.payload));
        },
    },
});

export const {
    toggleModalOpen,
    setWidgets,
    setLayouts,
    setBoard,
    toggleLayoutChanged,
    toggleTheme,
    setActiveDashboard,
    setDashboards,
} = globalSlice.actions;
export default globalSlice.reducer;
