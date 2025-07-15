"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { useAuth } from "./use-auth"
import { toast } from "@/hooks/use-toast"

export interface FixedExpense {
  id?: string
  userId: string
  descricao: string
  valor: number
  diaDoMes: number
  categoria: string
  ativo: boolean
}

export function useFixedExpenses() {
  const { user } = useAuth()
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setFixedExpenses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const q = query(collection(db, "fixedExpenses"), where("userId", "==", user.uid))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expensesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FixedExpense[]
        setFixedExpenses(expensesList)
        setLoading(false)
      },
      (err) => {
        console.error("Erro ao buscar despesas fixas:", err)
        setError("Falha ao carregar despesas fixas.")
        setLoading(false)
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas despesas fixas.",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [user])

  const addFixedExpense = useCallback(
    async (expense: Omit<FixedExpense, "id" | "userId">) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para adicionar despesas fixas.",
          variant: "destructive",
        })
        return
      }
      try {
        await addDoc(collection(db, "fixedExpenses"), {
          ...expense,
          userId: user.uid,
        })
        toast({
          title: "Sucesso!",
          description: "Despesa fixa adicionada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao adicionar despesa fixa:", e)
        setError("Falha ao adicionar despesa fixa.")
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a despesa fixa.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  const updateFixedExpense = useCallback(
    async (id: string, updates: Partial<Omit<FixedExpense, "id" | "userId">>) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para atualizar despesas fixas.",
          variant: "destructive",
        })
        return
      }
      try {
        await updateDoc(doc(db, "fixedExpenses", id), updates)
        toast({
          title: "Sucesso!",
          description: "Despesa fixa atualizada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao atualizar despesa fixa:", e)
        setError("Falha ao atualizar despesa fixa.")
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a despesa fixa.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  const deleteFixedExpense = useCallback(
    async (id: string) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para deletar despesas fixas.",
          variant: "destructive",
        })
        return
      }
      try {
        await deleteDoc(doc(db, "fixedExpenses", id))
        toast({
          title: "Sucesso!",
          description: "Despesa fixa deletada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao deletar despesa fixa:", e)
        setError("Falha ao deletar despesa fixa.")
        toast({
          title: "Erro",
          description: "Não foi possível deletar a despesa fixa.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  return {
    fixedExpenses,
    loadingFixedExpenses: loading,
    fixedExpensesError: error,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
  }
}
