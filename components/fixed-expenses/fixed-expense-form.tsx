"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useFixedExpenses, type FixedExpense } from "@/hooks/use-fixed-expenses"
import { useCategories } from "@/hooks/use-categories"
import { toast } from "@/hooks/use-toast"

interface FixedExpenseFormProps {
  expenseToEdit?: FixedExpense | null
  onFinish?: () => void
}

export function FixedExpenseForm({ expenseToEdit = null, onFinish }: FixedExpenseFormProps) {
  const { addFixedExpense, updateFixedExpense } = useFixedExpenses()
  const { categories, loadingCategories } = useCategories()

  const [descricao, setDescricao] = useState(expenseToEdit?.descricao || "")
  const [valor, setValor] = useState(expenseToEdit?.valor.toString() || "")
  const [diaDoMes, setDiaDoMes] = useState(expenseToEdit?.diaDoMes.toString() || "1")
  const [categoria, setCategoria] = useState(expenseToEdit?.categoria || "")
  const [ativo, setAtivo] = useState(expenseToEdit?.ativo ?? true)

  useEffect(() => {
    if (expenseToEdit) {
      setDescricao(expenseToEdit.descricao)
      setValor(expenseToEdit.valor.toString())
      setDiaDoMes(expenseToEdit.diaDoMes.toString())
      setCategoria(expenseToEdit.categoria)
      setAtivo(expenseToEdit.ativo)
    } else {
      // Reset form for new expense
      setDescricao("")
      setValor("")
      setDiaDoMes("1")
      setCategoria("")
      setAtivo(true)
    }
  }, [expenseToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!descricao || !valor || !diaDoMes || !categoria) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const expenseValue = Number.parseFloat(valor)
    const dayOfMonth = Number.parseInt(diaDoMes)

    if (isNaN(expenseValue) || expenseValue <= 0) {
      toast({
        title: "Erro de Validação",
        description: "O valor deve ser um número positivo.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      toast({
        title: "Erro de Validação",
        description: "O dia do mês deve ser um número entre 1 e 31.",
        variant: "destructive",
      })
      return
    }

    const newFixedExpense: Omit<FixedExpense, "id" | "userId"> = {
      descricao,
      valor: expenseValue,
      diaDoMes: dayOfMonth,
      categoria,
      ativo,
    }

    if (expenseToEdit && expenseToEdit.id) {
      await updateFixedExpense(expenseToEdit.id, newFixedExpense)
    } else {
      await addFixedExpense(newFixedExpense)
    }

    if (onFinish) {
      onFinish()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expenseToEdit ? "Editar Despesa Fixa" : "Nova Despesa Fixa"}</CardTitle>
        <CardDescription>
          {expenseToEdit
            ? "Atualize os detalhes da despesa fixa."
            : "Adicione uma nova despesa que se repete mensalmente."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Input
                id="descricao"
                placeholder="Ex: Aluguel, Mensalidade da academia"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                className={cn(
                  "transition-colors",
                  !descricao && "border-red-200 focus:border-red-400"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-medium">
                Valor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className={cn(
                  "transition-colors",
                  !valor && "border-red-200 focus:border-red-400"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diaDoMes" className="text-sm font-medium">
                Dia do Mês para Pagamento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="diaDoMes"
                type="number"
                min="1"
                max="31"
                value={diaDoMes}
                onChange={(e) => setDiaDoMes(e.target.value)}
                required
                className={cn(
                  "transition-colors",
                  !diaDoMes && "border-red-200 focus:border-red-400"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm font-medium">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Select value={categoria} onValueChange={setCategoria} required disabled={loadingCategories}>
                <SelectTrigger 
                  id="categoria"
                  className={cn(
                    "transition-colors",
                    !categoria && "border-red-200 focus:border-red-400"
                  )}
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Carregando categorias...
                    </SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      Nenhuma categoria disponível. Adicione uma em "Categorias".
                    </SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nome}>
                        {cat.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="ativo" checked={ativo} onCheckedChange={(checked: boolean) => setAtivo(checked)} />
            <Label htmlFor="ativo">Ativo (incluir na projeção)</Label>
          </div>

          <Button type="submit" className="w-full">
            {expenseToEdit ? "Atualizar Despesa Fixa" : "Adicionar Despesa Fixa"}
          </Button>
          {expenseToEdit && (
            <Button type="button" variant="outline" onClick={onFinish} className="w-full mt-2 bg-transparent">
              Cancelar Edição
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
