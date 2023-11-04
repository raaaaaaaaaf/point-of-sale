import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from 'src/firebase/firebaseConfig';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      console.log(user);

      // If a user is authenticated, fetch user data
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
            console.log('Document data:', userSnap.data());
          } else {
            console.log('User document does not exist');
          }
          setError(null);
        } catch (err) {
          console.error('Error fetching user data:', error);
          setError(error.message);
        } finally {
          setLoading(false); // Update loading state after authentication
        }
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);
  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
