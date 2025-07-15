"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthForm } from "@/components/auth/auth-form"
import { AppSidebar } from "@/components/layout/app-sidebar" // Updated import
import { TransactionForm } from "@/components/transactions/transaction-form"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionHistory } from "@/components/transactions/transaction-history"
import { CategoryManager } from "@/components/categories/category-manager"
import { FinancialSummary } from "@/components/dashboard/financial-summary"
import { EnhancedCharts } from "@/components/dashboard/enhanced-charts"
import { DateFilter } from "@/components/dashboard/date-filter"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { TransactionHistoryPreview } from "@/components/dashboard/transaction-history-preview"
import { FixedExpenseForm } from "@/components/fixed-expenses/fixed-expense-form"
import { FixedExpenseList } from "@/components/fixed-expenses/fixed-expense-list"
import { FutureExpensesView } from "@/components/future-expenses/future-expenses-view"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar" // New imports
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function Home() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedDate, setSelectedDate] = useState(new Date())

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  // Determine the current breadcrumb based on activeTab
  const getBreadcrumbLabel = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard"
      case "transactions":
        return "Transações"
      case "history":
        return "Histórico"
      case "settings":
        return "Categorias"
      case "fixed-expenses":
        return "Despesas Fixas"
      case "future-expenses":
        return "Gastos Futuros"
      default:
        return "Início"
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {" "}
      {/* defaultOpen can be read from cookie on server */}
      <AppSidebar activeTab={activeTab} onNavigate={setActiveTab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Início</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumbLabel(activeTab)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="dashboard" className="mt-0 space-y-8">
              {/* Filtro de Data */}
              <DateFilter selectedDate={selectedDate} onDateChange={setSelectedDate} />
              
              {/* Resumo Financeiro (KPI Cards) */}
              <FinancialSummary selectedDate={selectedDate} />

              {/* Gráficos Aprimorados (todos os 6 gráficos) */}
              <EnhancedCharts selectedDate={selectedDate} />

              {/* Histórico de Transações (agora ocupa a largura total) */}
              <div className="grid grid-cols-1 gap-6">
                <TransactionHistoryPreview />
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-0 space-y-8">
              {/* Formulário de Nova Transação */}
              <TransactionForm />
              {/* Lista de Transações Recentes */}
              <TransactionList />
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-8">
              {/* Histórico Completo */}
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-8">
              {/* Gerenciador de Categorias */}
              <CategoryManager />
            </TabsContent>

            <TabsContent value="fixed-expenses" className="mt-0 space-y-8">
              <FixedExpenseForm />
              <FixedExpenseList />
            </TabsContent>

            <TabsContent value="future-expenses" className="mt-0 space-y-8">
              <FutureExpensesView />
            </TabsContent>

            {/* Aba de Logout (apenas para fins de navegação, a ação real está no Sidebar) */}
            <TabsContent value="logout" className="mt-0 space-y-8">
              <div className="text-center py-12 text-muted-foreground">Você será desconectado em breve.</div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
