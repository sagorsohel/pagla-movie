import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="light bg-slate-50 text-slate-900">
        <AppSidebar />
        <SidebarInset className="bg-slate-50 text-slate-900 border-slate-200">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-2xs">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-slate-700 hover:text-slate-900" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 bg-slate-200"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard" className="text-slate-500 hover:text-slate-900 font-semibold">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-slate-400" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-slate-900 font-bold">Admin Control Panel</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex-1 p-6 bg-slate-50 text-slate-900">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
