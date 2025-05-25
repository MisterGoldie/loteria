/**
 * Utility functions for working with Farcaster data
 */

/**
 * Extract the Farcaster ID (FID) from the client context
 * This handles different ways the FID might be stored in the context
 */
export function getFarcasterIdFromContext(context: any): number | undefined {
  // Debug the entire context to see what's available
  console.log('Farcaster context:', JSON.stringify(context, null, 2));
  
  // Try different possible paths to find the FID
  if (!context) {
    console.log('No context available');
    return undefined;
  }
  
  // Most important: Check for user.fid directly in the context
  if (context.user && typeof context.user.fid === 'number') {
    console.log('Found FID in user object at root level:', context.user.fid);
    return context.user.fid;
  }
  
  // Check if we're in a Farcaster frame
  if (context.isFrame) {
    console.log('Running in a Farcaster frame');
  }
  
  // Check client object if it exists
  if (context.client) {
    console.log('Context client:', context.client);
    
    // Direct FID on client
    if (typeof context.client.fid === 'number') {
      console.log('Found FID as number on client:', context.client.fid);
      return context.client.fid;
    }
    
    // clientFid property
    if (typeof context.client.clientFid === 'number') {
      console.log('Found clientFid as number:', context.client.clientFid);
      return context.client.clientFid;
    }
    
    // FID in user object inside client
    if (context.client.user && typeof context.client.user.fid === 'number') {
      console.log('Found FID as number in client.user object:', context.client.user.fid);
      return context.client.user.fid;
    }
    
    // FID as string that needs conversion
    if (typeof context.client.fid === 'string') {
      const numFid = parseInt(context.client.fid, 10);
      if (!isNaN(numFid)) {
        console.log('Found FID as string on client, converted to number:', numFid);
        return numFid;
      }
    }
    
    // FID in user object as string
    if (context.client.user && typeof context.client.user.fid === 'string') {
      const numFid = parseInt(context.client.user.fid, 10);
      if (!isNaN(numFid)) {
        console.log('Found FID as string in user object, converted to number:', numFid);
        return numFid;
      }
    }
  }
  
  // Try to find FID in viewer property
  if (context.viewer && typeof context.viewer.fid === 'number') {
    console.log('Found FID in viewer object:', context.viewer.fid);
    return context.viewer.fid;
  }
  
  // Try to find FID in message property
  if (context.message && typeof context.message.fid === 'number') {
    console.log('Found FID in message object:', context.message.fid);
    return context.message.fid;
  }
  
  console.log('Could not find FID in context');
  return undefined;
}
