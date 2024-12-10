'use client';

import { useState } from 'react';
import { usersService } from '../services/users';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const checkUserStatus = async (email: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 'No user found with this email';
      }

      const userData = querySnapshot.docs[0].data();
      return `User found - Role: ${userData.role}, Status: ${userData.status}`;
    } catch (error) {
      console.error('Error checking user status:', error);
      return 'Error checking user status';
    }
  };

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First check current status
      const currentStatus = await checkUserStatus(email);
      setMessage(`Current status: ${currentStatus}`);

      // Then set up as admin
      const success = await usersService.setupInitialAdmin(email);
      if (success) {
        // Check status after setup
        const newStatus = await checkUserStatus(email);
        setMessage(`Admin setup complete. New status: ${newStatus}`);
      } else {
        setMessage('Failed to set up admin user.');
      }
    } catch (error) {
      setMessage('Error setting up admin user.');
      console.error(error);
    }
  };

  const handleCheckStatus = async () => {
    if (!email) {
      setMessage('Please enter an email first');
      return;
    }
    const status = await checkUserStatus(email);
    setMessage(status);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Setup</h1>
        <form onSubmit={handleSetupAdmin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter admin email"
              required
            />
          </div>
          <div className="space-y-2">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Set Up Admin
            </button>
            <button
              type="button"
              onClick={handleCheckStatus}
              className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Check Status
            </button>
          </div>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
