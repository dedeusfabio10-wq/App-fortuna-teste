/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, TrendingUp, PiggyBank, Award, Calendar, Sparkles, Settings2 } from 'lucide-react';
import { Transaction, SavingsGoal } from '../types';

interface SavingsGoalTrackerProps {
  transactions: Transaction[];
  savingsGoal: SavingsGoal;
  currentMonth: string; // Ex: "2026-06"
  onUpdateGoal?: (newGoal: SavingsGoal) => void;
}

export default function SavingsGoalTracker({ transactions, savingsGoal, currentMonth, onUpdateGoal }: SavingsGoalTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTargetAmount, setEditTargetAmount] = useState(savingsGoal.targetAmount);
  const [editMonthlyTarget, setEditMonthlyTarget] = useState(savingsGoal.monthlyTarget);
  const [editInitialSavings, setEditInitialSavings] = useState(savingsGoal.initialSavings);
  const [editStartMonth, setEditStartMonth] = useState(savingsGoal.startMonth || '2026-06');

  useEffect(() => {
    setEditTargetAmount(savingsGoal.targetAmount);
    setEditMonthlyTarget(savingsGoal.monthlyTarget);
    setEditInitialSavings(savingsGoal.initialSavings);
    setEditStartMonth(savingsGoal.startMonth || '2026-06');
  }, [savingsGoal]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGoal) {
      onUpdateGoal({
        targetAmount: Number(editTargetAmount),
        monthlyTarget: Number(editMonthlyTarget),
        initialSavings: Number(editInitialSavings),
        startMonth: editStartMonth,
      });
    }
    setIsEditing(false);
  };
  // Considerar apenas transações a partir do mês de início do plano para a poupança acumulada
  const startMonthKey = savingsGoal.startMonth || '2026-06';
  const planTransactions = transactions.filter(t => t.date.slice(0, 7) >= startMonthKey);

  const totalIncomes = planTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = planTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentAccumulated = totalIncomes - totalExpenses + savingsGoal.initialSavings;
  const targetAmount = savingsGoal.targetAmount;
  const overallPercentage = Math.min((currentAccumulated / targetAmount) * 100, 100);

  // Calcular economia do mês selecionado/atual
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthIncomes = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthSaved = monthIncomes - monthExpenses;
  const monthlyTarget = savingsGoal.monthlyTarget;
  const monthlyPercentage = Math.min(Math.max((monthSaved / monthlyTarget) * 100, 0), 100);

  // Projeção: quantos meses faltam para atingir R$ 10.000 economizando R$ 600 por mês
  const amountLeft = Math.max(targetAmount - currentAccumulated, 0);
  const monthsRemaining = monthlyTarget > 0 ? Math.ceil(amountLeft / monthlyTarget) : 0;

  // Formatação de moeda
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Determinar badges ou níveis de conquista baseado no progresso acumulado
  const getBadge = (progress: number) => {
    if (progress >= 100) return { name: 'Mestre das Finanças', color: 'bg-emerald-950/40 text-accent-emerald border border-accent-emerald/30', icon: Sparkles };
    if (progress >= 75) return { name: 'Investidor Avançado', color: 'bg-teal-950/40 text-teal-400 border border-teal-800/30', icon: Award };
    if (progress >= 50) return { name: 'Poupador Focado', color: 'bg-sky-950/40 text-sky-400 border border-sky-800/30', icon: TrendingUp };
    if (progress >= 25) return { name: 'Economista Iniciante', color: 'bg-blue-950/40 text-blue-400 border border-blue-800/30', icon: PiggyBank };
    return { name: 'Primeiros Passos', color: 'bg-neutral-800 text-neutral-400 border border-neutral-700/50', icon: Target };
  };

  const badge = getBadge(overallPercentage);
  const BadgeIcon = badge.icon;

  return (
    <div className="space-y-4" id="savings-goal-tracker">
      {/* Cabeçalho Unificado do Planejamento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-card border border-dark-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-accent-emerald/10 text-accent-emerald rounded-xl border border-accent-emerald/20">
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-dark-text-p text-sm flex items-center gap-1.5">
              Meta de Poupança e Rumo Realista
            </h3>
            <p className="text-[11px] text-dark-text-s">
              Defina seu objetivo final, esforço mensal, valor inicial e o mês de partida realista.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-dark-bg hover:bg-dark-border text-dark-text-p border border-dark-border rounded-xl text-xs font-semibold transition-all cursor-pointer select-none"
        >
          <Settings2 size={14} className="text-accent-emerald" />
          <span>Configurar Planejamento</span>
        </button>
      </div>

      {/* Painel de Edição Expansível */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="overflow-hidden bg-dark-card border border-accent-emerald/30 p-5 rounded-2xl shadow-md"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-2">
                <h4 className="font-bold text-dark-text-p text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-accent-emerald animate-pulse" />
                  Ajustar Parâmetros do Planejamento
                </h4>
                <p className="text-[10px] text-accent-emerald font-semibold bg-accent-emerald/10 px-2.5 py-0.5 rounded-full border border-accent-emerald/20">
                  Planejamento Realista
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Meta Final */}
                <div>
                  <label className="block text-[10px] font-bold text-dark-text-s uppercase tracking-wider mb-1.5">
                    Meta Acumulada Total (R$)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p focus:outline-none focus:border-accent-emerald text-xs font-semibold"
                  />
                </div>

                {/* Poupança Inicial */}
                <div>
                  <label className="block text-[10px] font-bold text-dark-text-s uppercase tracking-wider mb-1.5">
                    Valor Guardado Inicial (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editInitialSavings}
                    onChange={(e) => setEditInitialSavings(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p focus:outline-none focus:border-accent-emerald text-xs font-semibold"
                  />
                </div>

                {/* Meta Econômica Mensal */}
                <div>
                  <label className="block text-[10px] font-bold text-dark-text-s uppercase tracking-wider mb-1.5">
                    Meta de Economia Mensal (R$)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editMonthlyTarget}
                    onChange={(e) => setEditMonthlyTarget(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p focus:outline-none focus:border-accent-emerald text-xs font-semibold"
                  />
                </div>

                {/* Mês de Partida */}
                <div>
                  <label className="block text-[10px] font-bold text-dark-text-s uppercase tracking-wider mb-1.5">
                    Mês de Início Realista
                  </label>
                  <input
                    type="month"
                    required
                    value={editStartMonth}
                    onChange={(e) => setEditStartMonth(e.target.value)}
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p focus:outline-none focus:border-accent-emerald text-xs font-semibold cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-dark-border mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-dark-bg hover:bg-dark-border text-dark-text-s hover:text-dark-text-p text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-emerald hover:bg-emerald-400 text-dark-bg text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Salvar Planejamento
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloco 1: Meta Final Acumulada */}
        <div className="bg-dark-card rounded-2xl shadow-sm border border-dark-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent-emerald/10 text-accent-emerald rounded-lg">
                  <PiggyBank size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text-p text-lg">Poupança Acumulada</h3>
                  <p className="text-xs text-dark-text-s">Rumo aos {formatCurrency(targetAmount)}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${badge.color}`}>
                <BadgeIcon size={14} />
                {badge.name}
              </span>
            </div>

            <div className="my-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-3xl font-bold text-dark-text-p tracking-tight">
                  {formatCurrency(currentAccumulated)}
                </span>
                <span className="text-sm font-semibold text-accent-emerald">
                  {overallPercentage.toFixed(1)}%
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="w-full bg-dark-border rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-accent-emerald h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-dark-border pt-4 mt-2 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-dark-text-s">
              <span>Faltam economizar:</span>
              <span className="font-semibold text-dark-text-p">{formatCurrency(amountLeft)}</span>
            </div>
            {currentAccumulated < targetAmount ? (
              <div className="flex items-center gap-1.5 text-xs text-dark-text-s mt-1 bg-dark-bg p-2.5 rounded-lg border border-dark-border">
                <Calendar size={14} className="text-dark-text-s" />
                <span>
                  Neste ritmo (economizando <strong>{formatCurrency(monthlyTarget)}/mês</strong>), você alcançará o objetivo em <strong>{monthsRemaining} meses</strong>.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-accent-emerald mt-1 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                <Sparkles size={14} className="text-emerald-400" />
                <span>
                  <strong>Parabéns!</strong> Você atingiu e superou a sua meta de {formatCurrency(targetAmount)} guardados! 🎉
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bloco 2: Meta Mensal */}
        <div className="bg-dark-card rounded-2xl shadow-sm border border-dark-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent-emerald/10 text-accent-emerald rounded-lg">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text-p text-lg">Meta Econômica Mensal</h3>
                  <p className="text-xs text-dark-text-s">Guardar {formatCurrency(monthlyTarget)} todo mês</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                monthSaved >= monthlyTarget 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30' 
                  : monthSaved > 0 
                    ? 'bg-amber-950/40 text-amber-400 border-amber-800/30' 
                    : 'bg-rose-950/40 text-rose-400 border-rose-800/30'
              }`}>
                {monthSaved >= monthlyTarget ? 'Meta Batida! 🎉' : monthSaved > 0 ? 'Progredindo' : 'Sem Economias'}
              </span>
            </div>

            <div className="my-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className={`text-3xl font-bold tracking-tight ${monthSaved >= 0 ? 'text-dark-text-p' : 'text-rose-500'}`}>
                  {formatCurrency(monthSaved)}
                </span>
                <span className={`text-sm font-semibold ${monthSaved >= monthlyTarget ? 'text-accent-emerald' : 'text-dark-text-s'}`}>
                  {monthlyPercentage.toFixed(1)}%
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="w-full bg-dark-border rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${monthSaved >= monthlyTarget ? 'bg-accent-emerald' : 'bg-emerald-500/80'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-dark-border pt-4 mt-2 flex flex-col gap-2">
            {monthSaved >= monthlyTarget ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                <Sparkles size={14} className="text-emerald-500" />
                <span>
                  Fantástico! Você já ultrapassou a meta de economia em <strong>{formatCurrency(monthSaved - monthlyTarget)}</strong> neste mês. Continue firme!
                </span>
              </div>
            ) : monthSaved > 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30">
                <TrendingUp size={14} className="text-amber-500" />
                <span>
                  Faltam apenas <strong>{formatCurrency(monthlyTarget - monthSaved)}</strong> de economia para atingir a meta de <strong>{formatCurrency(monthlyTarget)}</strong> neste mês. Você consegue!
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
                <Target size={14} className="text-rose-500" />
                <span>
                  Seus gastos superaram suas entradas neste mês em <strong>{formatCurrency(Math.abs(monthSaved))}</strong>. Ajuste seus custos para voltar ao azul!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
