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

export async function GET() {
  // Using hardcoded values from the documentation example
  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjc0NzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgzRjE2ODZlNEI1Yjg2NjdEQzY1RTMzQzMxZDVBYTg2NzcxNzhGZDRBIn0",
      payload: "eyJkb21haW4iOiJ3d3cubG90ZXJpYWdhbWUueHl6In0",
      signature: "MHg1YmQ4Yjc2MGRiYWJiMWMxM2NkOTliYmJkMzM2ZTQ1ZjlkYjMyZDI2NDVjYzM3OWNiNmZhYjMxNWRhODQwNzk2N2FmZjUwMGY3YmU2MTUwMGJjZjE2ZWY2MGU4MjYyYzg4ZjUzYmM5MWE3YjgyNjk3YzRiZTg1OWY4NTdlNDZkNTFi"
    },
    frame: {
      "version": "next",
      "name": "Loteria",
      "iconUrl": "https://loteriagame.xyz/icon.png",
      "splashImageUrl": "https://loteriagame.xyz/icon.png",
      "splashBackgroundColor": "#000000",
      "homeUrl": "https://loteriagame.xyz"
    }
  });
}
