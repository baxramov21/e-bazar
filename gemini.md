# Bozor-Analitika (e-Bazar) Project Context

This document provides a comprehensive overview of the `e-Bazar` / `Bozor-Analitika` project. It serves as context for any AI assistant inheriting this codebase, detailing the project's goals, tech stack, and all features implemented so far.

## 🎯 Project Goal
We are building a premium, data-driven B2B agricultural trading and market intelligence platform for Uzbekistan. The platform connects **Buyers** and **Suppliers**, offering sophisticated tools like algorithmic trading advice, real-time (simulated) historical market charts, and intelligent supply chain optimization.

## 🛠️ Technology Stack
- **Framework:** Next.js (App Router, React)
- **Database / Auth:** Supabase
- **Styling:** Vanilla CSS (`globals.css`) using custom properties and a dark, premium aesthetic (e.g., `#111111` sidebars, glassmorphism).
- **AI Integration:** Google Gen AI SDK (`@google/genai`) using the `gemini-3.5-flash` model.
- **Charts & Icons:** `recharts` for data visualization, `lucide-react` for iconography.

## ✨ What We Have Built So Far

### 1. General UI & Architecture
- Implemented a unified, premium dark-themed layout.
- Separated the application into two distinct user flows: **Buyer** (`/buyer/*`) and **Supplier** (`/supplier/*`).
- Created responsive Sidebars for both roles (`BuyerSidebar.tsx` and `SupplierSidebar.tsx`).
- Built reusable components like `BackButton` and various `DashboardCharts`.

### 2. Buyer Features
- **Dashboard (`/buyer/dashboard`):** Overview of the buyer's activity, active orders, and quick actions.
- **Messages / AI Hub (`/buyer/messages`):** A sophisticated UI that receives complex JSON outputs from the Gemini AI and parses them into a beautiful layout featuring:
  - Recommended target price windows and confidence scores.
  - Optimal seller recommendations.
  - Decision matrices (best-case scenarios vs. risks) and actionable next steps.
  - Signal Badges (e.g., BUY_NOW, HOLD, SCALE_IN).
- **Market Analytics (`/buyer/analytics`):** 
  - A dynamic, interactive page that displays historical price trends for agricultural products (Bug'doy, Pomidor, Paxta, Uzum, Kartoshka) across various regions of Uzbekistan.
  - Features an `AreaChart` with gradient fills.
  - **Timeframe Filtering:** Supports viewing data by Day (last 30 days), Week (last 12 weeks), Month (1 year), Year (5 years), and Year-Over-Year comparison.
  - Integrates the Gemini AI to analyze the chart's current trend, project future changes, and explain the real-world agricultural reasons behind the trend in the Uzbek language.

### 3. Supplier Features
- **Dashboard (`/supplier/dashboard`):** Overview with KPI cards (Active Listings, Pending Orders, GMV).
- Includes an order status pie chart and a monthly GMV line chart.
- Features a KYB (Know Your Business) status banner alerting the supplier if their account is pending, verified, or rejected.
- **Grid Layout Fixes:** Overhauled the product listing views to use responsive CSS grids that properly span the full width of the remaining screen estate.

### 4. AI & Backend Integrations
- Successfully integrated `@google/genai`. 
- **Important Note on AI Model:** We are explicitly using `gemini-3.5-flash` because the user's specific API gateway/version threw 404 errors for older models.
- Created Server Actions (e.g., `generateMarketPredictionAction` and `generatePricePredictionAction`) that pass structured context (historical data strings, timeframes) to Gemini and instruct it to return highly structured data or professional Uzbek analysis.

## 🧭 Directives for Future AI Iterations
1. **Maintain Aesthetics:** Do not use basic styling. Stick to the premium, dark-mode, glowing aesthetic defined in the CSS variables.
2. **Use Server Actions:** Continue using Next.js Server Actions for database mutations and API calls (like Gemini).
3. **AI Persona:** Maintain the "Bazar Analyst AI" persona—an elite algorithmic trading advisor for agricultural commodities.
