"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { useAuth } from "./use-auth"
import { toast } from "@/hooks/use-toast"

export interface Category {
  id?: string
  userId: string
  nome: string
  cor: string
}

const DEFAULT_CATEGORIES = [
  { nome: "Alimentação", cor: "#ef4444" },
  { nome: "Transporte", cor: "#3b82f6" },
  { nome: "Moradia", cor: "#10b981" },
  { nome: "Saúde", cor: "#f59e0b" },
  { nome: "Educação", cor: "#8b5cf6" },
  { nome: "Lazer", cor: "#ec4899" },
  { nome: "Vestuário", cor: "#06b6d4" },
  { nome: "Outros", cor: "#84cc16" },
]

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasCreatedDefaults, setHasCreatedDefaults] = useState(false)

  useEffect(() => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const q = query(collection(db, "categories"), where("userId", "==", user.uid))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const categoriesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
        setCategories(categoriesList)
        setLoading(false)
        
        // Create default categories for new users
        if (categoriesList.length === 0 && !hasCreatedDefaults) {
          createDefaultCategories()
          setHasCreatedDefaults(true)
        }
      },
      (err) => {
        console.error("Erro ao buscar categorias:", err)
        setError("Falha ao carregar categorias.")
        setLoading(false)
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas categorias.",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [user])

  const createDefaultCategories = async () => {
    if (!user) return
    
    try {
      const promises = DEFAULT_CATEGORIES.map(category =>
        addDoc(collection(db, "categories"), {
          ...category,
          userId: user.uid,
        })
      )
      await Promise.all(promises)
      toast({
        title: "Bem-vindo!",
        description: "Categorias padrão foram criadas para você.",
      })
    } catch (error) {
      console.error("Erro ao criar categorias padrão:", error)
    }
  }
  const addCategory = useCallback(
    async (category: Omit<Category, "id" | "userId">) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para adicionar categorias.",
          variant: "destructive",
        })
        return
      }
      try {
        await addDoc(collection(db, "categories"), {
          ...category,
          userId: user.uid,
        })
        toast({
          title: "Sucesso!",
          description: "Categoria adicionada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao adicionar categoria:", e)
        setError("Falha ao adicionar categoria.")
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a categoria.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Omit<Category, "id" | "userId">>) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para atualizar categorias.",
          variant: "destructive",
        })
        return
      }
      try {
        await updateDoc(doc(db, "categories", id), updates)
        toast({
          title: "Sucesso!",
          description: "Categoria atualizada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao atualizar categoria:", e)
        setError("Falha ao atualizar categoria.")
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a categoria.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para deletar categorias.",
          variant: "destructive",
        })
        return
      }
      try {
        await deleteDoc(doc(db, "categories", id))
        toast({
          title: "Sucesso!",
          description: "Categoria deletada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao deletar categoria:", e)
        setError("Falha ao deletar categoria.")
        toast({
          title: "Erro",
          description: "Não foi possível deletar a categoria.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  return {
    categories,
    loadingCategories: loading,
    categoriesError: error,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
