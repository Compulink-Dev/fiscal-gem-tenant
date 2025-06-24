import Subdomain from '@/models/Subdomain';
import { connectToDB } from '@/lib/database';
import { FlattenMaps } from 'mongoose';

// Define the return type for lean documents
type LeanSubdomain = FlattenMaps<{
  _id: string;
  subdomain: string;
  emoji: string;
  createdAt: Date;
  __v?: number;
}>;

// Keep your existing isValidIcon function as is
export function isValidIcon(str: string) {
  if (str.length > 10) {
    return false;
  }

  try {
    const emojiPattern = /[\p{Emoji}]/u;
    if (emojiPattern.test(str)) {
      return true;
    }
  } catch (error) {
    console.warn(
      'Emoji regex validation failed, using fallback validation',
      error
    );
  }

  return str.length >= 1 && str.length <= 10;
}

type SubdomainData = {
  emoji: string;
  createdAt: number;
};

export async function getSubdomainData(subdomain: string): Promise<SubdomainData | null> {
  await connectToDB();
  
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const doc = await Subdomain.findOne({ subdomain: sanitizedSubdomain }).lean<LeanSubdomain>();
  
  if (!doc) return null;
  
  return {
    emoji: doc.emoji,
    createdAt: doc.createdAt.getTime()
  };
}

export async function getAllSubdomains() {
  await connectToDB();
  
  const subdomains = await Subdomain.find().sort({ createdAt: -1 }).lean<LeanSubdomain[]>();
  
  return subdomains.map((doc: any) => ({
    subdomain: doc.subdomain,
    emoji: doc.emoji,
    createdAt: doc.createdAt.getTime()
  }));
}