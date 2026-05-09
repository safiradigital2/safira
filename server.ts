import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import cors from "cors";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Facebook OAuth URL
  app.get("/api/auth/facebook/url", (req, res) => {
    const appId = process.env.META_APP_ID;
    // Use the environment provided APP_URL for redirect
    const redirectUri = `${process.env.APP_URL}/api/auth/facebook/callback`;
    const scopes = ["ads_management", "ads_read", "business_management", "public_profile", "email"].join(",");
    
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;
    
    res.json({ url });
  });

  // Facebook OAuth Callback
  app.get("/api/auth/facebook/callback", async (req, res) => {
    const { code } = req.query;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.APP_URL}/api/auth/facebook/callback`;

    try {
      // Exchange code for access token
      const tokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      const accessToken = tokenResponse.data.access_token;

      // Send success script to close popup
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'FB_AUTH_SUCCESS', token: '${accessToken}' }, '*');
              window.close();
            </script>
            <p>Conectado com sucesso! Fechando janela...</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Facebook Auth Error:", error.response?.data || error.message);
      res.status(500).send("Erro na autenticação com Facebook.");
    }
  });

  // AI Generation Route
  // Note: Per skill, generation should ideally be client-side, but Meta publishing needs the server.
  // I will implement the AI helper on the client for better UX, but this route is here if needed.
  app.post("/api/generate-ad", async (req, res) => {
    // Logic moved to client per gemini-api skill for direct GenAI usage
    res.status(404).send("Use client-side Gemini integration.");
  });

  // Meta Ad Publishing Route
  app.post("/api/publish-ad", async (req, res) => {
    const { accessToken, adAccountId, adData } = req.body;
    
    try {
      // 1. Create Campaign
      const campaign = await axios.post(`https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns`, {
        name: `Campanha IA - ${adData.headline}`,
        objective: "OUTCOME_TRAFFIC",
        status: "PAUSED", // Initial status paused for safety
      }, { params: { access_token: accessToken } });

      const campaignId = campaign.data.id;

      // 2. Create AdSet
      const adSet = await axios.post(`https://graph.facebook.com/v19.0/act_${adAccountId}/adsets`, {
        name: `AdSet IA - ${adData.headline}`,
        campaign_id: campaignId,
        daily_budget: adData.budget * 100, // In cents
        billing_event: "IMPRESSIONS",
        optimization_goal: "LINK_CLICKS",
        targeting: {
          geo_locations: { countries: ["BR"] }, // Default Brazil or based on AI suggestion
          publisher_platforms: ["facebook", "instagram"],
        },
        status: "PAUSED",
        start_time: Math.floor(Date.now() / 1000),
      }, { params: { access_token: accessToken } });

      const adSetId = adSet.data.id;

      // 3. Create Ad (Simplified)
      // Note: Real ad creation requires an image/video hash. 
      // This is a simplified skeleton for the user.
      res.json({ 
        success: true, 
        campaignId, 
        adSetId,
        message: "Estrutura de anúncio criada no Meta! Verifique seu Gerenciador de Anúncios."
      });
    } catch (error: any) {
      console.error("Meta API Publish Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
