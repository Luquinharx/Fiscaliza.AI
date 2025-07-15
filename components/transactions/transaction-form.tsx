"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTransactions, type Transaction } from "@/hooks/use-transactions"
import { useCategories } from "@/hooks/use-categories"
import { toast } from "@/hooks/use-toast"

interface TransactionFormProps {
  transactionToEdit?: Transaction | null
  onFinish?: () => void
}

export function TransactionForm({ transactionToEdit = null, onFinish }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions()
  const { categories, loadingCategories } = useCategories()

  const [descricao, setDescricao] = useState(transactionToEdit?.descricao || "")
  const [valor, setValor] = useState(transactionToEdit?.valor.toString() || "")
  const [tipo, setTipo] = useState<"entrada" | "saida">(transactionToEdit?.tipo || "saida")
  const [data, setData] = useState<Date | undefined>(
    transactionToEdit?.data ? new Date(transactionToEdit.data) : new Date(),
  )
  const [categoria, setCategoria] = useState(transactionToEdit?.categoria || "")
  const [isParcelado, setIsParcelado] = useState(!!transactionToEdit?.parcelas)
  const [parcelasAtuais, setParcelasAtuais] = useState(transactionToEdit?.parcelas?.atual.toString() || "1")
  const [parcelasTotal, setParcelasTotal] = useState(transactionToEdit?.parcelas?.total.toString() || "1")

  useEffect(() => {
    if (transactionToEdit) {
      setDescricao(transactionToEdit.descricao)
      setValor(transactionToEdit.valor.toString())
      setTipo(transactionToEdit.tipo)
      setData(new Date(transactionToEdit.data))
      setCategoria(transactionToEdit.categoria)
      setIsParcelado(!!transactionToEdit.parcelas)
      setParcelasAtuais(transactionToEdit.parcelas?.atual.toString() || "1")
      setParcelasTotal(transactionToEdit.parcelas?.total.toString() || "1")
    } else {
      // Reset form for new transaction
      setDescricao("")
      setValor("")
      setTipo("saida")
      setData(new Date())
      setCategoria("")
      setIsParcelado(false)
      setParcelasAtuais("1")
      setParcelasTotal("1")
    }
  }, [transactionToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!descricao || !valor || !data || !categoria) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const transactionValue = Number.parseFloat(valor)
    if (isNaN(transactionValue) || transactionValue <= 0) {
      toast({
        title: "Erro de Validação",
        description: "O valor deve ser um número positivo.",
        variant: "destructive",
      })
      return
    }

    const newTransaction: Omit<Transaction, "id" | "userId"> = {
      descricao,
      valor: transactionValue,
      tipo,
      data: format(data, "yyyy-MM-dd"),
      categoria,
    }

    if (isParcelado) {
      const current = Number.parseInt(parcelasAtuais)
      const total = Number.parseInt(parcelasTotal)
      if (isNaN(current) || isNaN(total) || current <= 0 || total <= 0 || current > total) {
        toast({
          title: "Erro de Validação",
          description: "As parcelas devem ser números válidos (atual <= total).",
          variant: "destructive",
        })
        return
      }
      newTransaction.parcelas = { atual: current, total: total }
    }

    if (transactionToEdit && transactionToEdit.id) {
      await updateTransaction(transactionToEdit.id, newTransaction)
    } else {
      await addTransaction(newTransaction)
    }

    if (onFinish) {
      onFinish()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transactionToEdit ? "Editar Transação" : "Nova Transação"}</CardTitle>
        <CardDescription>
          {transactionToEdit ? "Atualize os detalhes da transação." : "Adicione uma nova entrada ou saída financeira."}
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
                placeholder="Ex: Compras no supermercado"
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
              <Label htmlFor="tipo" className="text-sm font-medium">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select value={tipo} onValueChange={(value: "entrada" | "saida") => setTipo(value)} required>
                <SelectTrigger 
                  id="tipo"
                  className={cn(
                    "transition-colors",
                    !tipo && "border-red-200 focus:border-red-400"
                  )}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data" className="text-sm font-medium">
                Data <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal transition-colors",
                      !data && "text-muted-foreground border-red-200"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={data} onSelect={setData} initialFocus locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="parcelado"
              checked={isParcelado}
              onCheckedChange={(checked: boolean) => setIsParcelado(checked)}
            />
            <Label htmlFor="parcelado">Transação Parcelada</Label>
          </div>

          {isParcelado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parcelas-atuais" className="text-sm font-medium">
                  Parcela Atual <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parcelas-atuais"
                  type="number"
                  min="1"
                  value={parcelasAtuais}
                  onChange={(e) => setParcelasAtuais(e.target.value)}
                  required={isParcelado}
                  className={cn(
                    "transition-colors",
                    isParcelado && !parcelasAtuais && "border-red-200 focus:border-red-400"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parcelas-total" className="text-sm font-medium">
                  Total de Parcelas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parcelas-total"
                  type="number"
                  min="1"
                  value={parcelasTotal}
                  onChange={(e) => setParcelasTotal(e.target.value)}
                  required={isParcelado}
                  className={cn(
                    "transition-colors",
                    isParcelado && !parcelasTotal && "border-red-200 focus:border-red-400"
                  )}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            {transactionToEdit ? "Atualizar Transação" : "Adicionar Transação"}
          </Button>
          {transactionToEdit && (
            <Button type="button" variant="outline" onClick={onFinish} className="w-full mt-2 bg-transparent">
              Cancelar Edição
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
