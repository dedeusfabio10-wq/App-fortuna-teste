/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense'; // 'income' = entrada, 'expense' = saída
  category: string;
  costType: 'fixed' | 'variable' | 'none'; // 'fixed' = custo fixo, 'variable' = custo variável, 'none' = para entradas
  date: string; // formato YYYY-MM-DD
}

export interface SavingsGoal {
  targetAmount: number; // Meta total acumulada (ex: R$ 10.000,00)
  monthlyTarget: number; // Meta mensal de economia (ex: R$ 600,00)
  initialSavings: number; // Valor guardado inicial (se o usuário já tiver algum valor no começo)
  startMonth?: string; // Mês inicial de referência/partida (ex: "2026-06")
}

export interface AssistantTip {
  title: string;
  text: string;
  type: 'success' | 'warning' | 'info' | 'tip';
}

export interface AssistantAnalysis {
  tips: AssistantTip[];
  summary: string;
}
