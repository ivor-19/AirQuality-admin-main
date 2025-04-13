'use client'
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface User {
  _id: string;
  account_id: string;
  username: string;
  role?: string;
}

interface AuthContextType {
  userCred: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userCred, setUserCred] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const router = useRouter();

  // Check for stored token on load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUserCred(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
        
        // Handle redirect based on user role and current path
        const pathname = window.location.pathname;
        if (pathname === '/' || pathname === '/login') {
          const redirectPath = parsedUser.role === 'Admin' ? '/admin' : '/dashboard';
          setSessionActive(true);

          setTimeout(() => {
            setSessionActive(false);
            router.replace(redirectPath);
            
          }, 3000)
          
        }
      }
      
    };
    
    checkAuth();
  }, [router]);

  const login = (user: User, token: string) => {
    setUserCred(user);
    setToken(token);
    setIsAuthenticated(true);

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  const logout = () => {
    setUserCred(null);
    setToken(null);
    setIsAuthenticated(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <>
    <AlertDialog open={sessionActive} onOpenChange={setSessionActive}>
      <AlertDialogContent className='font-geist flex items-center justify-center'>
        <AlertDialogHeader className='flex flex-col items-center justify-center'>
          <Loader2 className='animate-spin'/>
          <AlertDialogTitle className='text-sm'>Your session is still active. Redirecting now...</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AuthContext.Provider value={{ userCred, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
    </>
  );
};