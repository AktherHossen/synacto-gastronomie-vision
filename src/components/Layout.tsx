import { useTranslation } from 'react-i18next';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import LanguageSelector from './LanguageSelector'

export function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if we're on the dashboard route
  const isDashboard = location.pathname === "/"

  const getPageTitle = () => {
    switch(location.pathname) {
        case "/": return t('layout.dashboard');
        case "/orders": return t('layout.orders');
        case "/menu": return t('layout.menu_management');
        case "/inventory": return t('layout.inventory');
        case "/reports": return t('layout.reports');
        case "/staff": return t('layout.staff_management');
        case "/settings": return t('layout.settings');
        case "/pos": return t('layout.pos');
        default: return "Synacto";
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h2>
                {isDashboard && <p className="text-sm text-gray-600">{t('layout.welcome_back')}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-gray-50/50">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
