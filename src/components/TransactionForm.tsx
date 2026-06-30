/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlusCircle, ArrowUpRight, ArrowDownRight, Tag, Calendar, DollarSign } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Investimentos', 'Venda', 'Outros'];
const EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Serviços', 'Compras', 'Outros'];

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [costType, setCostType] = useState<'fixed' | 'variable'>('variable');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[1]); // Padrão 'Alimentação'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      costType: type === 'income' ? 'none' : costType,
      date,
    });

    // Resetar campos simples para facilitar nova inserção
    setDescription('');
    setAmount('');
  };

  // Mudar categorias dinamicamente baseado no tipo
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    if (newType === 'income') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  return (
    <div className="bg-dark-card rounded-2xl shadow-sm border border-dark-border p-6" id="transaction-form">
      <h3 className="font-semibold text-dark-text-p text-lg mb-4 flex items-center gap-2">
        <PlusCircle size={20} className="text-accent-emerald" />
        Nova Entrada ou Saída
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Tipo: Entrada ou Saída */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-dark-bg rounded-xl border border-dark-border">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-dark-card text-accent-emerald shadow-xs border border-dark-border'
                : 'text-dark-text-s hover:text-dark-text-p'
            }`}
          >
            <ArrowUpRight size={16} />
            Entrada (Receita)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-dark-card text-rose-400 shadow-xs border border-dark-border'
                : 'text-dark-text-s hover:text-dark-text-p'
            }`}
          >
            <ArrowDownRight size={16} />
            Saída (Despesa)
          </button>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-dark-text-s uppercase tracking-wider mb-1.5">
            Descrição do Gasto ou Entrada
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Salário, Supermercado, Cinema, Internet..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p placeholder-dark-text-s/50 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-all text-sm"
          />
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-dark-text-s uppercase tracking-wider mb-1.5">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-text-s font-medium text-sm">R$</span>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p placeholder-dark-text-s/50 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-all text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-text-s uppercase tracking-wider mb-1.5">
              Data
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-text-s" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tipo de Custo (Fixo vs Variável) - Apenas se for Despesa */}
        {type === 'expense' && (
          <div>
            <label className="block text-xs font-semibold text-dark-text-s uppercase tracking-wider mb-1.5">
              Tipo de Custo (Como impacta seu orçamento)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCostType('fixed')}
                className={`py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  costType === 'fixed'
                    ? 'bg-blue-950/40 text-blue-400 border-blue-900/30 font-semibold'
                    : 'bg-dark-bg text-dark-text-s border-dark-border hover:bg-dark-card'
                }`}
              >
                Custo Fixo (Contas, Aluguel, etc)
              </button>
              <button
                type="button"
                onClick={() => setCostType('variable')}
                className={`py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  costType === 'variable'
                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/30 font-semibold'
                    : 'bg-dark-bg text-dark-text-s border-dark-border hover:bg-dark-card'
                }`}
              >
                Custo Variável (Lazer, Lanches, etc)
              </button>
            </div>
          </div>
        )}

        {/* Categoria */}
        <div>
          <label className="block text-xs font-semibold text-dark-text-s uppercase tracking-wider mb-1.5">
            Categoria
          </label>
          <div className="relative">
            <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-text-s" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-dark-text-p focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-all text-sm appearance-none cursor-pointer"
            >
              {type === 'income'
                ? INCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-dark-card text-dark-text-p">
                      {cat}
                    </option>
                  ))
                : EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-dark-card text-dark-text-p">
                      {cat}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          className="w-full py-3 bg-accent-emerald text-dark-bg hover:bg-emerald-400 font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
        >
          Salvar Lançamento
        </button>
      </form>
    </div>
  );
}
