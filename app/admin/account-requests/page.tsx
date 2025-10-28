// app/admin/account-requests/AccountRequestsClient.tsx (Client-side component)

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableRow, TableCell, TableBody, TableHeader, TableHead} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { acceptUser, getVerifyPendingWithClerk, rejectUser, syncClerkToVerifyPending } from "./server";

const AccountRequestsClient = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [dialogType, setDialogType] = useState<'accept' | 'reject' | null>(null);

  const loadData = async () => {
    const data = await getVerifyPendingWithClerk();
    setPendingUsers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle accepting or rejecting a user
  const handleConfirm = async () => {
    if (!selectedUser) return;

    if (dialogType === "accept") {
      await acceptUser(selectedUser.clerkId, selectedUser.email);
    } else if (dialogType === "reject") {
      await rejectUser(selectedUser.clerkId);
    }

    setSelectedUser(null);
    setDialogType(null);
    
    loadData();
  };

  useEffect(() => {
  const sync = async () => {
    await syncClerkToVerifyPending();
    loadData();
  };
  sync();
}, []);


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Pedidos de contas</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Perfil</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ação</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pendingUsers.length > 0 ? (
            pendingUsers.map((user) => (
              <TableRow key={user.clerkId}>
                <TableCell>
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="flex gap-2">
                  {/* Accept Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          setSelectedUser(user);
                          setDialogType('accept');
                        }}
                      >
                        Aceitar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Aceitar esse usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Certeza que quer aprovar este usuário <strong>{user.email}</strong>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleConfirm()}>
                          Sim, Aceitar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Reject Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-red-500 hover:bg-red-600"
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setDialogType('reject');
                        }}
                      >
                        Rejeitar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rejeitar este user?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Certeza que quer rejeitar este <strong>{user.email}</strong>? essa ação não volta.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleConfirm()}>
                          Sim, Rejeitar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
               Nenhum pedido de aprovação de usuários.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AccountRequestsClient;
