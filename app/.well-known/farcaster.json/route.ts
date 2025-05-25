function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET(request: Request) {
  // Get the host from the request headers
  const host = request.headers.get('host') || '';
  
  // Return the appropriate manifest with the correct domain
  return Response.json({
    accountAssociation: {
      "header": "eyJmaWQiOjc0NzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgzRjE2ODZlNEI1Yjg2NjdEQzY1RTMzQzMxZDVBYTg2NzcxNzhGZDRBIn0",
      "payload": "eyJkb21haW4iOiJsb3RlcmlhZ2FtZS54eXoifQ",
      "signature": "MHg3MjQ0ODZkYzc4YmNjMzUyZTc3NGQwZTc0YjBiMTQyMTQzZjQ2YmJiOWVkZDg4MWU0ODExZGFjMGM4N2IxNWNiNWYzYWNlNzQxNGJlNGRmNGEzYWI5MzNlMTAzODE5NDg4YzRmYmI2OGNjM2MyNDk3MmI2ZWJhMzBlOTAzYWRhZTFi"
    },
    frame: {
      "version": "1",
      "name": "Loteria",
      "homeUrl": "https://loteriagame.xyz",
      "iconUrl": "https://loteriagame.xyz/icon.png",
      "imageUrl": "https://loteriagame.xyz/image.png",
      "buttonTitle": "Play Loteria",
      "splashImageUrl": "https://loteriagame.xyz/splash.png",
      "splashBackgroundColor": "#eeccff",
      "webhookUrl": "https://loteriagame.xyz/api/webhook",
      "subtitle": "Mexican bingo with rewards",
      "description": "Loteria is a fun, interactive game based on traditional Mexican bingo where players can win USDC rewards on Base network",
      "primaryCategory": "games",
      "tags": ["game", "bingo", "crypto", "rewards", "base"],
      "heroImageUrl": "https://loteriagame.xyz/hero.png",
      "tagline": "Play Loteria, Win Crypto",
      "ogTitle": "Loteria - Crypto Rewards Game",
      "ogDescription": "Play the traditional Mexican bingo game and win USDC rewards on Base",
      "ogImageUrl": "https://loteriagame.xyz/og-image.png",
      "noindex": false,
      "requiredChains": [
        "eip155:8453"
      ]
    }
  });
}