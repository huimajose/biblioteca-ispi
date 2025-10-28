"use client";

import { useState, useEffect } from "react";
import { fetchUsers, changeRole, getUsersWithClerk } from "./server"; // import server-side logic
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [users, setUsers] = useState<any[]>([]);

  // Function to fetch users
  const getUsers = async () => {
    const fetchedUsers = await getUsersWithClerk(); // Call the server function
    const sortedUsers = fetchedUsers.sort((a: any, b: any) => {
      const roleA = a.role || "Estudante";
      const roleB = b.role || "Estudante";
      return roleA === "admin" && roleB !== "admin" ? -1 : roleA !== "admin" && roleB === "admin" ? 1 : 0;
    });

    setUsers(sortedUsers); // Update the state with fetched data
  };

  console.log("User encontrados: ",users)
  // Fetch users on component mount
  useEffect(() => {
    getUsers();
  }, []); // Empty dependency array means it runs only once when the component mounts

  // Handle role change and refetch updated users
const handleRoleChange = async (userId: string, newRole: string) => {
  try {
    await changeRole(userId, newRole);
    getUsers();
  } catch (error) {
    console.error("Erro ao mudar role:", error);
  }
};


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Todos usuários</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Perfil</TableHead>
            <TableHead>Nome completo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>permissão</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const role = user.role || "Estudante";
            const uniqueKey = `${user.id}-${user.email}`; // Create a unique key

            return (
              <TableRow key={uniqueKey}>
                <TableCell>
                  <img src={user.profile} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
                </TableCell>
                <TableCell>{user.fullName || "-"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {role === "admin" ? (
                        <Button variant="outline" className="capitalize flex items-center gap-2 min-w-[80px] bg-green-300/80">
                          {String(role)}
                        </Button>
                      ) : (
                        <Button variant="outline" className="capitalize flex items-center gap-2 min-w-[80px] ">
                          {String(role)}
                        </Button>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["Estudante", "admin"].map((r) => (
                        <DropdownMenuItem asChild key={`${uniqueKey}-${r}`}>
                          <button
                            type="button"
                            className={`w-full text-left ${r === role ? "font-semibold text-blue-500" : ""}`}
                            onClick={() => handleRoleChange(user.id, r)}
                          >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </button>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
