import { openDB } from 'idb';

const DB_NAME = 'blogflow-db';
const STORE_NAME = 'posts';

export async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

export async function savePost(content: string) {
    const db = await initDB();
    await db.put(STORE_NAME, content, 'current-draft');
}

export async function loadPost() {
    const db = await initDB();
    return db.get(STORE_NAME, 'current-draft');
}
