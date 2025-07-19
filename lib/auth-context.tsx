"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"

type UserData = User | null

interface AuthContextType {
  session: Session | null
  user: UserData
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; data: any }>
  signOut: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  refreshSession: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserData>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting initial session:", error.message)
          setError(error.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error("Error in getInitialSession:", err)
        setError("Failed to initialize session")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state change:", event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)
      setError(null)
      setLoading(false)

      // Handle specific auth events
      if (event === "SIGNED_OUT") {
        console.log("👋 User signed out")
      } else if (event === "SIGNED_IN") {
        console.log("👋 User signed in:", session?.user?.email)
      } else if (event === "TOKEN_REFRESHED") {
        console.log("🔄 Token refreshed for:", session?.user?.email)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔐 Attempting sign in for:", email)
      const result = await supabase.auth.signInWithPassword({ email, password })

      if (result.error) {
        setError(result.error.message)
        throw result.error
      }

      console.log("✅ Sign in successful")
      return { error: null, data: result.data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed"
      setError(errorMessage)
      return { error: error as Error, data: null }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log("📝 Attempting sign up for:", email)
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (result.error) {
        setError(result.error.message)
        throw result.error
      }

      console.log("✅ Sign up successful")
      return { error: null, data: result.data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign up failed"
      setError(errorMessage)
      return { error: error as Error, data: null }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🚪 Signing out...")
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        throw error
      }

      console.log("✅ Sign out successful")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign out failed"
      setError(errorMessage)
      console.error("🚨 Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Refreshing session...")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        setError(error.message)
        throw error
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        console.log("✅ Session refreshed successfully")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to refresh session"
      setError(errorMessage)
      console.error("🚨 Session refresh failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    isAuthenticated: !!session && !!user,
    refreshSession,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
