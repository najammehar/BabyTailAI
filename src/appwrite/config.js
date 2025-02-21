import { Client, Databases, Account, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint(String(import.meta.env.VITE_APPWRITE_URL)) 
    .setProject(String(import.meta.env.VITE_APPWRITE_PROJECT));

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

export const appwriteConfig = {
    databaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    milestonesCollectionId: String(import.meta.env.VITE_APPWRITE_MILESTONES_COLLECTION_ID),
    chaptersCollectionId: String(import.meta.env.VITE_APPWRITE_CHAPTERS_COLLECTION_ID),
    imagesCollectionId: String(import.meta.env.VITE_APPWRITE_IMAGES_COLLECTION_ID),
    imagesBucketId: String(import.meta.env.VITE_APPWRITE_IMAGES_BUCKET_ID),
};