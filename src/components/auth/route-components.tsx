"use client"

import { Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { useState, useEffect } from "react";

// Development mode authentication bypass
const useDevelopmentSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      // Create a mock session for development
      setSession({
        user: {
          id: "dev-user-id",
          name: "Development User",
          email: "admin@example.com", // This matches our admin check in the Header component
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "dev-session-id",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "dev-user-id",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          token: "dev-token",
        }
      });
      setIsPending(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { data: session, isPending, error: null };
};

export const ProtectedRoute = ({ Component }: { Component: () => JSX.Element }) => {
    // Use development session in development mode
    const isDevelopment = true; // Set to true for development, would be environment-based in production
    
    const sessionHook = isDevelopment 
      ? useDevelopmentSession() 
      : fine.auth.useSession();
    
    const { 
        data: session, 
        isPending, //loading state
        error, //error object
    } = sessionHook;

    if (isPending) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    
    return !session?.user ? <Navigate to='/login' /> : <Component />;
};