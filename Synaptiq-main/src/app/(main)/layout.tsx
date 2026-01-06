
import { UserNav } from "@/components/layout/user-nav";
import { MainNav } from "@/components/layout/main-nav";
import { Icons } from "@/components/icons";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { AppDataProvider } from "@/context/app-data-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDataProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <Icons.logo className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold transition-all duration-200 font-headline text-gradient group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0">UniLife AI</h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b md:px-6">
             <SidebarTrigger className="md:hidden" />
             <div className="flex-1" />
             <ClientOnly>
              <UserNav />
             </ClientOnly>
          </header>
          <main className="flex flex-1">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppDataProvider>
  );
}
