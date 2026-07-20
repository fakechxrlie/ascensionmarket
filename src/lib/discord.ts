const WEBHOOK_BIDDING = process.env.DISCORD_WEBHOOK_BIDDING || '';
const WEBHOOK_ADMIN_LOGS = process.env.DISCORD_WEBHOOK_ADMIN_LOGS || '';

interface DiscordEmbed {
  title: string;
  description: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
}

export async function sendOrderBiddingLog(embed: DiscordEmbed) {
  try {
    await fetch(WEBHOOK_BIDDING, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          ...embed,
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (err) {
    console.error('Failed to send Discord Bidding log:', err);
  }
}

export async function sendAdminLog(embed: DiscordEmbed) {
  try {
    await fetch(WEBHOOK_ADMIN_LOGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          ...embed,
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (err) {
    console.error('Failed to send Discord Admin log:', err);
  }
}
