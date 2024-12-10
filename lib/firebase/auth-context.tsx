import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

// Create a context for authentication
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(setUser);
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
