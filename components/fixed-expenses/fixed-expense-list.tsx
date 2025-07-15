"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFixedExpenses, type FixedExpense } from "@/hooks/use-fixed-expenses"
import { Edit, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { FixedExpenseForm } from "./fixed-expense-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function FixedExpenseList() {
  const { fixedExpenses, loadingFixedExpenses, fixedExpensesError, deleteFixedExpense } = useFixedExpenses()
  const [isEditing, setIsEditing] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<FixedExpense | null>(null)

  const handleEdit = (expense: FixedExpense) => {
    setCurrentExpense(expense)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    await deleteFixedExpense(id)
  }

  if (loadingFixedExpenses) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas Fixas</CardTitle>
          <CardDescription>Todas as suas despesas fixas cadastradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando despesas fixas...</div>
        </CardContent>
      </Card>
    )
  }

  if (fixedExpensesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas Fixas</CardTitle>
          <CardDescription>Todas as suas despesas fixas cadastradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">Erro ao carregar despesas fixas: {fixedExpensesError}</div>
        </CardContent>
      </Card>
    )
  }

  if (isEditing) {
    return <FixedExpenseForm expenseToEdit={currentExpense} onFinish={() => setIsEditing(false)} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Despesas Fixas</CardTitle>
        <CardDescription>Todas as suas despesas fixas cadastradas.</CardDescription>
      </CardHeader>
      <CardContent>
        {fixedExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhuma despesa fixa registrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Dia do Mês</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.descricao}</TableCell>
                    <TableCell>R$ {expense.valor.toFixed(2)}</TableCell>
                    <TableCell>{expense.diaDoMes}</TableCell>
                    <TableCell>{expense.categoria}</TableCell>
                    <TableCell>
                      <Badge variant={expense.ativo ? "default" : "secondary"}>
                        {expense.ativo ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {expense.ativo ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Deletar</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente sua despesa fixa.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(expense.id!)}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
