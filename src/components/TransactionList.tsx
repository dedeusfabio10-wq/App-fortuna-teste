/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export default function TransactionList({
  transactions,
  onDeleteTransaction,
  selectedMonth,
  onSelectMonth
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [costTypeFilter, setCostTypeFilter] = useState<'all' | 'fixed' | 'variable'>('all');

  // Obter todos os meses que possuem lançamentos cadastrados para colocar no dropdown de filtro
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).sort().reverse(); // Mais recentes primeiro

  // Nomes dos meses em português para exibição elegante
  const MONTH_NAMES: { [key: string]: string } = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${MONTH_NAMES[month]} de ${year}`;
  };

  // Filtragem das transações baseadas nos filtros selecionados pelo usuário
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = t.date.startsWith(selectedMonth);
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCostType = costTypeFilter === 'all' || 
                            (t.type === 'expense' && t.costType === costTypeFilter);

    return matchesSearch && matchesMonth && matchesType && matchesCostType;
  });

  // Formatação de data
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Formatação de moeda
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-dark-card rounded-2xl shadow-sm border border-dark-border p-6" id="transaction-list">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-dark-text-p text-lg flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-accent-emerald" />
            Lançamentos Recentes
          </h3>
          <p className="text-xs text-dark-text-s">Histórico detalhado de fluxo de caixa</p>
        </div>

        {/* Seletor de Mês Ativo */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-dark-text-s uppercase tracking-wider">Mês de Referência:</span>
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="bg-dark-bg border border-dark-border text-dark-text-p text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-accent-emerald cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m} className="bg-dark-card text-dark-text-p">
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controles de Filtro e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Busca por texto */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-text-s" />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p placeholder-dark-text-s/50 focus:outline-none focus:border-accent-emerald text-xs"
          />
        </div>

        {/* Filtro por Entrada / Saída */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-dark-bg border border-dark-border text-dark-text-p text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent-emerald cursor-pointer appearance-none"
          >
            <option value="all" className="bg-dark-card text-dark-text-p">📊 Tipo: Todas as Transações</option>
            <option value="income" className="bg-dark-card text-dark-text-p">🟢 Apenas Entradas (Receitas)</option>
            <option value="expense" className="bg-dark-card text-dark-text-p">🔴 Apenas Saídas (Despesas)</option>
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-dark-text-s text-[10px]">▼</div>
        </div>

        {/* Filtro por Custo Fixo / Variável */}
        <div className="relative">
          <select
            value={costTypeFilter}
            onChange={(e) => setCostTypeFilter(e.target.value as any)}
            className="w-full bg-dark-bg border border-dark-border text-dark-text-p text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent-emerald cursor-pointer appearance-none disabled:opacity-50"
            disabled={typeFilter === 'income'}
          >
            <option value="all" className="bg-dark-card text-dark-text-p">🛠️ Classificação: Fixos & Variáveis</option>
            <option value="fixed" className="bg-dark-card text-dark-text-p">📌 Apenas Custos Fixos</option>
            <option value="variable" className="bg-dark-card text-dark-text-p">⚡ Apenas Custos Variáveis</option>
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-dark-text-s text-[10px]">▼</div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="overflow-hidden border border-dark-border rounded-xl">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center bg-dark-bg/30">
            <Layers size={36} className="mx-auto text-dark-text-s/30 mb-2" />
            <p className="text-dark-text-s text-sm font-medium">Nenhum lançamento encontrado para esses filtros.</p>
            <p className="text-dark-text-s/60 text-xs mt-1">Experimente mudar o mês ou os filtros acima!</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border max-h-[380px] overflow-y-auto">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-dark-bg/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Ícone Indicador de Entrada/Saída */}
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    t.type === 'income' 
                      ? 'bg-accent-emerald/10 text-accent-emerald' 
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark-text-p truncate">{t.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold bg-dark-bg text-dark-text-s px-2 py-0.5 rounded-full border border-dark-border">
                        {t.category}
                      </span>
                      {t.type === 'expense' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.costType === 'fixed' 
                            ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' 
                            : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                        }`}>
                          {t.costType === 'fixed' ? 'Contas / Fixo' : 'Lazer / Variável'}
                        </span>
                      )}
                      <span className="text-[10px] text-dark-text-s font-medium">
                        {formatDate(t.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-4 flex-shrink-0">
                  <span className={`text-sm font-bold ${
                    t.type === 'income' ? 'text-accent-emerald' : 'text-dark-text-p'
                  }`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>

                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-1.5 text-dark-text-s hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                    title="Excluir lançamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo do Mês Selecionado */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-dark-border text-center text-xs">
          <div className="bg-emerald-950/20 p-2 rounded-xl border border-emerald-900/10">
            <span className="block text-dark-text-s font-medium text-[10px] uppercase">Entradas</span>
            <span className="font-bold text-accent-emerald text-sm">
              {formatCurrency(filteredTransactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0))}
            </span>
          </div>
          <div className="bg-blue-950/20 p-2 rounded-xl border border-blue-900/10">
            <span className="block text-dark-text-s font-medium text-[10px] uppercase">Custos Fixos</span>
            <span className="font-bold text-blue-400 text-sm">
              {formatCurrency(filteredTransactions.filter(t => t.type === 'expense' && t.costType === 'fixed').reduce((acc, c) => acc + c.amount, 0))}
            </span>
          </div>
          <div className="bg-amber-950/20 p-2 rounded-xl border border-amber-900/10">
            <span className="block text-dark-text-s font-medium text-[10px] uppercase">Custos Variáveis</span>
            <span className="font-bold text-amber-400 text-sm">
              {formatCurrency(filteredTransactions.filter(t => t.type === 'expense' && t.costType === 'variable').reduce((acc, c) => acc + c.amount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
