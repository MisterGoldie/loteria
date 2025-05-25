"use client";

import { useEffect, useState } from 'react';
import { fetchFarcasterUser, type NeynarUser } from '../utils/neynar';
import Image from 'next/image';

interface FarcasterProfileProps {
  fid: number;
}

export function FarcasterProfile({ fid }: FarcasterProfileProps) {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!fid) {
          setError('No Farcaster ID available');
          setLoading(false);
          return;
        }
        
        const userData = await fetchFarcasterUser(fid);
        
        if (userData) {
          setUser(userData);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error loading Farcaster profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [fid]);

  // Display loading state
  if (loading) {
    return <div className="flex justify-center items-center p-4">Loading profile...</div>;
  }

  // Display error state
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  // Display user profile
  if (user) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3">
          <Image 
            src={user.pfp_url}
            alt={`${user.display_name || user.username}'s profile picture`}
            fill
            className="object-cover"
          />
        </div>
        <h3 className="font-bold text-lg">{user.display_name || user.username}</h3>
        <p className="text-gray-500">@{user.username}</p>
        {user.profile?.bio?.text && (
          <p className="text-sm mt-2 text-center">{user.profile.bio.text}</p>
        )}
        <div className="flex gap-4 mt-3 text-sm">
          <div>
            <span className="font-bold">{user.following_count}</span> Following
          </div>
          <div>
            <span className="font-bold">{user.follower_count}</span> Followers
          </div>
        </div>
      </div>
    );
  }

  return null;
}
