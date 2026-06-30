/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getInitialTransactions } from './utils/dummyData';
import { Transaction, SavingsGoal } from './types';
import SavingsGoalTracker from './components/SavingsGoalTracker';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlyComparison from './components/MonthlyComparison';
import FinancialAssistant from './components/FinancialAssistant';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Layers, 
  PiggyBank, 
  RotateCcw, 
  Trash2, 
  Download, 
  Upload,
  Info,
  Smartphone,
  X,
  Share,
  Plus
} from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>({
    targetAmount: 10000,
    monthlyTarget: 600,
    initialSavings: 0, // Poupança acumulada inicial
    startMonth: '2026-06',
  });
  
  // Definindo "2026-06" (Junho de 2026) como mês inicial de referência baseado nos dados de demonstração
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');

  // Estados e Efeitos para o PWA (Instalação Móvel Nativa)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // Detectar se o aplicativo já está rodando de forma standalone (instalado)
    const isCurrentlyStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isCurrentlyStandalone);

    // Capturar o evento de instalação do navegador
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Escolha do usuário sobre a instalação: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      // Se não houver o prompt nativo automático (ex: iOS Safari ou navegadores específicos), abrimos o manual interativo
      setShowInstallModal(true);
    }
  };

  // Formatar rótulo do mês de forma amigável
  const formatMonthLabel = (monthKey: string) => {
    try {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, (c) => c.toUpperCase());
    } catch (e) {
      return monthKey;
    }
  };

  // Carregar dados no carregamento inicial do componente
  useEffect(() => {
    const storedTransactions = localStorage.getItem('savings_app_transactions');
    const storedGoal = localStorage.getItem('savings_app_goal');

    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (e) {
        console.error("Erro ao ler transações do localStorage", e);
        setTransactions(getInitialTransactions());
      }
    } else {
      // Se não houver dados, inicia com o dummy data (extremamente prático para comparar meses anteriores)
      const initial = getInitialTransactions();
      setTransactions(initial);
      localStorage.setItem('savings_app_transactions', JSON.stringify(initial));
    }

    if (storedGoal) {
      try {
        const parsed = JSON.parse(storedGoal);
        setSavingsGoal(parsed);
        if (parsed.startMonth) {
          setSelectedMonth(parsed.startMonth);
        }
      } catch (e) {
        console.error("Erro ao ler meta de economia do localStorage", e);
      }
    }
  }, []);

  // Salvar transações sempre que houver modificação
  const saveTransactionsToStorage = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('savings_app_transactions', JSON.stringify(newTransactions));
  };

  // Salvar configurações de meta
  const saveGoalToStorage = (newGoal: SavingsGoal) => {
    setSavingsGoal(newGoal);
    localStorage.setItem('savings_app_goal', JSON.stringify(newGoal));
    if (newGoal.startMonth) {
      setSelectedMonth(newGoal.startMonth);
    }
  };

  // Adicionar uma transação
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    const updated = [newTx, ...transactions];
    saveTransactionsToStorage(updated);

    // Ajusta o mês de referência automaticamente se o usuário cadastrar um mês diferente do atual
    const txMonth = newTx.date.slice(0, 7);
    setSelectedMonth(txMonth);
  };

  // Deletar uma transação
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactionsToStorage(updated);
  };

  // Reiniciar os dados para a demonstração bonita
  const handleResetDemoData = () => {
    if (window.confirm("Deseja reiniciar o app com os dados ilustrativos de teste dos últimos 4 meses?")) {
      const demo = getInitialTransactions();
      saveTransactionsToStorage(demo);
      setSelectedMonth('2026-06');
    }
  };

  // Limpar todos os dados do absoluto zero
  const handleClearAllData = () => {
    if (window.confirm("ATENÇÃO: Deseja apagar TODOS os seus lançamentos e começar do absoluto zero? Esta ação é irreversível.")) {
      saveTransactionsToStorage([]);
      // Define o mês atual real de forma automática
      const currentRealMonth = new Date().toISOString().slice(0, 7);
      setSelectedMonth(currentRealMonth);
    }
  };

  // Exportar dados em JSON para Backup pessoal do usuário
  const handleExportData = () => {
    const backup = {
      transactions,
      savingsGoal
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "backup_controle_financeiro.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar dados em JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          saveTransactionsToStorage(parsed.transactions);
          if (parsed.savingsGoal) {
            saveGoalToStorage(parsed.savingsGoal);
          }
          alert("Backup importado com sucesso!");
          if (parsed.transactions.length > 0) {
            setSelectedMonth(parsed.transactions[0].date.slice(0, 7));
          }
        } else {
          alert("Formato de backup inválido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo de backup.");
      }
    };
  };

  // --- CÁLCULOS ESTATÍSTICOS DO MÊS DE REFERÊNCIA SELECIONADO ---
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  
  const monthIncomes = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthSaved = monthIncomes - monthExpenses;

  // Total acumulado a partir do mês de início do planejamento (realista e configurável)
  const startMonthKey = savingsGoal.startMonth || '2026-06';
  const planTransactions = transactions.filter(t => t.date.slice(0, 7) >= startMonthKey);

  const totalIncomesHistory = planTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpensesHistory = planTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalAccumulatedSavings = totalIncomesHistory - totalExpensesHistory + savingsGoal.initialSavings;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-p flex flex-col font-sans antialiased">
      {/* HEADER PRINCIPAL */}
      <header className="bg-dark-card border-b border-dark-border shadow-xs sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent-emerald text-dark-bg rounded-xl shadow-xs">
              <PiggyBank size={24} />
            </div>
            <div>
              <h1 className="font-bold text-dark-text-p tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                FORTUNA <span className="text-accent-emerald">●</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-dark-text-s font-medium">
                Sua meta de {formatCurrency(savingsGoal.monthlyTarget)}/mês acumulando para {formatCurrency(savingsGoal.targetAmount)}
              </p>
            </div>
          </div>

          {/* AÇÕES DE UTILITÁRIOS */}
          <div className="flex items-center gap-2">
            {/* Botão de Instalação do PWA */}
            {!isStandalone && (
              <button
                onClick={handleInstallApp}
                className="flex items-center gap-1.5 px-3 py-2 bg-accent-emerald/10 hover:bg-accent-emerald/20 active:scale-95 text-accent-emerald border border-accent-emerald/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Instalar Fortuna no Celular"
              >
                <Smartphone size={14} className="text-accent-emerald" />
                <span>Instalar no Celular</span>
              </button>
            )}

            {/* Reset Demo Data */}
            <button
              onClick={handleResetDemoData}
              className="p-2 text-dark-text-s hover:text-accent-emerald hover:bg-dark-bg rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold"
              title="Restaurar dados de teste"
            >
              <RotateCcw size={16} />
              <span className="hidden md:inline">Dados de Teste</span>
            </button>

            {/* Export / Backup */}
            <button
              onClick={handleExportData}
              className="p-2 text-dark-text-s hover:text-accent-emerald hover:bg-dark-bg rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold"
              title="Exportar backup JSON"
            >
              <Download size={16} />
              <span className="hidden md:inline">Exportar</span>
            </button>

            {/* Import / Restore */}
            <label className="p-2 text-dark-text-s hover:text-accent-emerald hover:bg-dark-bg rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold">
              <Upload size={16} />
              <span className="hidden md:inline">Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>

            {/* Clear All */}
            <button
              onClick={handleClearAllData}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold"
              title="Zerar aplicativo"
            >
              <Trash2 size={16} />
              <span className="hidden md:inline">Zerar</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL EM GRID */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* CARDS COM MÉTRICAS DO MÊS ATIVO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-cards">
          
          {/* Card 1: Saldo Consolidado */}
          <div className="bg-dark-card p-5 rounded-2xl border border-dark-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-dark-text-s uppercase tracking-wider block">
                Saldo de {formatMonthLabel(selectedMonth)}
              </span>
              <span className={`text-2xl font-bold tracking-tight block mt-1 ${
                monthSaved >= 0 ? 'text-accent-emerald' : 'text-rose-500'
              }`}>
                {formatCurrency(monthSaved)}
              </span>
              <span className="text-[10px] text-dark-text-s font-medium">
                (Entradas menos saídas)
              </span>
            </div>
            <div className={`p-3 rounded-xl ${monthSaved >= 0 ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-rose-500/10 text-rose-500'}`}>
              <DollarSign size={24} />
            </div>
          </div>

          {/* Card 2: Entradas Totais */}
          <div className="bg-dark-card p-5 rounded-2xl border border-dark-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-dark-text-s uppercase tracking-wider block">
                Entradas (Mês)
              </span>
              <span className="text-2xl font-bold text-dark-text-p tracking-tight block mt-1">
                {formatCurrency(monthIncomes)}
              </span>
              <span className="text-[10px] text-accent-emerald font-medium">
                Ganhos e receitas extras
              </span>
            </div>
            <div className="p-3 bg-accent-emerald/10 text-accent-emerald rounded-xl">
              <ArrowUpCircle size={24} />
            </div>
          </div>

          {/* Card 3: Saídas Totais */}
          <div className="bg-dark-card p-5 rounded-2xl border border-dark-border shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-dark-text-s uppercase tracking-wider block">
                Saídas (Mês)
              </span>
              <span className="text-2xl font-bold text-dark-text-p tracking-tight block mt-1">
                {formatCurrency(monthExpenses)}
              </span>
              <span className="text-[10px] text-rose-400 font-medium">
                Contas + despesas supérfluas
              </span>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <ArrowDownCircle size={24} />
            </div>
          </div>

          {/* Card 4: Fundo Acumulado Total */}
          <div className="bg-dark-card p-5 rounded-2xl border border-accent-emerald/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-accent-emerald uppercase tracking-wider block">
                Total Guardado
              </span>
              <span className="text-2xl font-bold text-accent-emerald tracking-tight block mt-1">
                {formatCurrency(totalAccumulatedSavings)}
              </span>
              <span className="text-[10px] text-emerald-500 font-medium">
                Rumo aos {formatCurrency(savingsGoal.targetAmount)}!
              </span>
            </div>
            <div className="p-3 bg-accent-emerald/10 text-accent-emerald rounded-xl border border-accent-emerald/20">
              <PiggyBank size={24} />
            </div>
          </div>
        </div>

        {/* TRACKER DE METAS (R$ 600 / R$ 10K) */}
        <SavingsGoalTracker 
          transactions={transactions} 
          savingsGoal={savingsGoal} 
          currentMonth={selectedMonth} 
          onUpdateGoal={saveGoalToStorage}
        />

        {/* GRADE INTERMEDIÁRIA DE LANÇAMENTOS E ASSISTENTE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulário (Esquerda, Col 1) */}
          <div className="lg:col-span-1 space-y-6">
            <TransactionForm onAddTransaction={handleAddTransaction} />
            
            {/* Painel Informativo sobre Custos Fixos vs Variáveis */}
            <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
              <h4 className="font-bold text-dark-text-p text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Info size={14} className="text-accent-emerald" />
                Diferença de Custos
              </h4>
              <ul className="space-y-2 text-xs text-dark-text-s leading-relaxed">
                <li>
                  📌 <strong className="text-dark-text-p">Custos Fixos:</strong> Gastos essenciais e recorrentes que variam pouco (ex: aluguel, condomínio, internet, mensalidades). É a sua base mensal de sobrevivência.
                </li>
                <li>
                  ⚡ <strong className="text-dark-text-p">Custos Variáveis:</strong> Gastos esporádicos e maleáveis (ex: alimentação fora, lazer, compras, transportes casuais). São os primeiros que você deve ajustar para garantir sua economia mensal de {formatCurrency(savingsGoal.monthlyTarget)}!
                </li>
              </ul>
            </div>
          </div>

          {/* Lista de Transações (Centro, Col 2 e 3) */}
          <div className="lg:col-span-2 space-y-6">
            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={handleDeleteTransaction}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          </div>
        </div>

        {/* COMPARAÇÃO MENSAL E ASSISTENTE INTELIGENTE EM DUPLA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyComparison transactions={transactions} />
          <FinancialAssistant 
            transactions={transactions} 
            savingsGoal={savingsGoal} 
            currentMonth={selectedMonth} 
          />
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="bg-dark-card border-t border-dark-border py-6 mt-12 text-center text-xs text-dark-text-s font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© 2026 Controle de Gastos e Economias — Desenvolvido de forma fácil e interativa.</p>
          <p className="mt-1">
            Seus dados estão protegidos localmente e salvos apenas no seu navegador.
          </p>
        </div>
      </footer>

      {/* MODAL DE AJUDA PARA INSTALAÇÃO (PWA) */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-[#02040a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border max-w-md w-full rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="text-accent-emerald animate-bounce" size={20} />
                <h3 className="font-bold text-dark-text-p text-base">Instalar Fortuna no seu Celular</h3>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1.5 hover:bg-dark-bg text-dark-text-s hover:text-dark-text-p rounded-lg transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo com guias */}
            <div className="space-y-6">
              <p className="text-xs text-dark-text-s leading-relaxed">
                Você pode instalar o <strong className="text-accent-emerald">Fortuna</strong> para utilizá-lo como um aplicativo nativo no seu celular, com carregamento instantâneo, visualização em tela cheia e suporte offline!
              </p>

              {/* Segurança e Persistência de Dados */}
              <div className="bg-accent-emerald/5 border border-accent-emerald/20 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-accent-emerald uppercase tracking-wider block flex items-center gap-1">
                  🔒 Seus Dados Estão Salvos e Seguros
                </span>
                <p className="text-xs text-dark-text-p leading-relaxed">
                  Todas as suas transações e metas são <strong className="text-accent-emerald">salvas automaticamente no armazenamento local do seu próprio celular (LocalStorage)</strong> de forma 100% privada e criptografada pelo próprio navegador.
                </p>
                <p className="text-[11px] text-dark-text-s leading-relaxed">
                  💡 <strong>Dica de Segurança:</strong> Para total tranquilidade caso você perca ou troque de celular, use a opção <strong className="text-white">"Exportar"</strong> no menu superior para baixar um arquivo de backup de tempos em tempos. Você poderá restaurá-lo em qualquer aparelho usando a opção <strong className="text-white">"Importar"</strong>!
                </p>
              </div>

              {/* Guia iOS Safari */}
              <div className="bg-dark-bg/60 p-4 rounded-xl border border-dark-border space-y-3">
                <span className="text-[10px] font-bold text-accent-emerald uppercase tracking-wider block">
                  Para iPhone ou iPad (Safari)
                </span>
                <ol className="list-decimal list-inside space-y-2 text-xs text-dark-text-p">
                  <li>
                    Abra o site no navegador <strong className="text-accent-emerald">Safari</strong>.
                  </li>
                  <li>
                    Toque no botão de <strong className="text-accent-emerald">Compartilhar</strong> (<Share size={12} className="inline mx-1 text-accent-emerald" />) no menu inferior.
                  </li>
                  <li>
                    Role a lista e escolha <strong className="text-accent-emerald">Adicionar à Tela de Início</strong> (<Plus size={12} className="inline mx-1 text-accent-emerald" />).
                  </li>
                  <li>
                    Pronto! Abra o app Fortuna direto pela sua tela inicial do celular! 🎉
                  </li>
                </ol>
              </div>

              {/* Guia Android Chrome */}
              <div className="bg-dark-bg/60 p-4 rounded-xl border border-dark-border space-y-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  Para Android (Chrome)
                </span>
                <ol className="list-decimal list-inside space-y-2 text-xs text-dark-text-p">
                  <li>
                    Toque no botão de opções (<strong className="text-blue-400">⋮</strong>) no canto superior direito do Chrome.
                  </li>
                  <li>
                    Selecione a opção <strong className="text-blue-400">Instalar aplicativo</strong> ou <strong className="text-blue-400">Adicionar à tela inicial</strong>.
                  </li>
                  <li>
                    Confirme a instalação e o Fortuna estará na sua gaveta de apps! 🚀
                  </li>
                </ol>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="mt-6 pt-4 border-t border-dark-border flex justify-end">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 bg-accent-emerald hover:bg-emerald-400 text-dark-bg text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Entendi, vou instalar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
