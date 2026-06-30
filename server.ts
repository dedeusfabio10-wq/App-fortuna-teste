/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Inicializa o cliente do Gemini de forma preguiçosa (lazy) para evitar travamentos
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY não foi encontrado nas variáveis de ambiente.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Rota de Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint do Assistente Financeiro Inteligente
app.post("/api/assistant", async (req, res) => {
  try {
    const { transactions, savingsGoal, currentBalance, currentSavings } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Caso não haja chave de API, retorna dicas inteligentes estáticas para não quebrar a usabilidade do app
      return res.json({
        summary: "Parece que a chave da API do Gemini não está configurada nos segredos do projeto. Mas não se preocupe! Aqui estão algumas dicas gerais excelentes baseadas no seu perfil.",
        tips: [
          {
            title: "Mantenha o Foco nos R$ 600",
            text: "Para atingir R$ 10.000, economizar R$ 600 por mês é um excelente ritmo. Tente automatizar essa transferência assim que receber seu salário!",
            type: "success"
          },
          {
            title: "Cuidado com Custos Variáveis",
            text: "Os custos variáveis (como aplicativos de entrega, transporte por aplicativo e compras por impulso) costumam ser os maiores ralos de dinheiro. Tente estipular um limite semanal para eles.",
            type: "warning"
          },
          {
            title: "Negocie seus Custos Fixos",
            text: "Rever planos de internet, serviços de assinatura de streaming que você não usa e tarifas bancárias pode liberar uma boa fatia do seu orçamento mensal.",
            type: "tip"
          }
        ]
      });
    }

    const ai = getAiClient();

    // Formata os dados para o prompt
    const formattedTransactions = transactions && Array.isArray(transactions) 
      ? transactions.map((t: any) => `- ${t.date}: ${t.type === 'income' ? 'Entrada' : 'Saída'} (${t.costType === 'fixed' ? 'Fixo' : t.costType === 'variable' ? 'Variável' : 'N/A'}) de R$ ${t.amount.toFixed(2)} - ${t.description} [${t.category}]`).join('\n')
      : "Nenhuma transação cadastrada ainda.";

    const prompt = `
Você é um consultor financeiro pessoal extremamente amigável, acolhedor e focado em ajudar o usuário a economizar e organizar suas finanças.
O usuário está utilizando um app de controle financeiro com os seguintes dados atuais:
- Meta Total Acumulada: R$ ${(savingsGoal?.targetAmount || 10000).toFixed(2)}
- Meta Mensal de Economia: R$ ${(savingsGoal?.monthlyTarget || 600).toFixed(2)}
- Economias Acumuladas até o momento: R$ ${(currentSavings || 0).toFixed(2)}
- Saldo disponível este mês: R$ ${(currentBalance || 0).toFixed(2)}

Transações recentes cadastradas pelo usuário:
${formattedTransactions}

Por favor, analise a situação financeira dele e gere:
1. Um resumo motivador, amigável e direto em português que analise os hábitos de gastos dele (destacando a proporção de custos fixos vs variáveis se houver, e como ele está em relação à meta de economizar R$ 600,00 no mês atual).
2. Uma lista de 3 a 4 dicas práticas acionáveis específicas, classificadas por tipo:
   - 'success': Conquistas ou pontos positivos (ex: "Parabéns por manter seus custos fixos baixos").
   - 'warning': Alertas de risco (ex: "Seus custos variáveis com alimentação fora de casa estão altos").
   - 'tip': Dica de economia prática (ex: "Que tal trocar a assinatura X por uma mais barata?").
   - 'info': Informação útil de planejamento (ex: "Mantendo este ritmo, você alcançará os R$ 10.000 em X meses").

Retorne a resposta estritamente no formato JSON estruturado correspondente a este schema:
{
  "summary": "Texto resumido em português",
  "tips": [
    {
      "title": "Título Curto da Dica",
      "text": "Conteúdo detalhado da dica",
      "type": "success" | "warning" | "tip" | "info"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Um resumo geral acolhedor e focado na saúde financeira do usuário."
            },
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { 
                    type: Type.STRING,
                    description: "Deve ser um dos seguintes valores: 'success', 'warning', 'tip', 'info'"
                  }
                },
                required: ["title", "text", "type"]
              }
            }
          },
          required: ["summary", "tips"]
        }
      }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText.trim());
    return res.json(resultJson);

  } catch (error: any) {
    console.error("Erro no assistente financeiro do Gemini:", error);
    res.status(500).json({ 
      error: "Ocorreu um erro ao processar sua solicitação no assistente de IA.",
      details: error.message 
    });
  }
});

// Configuração do Vite middleware ou servir estáticos
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
