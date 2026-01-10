import cron from "node-cron";
import { penalizeOverdueUsers } from "@/services/userScore.service";

// Executa todo dia à meia-noite
export function startUserScorePenaltyJob() {
    cron.schedule("0 0 * * *", async () => {
        console.log("Iniciando job de penalização de usuários com livros atrasados...");
        try {
            await penalizeOverdueUsers();
            console.log("Job de penalização concluído com sucesso.");
        } catch (error) {
            console.error("Erro ao executar job de penalização:", error);
        }   
    });
}