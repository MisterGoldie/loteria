/**
 * Utility functions for interacting with the Neynar API
 */

// Types for Neynar API responses
export interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verified: boolean;
}

export interface NeynarResponse {
  users: NeynarUser[];
}

/**
 * Fetch user data from Neynar API
 * @param fid Farcaster ID to fetch
 * @returns User data or null if not found
 */
export async function fetchFarcasterUser(fid: number): Promise<NeynarUser | null> {
  console.log(`Attempting to fetch Farcaster user with FID: ${fid}`);
  
  try {
    const neynarKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
    
    if (!neynarKey) {
      console.error('NEXT_PUBLIC_NEYNAR_API_KEY is not defined in environment variables');
      return null;
    }
    
    console.log('Using Neynar API key:', neynarKey.substring(0, 4) + '...');
    const endpoint = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    console.log('Fetching from endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': neynarKey
      }
    });

    console.log('Neynar API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Neynar API error (${response.status}):`, errorText);
      throw new Error(`Neynar API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as NeynarResponse;
    console.log('Neynar API response data:', data);
    
    if (data.users && data.users.length > 0) {
      const apiUser = data.users[0];
      console.log('Found user:', apiUser.username, 'with profile pic:', apiUser.pfp_url || 'none');
      
      // Add fallback for profile picture if not provided
      return {
        ...apiUser,
        pfp_url: apiUser.pfp_url || `https://avatar.vercel.sh/${apiUser.username || fid}`
      };
    } else {
      console.log('No users found in Neynar response for FID:', fid);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return null;
  }
}
