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
      "iconUrl": "https://loteriagame.xyz/icon.png",
      "homeUrl": "https://loteriagame.xyz",
      "imageUrl": "https://loteriagame.xyz/image.png",
      "buttonTitle": "Play Loteria",
      "splashImageUrl": "https://loteriagame.xyz/splash.png",
      "splashBackgroundColor": "#eeccff",
      "webhookUrl": "https://loteriagame.xyz/api/webhook"
    }
  });
}
