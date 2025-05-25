"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchFarcasterUser } from '../utils/neynar';

interface FarcasterAvatarProps {
  fid?: number;
  size?: number;
  className?: string;
}

export function FarcasterAvatar({ fid, size = 32, className = '' }: FarcasterAvatarProps) {
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (!isMounted) return;
    
    const loadProfilePicture = async () => {
      try {
        setLoading(true);
        
        // Only proceed if we have a FID
        if (!fid) {
          setLoading(false);
          return;
        }
        
        const userData = await fetchFarcasterUser(fid);
        
        if (userData?.pfp_url) {
          setPfpUrl(userData.pfp_url);
        }
      } catch (err) {
        console.error('Error loading profile picture:', err);
      } finally {
        setLoading(false);
      }
    };

    if (fid) {
      loadProfilePicture();
    }
  }, [fid, isMounted]);

  // Only render the actual content after client-side hydration is complete
  if (!isMounted) {
    return (
      <div 
        className={`relative rounded-full bg-gray-200 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  
  if (loading || !pfpUrl) {
    // Return a placeholder during loading or if no profile picture
    return (
      <div 
        className={`relative rounded-full bg-gray-200 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image 
        src={pfpUrl}
        alt="Farcaster Profile"
        fill
        className="object-cover"
      />
    </div>
  );
}
