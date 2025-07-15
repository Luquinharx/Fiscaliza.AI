"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { useAuth } from "./use-auth"
import { toast } from "@/hooks/use-toast"

export interface Transaction {
  id?: string
  userId: string
  descricao: string
  valor: number
  tipo: "entrada" | "saida"
  data: string // YYYY-MM-DD
  categoria: string
  parcelas?: {
    atual: number
    total: number
  }
}

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("data", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const transactionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[]
        setTransactions(transactionsList)
        setLoading(false)
      },
      (err) => {
        console.error("Erro ao buscar transações:", err)
        setError("Falha ao carregar transações.")
        setLoading(false)
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas transações.",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [user])

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "userId">) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para adicionar transações.",
          variant: "destructive",
        })
        return
      }
      try {
        await addDoc(collection(db, "transactions"), {
          ...transaction,
          userId: user.uid,
        })
        toast({
          title: "Sucesso!",
          description: "Transação adicionada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao adicionar transação:", e)
        setError("Falha ao adicionar transação.")
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a transação.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, "id" | "userId">>) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para atualizar transações.",
          variant: "destructive",
        })
        return
      }
      try {
        await updateDoc(doc(db, "transactions", id), updates)
        toast({
          title: "Sucesso!",
          description: "Transação atualizada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao atualizar transação:", e)
        setError("Falha ao atualizar transação.")
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a transação.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para deletar transações.",
          variant: "destructive",
        })
        return
      }
      try {
        await deleteDoc(doc(db, "transactions", id))
        toast({
          title: "Sucesso!",
          description: "Transação deletada com sucesso.",
        })
      } catch (e) {
        console.error("Erro ao deletar transação:", e)
        setError("Falha ao deletar transação.")
        toast({
          title: "Erro",
          description: "Não foi possível deletar a transação.",
          variant: "destructive",
        })
      }
    },
    [user],
  )

  return {
    transactions,
    loadingTransactions: loading,
    transactionsError: error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
