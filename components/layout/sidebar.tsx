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

const NAV_ITEMS = [
  { label: "Dashboard", value: "dashboard", icon: Home, animation: "bounce" },
  { label: "Transações", value: "transactions", icon: ListChecks, animation: "shake" },
  { label: "Histórico", value: "history", icon: History, animation: "spin" },
  { label: "Categorias", value: "categories", icon: Settings, animation: "pulse" },
  { label: "Fixas", value: "fixed-expenses", icon: CreditCard, animation: "swing" },
  { label: "Futuras", value: "future-expenses", icon: CalendarClock, animation: "wiggle" },
  { label: "Sair", value: "logout", icon: LogOut, animation: "slide" },
]

interface AppSidebarProps {
  activeTab: string
  onNavigate: (value: string) => void
}

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <div className="flex justify-end p-2">
      <button
        onClick={toggleSidebar}
        className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors duration-200"
      >
        <ChevronLeft
          className={`h-4 w-4 transition-transform duration-300 ${state === "collapsed" ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  )
}

export function AppSidebar({ activeTab, onNavigate }: AppSidebarProps) {
  const handleNavigation = (value: string) => {
    if (value === "logout") {
      console.log("Logout clicked")
      return
    }
    onNavigate(value)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 hover:bg-blue-700">
            <DollarSign className="w-4 h-4 text-white transition-all duration-300" />
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground">FinanceApp</h2>
            <p className="text-xs text-sidebar-foreground/70">Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarToggle />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item, index) => (
                <SidebarMenuItem
                  key={item.value}
                  className="animate-in slide-in-from-left-2 fade-in-0 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.value}
                    onClick={() => handleNavigation(item.value)}
                  >
                    <button className="w-full group/button">
                      <item.icon
                        className={`w-4 h-4 transition-all duration-300 ${
                          item.animation === "bounce"
                            ? "group-hover/button:animate-bounce"
                            : item.animation === "shake"
                              ? "group-hover/button:animate-pulse group-hover/button:translate-x-1"
                              : item.animation === "spin"
                                ? "group-hover/button:animate-spin"
                                : item.animation === "pulse"
                                  ? "group-hover/button:animate-pulse group-hover/button:scale-110"
                                  : item.animation === "swing"
                                    ? "group-hover/button:rotate-12 group-hover/button:scale-110"
                                    : item.animation === "wiggle"
                                      ? "group-hover/button:animate-bounce group-hover/button:rotate-6"
                                      : item.animation === "slide"
                                        ? "group-hover/button:translate-x-2 group-hover/button:text-red-500"
                                        : ""
                        } group-hover/button:text-blue-600`}
                      />
                      <span className="transition-colors duration-200 group-hover/button:text-blue-700">
                        {item.label}
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
  <div className="text-xs text-sidebar-foreground/70 text-center p-2">
    <p>Sistema Financeiro</p>
    <p className="mt-1">v2.0.1</p>
  </div>
</SidebarFooter>

<SidebarRail>
  <SidebarToggle />
</SidebarRail>

    </Sidebar>
  )
}
