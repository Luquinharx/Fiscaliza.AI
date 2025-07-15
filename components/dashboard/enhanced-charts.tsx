"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/hooks/use-transactions"
import { useCategories } from "@/hooks/use-categories"
import { useFixedExpenses } from "@/hooks/use-fixed-expenses"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
  Tooltip,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  BarChartIcon,
  PieChartIcon,
  Calendar,
  DollarSign,
  Target,
  Activity,
} from "lucide-react"

interface EnhancedChartsProps {
  selectedDate: Date
}

// Paleta de cores vibrantes e modernas para os gráficos
const CHART_COLORS = {
  blue: ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
  green: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
  red: ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"],
  purple: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"],
  orange: ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa"],
  teal: ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"],
  yellow: ["#ca8a04", "#eab308", "#facc15", "#fde047", "#fef08a"],
  pink: ["#db2777", "#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8"],
  indigo: ["#4338ca", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"],
  emerald: ["#047857", "#059669", "#10b981", "#34d399", "#6ee7b7"],
  // Cores específicas para diferentes tipos de gráfico
  pie: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"],
  area: {
    entradas: "#10b981",
    saidas: "#ef4444",
    saldo: "#3b82f6",
  },
}

// Helper para obter o nome do mês
const getMonthName = (monthIndex: number, year: number) => {
  const date = new Date(year, monthIndex, 1)
  return date.toLocaleDateString("pt-BR", { month: "short" })
}

// Componente customizado para tooltip com design moderno
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-200 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <p className="font-semibold text-gray-800 mb-3 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 font-medium">{entry.name}</span>
            <span className="font-bold text-gray-800">
              R$ {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Componente de ícone animado
const AnimatedIcon = ({ icon: Icon, className = "" }: { icon: any; className?: string }) => (
  <div className={`transition-all duration-300 hover:scale-110 hover:rotate-3 group-hover:animate-pulse ${className}`}>
    <Icon className="w-5 h-5 text-muted-foreground drop-shadow-sm" />
  </div>
)

export function EnhancedCharts({ selectedDate }: EnhancedChartsProps) {
  /* ------------------------------ hooks ------------------------------ */
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const { fixedExpenses } = useFixedExpenses()
  
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  // --- Data para todos os gráficos ---
  // 1. Gráfico de Pizza: Distribuição de Gastos por Categoria (Mês Atual)
  const categoryExpensesData = (() => {
    const currentExpenses = transactions.filter((t) => {
      const d = new Date(t.data)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.tipo === "saida"
    })
    const uniqueCategories = Array.from(new Map(categories.map((c) => [c.nome, c])).values())
    return uniqueCategories
      .map((cat, index) => ({
        name: cat.nome,
        value: currentExpenses.filter((t) => t.categoria === cat.nome).reduce((sum, t) => sum + t.valor, 0),
        color: CHART_COLORS.pie[index % CHART_COLORS.pie.length],
      }))
      .filter((v) => v.value > 0)
      .sort((a, b) => b.value - a.value)
  })()
  const totalCurrentMonthExpenses = categoryExpensesData.reduce((sum, i) => sum + i.value, 0)

  // 2. Gráfico de Barras: Comparativo de Entrada vs Saída por Mês (Últimos 6 Meses)
  const monthlyInOutData = (() => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      const label = getMonthName(month, year)
      const monthTransactions = transactions.filter((t) => {
        const d = new Date(t.data)
        return d.getMonth() === month && d.getFullYear() === year
      })
      const entradas = monthTransactions.filter((t) => t.tipo === "entrada").reduce((sum, t) => sum + t.valor, 0)
      const saidas = monthTransactions.filter((t) => t.tipo === "saida").reduce((sum, t) => sum + t.valor, 0)
      data.push({ month: label, entradas, saidas })
    }
    return data
  })()

  // 3. Gráfico de Linha: Evolução do Saldo Mensal (Últimos 6 Meses)
  const monthlyBalanceData = (() => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      const label = getMonthName(month, year)
      const monthTransactions = transactions.filter((t) => {
        const d = new Date(t.data)
        return d.getMonth() === month && d.getFullYear() === year
      })
      const entradas = monthTransactions.filter((t) => t.tipo === "entrada").reduce((sum, t) => sum + t.valor, 0)
      const saidas = monthTransactions.filter((t) => t.tipo === "saida").reduce((sum, t) => sum + t.valor, 0)
      const saldo = entradas - saidas
      data.push({ month: label, saldo })
    }
    return data
  })()

  // 4. Gráfico de Barras Horizontais: Maiores Gastos do Mês (Top 5)
  const topExpensesData = (() => {
    const currentMonthExpenses = transactions.filter((t) => {
      const d = new Date(t.data)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.tipo === "saida"
    })
    return currentMonthExpenses
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
      .map((t, index) => ({
        descricao: t.descricao,
        valor: t.valor,
        color: CHART_COLORS.red[index % CHART_COLORS.red.length],
        rank: index + 1,
      }))
  })()

  // 5. Gráfico de Área: Fluxo Financeiro Diário (Mês Atual)
  const dailyFlowData = (() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const dataMap = new Map<number, { entradas: number; saidas: number }>()
    for (let i = 1; i <= daysInMonth; i++) dataMap.set(i, { entradas: 0, saidas: 0 })
    transactions.forEach((t) => {
      const d = new Date(t.data)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate()
        const current = dataMap.get(day)!
        if (t.tipo === "entrada") {
          current.entradas += t.valor
        } else {
          current.saidas += t.valor
        }
        dataMap.set(day, current)
      }
    })
    return Array.from(dataMap.entries())
      .sort(([dayA], [dayB]) => dayA - dayB)
      .map(([day, values]) => ({
        day,
        entradas: values.entradas,
        saidas: values.saidas,
      }))
  })()

  // 6. Gráfico de Pizza: Análise por Categoria (Últimos 3 Meses) - NOVO
  const categoryAnalysisData = (() => {
    const last3MonthsExpenses = transactions.filter((t) => {
      const d = new Date(t.data)
      const monthsAgo = new Date(currentYear, currentMonth - 3, 1)
      return d >= monthsAgo && d <= new Date(currentYear, currentMonth + 1, 0) && t.tipo === "saida"
    })
    const uniqueCategories = Array.from(new Map(categories.map((c) => [c.nome, c])).values())
    return uniqueCategories
      .map((cat, index) => ({
        name: cat.nome,
        value: last3MonthsExpenses.filter((t) => t.categoria === cat.nome).reduce((sum, t) => sum + t.valor, 0),
        color: CHART_COLORS.pie[index % CHART_COLORS.pie.length],
      }))
      .filter((v) => v.value > 0)
      .sort((a, b) => b.value - a.value)
  })()
  const totalLast3MonthsExpenses = categoryAnalysisData.reduce((sum, i) => sum + i.value, 0)

  // 7. Gráfico de Projeção de Gastos Futuros (Próximos 12 Meses)
  const futureExpensesProjectionData = (() => {
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
  })()

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header da Dashboard */}
      <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold text-foreground mb-2 hidden lg:block">Dashboard Financeira</h1>
        <h1 className="text-2xl font-bold text-foreground mb-2 lg:hidden">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Análise completa das suas finanças</p>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* 1. Gráfico de Pizza – Distribuição de Gastos por Categoria */}
        <Card className="group bg-card border shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-left-4 duration-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-card-foreground">
              <div className="p-2 bg-muted rounded-lg shadow-md">
                <AnimatedIcon icon={PieChartIcon} />
              </div>
              <span className="hidden sm:inline">Gastos por Categoria</span>
              <span className="sm:hidden">Gastos</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Distribuição das despesas do mês selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {totalCurrentMonthExpenses === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma despesa registrada</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryExpensesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {categoryExpensesData.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={entry.color}
                            className="hover:opacity-80 transition-opacity duration-200"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center animate-in fade-in-0 zoom-in-95 duration-1000 delay-500">
                      <div className="text-xl sm:text-2xl font-bold text-card-foreground">
                        R$ {totalCurrentMonthExpenses.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categoryExpensesData.map((item, index) => {
                    const percentage = ((item.value / totalCurrentMonthExpenses) * 100).toFixed(1)
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-card-foreground text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-card-foreground text-sm">R$ {item.value.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Gráfico de Barras – Entradas vs Saídas (COMPARATIVO) */}
        <Card className="group bg-card border shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-card-foreground">
              <div className="p-2 bg-muted rounded-lg shadow-md">
                <AnimatedIcon icon={BarChartIcon} />
              </div>
              <span className="hidden sm:inline">Entradas vs Saídas</span>
              <span className="sm:hidden">Entradas/Saídas</span>
            </CardTitle>
            <CardDescription className="text-sm">Comparativo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyInOutData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickMargin={10}
                  axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="entradas"
                  name="Entradas"
                  fill={CHART_COLORS.area.entradas}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                />
                <Bar
                  dataKey="saidas"
                  name="Saídas"
                  fill={CHART_COLORS.area.saidas}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Gráfico de Linha – Evolução do Saldo (REDESENHADO) */}
        <Card className="group bg-card border shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-card-foreground">
              <div className="p-2 bg-muted rounded-lg shadow-md">
                <AnimatedIcon icon={Activity} />
              </div>
              <span className="hidden sm:inline">Evolução do Saldo</span>
              <span className="sm:hidden">Saldo</span>
            </CardTitle>
            <CardDescription className="text-sm">Tendência dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyBalanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Área com gradiente */}
                <Area
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke={CHART_COLORS.area.saldo}
                  strokeWidth={3}
                  fill="url(#balanceGradient)"
                  fillOpacity={0.4}
                  animationDuration={2000}
                />
                {/* Linha principal */}
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke={CHART_COLORS.area.saldo}
                  strokeWidth={3}
                  dot={{
                    r: 6,
                    fill: CHART_COLORS.area.saldo,
                    strokeWidth: 3,
                    stroke: "#fff",
                    className: "drop-shadow-sm",
                  }}
                  activeDot={{
                    r: 8,
                    fill: CHART_COLORS.area.saldo,
                    stroke: "#fff",
                    strokeWidth: 3,
                    className: "drop-shadow-md animate-pulse",
                  }}
                  animationDuration={1800}
                  animationBegin={200}
                />
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.area.saldo} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={CHART_COLORS.area.saldo} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha - Gráficos maiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 4. Maiores Gastos - Redesenhado */}
        <Card className="group bg-card border shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-card-foreground">
              <div className="p-2 bg-muted rounded-lg shadow-md">
                <AnimatedIcon icon={Target} />
              </div>
              <span className="hidden sm:inline">Top 5 Maiores Gastos</span>
              <span className="sm:hidden">Maiores Gastos</span>
            </CardTitle>
            <CardDescription className="text-sm">Suas maiores despesas do mês selecionado</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {topExpensesData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum gasto registrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topExpensesData.map((expense, index) => (
                  <div
                    key={index}
                    className="relative animate-in fade-in-0 slide-in-from-left-2 duration-500"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-sm shadow-md">
                          #{expense.rank}
                        </div>
                        <div>
                          <h4 className="font-semibold text-card-foreground text-sm sm:text-lg">
                            {expense.descricao.length > 25
                              ? expense.descricao.substring(0, 22) + "..."
                              : expense.descricao}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
                            <span className="text-sm text-muted-foreground">Despesa</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg sm:text-2xl font-bold text-red-600">R$ {expense.valor.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {((expense.valor / topExpensesData.reduce((sum, e) => sum + e.valor, 0)) * 100).toFixed(1)}%
                          do total
                        </div>
                      </div>
                    </div>
                    {/* Barra de progresso visual */}
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${(expense.valor / Math.max(...topExpensesData.map((e) => e.valor))) * 100}%`,
                          animationDelay: `${index * 200 + 500}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Fluxo Financeiro Diário */}
        <Card className="group bg-card border shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-card-foreground">
              <div className="p-2 bg-muted rounded-lg shadow-md">
                <AnimatedIcon icon={Calendar} />
              </div>
              <span className="hidden sm:inline">Fluxo Diário</span>
              <span className="sm:hidden">Fluxo</span>
            </CardTitle>
            <CardDescription className="text-sm">Movimentação financeira do mês selecionado</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  name="Entradas"
                  stackId="1"
                  stroke={CHART_COLORS.area.entradas}
                  fill="url(#dailyEntriesGradient)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="saidas"
                  name="Saídas"
                  stackId="2"
                  stroke={CHART_COLORS.area.saidas}
                  fill="url(#dailyExitsGradient)"
                  animationDuration={1500}
                  animationBegin={300}
                />
                <defs>
                  <linearGradient id="dailyEntriesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.area.entradas} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={CHART_COLORS.area.entradas} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="dailyExitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.area.saidas} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={CHART_COLORS.area.saidas} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Terceira linha - Gráficos especiais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 6. Análise por Categoria - NOVO GRÁFICO DE PIZZA */}
        <Card className="group bg-card border shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-left-4 duration-700 delay-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-card-foreground">
              <div className="p-2 bg-muted rounded-lg shadow-md">
                <AnimatedIcon icon={PieChartIcon} />
              </div>
              <span className="hidden sm:inline">Análise por Categoria</span>
              <span className="sm:hidden">Análise</span>
            </CardTitle>
            <CardDescription className="text-sm">Gastos dos últimos 3 meses por categoria</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {totalLast3MonthsExpenses === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Dados insuficientes para análise</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryAnalysisData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1200}
                      >
                        {categoryAnalysisData.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={entry.color}
                            className="hover:opacity-80 transition-opacity duration-200"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categoryAnalysisData.slice(0, 5).map((item, index) => {
                    const percentage = ((item.value / totalLast3MonthsExpenses) * 100).toFixed(1)
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-card-foreground text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-card-foreground text-sm">R$ {item.value.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card className="group bg-gradient-to-br from-slate-800 to-gray-900 text-white border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-right-4 duration-700 delay-600">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg shadow-md">
                <AnimatedIcon icon={DollarSign} />
              </div>
              <span className="hidden sm:inline">Resumo Financeiro</span>
              <span className="sm:hidden">Resumo</span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">Visão geral do mês selecionado</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Métricas principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-700">
                  <div className="text-xl sm:text-2xl font-bold">
                    R$ {monthlyInOutData[monthlyInOutData.length - 1]?.entradas.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-sm text-gray-300">Entradas</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300 animate-in fade-in-0 slide-in-from-right-2 duration-500 delay-800">
                  <div className="text-xl sm:text-2xl font-bold">
                    R$ {monthlyInOutData[monthlyInOutData.length - 1]?.saidas.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-sm text-gray-300">Saídas</div>
                </div>
              </div>
              {/* Saldo atual */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300 animate-in fade-in-0 zoom-in-95 duration-500 delay-900">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  R$ {monthlyBalanceData[monthlyBalanceData.length - 1]?.saldo.toFixed(2) || "0.00"}
                </div>
                <div className="text-gray-300">Saldo do Mês</div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {(monthlyBalanceData[monthlyBalanceData.length - 1]?.saldo || 0) >= 0 ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-300" />
                      <span className="text-green-300">Positivo</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-red-300" />
                      <span className="text-red-300">Negativo</span>
                    </>
                  )}
                </div>
              </div>
              {/* Estatísticas adicionais */}
              <div className="space-y-3">
                {[
                  { label: "Categorias ativas:", value: categoryExpensesData.length },
                  { label: "Maior gasto:", value: `R$ ${topExpensesData[0]?.valor.toFixed(2) || "0.00"}` },
                  {
                    label: "Média diária:",
                    value: `R$ ${(totalCurrentMonthExpenses / new Date(currentYear, currentMonth + 1, 0).getDate()).toFixed(2)}`,
                  },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="flex justify-between items-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${1000 + index * 100}ms` }}
                  >
                    <span className="text-gray-300">{stat.label}</span>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Última linha - Projeção futura */}
      <Card className="group bg-card border shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-card-foreground">
            <div className="p-2 bg-muted rounded-lg shadow-md">
              <AnimatedIcon icon={DollarSign} />
            </div>
            <span className="hidden sm:inline">Projeção de Gastos Futuros</span>
            <span className="sm:hidden">Projeção Futura</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Previsão de despesas fixas e parceladas para os próximos 12 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={350} minWidth={600}>
            <BarChart data={futureExpensesProjectionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="fixedExpenses"
                name="Despesas Fixas"
                stackId="a"
                fill="url(#projectionGradient1)"
                radius={[0, 0, 0, 0]}
                animationDuration={1200}
              />
              <Bar
                dataKey="installments"
                name="Parcelas"
                stackId="a"
                fill="url(#projectionGradient2)"
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
                animationBegin={200}
              />
              <defs>
                <linearGradient id="projectionGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.orange[1]} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={CHART_COLORS.orange[1]} stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="projectionGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.purple[1]} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={CHART_COLORS.purple[1]} stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
