
import { useState } from "react"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  Receipt, 
  Settings,
  LogOut 
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/menu', icon: Receipt, label: 'Menu' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/reports', icon: TrendingUp, label: 'Reports' },
  { path: '/staff', icon: Users, label: 'Staff' },
  { path: '/settings', icon: Settings, label: 'Settings' }
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {/* Header */}
        <div className="flex items-center h-16 px-6 border-b">
          <h1 className="text-xl font-bold" style={{ color: '#6B2CF5' }}>Synacto POS</h1>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)}>
                      <NavLink to={item.path} className={getNavCls}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Abmelden
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
