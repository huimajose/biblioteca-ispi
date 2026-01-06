import { User, BookOpen, History,  Library } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"


const items = [
    {
        img: User,
        route: "/user",
        text: "Informações do Usuário",
    },
    {
        img: BookOpen,
        route: "/user/books",
        text: "Explorar",
    },
    {
        img: History,
        route: "/user/transactions",
        text: "Requisições",
    },
    {
        img: Library,
        route: "/user/borrowings",
        text: "Minha estante",
    },
];

const UserSidebar = () => {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-green-600 text-sm bold uppercase tracking-wide">
                            Biblioteca Digital</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem className="text-green-600" key={item.text}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.route}>
                                                <item.img />
                                                <span>{item.text}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}

export default UserSidebar; 