"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { useFixedExpenses } from "@/hooks/use-fixed-expenses"
import { useMemo } from "react"

interface FinancialSummaryProps {
  selectedDate: Date
}

export function FinancialSummary({ selectedDate }: FinancialSummaryProps) {
  const { transactions, loadingTransactions } = useTransactions()
  const { fixedExpenses, loadingFixedExpenses } = useFixedExpenses()

  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  const { totalRevenue, totalExpenses, currentBalance, totalFixedExpenses } = useMemo(() => {
    let revenue = 0
    let expenses = 0
    let fixedExp = 0

    transactions.forEach((t) => {
      const d = new Date(t.data)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.tipo === "entrada") {
          revenue += t.valor
        } else {
          expenses += t.valor
        }
      }
    })

    fixedExpenses.forEach((fe) => {
      if (fe.ativo) {
        fixedExp += fe.valor
      }
    })

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      currentBalance: revenue - expenses,
      totalFixedExpenses: fixedExp,
    }
  }, [transactions, fixedExpenses, currentMonth, currentYear])

  if (loadingTransactions || loadingFixedExpenses) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
              <div className="h-4 w-4 rounded-full bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-muted h-8 w-3/4 rounded"></div>
              <p className="text-xs text-muted-foreground bg-muted h-4 w-1/2 mt-1 rounded"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Mês selecionado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">R$ {totalExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Mês selecionado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">R$ {currentBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {currentBalance >= 0 ? (
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> Positivo
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" /> Negativo
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Fixas</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">R$ {totalFixedExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Mensal</p>
        </CardContent>
      </Card>
    </div>
  )
}
