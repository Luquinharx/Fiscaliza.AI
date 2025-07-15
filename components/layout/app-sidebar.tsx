"use client"
import {
  Home,
  ListChecks,
  History,
  Settings,
  CreditCard,
  CalendarClock,
  LogOut,
  DollarSign,
  ChevronLeft,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Dashboard", value: "dashboard", icon: Home },
  { label: "Transações", value: "transactions", icon: ListChecks },
  { label: "Histórico", value: "history", icon: History },
  { label: "Categorias", value: "settings", icon: Settings },
  { label: "Despesas Fixas", value: "fixed-expenses", icon: CreditCard },
  { label: "Gastos Futuros", value: "future-expenses", icon: CalendarClock },
  { label: "Sair", value: "logout", icon: LogOut },
]

interface AppSidebarProps {
  activeTab: string
  onNavigate: (value: string) => void
}

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <div className="flex justify-end px-2 pb-2">
      <button
        onClick={toggleSidebar}
        title={state === "collapsed" ? "Expandir" : "Recolher"}
        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors duration-200"
      >
        <ChevronLeft
          className={`h-5 w-5 transition-transform duration-300 ${state === "collapsed" ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  )
}

export function AppSidebar({ activeTab, onNavigate }: AppSidebarProps) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" side="left">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="justify-start">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <DollarSign className="size-4" />
              </div>
              <div className={cn("flex flex-col gap-0.5 leading-none", state === "collapsed" && "hidden")}>
                <span className="font-semibold">FinanceApp</span>
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarToggle />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(state === "collapsed" && "hidden")}>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.value}
                    tooltip={item.label}
                    onClick={() => onNavigate(item.value)}
                  >
                    <a href="#">
                      <item.icon />
                      <span className={cn(state === "collapsed" && "hidden")}>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className={cn("text-xs text-muted-foreground text-center", state === "collapsed" && "hidden")}>
          <p>Sistema Financeiro</p>
          <p className="mt-1">v2.0.1</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
