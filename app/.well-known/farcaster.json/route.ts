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
      payload: "eyJkb21haW4iOiIyMTAxYjQ4OGUxZTUubmdyb2suYXBwIn0",
      signature: "MHhjMjhiNzc5YTUyYjJmZjkyOTEyMmI3ODI5OTA3YzRmMmQzMTQ4ZTlkOWRiNjkwZjZmM2M4MmQ2M2QyMDg0YjE2MDFlOGE5NTMxOTI2MmE5ZDY0ZDA0MGYyMWU2YmMxYzNiZDZmMmYwODM2OWViNTU4ZTExMDhhZmIwYjBmZTA5YTFi"
    },
    frame: {
      "version": "next",
      "name": "Loteria",
      "iconUrl": "https://loteriagame.xyz/fakeicon.png",
      "splashImageUrl": "https://loteriagame.xyz/fakeicon.png",
      "splashBackgroundColor": "#000000",
      "homeUrl": "https://loteriagame.xyz"
    }
  });
}
