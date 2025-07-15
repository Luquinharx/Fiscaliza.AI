"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { auth } from "@/lib/firebase"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import { toast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Login bem-sucedido!",
        description: "Você foi logado com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      toast({
        title: "Erro no Login",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "Cadastro bem-sucedido!",
        description: "Sua conta foi criada e você foi logado.",
      })
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error)
      toast({
        title: "Erro no Cadastro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await signOut(auth)
      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao Desconectar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
