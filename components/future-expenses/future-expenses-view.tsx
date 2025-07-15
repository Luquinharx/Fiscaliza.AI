"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { useFixedExpenses } from "@/hooks/use-fixed-expenses"
import { useCategories } from "@/hooks/use-categories"

interface FutureExpense {
  month: string
  year: number
  fixedExpenses: number
  installments: number
  total: number
}

interface CategoryExpense {
  category: string
  total: number
}

// Paleta de cores vibrantes para os gráficos
const CHART_COLORS = {
  blue: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
  green: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
  red: ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"],
  purple: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"],
  orange: ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa"],
  teal: ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"],
  yellow: ["#ca8a04", "#eab308", "#facc15", "#fde047", "#fef08a"],
  pink: ["#db2777", "#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8"],
}

// Helper para obter o nome do mês
const getMonthName = (monthIndex: number, year: number) => {
  const date = new Date(year, monthIndex, 1)
  return date.toLocaleDateString("pt-BR", { month: "long" })
}

// Formatar data para exibição
const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

export function FutureExpensesView() {
  const { transactions } = useTransactions()
  const { fixedExpenses } = useFixedExpenses()
  const { categories } = useCategories()
  const [viewType, setViewType] = useState<"month" | "category">("month")

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const futureExpensesProjectionData: FutureExpense[] = useMemo(() => {
    const projectionMonths = 12
    const dataMap = new Map<string, { fixedExpenses: number; installments: number; total: number }>()

    for (let i = 0; i < projectionMonths; i++) {
      const date = new Date(currentYear, currentMonth + i, 1)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      dataMap.set(`${year}-${month}`, { fixedExpenses: 0, installments: 0, total: 0 })
    }

    fixedExpenses.forEach((expense) => {
      if (expense.ativo) {
        for (let i = 0; i < projectionMonths; i++) {
          const date = new Date(currentYear, currentMonth + i, expense.diaDoMes)
          const year = date.getFullYear()
          const month = (date.getMonth() + 1).toString().padStart(2, "0")
          const key = `${year}-${month}`
          if (dataMap.has(key)) {
            const current = dataMap.get(key)!
            current.fixedExpenses += expense.valor
            current.total += expense.valor
            dataMap.set(key, current)
          }
        }
      }
    })

    transactions.forEach((transaction) => {
      if (
        transaction.tipo === "saida" &&
        transaction.parcelas &&
        transaction.parcelas.atual < transaction.parcelas.total
      ) {
        const baseDate = new Date(transaction.data)
        for (let i = transaction.parcelas.atual; i < transaction.parcelas.total; i++) {
          const installmentDate = new Date(baseDate)
          installmentDate.setMonth(installmentDate.getMonth() + i)

          const projectionEndDate = new Date(currentYear, currentMonth + projectionMonths, 0)
          if (installmentDate <= projectionEndDate) {
            const year = installmentDate.getFullYear()
            const month = (installmentDate.getMonth() + 1).toString().padStart(2, "0")
            const key = `${year}-${month}`
            if (dataMap.has(key)) {
              const current = dataMap.get(key)!
              const installmentValue = transaction.valor / transaction.parcelas.total
              current.installments += installmentValue
              current.total += installmentValue
              dataMap.set(key, current)
            }
          }
        }
      }
    })

    return Array.from(dataMap.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => ({
        month: getMonthName(Number.parseInt(key.substring(5, 7)) - 1, Number.parseInt(key.substring(0, 4))),
        year: Number.parseInt(key.substring(0, 4)),
        fixedExpenses: Number.parseFloat(value.fixedExpenses.toFixed(2)),
        installments: Number.parseFloat(value.installments.toFixed(2)),
        total: Number.parseFloat(value.total.toFixed(2)),
      }))
  }, [transactions, fixedExpenses, currentMonth, currentYear])

  const futureExpensesByCategoryData: CategoryExpense[] = useMemo(() => {
    const categoryMap = new Map<string, number>()

    // Aggregate fixed expenses by category (if applicable, assuming a default category or mapping)
    // For simplicity, let's assume fixed expenses don't have categories in this view, or map them to a generic one.
    // If fixed expenses had categories, you'd iterate them here.

    // Aggregate installment expenses by category
    transactions.forEach((transaction) => {
      if (
        transaction.tipo === "saida" &&
        transaction.parcelas &&
        transaction.parcelas.atual < transaction.parcelas.total
      ) {
        const installmentValue = transaction.valor / transaction.parcelas.total
        const categoryName = categories.find((cat) => cat.nome === transaction.categoria)?.nome || "Outros"
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + installmentValue)
      }
    })

    // Add fixed expenses to a generic category or their actual categories if available
    fixedExpenses.forEach((expense) => {
      if (expense.ativo) {
        // If fixed expenses have categories, use them. Otherwise, lump into "Fixed"
        const categoryName = categories.find((cat) => cat.nome === expense.categoria)?.nome || "Despesas Fixas"
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + expense.valor)
      }
    })

    return Array.from(categoryMap.entries())
      .map(([category, total]) => ({ category, total: Number.parseFloat(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total)
  }, [transactions, fixedExpenses, categories])

  const handleDownload = () => {
    const dataToExport = viewType === "month" ? futureExpensesProjectionData : futureExpensesByCategoryData
    const headers =
      viewType === "month"
        ? ["Mês", "Ano", "Despesas Fixas", "Parcelas", "Total Projetado"]
        : ["Categoria", "Total Projetado"]

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((item) => {
        if (viewType === "month") {
          const monthItem = item as FutureExpense
          return `${monthItem.month},${monthItem.year},${monthItem.fixedExpenses},${monthItem.installments},${monthItem.total}`
        } else {
          const categoryItem = item as CategoryExpense
          return `${categoryItem.category},${categoryItem.total}`
        }
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `gastos_futuros_${viewType}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card className="bg-card border border-border shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-foreground">Projeção de Gastos Futuros</CardTitle>
            <CardDescription className="text-muted-foreground">
              Visualize suas despesas futuras com base em pagamentos parcelados e despesas fixas.
            </CardDescription>
          </div>
          <Button onClick={handleDownload} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={viewType} onValueChange={(value) => setViewType(value as "month" | "category")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Por Mês</TabsTrigger>
              <TabsTrigger value="category">Por Categoria</TabsTrigger>
            </TabsList>
            <TabsContent value="month" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês/Ano</TableHead>
                    <TableHead>Despesas Fixas</TableHead>
                    <TableHead>Parcelas</TableHead>
                    <TableHead className="text-right">Total Projetado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureExpensesProjectionData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhuma projeção de gastos futuros disponível.
                      </TableCell>
                    </TableRow>
                  ) : (
                    futureExpensesProjectionData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{`${data.month} ${data.year}`}</TableCell>
                        <TableCell>R$ {data.fixedExpenses.toFixed(2)}</TableCell>
                        <TableCell>R$ {data.installments.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">R$ {data.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="category" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Total Projetado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureExpensesByCategoryData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                        Nenhuma projeção de gastos futuros por categoria disponível.
                      </TableCell>
                    </TableRow>
                  ) : (
                    futureExpensesByCategoryData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{data.category}</TableCell>
                        <TableCell className="text-right font-semibold">R$ {data.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
