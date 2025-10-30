"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AllUsersPage() {
  const [users, setUsers] = useState<any[]>([]);


  

  const fetchUsers = async () => {
    const res = await fetch("/api/admin");
    const data = await res.json();
    setUsers(data);
  };

  const changeRole = async (userId: string, newRole: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole }),
    });

    if (res.ok) fetchUsers();
    else console.error("Falha ao atualizar role");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  console.log("users verificados:", users)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Todos usuários</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Perfil</TableHead>
            <TableHead>Nome completo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Permissão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const role = user.role || "Estudante";
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <img src={user.profile} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
                </TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`capitalize ${role === "admin" ? "bg-green-300/80" : ""}`}
                      >
                        {role}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["Estudante", "admin", "User"].map((r) => (
                        <DropdownMenuItem key={r}>
                          <button
                            className={`w-full text-left ${r === role ? "font-semibold text-blue-500" : ""}`}
                            onClick={() => changeRole(user.id, r)}
                          >
                            {r}
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
}
