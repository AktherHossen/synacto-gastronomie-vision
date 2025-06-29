import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if we're on the dashboard route
  const isDashboard = location.pathname === "/"

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
                {isDashboard ? (
                  <>
                    <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-600">Welcome back! Here's what's happening today.</p>
                  </>
                ) : (
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {location.pathname === "/orders" && "Orders"}
                    {location.pathname === "/menu" && "Menu Management"}
                    {location.pathname === "/inventory" && "Inventory"}
                    {location.pathname === "/reports" && "Reports"}
                    {location.pathname === "/staff" && "Staff Management"}
                    {location.pathname === "/settings" && "Settings"}
                    {location.pathname === "/pos" && "Point of Sale"}
                  </h2>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="text-white font-medium"
                style={{ backgroundColor: '#406AFF' }}
                onClick={() => navigate('/orders')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
