export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-2">Acesso Negado</h1>
      <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
    </div>
  );
}
