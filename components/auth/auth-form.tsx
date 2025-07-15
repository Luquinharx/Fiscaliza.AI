"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const { signIn, signUp, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      await signIn(email, password)
    } else {
      await signUp(email, password)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
      {/* Background elements with parallax effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="relative z-10 w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center p-6 border-b border-white/10">
          <CardTitle className="text-3xl font-bold text-white mb-2 animate-in slide-in-from-top-4 duration-700">
            {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
          </CardTitle>
          <CardDescription className="text-gray-200 animate-in fade-in duration-700 delay-100">
            {isLogin ? "Faça login para acessar sua dashboard." : "Junte-se a nós e comece a gerenciar suas finanças."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="space-y-4">
              <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                <Label htmlFor="email" className="text-gray-200 text-sm font-medium mb-1 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                />
              </div>
              <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                <Label htmlFor="password" className="text-gray-200 text-sm font-medium mb-1 block">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                />
              </div>
            </div>
            <Button
              type="submit"
              className={cn(
                "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl",
                "animate-in fade-in zoom-in-95 duration-700 delay-400",
                loading && "opacity-70 cursor-not-allowed",
              )}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Entrando..." : "Cadastrando..."}
                </>
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-gray-300 animate-in fade-in duration-700 delay-500">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-300 hover:text-blue-100 transition-colors duration-300 p-0 h-auto"
              disabled={loading}
            >
              {isLogin ? "Cadastre-se" : "Faça login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
