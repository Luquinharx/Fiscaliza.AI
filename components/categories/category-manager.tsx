"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCategories } from "@/hooks/use-categories"
import { Plus, Edit, Trash2 } from "lucide-react"
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
import type { Category } from "@/hooks/use-categories"
import { toast } from "@/hooks/use-toast"

export function CategoryManager() {
  const { categories, loadingCategories, categoriesError, addCategory, updateCategory, deleteCategory } =
    useCategories()
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#000000")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === "") {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode ser vazio.",
        variant: "destructive",
      })
      return
    }
    await addCategory({ nome: newCategoryName, cor: newCategoryColor })
    setNewCategoryName("")
    setNewCategoryColor("#000000")
  }

  const handleUpdateCategory = async () => {
    if (editingCategory && editingCategory.id) {
      if (editingCategory.nome.trim() === "") {
        toast({
          title: "Erro",
          description: "O nome da categoria não pode ser vazio.",
          variant: "destructive",
        })
        return
      }
      await updateCategory(editingCategory.id, { nome: editingCategory.nome, cor: editingCategory.cor })
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id)
  }

  if (loadingCategories) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Categorias</CardTitle>
          <CardDescription>Adicione, edite ou remova suas categorias de transação.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando categorias...</div>
        </CardContent>
      </Card>
    )
  }

  if (categoriesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Categorias</CardTitle>
          <CardDescription>Adicione, edite ou remova suas categorias de transação.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">Erro ao carregar categorias: {categoriesError}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Categorias</CardTitle>
        <CardDescription>Adicione, edite ou remova suas categorias de transação.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-sm font-medium">
                Nome da Categoria <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder="Ex: Alimentação"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={cn(
                  "transition-colors",
                  !newCategoryName && "border-red-200 focus:border-red-400"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color" className="text-sm font-medium">
                Cor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-color"
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="h-10 w-full"
              />
            </div>
            <Button onClick={handleAddCategory} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Categoria
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Nenhuma categoria registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {editingCategory?.id === category.id ? (
                          <Input
                            value={editingCategory.nome}
                            onChange={(e) => setEditingCategory({ ...editingCategory, nome: e.target.value })}
                            className="min-w-[150px]"
                          />
                        ) : (
                          category.nome
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCategory?.id === category.id ? (
                          <Input
                            type="color"
                            value={editingCategory.cor}
                            onChange={(e) => setEditingCategory({ ...editingCategory, cor: e.target.value })}
                            className="h-8 w-16"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: category.cor }} />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {editingCategory?.id === category.id ? (
                            <Button variant="outline" size="sm" onClick={handleUpdateCategory}>
                              Salvar
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          )}
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
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.id!)}>
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
