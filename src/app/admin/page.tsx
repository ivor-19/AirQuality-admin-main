"use client"

import { PollutantsDisplay } from "@/components/charts/PollutantsDisplay"
import { PollutantsRadar } from "@/components/charts/PollutantsRadar"
import { PollutantsTime } from "@/components/charts/PollutantsTime"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { ModeToggle } from "@/components/ModeToggle"
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
import { useAuth } from "../context/AuthContext"

export default function Admin() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 font-geist">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Analytics
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pollutants</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 pollutants-grid">
            <PollutantsRadar />
            <PollutantsDisplay />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <PollutantsTime />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
