import React, { createContext, useContext, useState, useEffect } from 'react';
import { databases, appwriteConfig } from '../appwrite/config';
import { ID, Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';

const ChapterContext = createContext();

export const useChapters = () => {
    const context = useContext(ChapterContext);
    if (!context) {
        throw new Error('useChapters must be used within a ChaptersProvider');
    }
    return context;
};

export const ChaptersProvider = ({ children }) => {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const DATABASE_ID = appwriteConfig.databaseId;
    const COLLECTION_ID = appwriteConfig.chaptersCollectionId;

    useEffect(() => {
        if (user) {
            getUserChapters();
        } else {
            setChapters([]);
        }
    }, [user]);

    const getUserChapters = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('userId', user.$id), Query.orderAsc('chapterNo')]
            );
            
            if (response.documents.length > 0) {
                setChapters(response.documents);
            } else {
                setChapters([]);
            }
        } catch (error) {
            console.error('Error fetching chapters:', error);
            setChapters([]);
        } finally {
            setLoading(false);
        }
    };

    const createChapter = async (chapterData) => {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    ...chapterData,
                    userId: user.$id
                }
            );
            setChapters(prev => [...prev, response]);
            return { success: true, data: response };
        } catch (error) {
            console.error('Error creating chapter:', error);
            return { 
                success: false, 
                error: 'Failed to create chapter' 
            };
        }
    };

    const updateChapter = async (chapterId, chapterData) => {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                chapterId,
                chapterData
            );
            setChapters(prev => 
                prev.map(chapter => 
                    chapter.$id === chapterId ? response : chapter
                )
            );
            return { success: true, data: response };
        } catch (error) {
            console.error('Error updating chapter:', error);
            return { 
                success: false, 
                error: 'Failed to update chapter' 
            };
        }
    };

    const value = {
        chapters,
        loading,
        createChapter,
        updateChapter,
        getUserChapters
    };

    return (
        <ChapterContext.Provider value={value}>
            {children}
        </ChapterContext.Provider>
    );
};