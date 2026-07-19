const WEBHOOK_BIDDING = 'https://discord.com/api/webhooks/1528487329633927268/x4Ku5395Uwm9zgkt9xJyDWlbGOwqyLTUYHAVifc7P_Jjd31_p4oOIq71J-XDYCJHlPkl';
const WEBHOOK_ADMIN_LOGS = 'https://discord.com/api/webhooks/1528487562568794118/2Rssfl2vrlZ8ELsdmns3nEIJqsfqNNwNjXe63YD3w_3YzRPY_9_v8jo9EthWWENuG60W';

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
