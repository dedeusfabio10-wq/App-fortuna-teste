/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BrainCircuit, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, Compass, Loader2 } from 'lucide-react';
import { Transaction, SavingsGoal, AssistantTip, AssistantAnalysis } from '../types';

interface FinancialAssistantProps {
  transactions: Transaction[];
  savingsGoal: SavingsGoal;
  currentMonth: string; // Ex: "2026-06"
}

export default function FinancialAssistant({ transactions, savingsGoal, currentMonth }: FinancialAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AssistantAnalysis | null>(null);
  const [localTips, setLocalTips] = useState<AssistantTip[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Calcular métricas básicas do mês atual para regras locais de feedback rápido
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const fixed = monthTransactions.filter(t => t.type === 'expense' && t.costType === 'fixed').reduce((acc, c) => acc + c.amount, 0);
  const variable = monthTransactions.filter(t => t.type === 'expense' && t.costType === 'variable').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = fixed + variable;
  const currentSaved = income - totalExpense;

  // Gerar dicas locais baseadas nas regras de finanças
  useEffect(() => {
    const tips: AssistantTip[] = [];

    // Regra 1: Progresso do mês em relação à meta de R$ 600
    if (currentSaved >= savingsGoal.monthlyTarget) {
      tips.push({
        title: 'Meta Mensal Atingida! 🎉',
        text: `Excelente! Você já economizou ${currentSaved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} este mês, superando a meta de R$ 600,00! Continue guardando esse excedente para atingir os R$ 10.000 mais rápido.`,
        type: 'success',
      });
    } else if (currentSaved > 0) {
      const rest = savingsGoal.monthlyTarget - currentSaved;
      tips.push({
        title: 'Falta pouco para a meta de R$ 600!',
        text: `Você já economizou ${currentSaved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Falta poupar mais ${rest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para bater sua meta mensal. Que tal adiar aquela compra não essencial?`,
        type: 'info',
      });
    } else if (income > 0 && currentSaved <= 0) {
      tips.push({
        title: 'Alerta de Saldo Negativo ⚠️',
        text: 'Neste mês, suas saídas superaram suas entradas. É fundamental analisar seus custos variáveis para reverter essa situação o quanto antes.',
        type: 'warning',
      });
    }

    // Regra 2: Proporção de Custos Fixos vs Variáveis
    if (income > 0) {
      const fixedRatio = (fixed / income) * 100;
      const variableRatio = (variable / income) * 100;

      if (fixedRatio > 50) {
        tips.push({
          title: 'Custos Fixos Elevados',
          text: `Seus custos fixos consomem ${fixedRatio.toFixed(0)}% da sua renda. O ideal é que fiquem abaixo de 50%. Tente renegociar contratos de internet, seguros ou tarifas recorrentes.`,
          type: 'warning',
        });
      }

      if (variableRatio > 35) {
        tips.push({
          title: 'Atenção aos Gastos Variáveis 🛍️',
          text: `Você destinou ${variableRatio.toFixed(0)}% das suas receitas para custos variáveis (lazer, compras). Tente colocar uma meta semanal para pequenos caprichos, pois eles são os mais fáceis de cortar.`,
          type: 'tip',
        });
      } else if (variable > 0 && variableRatio <= 20) {
        tips.push({
          title: 'Ótimo controle de supérfluos!',
          text: `Seus gastos variáveis representam apenas ${variableRatio.toFixed(0)}% da sua renda deste mês. Isso demonstra excelente disciplina e foco na sua meta de economia!`,
          type: 'success',
        });
      }
    } else {
      tips.push({
        title: 'Cadastre sua Receita',
        text: 'Para dar conselhos mais precisos, adicione sua receita do mês (salário, comissões, etc.) usando o formulário ao lado.',
        type: 'info',
      });
    }

    setLocalTips(tips);
  }, [transactions, currentMonth, currentSaved, savingsGoal.monthlyTarget, income, fixed, variable]);

  // Função para consultar o assistente avançado do Gemini
  const fetchAiAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calcular saldo total acumulado de todas as transações para passar ao backend
      const totalIncomes = transactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
      const currentSavings = totalIncomes - totalExpenses + savingsGoal.initialSavings;

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          savingsGoal,
          currentBalance: currentSaved,
          currentSavings,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor do assistente financeiro.');
      }

      const data = await response.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível conectar ao Assistente de IA agora. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  const getTipStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/20 border-emerald-900/30',
          text: 'text-emerald-400',
          iconColor: 'text-accent-emerald',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          bg: 'bg-rose-950/20 border-rose-900/30',
          text: 'text-rose-400',
          iconColor: 'text-rose-400',
          icon: AlertTriangle,
        };
      case 'tip':
        return {
          bg: 'bg-amber-950/20 border-amber-900/30',
          text: 'text-amber-400',
          iconColor: 'text-amber-400',
          icon: Lightbulb,
        };
      default:
        return {
          bg: 'bg-blue-950/20 border-blue-900/30',
          text: 'text-blue-400',
          iconColor: 'text-blue-400',
          icon: Compass,
        };
    }
  };

  return (
    <div className="bg-dark-card rounded-2xl shadow-sm border border-dark-border p-6 flex flex-col justify-between" id="financial-assistant">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-dark-text-p text-lg flex items-center gap-2">
              <BrainCircuit size={20} className="text-accent-emerald" />
              Assistente de Poupança Inteligente
            </h3>
            <p className="text-xs text-dark-text-s">Dicas e análises sob medida para alcançar sua meta</p>
          </div>

          <button
            onClick={fetchAiAnalysis}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent-emerald text-dark-bg rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            Consultar IA
          </button>
        </div>

        {/* Análise de Inteligência Artificial do Gemini */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-10 text-center bg-dark-bg/40 rounded-xl border border-dark-border my-4"
            >
              <Loader2 size={32} className="animate-spin mx-auto text-accent-emerald mb-2" />
              <p className="text-dark-text-p text-sm font-semibold">Analisando suas transações...</p>
              <p className="text-dark-text-s text-xs mt-1">O Gemini está formulando uma estratégia de economia personalizada.</p>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs rounded-xl my-4"
            >
              <p className="font-semibold">{error}</p>
              <button
                onClick={fetchAiAnalysis}
                className="mt-2 text-accent-emerald hover:text-emerald-400 font-bold underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </motion.div>
          )}

          {aiAnalysis && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-4 bg-emerald-950/10 border border-emerald-900/30 p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-2 text-accent-emerald font-bold text-sm">
                <Sparkles size={16} />
                <span>Análise do Consultor de IA:</span>
              </div>
              <p className="text-xs text-dark-text-p leading-relaxed mb-4">
                {aiAnalysis.summary}
              </p>

              <div className="space-y-3">
                {aiAnalysis.tips.map((tip, idx) => {
                  const styles = getTipStyles(tip.type);
                  const TipIcon = styles.icon;
                  return (
                    <div key={idx} className={`p-3 rounded-xl border flex items-start gap-3 ${styles.bg}`}>
                      <TipIcon size={16} className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />
                      <div className="text-xs">
                        <h4 className="font-bold text-dark-text-p">{tip.title}</h4>
                        <p className="text-dark-text-s mt-0.5 leading-relaxed">{tip.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setAiAnalysis(null)}
                className="mt-4 text-[10px] font-semibold text-dark-text-s hover:text-dark-text-p underline cursor-pointer"
              >
                Voltar para dicas automáticas locais
              </button>
            </motion.div>
          )}

          {/* Dicas locais (quando não está carregando e não há resposta de IA ativa) */}
          {!aiAnalysis && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 my-4 max-h-[300px] overflow-y-auto pr-1"
            >
              {localTips.map((tip, idx) => {
                const styles = getTipStyles(tip.type);
                const TipIcon = styles.icon;
                return (
                  <div key={idx} className={`p-3 rounded-xl border flex items-start gap-3 ${styles.bg}`}>
                    <TipIcon size={16} className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="text-xs">
                      <h4 className="font-bold text-dark-text-p">{tip.title}</h4>
                      <p className="text-dark-text-s mt-0.5 leading-relaxed">{tip.text}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-dark-border pt-4 text-[11px] text-dark-text-s text-center flex items-center justify-center gap-1">
        <TrendingUp size={12} className="text-accent-emerald" />
        <span>Foco na meta: guardando R$ 600 por mês, os R$ 10.000 virão de forma consistente!</span>
      </div>
    </div>
  );
}
