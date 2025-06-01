import config from './config.json' assert { type: "json" };
import axios from 'axios';
const { webhookUrl, webhookName, webhookAvatar } = config;

export async function sendToDiscord({ name, uid, character, message }) {
  if (!webhookUrl) {
    console.error("Webhook URL not set in config.json");
    return;
  }

  const embed = {
    title: "New Artifact Submission",
    color: 0x00ff00, // green color, you can change it
    fields: [
      { name: "Name", value: name, inline: true },
      { name: "UID", value: uid, inline: true },
      { name: "Character", value: character, inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  if (message && message.trim().length > 0) {
    embed.fields.push({ name: "Message", value: message });
  }

  try {
    await axios.post(webhookUrl, {
      username: webhookName || "WebhookBot",
      avatar_url: webhookAvatar || undefined,
      embeds: [embed],
    });
    console.log("Webhook embed sent successfully");
  } catch (error) {
    console.error("Error sending webhook:", error.response?.data || error.message);
  }
}
