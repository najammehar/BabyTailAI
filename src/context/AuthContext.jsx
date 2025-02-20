import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { ID } from 'appwrite';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            console.log(account);
            const currentSession = await account.getSession('current');
            if (currentSession) {
                const accountDetails = await account.get();
                setUser(accountDetails);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.log('Auth error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const signUp = async (email, password, name) => {
        try {
            const newAccount = await account.create(ID.unique(), email, password, name);
            if (newAccount) {
                const loginResult = await login(email, password);
                return loginResult;
            }
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Failed to sign up';
            
            if (error.code === 409) {
                errorMessage = 'An account with this email already exists';
            } else if (error.code === 400) {
                if (error.message.includes('password')) {
                    errorMessage = 'Password must be at least 8 characters long';
                } else if (error.message.includes('email')) {
                    errorMessage = 'Please enter a valid email address';
                }
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const login = async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const accountDetails = await account.get();
            setUser(accountDetails);
            navigate('/milestones');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Failed to login';
            
            if (error.code === 401) {
                errorMessage = 'Invalid email or password';
            } else if (error.code === 429) {
                errorMessage = 'Too many attempts. Please try again later';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        loading,
        signUp,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};