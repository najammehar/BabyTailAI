import React, { createContext, useContext, useState, useEffect } from 'react';
import { databases, appwriteConfig } from '../appwrite/config';
import { ID, Query } from 'appwrite';
import { useAuth } from './AuthContext';

const MilestonesContext = createContext();

export const useMilestones = () => {
    const context = useContext(MilestonesContext);
    if (!context) {
        throw new Error('useMilestones must be used within a MilestonesProvider');
    }
    return context;
};

export const MilestonesProvider = ({ children }) => {
    const [milestone, setMilestone] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Your database and collection IDs
    const DATABASE_ID = appwriteConfig.databaseId;
    const COLLECTION_ID = appwriteConfig.milestonesCollectionId;

    useEffect(() => {
        if (user) {
            getUserMilestone();
        } else {
            setMilestone(null);
        }
    }, [user]);

    const getUserMilestone = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('userId', user.$id)]
            );
            
            if (response.documents.length > 0) {
                setMilestone(response.documents[0]);
            } else {
                setMilestone(null);
            }
        } catch (error) {
            console.error('Error fetching milestone:', error);
            setMilestone(null);
        } finally {
            setLoading(false);
        }
    };

    const createMilestone = async (milestoneData) => {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    ...milestoneData,
                    userId: user.$id
                }
            );
            setMilestone(response);
            return { success: true, data: response };
        } catch (error) {
            console.error('Error creating milestone:', error);
            return { 
                success: false, 
                error: 'Failed to create milestone' 
            };
        }
    };

    const updateMilestone = async (milestoneData) => {
        if (!milestone) {
            return { success: false, error: 'No milestone found to update' };
        }

        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                milestone.$id,
                milestoneData
            );
            setMilestone(response);
            return { success: true, data: response };
        } catch (error) {
            console.error('Error updating milestone:', error);
            return { 
                success: false, 
                error: 'Failed to update milestone' 
            };
        }
    };

    const value = {
        milestone,
        loading,
        createMilestone,
        updateMilestone,
        getUserMilestone
    };

    return (
        <MilestonesContext.Provider value={value}>
          {children}
        </MilestonesContext.Provider>
      );
};