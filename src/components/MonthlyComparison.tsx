/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BarChart3, ArrowDown, ArrowUp, Equal, TrendingUp, Info } from 'lucide-react';
import { Transaction } from '../types';

interface MonthlyComparisonProps {
  transactions: Transaction[];
}

interface MonthlyData {
  monthKey: string; // Ex: "2026-06"
  monthName: string; // Ex: "Junho"
  income: number;
  fixed: number;
  variable: number;
  totalExpense: number;
  savings: number;
}

export default function MonthlyComparison({ transactions }: MonthlyComparisonProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  // Nomes dos meses em português
  const MONTH_NAMES: { [key: string]: string } = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
  };

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${MONTH_NAMES[month]} / ${year.slice(2)}`;
  };

  // Agrupar e calcular dados por mês
  const monthlyMap: { [key: string]: { income: number; fixed: number; variable: number } } = {};

  transactions.forEach((t) => {
    const monthKey = t.date.slice(0, 7); // YYYY-MM
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, fixed: 0, variable: 0 };
    }

    if (t.type === 'income') {
      monthlyMap[monthKey].income += t.amount;
    } else {
      if (t.costType === 'fixed') {
        monthlyMap[monthKey].fixed += t.amount;
      } else {
        monthlyMap[monthKey].variable += t.amount;
      }
    }
  });

  // Ordenar meses cronologicamente
  const sortedMonths = Object.keys(monthlyMap).sort();

  // Se não houver dados, retorna vazio
  if (sortedMonths.length === 0) {
    return (
      <div className="bg-dark-card rounded-2xl shadow-sm border border-dark-border p-6 text-center">
        <p className="text-dark-text-s text-sm">Adicione transações para ver o histórico comparativo.</p>
      </div>
    );
  }

  const monthlyData: MonthlyData[] = sortedMonths.map((m) => {
    const data = monthlyMap[m];
    const totalExpense = data.fixed + data.variable;
    return {
      monthKey: m,
      monthName: getMonthLabel(m),
      income: data.income,
      fixed: data.fixed,
      variable: data.variable,
      totalExpense,
      savings: data.income - totalExpense
    };
  });

  // Pegar os últimos 5 meses para o gráfico para manter clean
  const chartData = monthlyData.slice(-5);

  // Encontrar valor máximo para escala do gráfico
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.totalExpense, 1000))
  ) * 1.1; // Adiciona folga de 10%

  // Moeda formatada
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Comparação do mês atual com o mês anterior
  let variationMessage = null;
  if (monthlyData.length >= 2) {
    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];

    const expenseDiff = current.totalExpense - previous.totalExpense;
    const expensePercent = previous.totalExpense > 0 ? (expenseDiff / previous.totalExpense) * 100 : 0;
    const isReduction = expenseDiff < 0;

    const variableDiff = current.variable - previous.variable;
    const variablePercent = previous.variable > 0 ? (variableDiff / previous.variable) * 100 : 0;

    variationMessage = {
      isReduction,
      percent: Math.abs(expensePercent).toFixed(0),
      variablePercent: Math.abs(variablePercent).toFixed(0),
      isVariableReduction: variableDiff < 0,
    };
  }

  return (
    <div className="bg-dark-card rounded-2xl shadow-sm border border-dark-border p-6" id="monthly-comparison">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-dark-text-p text-lg flex items-center gap-2">
            <BarChart3 size={20} className="text-accent-emerald" />
            Análise e Comparativo Mensal
          </h3>
          <p className="text-xs text-dark-text-s">Veja o balanço das suas despesas fixas e variáveis</p>
        </div>

        {/* Toggle Gráfico / Tabela */}
        <div className="flex bg-dark-bg p-0.5 rounded-lg text-xs font-medium border border-dark-border">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'chart' ? 'bg-dark-card text-accent-emerald shadow-xs border border-dark-border' : 'text-dark-text-s hover:text-dark-text-p'
            }`}
          >
            Gráfico
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'table' ? 'bg-dark-card text-accent-emerald shadow-xs border border-dark-border' : 'text-dark-text-s hover:text-dark-text-p'
            }`}
          >
            Tabela
          </button>
        </div>
      </div>

      {/* Alerta de Variação Rápida */}
      {variationMessage && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
          variationMessage.isReduction 
            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
            : 'bg-amber-950/20 border-amber-900/30 text-amber-400'
        }`}>
          <div className={`p-1.5 rounded-lg ${variationMessage.isReduction ? 'bg-emerald-900/40' : 'bg-amber-900/40'}`}>
            <TrendingUp size={16} className={variationMessage.isReduction ? 'text-accent-emerald' : 'text-amber-400'} />
          </div>
          <div className="text-xs">
            <p className="font-semibold">
              {variationMessage.isReduction 
                ? `Suas despesas caíram ${variationMessage.percent}% em relação ao mês anterior!` 
                : `Seus gastos subiram ${variationMessage.percent}% em relação ao mês anterior.`}
            </p>
            <p className="text-dark-text-s mt-0.5">
              {variationMessage.isVariableReduction
                ? `Os custos variáveis diminuíram ${variationMessage.variablePercent}%, excelente esforço de contenção!`
                : `Os custos variáveis (lazer, compras) variaram ${variationMessage.variablePercent}%. Fique atento aos excessos.`}
            </p>
          </div>
        </div>
      )}

      {/* Visualização de Gráfico */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          {/* Legenda do Gráfico */}
          <div className="flex flex-wrap gap-4 text-xs font-medium text-dark-text-s">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs"></span>
              <span>Receitas (Entradas)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-500 rounded-xs"></span>
              <span>Custos Fixos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-400 rounded-xs"></span>
              <span>Custos Variáveis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 border-t border-dashed border-accent-emerald inline-block h-0"></span>
              <span>Meta de Economia (R$ 600)</span>
            </div>
          </div>

          {/* Renderização de Gráfico de Barras em SVG */}
          <div className="w-full h-64 relative bg-dark-bg/30 rounded-xl p-4 border border-dark-border">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Linhas de Grade e Eixo Y */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <g key={percent}>
                  <line
                    x1="5"
                    y1={100 - percent * 0.8 - 10}
                    x2="95"
                    y2={100 - percent * 0.8 - 10}
                    stroke="#262629"
                    strokeWidth="0.5"
                  />
                  {/* Marcadores de Valor no Eixo Y */}
                  <text
                    x="2"
                    y={100 - percent * 0.8 - 9}
                    fontSize="2.5"
                    fill="#9CA3AF"
                    textAnchor="start"
                    className="font-mono"
                  >
                    {((percent / 100) * maxVal).toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short' })}
                  </text>
                </g>
              ))}

              {/* Renderização das Barras para cada Mês */}
              {chartData.map((d, index) => {
                const totalMonths = chartData.length;
                // Margens e larguras das colunas
                const startX = 12 + index * (80 / totalMonths);
                const colWidth = (80 / totalMonths) * 0.4;

                // Altura das barras baseada na proporção de valor máximo
                const incomeHeight = (d.income / maxVal) * 80;
                const fixedHeight = (d.fixed / maxVal) * 80;
                const variableHeight = (d.variable / maxVal) * 80;

                const incomeY = 90 - incomeHeight;
                const fixedY = 90 - fixedHeight;
                const variableY = incomeY - variableHeight; // Empilhar acima do fixo

                // Posição Y da despesa total (custo fixo + variável)
                const totalExpenseHeight = ((d.fixed + d.variable) / maxVal) * 80;
                const expenseY = 90 - totalExpenseHeight;

                return (
                  <g key={d.monthKey}>
                    {/* Barra de Receita (Verde) */}
                    <rect
                      x={startX}
                      y={incomeY}
                      width={colWidth}
                      height={incomeHeight}
                      fill="#10b981"
                      rx="1"
                    />

                    {/* Barra Empilhada de Despesa (Custo Fixo embaixo, Variável em cima) */}
                    {/* Custo Fixo (Blue) */}
                    <rect
                      x={startX + colWidth + 1.5}
                      y={90 - fixedHeight}
                      width={colWidth}
                      height={fixedHeight}
                      fill="#3b82f6"
                      rx="1"
                    />
                    {/* Custo Variável (Amber) */}
                    <rect
                      x={startX + colWidth + 1.5}
                      y={90 - totalExpenseHeight}
                      width={colWidth}
                      height={variableHeight}
                      fill="#fbbf24"
                      rx="1"
                    />

                    {/* Linha/Meta de Economia Mensal de R$ 600 sobre a Receita */}
                    {/* Se a receita - despesa >= 600, desenhamos um indicador de sucesso */}
                    {d.savings >= 600 && (
                      <circle
                        cx={startX + colWidth * 1.1}
                        cy={90 - ((d.savings) / maxVal) * 80}
                        r="1.2"
                        fill="#10b981"
                      />
                    )}

                    {/* Nome do Mês */}
                    <text
                      x={startX + colWidth * 1.1}
                      y="96"
                      fontSize="3"
                      fill="#9CA3AF"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {d.monthName}
                    </text>
                  </g>
                );
              })}

              {/* Linha de Base */}
              <line x1="5" y1="90" x2="95" y2="90" stroke="#262629" strokeWidth="0.8" />
            </svg>
          </div>

          <div className="flex items-start gap-2 bg-dark-bg p-3 rounded-lg border border-dark-border text-xs text-dark-text-s">
            <Info size={16} className="text-accent-emerald flex-shrink-0 mt-0.5" />
            <p>
              O gráfico exibe duas colunas para cada mês. A <strong className="text-dark-text-p">coluna da esquerda (verde)</strong> representa as entradas totais. A <strong className="text-dark-text-p">coluna da direita (mista)</strong> representa as saídas, divididas em <strong className="text-dark-text-p">custos fixos (azul)</strong> e <strong className="text-dark-text-p">custos variáveis (amarelo)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Visualização em Tabela */}
      {activeTab === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border text-xs font-semibold text-dark-text-s uppercase tracking-wider">
                <th className="py-3 px-4">Mês</th>
                <th className="py-3 px-4 text-accent-emerald">Entradas</th>
                <th className="py-3 px-4 text-blue-400">Custos Fixos</th>
                <th className="py-3 px-4 text-amber-400">Custos Variáveis</th>
                <th className="py-3 px-4 text-dark-text-p">Gasto Total</th>
                <th className="py-3 px-4 text-right">Economizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-sm">
              {monthlyData.map((d) => (
                <tr key={d.monthKey} className="hover:bg-dark-bg/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-dark-text-p">{d.monthName}</td>
                  <td className="py-3 px-4 text-accent-emerald font-medium">{formatCurrency(d.income)}</td>
                  <td className="py-3 px-4 text-dark-text-s">{formatCurrency(d.fixed)}</td>
                  <td className="py-3 px-4 text-dark-text-s">{formatCurrency(d.variable)}</td>
                  <td className="py-3 px-4 text-dark-text-p font-medium">{formatCurrency(d.totalExpense)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      d.savings >= 600 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                        : d.savings > 0 
                          ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' 
                          : 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                    }`}>
                      {formatCurrency(d.savings)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
