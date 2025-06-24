// app/actions.ts
'use server';

import Subdomain from '@/models/Subdomain'; // Ensure correct capitalization
import { isValidIcon } from '@/lib/subdomains';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rootDomain, protocol } from '@/lib/utils';
import { connectToDB } from '@/lib/database';

export async function createSubdomainAction(
  prevState: any,
  formData: FormData
) {
  await connectToDB();
  
  const subdomain = formData.get('subdomain') as string;
  const icon = formData.get('icon') as string;

  if (!subdomain || !icon) {
    return { success: false, error: 'Subdomain and icon are required' };
  }

  if (!isValidIcon(icon)) {
    return {
      subdomain,
      icon,
      success: false,
      error: 'Please enter a valid emoji (maximum 10 characters)'
    };
  }

  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (sanitizedSubdomain !== subdomain) {
    return {
      subdomain,
      icon,
      success: false,
      error: 'Subdomain can only have lowercase letters, numbers, and hyphens'
    };
  }

  try {
    const existingSubdomain = await Subdomain.findOne({ subdomain: sanitizedSubdomain });
    if (existingSubdomain) {
      return {
        subdomain,
        icon,
        success: false,
        error: 'This subdomain is already taken'
      };
    }

    await Subdomain.create({
      subdomain: sanitizedSubdomain,
      emoji: icon
    });

    // Ensure these values are correct
    console.log('Redirecting to:', `${protocol}://${sanitizedSubdomain}.${rootDomain}`);
    redirect(`${protocol}://${sanitizedSubdomain}.${rootDomain}`);
    
  } catch (error: any) {
    console.error('Error creating subdomain:', error);
    return {
      subdomain,
      icon,
      success: false,
      error: error.message || 'An error occurred while creating the subdomain'
    };
  }
}


export async function deleteSubdomainAction(
  prevState: any,
  formData: FormData
) {
  await connectToDB();
  
  const subdomain = formData.get('subdomain') as string;
  
  try {
    await Subdomain.deleteOne({ subdomain });
    revalidatePath('/admin');
    return { success: 'Domain deleted successfully' };
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    return { error: 'Failed to delete subdomain' };
  }
}