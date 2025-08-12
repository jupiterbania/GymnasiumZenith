
'use server';

import { suggestGalleryCategories as suggestGalleryCategoriesFlow, SuggestGalleryCategoriesInput } from '@/ai/flows/suggest-gallery-categories';
import { Member, GalleryItem, Post, Expense } from '@/types';
import { connectToDatabase } from './mongodb';
import { Collection, ObjectId, Sort } from 'mongodb';

// --- Generic DB Helper ---
async function getCollection<T>(collectionName: string): Promise<Collection<T>> {
    const db = await connectToDatabase();
    return db.collection<T>(collectionName);
}

// --- Fee Settings Actions ---
export async function getFeeSettings(): Promise<{ admissionFee: number, monthlyFee: number }> {
    try {
        const settingsCollection = await getCollection('settings');
        const settings = await settingsCollection.findOne({ name: 'fees' });
        if (settings) {
            return { admissionFee: (settings as any).admissionFee, monthlyFee: (settings as any).monthlyFee };
        }
        return { admissionFee: 1000, monthlyFee: 500 };
    } catch (error) {
        console.error("Error getting fee settings: ", error);
        throw new Error("Could not fetch fee settings.");
    }
}

export async function saveFeeSettings(fees: { admissionFee: number, monthlyFee: number }): Promise<void> {
    try {
        const settingsCollection = await getCollection('settings');
        await settingsCollection.updateOne({ name: 'fees' }, { $set: { ...fees, name: 'fees' } }, { upsert: true });
    } catch (error) {
        console.error("Error saving fee settings: ", error);
        throw new Error("Could not save fee settings.");
    }
}

// --- Generic CRUD Actions ---
async function findDocuments<T>(collectionName: string, sort: Sort): Promise<T[]> {
    try {
        const collection = await getCollection<any>(collectionName);
        const documents = await collection.find().sort(sort).toArray();
        return documents.map(doc => ({ ...doc, id: doc._id.toString(), _id: undefined })) as T[];
    } catch (error) {
        console.error(`Error getting ${collectionName}: `, error);
        return [];
    }
}

async function findDocumentById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
        if (!ObjectId.isValid(id)) return null;
        const collection = await getCollection<any>(collectionName);
        const document = await collection.findOne({ _id: new ObjectId(id) });
        if (document) {
            return { ...document, id: document._id.toString(), _id: undefined } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error getting ${collectionName} item by ID: `, error);
        return null;
    }
}

async function insertDocument<T extends { id: string }>(collectionName: string, doc: Omit<T, 'id'>): Promise<T> {
    try {
        const collection = await getCollection<any>(collectionName);
        const result = await collection.insertOne(doc);
        return { ...doc, id: result.insertedId.toString() } as T;
    } catch (error) {
        console.error(`Error adding ${collectionName} item: `, error);
        throw new Error(`Could not add ${collectionName} item.`);
    }
}

async function updateDocument<T extends { id: string }>(collectionName: string, doc: T): Promise<void> {
    try {
        const collection = await getCollection<any>(collectionName);
        const { id, ...docData } = doc;
        if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId for update.");
        const { _id, ...updateData } = docData as any; // Exclude _id if it exists
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    } catch (error) {
        console.error(`Error updating ${collectionName} item: `, error);
        throw new Error(`Could not update ${collectionName} item.`);
    }
}

async function deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
        const collection = await getCollection<any>(collectionName);
        if (!ObjectId.isValid(docId)) throw new Error("Invalid ObjectId for delete.");
        await collection.deleteOne({ _id: new ObjectId(docId) });
    } catch (error) {
        console.error(`Error deleting ${collectionName} item: `, error);
        throw new Error(`Could not delete ${collectionName} item.`);
    }
}

// --- Member Actions ---
export async function getMembers() { return await findDocuments<Member>('members', { startDate: -1 }); }
export async function getMember(id: string) { return await findDocumentById<Member>('members', id); }
export async function addMember(member: Omit<Member, 'id'>) { return await insertDocument<Member>('members', member); }
export async function updateMember(member: Member) { return await updateDocument<Member>('members', member); }
export async function deleteMember(memberId: string) { return await deleteDocument('members', memberId); }

// --- Gallery Actions ---
export async function getGalleryItems() { return await findDocuments<GalleryItem>('gallery', { createdAt: -1 }); }
export async function addGalleryItem(item: Omit<GalleryItem, 'id'>) { return await insertDocument<GalleryItem>('gallery', item); }
export async function updateGalleryItem(item: GalleryItem) { return await updateDocument<GalleryItem>('gallery', item); }
export async function deleteGalleryItem(itemId: string) { return await deleteDocument('gallery', itemId); }

// --- Post Actions ---
export async function getPosts() { return await findDocuments<Post>('posts', { createdAt: -1 }); }
export async function addPost(post: Omit<Post, 'id'>) { return await insertDocument<Post>('posts', post); }
export async function updatePost(post: Post) { return await updateDocument<Post>('posts', post); }
export async function deletePost(postId: string) { return await deleteDocument('posts', postId); }

// --- Expense Actions ---
export async function getExpenses() { return await findDocuments<Expense>('expenses', { date: -1 }); }
export async function addExpense(expense: Omit<Expense, 'id'>) { return await insertDocument<Expense>('expenses', expense); }
export async function deleteExpense(expenseId: string) { return await deleteDocument('expenses', expenseId); }

// --- Featured Items Action ---
export async function getFeaturedItems(): Promise<((Post | GalleryItem) & { itemType: 'post' | 'gallery' })[]> {
    try {
        const postsCollection = await getCollection('posts');
        const galleryCollection = await getCollection('gallery');

        const [posts, galleryItems] = await Promise.all([
            postsCollection.find({ showOnHomepage: true }).toArray(),
            galleryCollection.find({ showOnHomepage: true }).toArray()
        ]);

        const featuredPosts: ((Post) & { itemType: 'post' })[] = posts.map(doc => ({
            ...(doc as unknown as Post),
            id: doc._id.toString(),
            itemType: 'post'
        }));

        const featuredGalleryItems: ((GalleryItem) & { itemType: 'gallery' })[] = galleryItems.map(doc => ({
            ...(doc as unknown as GalleryItem),
            id: doc._id.toString(),
            itemType: 'gallery'
        }));

        const combined = [...featuredPosts, ...featuredGalleryItems];
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return combined;
    } catch (error) {
        console.error("Error getting featured items: ", error);
        return [];
    }
}


// --- Gen AI Actions ---
export async function suggestGalleryCategories(input: SuggestGalleryCategoriesInput): Promise<{ categories?: string[]; error?: string }> {
  if (!input.title || !input.description) {
    return { error: 'Title and description are required.' };
  }

  try {
    const result = await suggestGalleryCategoriesFlow(input);
    return { categories: result.categories };
  } catch (error) {
    console.error('Error suggesting categories:', error);
    return { error: 'An unexpected error occurred while suggesting categories.' };
  }
}
