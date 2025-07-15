"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTransactions } from "@/hooks/use-transactions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowUpRight, ArrowDownLeft, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { TransactionForm } from "./transaction-form"
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
import type { Transaction } from "@/hooks/use-transactions"

export function TransactionList() {
  const { transactions, loadingTransactions, transactionsError, deleteTransaction } = useTransactions()
  const [isEditing, setIsEditing] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)

  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    await deleteTransaction(id)
  }

  if (loadingTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>Todas as suas transações.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando transações...</div>
        </CardContent>
      </Card>
    )
  }

  if (transactionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>Todas as suas transações.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">Erro ao carregar transações: {transactionsError}</div>
        </CardContent>
      </Card>
    )
  }

  if (isEditing) {
    return <TransactionForm transactionToEdit={currentTransaction} onFinish={() => setIsEditing(false)} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Transações</CardTitle>
        <CardDescription>Todas as suas transações.</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhuma transação registrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.descricao}</TableCell>
                    <TableCell className={transaction.tipo === "entrada" ? "text-green-600" : "text-red-600"}>
                      {transaction.tipo === "entrada" ? (
                        <ArrowUpRight className="inline-block h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownLeft className="inline-block h-4 w-4 mr-1" />
                      )}
                      R$ {transaction.valor.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.tipo === "entrada" ? "default" : "destructive"}>
                        {transaction.tipo === "entrada" ? "Entrada" : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(transaction.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{transaction.categoria}</TableCell>
                    <TableCell>
                      {transaction.parcelas ? `${transaction.parcelas.atual}/${transaction.parcelas.total}` : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
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
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente sua transação.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(transaction.id!)}>
                                Deletar
                              </AlertDialogAction>
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
