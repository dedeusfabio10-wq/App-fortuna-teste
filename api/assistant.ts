import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
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

export default async function handler(req: any, res: any) {
  // CORS Headers support for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactions, savingsGoal, currentBalance, currentSavings } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        summary: "Parece que a chave da API do Gemini não está configurada nas variáveis de ambiente da Vercel (GEMINI_API_KEY). Adicione-a nas configurações do seu projeto na Vercel para liberar as dicas da Inteligência Artificial em tempo real!",
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
    return res.status(200).json(resultJson);

  } catch (error: any) {
    console.error("Erro no assistente financeiro do Gemini na Vercel:", error);
    res.status(500).json({ 
      error: "Ocorreu um erro ao processar sua solicitação no assistente de IA.",
      details: error.message 
    });
  }
}
