import { useState } from "react"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  Receipt, 
  Settings,
  LogOut,
  Armchair,
  BookOpen,
  Warehouse,
  PlusCircle,
  Soup,
  Table,
  Map,
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import LanguageSelector from './LanguageSelector'

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

export function AppSidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const navigationItems = [
    { path: '/', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { path: '/pos', icon: ShoppingCart, label: t('sidebar.pos') },
    { path: '/orders', icon: Receipt, label: t('sidebar.orders') },
    { path: '/tables', icon: Table, label: t('sidebar.tables') },
    { path: '/floor-plan', icon: Map, label: t('sidebar.floorPlan') },
    { path: '/kitchen', icon: Soup, label: t('sidebar.kitchenDisplay') },
    { path: '/menu', icon: Receipt, label: t('sidebar.menu') },
    { path: '/inventory', icon: Package, label: t('sidebar.inventory') },
    { path: '/reports', icon: TrendingUp, label: t('sidebar.reports') },
    { path: '/staff', icon: Users, label: t('sidebar.staff') },
    { path: '/customers', icon: Users, label: t('sidebar.customers', 'Customers') },
    { path: '/integrations/delivery', icon: Warehouse, label: t('sidebar.delivery', 'Delivery Integrations') },
    { path: '/settings', icon: Settings, label: t('sidebar.settings') }
  ]

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
          <SidebarGroupLabel>{t('sidebar.navigation', 'Navigation')}</SidebarGroupLabel>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')}>
              <NavLink to="/settings" className={getNavCls}>
                <Settings className="h-5 w-5" />
                <span>{t('sidebar.settings')}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span>{t('sidebar.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
