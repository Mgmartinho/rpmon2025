import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// 🔑 Configure suas credenciais
const FACEBOOK_PAGE_ID = "SEU_PAGE_ID";
const INSTAGRAM_ID = "SEU_INSTAGRAM_ID";
const FACEBOOK_TOKEN = "SEU_TOKEN_FACEBOOK";
const YOUTUBE_CHANNEL_ID = "SEU_CHANNEL_ID";
const YOUTUBE_API_KEY = "SUA_API_KEY_YOUTUBE";

app.get("/api/followers", async (req, res) => {
  try {
    // Facebook
    const fbRes = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}?fields=followers_count&access_token=${FACEBOOK_TOKEN}`
    );
    const fbData = await fbRes.json();

    // Instagram
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${INSTAGRAM_ID}?fields=followers_count&access_token=${FACEBOOK_TOKEN}`
    );
    const igData = await igRes.json();

    // YouTube
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    );
    const ytData = await ytRes.json();

    res.json({
      facebook: fbData.followers_count || 0,
      instagram: igData.followers_count || 0,
      youtube: ytData.items[0]?.statistics.subscriberCount || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar seguidores" });
  }
});

app.listen(4000, () => console.log("✅ Backend rodando em http://localhost:4000"));
