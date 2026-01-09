export const TRANSACTION_STATUS: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  REQUESTED: {
    label: "Enviado",
    className: "bg-yellow-100 text-yellow-800",
  },
  PENDING: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800",
  },
  ACCEPTED: {
    label: "Aceite",
    className: "bg-green-100 text-green-800",
  },
  REJECTED: {
    label: "Rejeitado",
    className: "bg-red-100 text-red-800",
  },
  RETURNED: {
    label: "Devolvido",
    className: "bg-blue-100 text-blue-800",
  },
};
