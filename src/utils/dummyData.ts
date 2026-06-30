/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction } from '../types';

export const getInitialTransactions = (): Transaction[] => {
  // Simular transações para os últimos 3 meses (Março, Abril, Maio de 2026) e o mês atual (Junho de 2026)
  return [
    // --- MARÇO 2026 ---
    {
      id: 'm1',
      description: 'Salário Mensal',
      amount: 3500,
      type: 'income',
      category: 'Salário',
      costType: 'none',
      date: '2026-03-05'
    },
    {
      id: 'm2',
      description: 'Trabalho Freelance Design',
      amount: 450,
      type: 'income',
      category: 'Freelance',
      costType: 'none',
      date: '2026-03-15'
    },
    {
      id: 'm3',
      description: 'Aluguel do Apartamento',
      amount: 1200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-03-10'
    },
    {
      id: 'm4',
      description: 'Condomínio e Gás',
      amount: 200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-03-10'
    },
    {
      id: 'm5',
      description: 'Plano de Internet Fibra',
      amount: 100,
      type: 'expense',
      category: 'Serviços',
      costType: 'fixed',
      date: '2026-03-12'
    },
    {
      id: 'm6',
      description: 'Supermercado do Mês',
      amount: 550,
      type: 'expense',
      category: 'Alimentação',
      costType: 'variable',
      date: '2026-03-07'
    },
    {
      id: 'm7',
      description: 'Jantar de Fim de Semana',
      amount: 180,
      type: 'expense',
      category: 'Lazer',
      costType: 'variable',
      date: '2026-03-14'
    },
    {
      id: 'm8',
      description: 'Combustível',
      amount: 220,
      type: 'expense',
      category: 'Transporte',
      costType: 'variable',
      date: '2026-03-20'
    },
    {
      id: 'm9',
      description: 'Cinema e Lanche',
      amount: 90,
      type: 'expense',
      category: 'Lazer',
      costType: 'variable',
      date: '2026-03-22'
    },
    {
      id: 'm10',
      description: 'Academia Mensalidade',
      amount: 110,
      type: 'expense',
      category: 'Saúde',
      costType: 'fixed',
      date: '2026-03-10'
    },
    {
      id: 'm11',
      description: 'Roupas Novas',
      amount: 300,
      type: 'expense',
      category: 'Compras',
      costType: 'variable',
      date: '2026-03-28'
    },

    // --- ABRIL 2026 ---
    {
      id: 'a1',
      description: 'Salário Mensal',
      amount: 3500,
      type: 'income',
      category: 'Salário',
      costType: 'none',
      date: '2026-04-05'
    },
    {
      id: 'a2',
      description: 'Aluguel do Apartamento',
      amount: 1200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-04-10'
    },
    {
      id: 'a3',
      description: 'Condomínio e Gás',
      amount: 200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-04-10'
    },
    {
      id: 'a4',
      description: 'Plano de Internet Fibra',
      amount: 100,
      type: 'expense',
      category: 'Serviços',
      costType: 'fixed',
      date: '2026-04-12'
    },
    {
      id: 'a5',
      description: 'Supermercado Mensal',
      amount: 620,
      type: 'expense',
      category: 'Alimentação',
      costType: 'variable',
      date: '2026-04-08'
    },
    {
      id: 'a6',
      description: 'Transporte Aplicativo',
      amount: 140,
      type: 'expense',
      category: 'Transporte',
      costType: 'variable',
      date: '2026-04-15'
    },
    {
      id: 'a7',
      description: 'Aniversário de Amigo (Presente + Jantar)',
      amount: 250,
      type: 'expense',
      category: 'Lazer',
      costType: 'variable',
      date: '2026-04-18'
    },
    {
      id: 'a8',
      description: 'Academia Mensalidade',
      amount: 110,
      type: 'expense',
      category: 'Saúde',
      costType: 'fixed',
      date: '2026-04-10'
    },
    {
      id: 'a9',
      description: 'Remédios Farmácia',
      amount: 80,
      type: 'expense',
      category: 'Saúde',
      costType: 'variable',
      date: '2026-04-22'
    },
    {
      id: 'a10',
      description: 'Serviço de Streaming (Netflix/Spotify)',
      amount: 75,
      type: 'expense',
      category: 'Serviços',
      costType: 'fixed',
      date: '2026-04-10'
    },
    {
      id: 'a11',
      description: 'Lanches Delivery',
      amount: 120,
      type: 'expense',
      category: 'Alimentação',
      costType: 'variable',
      date: '2026-04-26'
    },

    // --- MAIO 2026 ---
    {
      id: 'ma1',
      description: 'Salário Mensal',
      amount: 3500,
      type: 'income',
      category: 'Salário',
      costType: 'none',
      date: '2026-05-05'
    },
    {
      id: 'ma2',
      description: 'Venda de Item Usado',
      amount: 250,
      type: 'income',
      category: 'Outros',
      costType: 'none',
      date: '2026-05-20'
    },
    {
      id: 'ma3',
      description: 'Aluguel do Apartamento',
      amount: 1200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-05-10'
    },
    {
      id: 'ma4',
      description: 'Condomínio e Gás',
      amount: 200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-05-10'
    },
    {
      id: 'ma5',
      description: 'Plano de Internet Fibra',
      amount: 100,
      type: 'expense',
      category: 'Serviços',
      costType: 'fixed',
      date: '2026-05-12'
    },
    {
      id: 'ma6',
      description: 'Supermercado e Feira',
      amount: 680,
      type: 'expense',
      category: 'Alimentação',
      costType: 'variable',
      date: '2026-05-06'
    },
    {
      id: 'ma7',
      description: 'Show de Música',
      amount: 350,
      type: 'expense',
      category: 'Lazer',
      costType: 'variable',
      date: '2026-05-15'
    },
    {
      id: 'ma8',
      description: 'Combustível Carro',
      amount: 260,
      type: 'expense',
      category: 'Transporte',
      costType: 'variable',
      date: '2026-05-22'
    },
    {
      id: 'ma9',
      description: 'Academia Mensalidade',
      amount: 110,
      type: 'expense',
      category: 'Saúde',
      costType: 'fixed',
      date: '2026-05-10'
    },
    {
      id: 'ma10',
      description: 'Serviço de Streaming (Netflix/Spotify)',
      amount: 75,
      type: 'expense',
      category: 'Serviços',
      costType: 'fixed',
      date: '2026-05-10'
    },
    {
      id: 'ma11',
      description: 'Manutenção de Eletrodoméstico',
      amount: 220,
      type: 'expense',
      category: 'Outros',
      costType: 'variable',
      date: '2026-05-25'
    },

    // --- JUNHO 2026 (Mês Atual) ---
    {
      id: 'j1',
      description: 'Salário Mensal',
      amount: 3500,
      type: 'income',
      category: 'Salário',
      costType: 'none',
      date: '2026-06-05'
    },
    {
      id: 'j2',
      description: 'Aluguel do Apartamento',
      amount: 1200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-06-10'
    },
    {
      id: 'j3',
      description: 'Condomínio e Gás',
      amount: 200,
      type: 'expense',
      category: 'Moradia',
      costType: 'fixed',
      date: '2026-06-10'
    },
    {
      id: 'j4',
      description: 'Plano de Internet Fibra',
      amount: 100,
      type: 'expense',
      category: 'Serviços',
      costType: 'fixed',
      date: '2026-06-12'
    },
    {
      id: 'j5',
      description: 'Supermercado Semanal',
      amount: 450,
      type: 'expense',
      category: 'Alimentação',
      costType: 'variable',
      date: '2026-06-08'
    },
    {
      id: 'j6',
      description: 'Academia Mensalidade',
      amount: 110,
      type: 'expense',
      category: 'Saúde',
      costType: 'fixed',
      date: '2026-06-10'
    },
    {
      id: 'j7',
      description: 'Lazer com Amigos',
      amount: 160,
      type: 'expense',
      category: 'Lazer',
      costType: 'variable',
      date: '2026-06-14'
    },
    {
      id: 'j8',
      description: 'Uber e Ônibus',
      amount: 90,
      type: 'expense',
      category: 'Transporte',
      costType: 'variable',
      date: '2026-06-18'
    },
    {
      id: 'j9',
      description: 'Serviço de Streaming (Netflix/Spotify)',
      amount: 75,
      type: 'expense',
      category: 'Serviços',
      costType: 'fixed',
      date: '2026-06-10'
    }
  ];
};
