"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useTransactions } from "@/hooks/use-transactions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

export function TransactionHistory() {
  const { transactions, loadingTransactions, transactionsError } = useTransactions()

  if (loadingTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico Completo de Transações</CardTitle>
          <CardDescription>Todas as suas transações em ordem cronológica inversa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>
        </CardContent>
      </Card>
    )
  }

  if (transactionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico Completo de Transações</CardTitle>
          <CardDescription>Todas as suas transações em ordem cronológica inversa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">Erro ao carregar histórico: {transactionsError}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Completo de Transações</CardTitle>
        <CardDescription>Todas as suas transações em ordem cronológica inversa.</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhuma transação registrada no histórico.</div>
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
