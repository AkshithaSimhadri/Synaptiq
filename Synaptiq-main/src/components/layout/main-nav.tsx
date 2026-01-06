
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  User,
  ListTodo,
  BookCheck,
  HeartPulse,
  Bed,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/study-planner", icon: BookCheck, label: "Study Planner" },
  { href: "/tasks", icon: ListTodo, label: "To-Do List" },
  { href: "/career", icon: BrainCircuit, label: "Career" },
  { href: "/habits", icon: HeartPulse, label: "Habit Tracker" },
  { href: "/sleep-coach", icon: Bed, label: "Sleep Coach" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="p-2">
      <SidebarMenu>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} className="block">
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={link.label}
                  className="justify-start w-full"
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
