import mongoose, { Schema, Document } from 'mongoose';

export interface ISubdomain extends Document {
  subdomain: string;
  emoji: string;
  createdAt: Date;
}

const SubdomainSchema: Schema = new Schema({
  subdomain: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/ // Only allow lowercase letters, numbers, and hyphens
  },
  emoji: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create index for faster queries
SubdomainSchema.index({ subdomain: 1 });

export default mongoose.models.Subdomain || 
       mongoose.model<ISubdomain>('Subdomain', SubdomainSchema);