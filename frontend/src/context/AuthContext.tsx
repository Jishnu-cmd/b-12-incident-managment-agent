import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { api } from '../services/api';

export interface UserProfile {
  id: number;
  clerk_user_id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: string;
  department: string;
}

interface AuthContextType {
  user: UserProfile | null;
  clerkUser: any;
  isSignedIn: boolean;
  isLoaded: boolean;
  syncUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);

  const syncUser = async () => {
    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || '';
      const phoneNumber = clerkUser.primaryPhoneNumber?.phoneNumber || clerkUser.phoneNumbers[0]?.phoneNumber || '';
      const name = clerkUser.fullName || clerkUser.firstName || email.split('@')[0];

      try {
        const synced = await api.syncClerkUser({
          clerk_user_id: clerkUser.id,
          email: email,
          name: name,
          phone_number: phoneNumber,
          role: (clerkUser.publicMetadata?.role as string) || 'Lead SRE'
        });
        setDbUser(synced);
      } catch (err) {
        console.error('Clerk user DB sync failed', err);
      }
    } else {
      setDbUser(null);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      syncUser();
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  const logout = async () => {
    try {
      await signOut();
      await clerkSignOut();
      setDbUser(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const activeUser: UserProfile | null = clerkUser ? {
    id: dbUser?.id || 1,
    clerk_user_id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || dbUser?.name || 'AetherPay User',
    email: clerkUser.primaryEmailAddress?.emailAddress || dbUser?.email || '',
    phone_number: clerkUser.primaryPhoneNumber?.phoneNumber || dbUser?.phone_number || '',
    role: dbUser?.role || 'Lead SRE',
    department: dbUser?.department || 'AetherPay Enterprise'
  } : null;

  return (
    <AuthContext.Provider value={{ 
      user: activeUser, 
      clerkUser, 
      isSignedIn: !!isSignedIn, 
      isLoaded, 
      syncUser, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
