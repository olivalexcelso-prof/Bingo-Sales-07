
import React, { useState, useEffect, useRef } from 'react';
import { User, BingoCard, GameState, View } from './types';
import { bingoApi } from './services/api';
import BingoGrid from './components/BingoGrid';
import WinnerBanner from './components/WinnerBanner';
import { Icons } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<BingoCard[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastNarration, setLastNarration] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // Lógica de Autenticação (Login ou Cadastro)
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = authMode === 'login' 
        ? await bingoApi.login(data) 
        : await bingoApi.register(data);
      
      setUser(res.user);
      setCards(res.cards);
      setView('game');
    } catch (err) {
      alert(authMode === 'login' ? 'Dados incorretos.' : 'Erro ao cadastrar. Tente outro CPF.');
    } finally {
      setLoading(false);
    }
  };

  // Sync com Servidor
  useEffect(() => {
    if (view !== 'game' || !user) return;
    const interval = setInterval(async () => {
      try {
        const state = await bingoApi.getGameState(user.id);
        setGameState(state);
        if (state.narrationUrl && state.narrationUrl !== lastNarration) {
          audioRef.current.src = state.narrationUrl;
          audioRef.current.play().catch(() => {});
          setLastNarration(state.narrationUrl);
        }
        if (state.isWinner && !showWinner) {
          setShowWinner(true);
          setTimeout(() => setShowWinner(false), 8000);
        }
      } catch (e) { console.error("Sync..."); }
    }, 2000);
    return () => clearInterval(interval);
  }, [view, user, lastNarration, showWinner]);

  const handleWithdrawSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = { ...Object.fromEntries(formData.entries()), userId: user.id };
    try {
      const res = await bingoApi.requestWithdraw(data);
      alert(`Status do Saque: ${res.status}`);
      setView('game');
    } catch { alert('Erro ao processar saque.'); }
    finally { setLoading(false); }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || wordCount > 30) return;
    const res = await bingoApi.sendSupport(user.id, supportMsg);
    if (res.whatsappUrl) window.open(res.whatsappUrl, '_blank');
    alert('Pedido de ajuda enviado!');
    setView('game');
  };

  const wordCount = supportMsg.trim() ? supportMsg.trim().split(/\s+/).length : 0;

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl animate__animated animate__fadeIn">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-yellow-500 italic">BINGO MASTER</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mobile Client v1.2</p>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-xl mb-6">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${authMode === 'login' ? 'bg-yellow-500 text-slate-900' : 'text-slate-500'}`}>Login</button>
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${authMode === 'register' ? 'bg-yellow-500 text-slate-900' : 'text-slate-500'}`}>Cadastro</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {authMode === 'register' && (
              <input name="nome" required placeholder="Nome Completo" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
            )}
            <input name="cpf" required placeholder="CPF" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
            <input name="whatsapp" required placeholder="WhatsApp" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
            <input name="password" required type="password" placeholder="Senha" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
            
            <button disabled={loading} className="w-full bg-yellow-500 p-4 rounded-xl font-black text-slate-900 uppercase shadow-lg active:scale-95 transition-all mt-4">
              {loading ? 'Processando...' : authMode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden select-none">
      {/* 3.4 PAINEL DE PREMIAÇÃO */}
      <div className="bg-slate-900 border-b border-white/5 px-2 py-2 flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'quadra', label: 'QUADRA', val: gameState?.prizes.quadra },
          { id: 'linha', label: 'LINHA', val: gameState?.prizes.linha },
          { id: 'bingo', label: 'BINGO', val: gameState?.prizes.bingo },
          { id: 'acumulado', label: 'ACUMULADO', val: gameState?.prizes.acumulado }
        ].map((p) => {
          const isActive = gameState?.prizes.activePrize === p.id;
          return (
            <div key={p.id} className={`flex flex-col items-center px-3 py-1 rounded-lg border transition-all ${isActive ? 'bg-yellow-500/10 border-yellow-500 opacity-100' : 'border-transparent opacity-30'}`}>
              <span className={`text-[8px] font-bold ${isActive ? 'text-yellow-500' : 'text-slate-500'}`}>{p.label}</span>
              <span className="text-xs font-black text-white">${p.val || '0'}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/80 p-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 flex items-center justify-center font-black text-slate-900">
            {user?.nome[0]}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Saldo</p>
            <p className="text-lg font-black text-white leading-tight">R$ {user?.saldo.toFixed(2)}</p>
          </div>
        </div>
        <button onClick={() => bingoApi.requestCredit(user!.id).then(r => window.location.href = r.url)} className="bg-green-600 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg active:scale-90 uppercase tracking-tighter">
          Crédito+
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
        {view === 'game' && (
          <>
            <div className="bg-slate-900/40 rounded-3xl p-6 flex flex-col items-center border border-white/5">
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center border-[10px] border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                <span className="text-6xl font-black text-slate-900 tabular-nums">{gameState?.currentBall || '--'}</span>
              </div>
              <div className="flex gap-1.5 mt-6 overflow-x-auto w-full justify-center hide-scrollbar">
                {gameState?.history.slice(-8).reverse().map((b, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 text-[10px] flex items-center justify-center font-bold border border-white/5 opacity-60">
                    {b}
                  </div>
                ))}
              </div>
            </div>
            {cards.map(card => (
              <BingoGrid 
                key={card.id} 
                card={card} 
                isApproaching={gameState?.approximation?.cardId === card.id}
                approximationType={gameState?.approximation?.type}
                ballsMissing={gameState?.approximation?.ballsMissing}
              />
            ))}
          </>
        )}

        {view === 'finance' && (
          <div className="bg-slate-800 p-6 rounded-3xl animate__animated animate__fadeInUp">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Icons.Wallet className="w-6 h-6 text-green-500" />
              Solicitar Saque
            </h3>
            <form onSubmit={handleWithdrawSubmit} className="space-y-3">
              <input name="nome" required placeholder="Nome Titular" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
              <input name="cpf" required placeholder="CPF" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
              <input name="whatsapp" required placeholder="WhatsApp" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
              <input name="password" required type="password" placeholder="Sua Senha" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
              <input name="pix" required placeholder="Chave PIX" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
              <input name="amount" required type="number" placeholder="Valor R$" className="w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm" />
              <button disabled={loading} className="w-full bg-green-600 p-4 rounded-xl font-black text-white uppercase mt-4">{loading ? 'Enviando...' : 'Confirmar Saque'}</button>
            </form>
          </div>
        )}

        {view === 'support' && (
          <div className="bg-slate-800 p-6 rounded-3xl animate__animated animate__fadeInUp">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
              <Icons.Support className="w-6 h-6 text-blue-500" />
              Ajuda
            </h3>
            <p className="text-xs text-slate-400 mb-6">Máximo de 30 palavras.</p>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <textarea 
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                required 
                placeholder="Descreva seu problema..." 
                className={`w-full bg-slate-700 p-4 rounded-xl outline-none text-white text-sm h-32 resize-none ${wordCount > 30 ? 'ring-2 ring-red-500' : ''}`}
              />
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className={wordCount > 30 ? 'text-red-500' : 'text-slate-500'}>{wordCount} / 30 palavras</span>
                {wordCount > 30 && <span className="text-red-500 uppercase">Limite excedido</span>}
              </div>
              <button disabled={wordCount > 30 || wordCount === 0} className="w-full bg-slate-900 p-4 rounded-xl font-black text-white uppercase disabled:opacity-50">Enviar ao Suporte</button>
            </form>
          </div>
        )}
      </main>

      <nav className="bg-slate-900 border-t border-white/5 flex justify-around p-3 pb-8">
        {[
          { id: 'game', icon: <Icons.Trophy className="w-6 h-6"/>, label: 'Jogo' },
          { id: 'finance', icon: <Icons.Wallet className="w-6 h-6"/>, label: 'Saque' },
          { id: 'support', icon: <Icons.Support className="w-6 h-6"/>, label: 'Ajuda' }
        ].map(item => (
          <button key={item.id} onClick={() => setView(item.id as View)} className={`flex flex-col items-center gap-1 transition-colors ${view === item.id ? 'text-yellow-500' : 'text-slate-600'}`}>
            {item.icon}
            <span className="text-[10px] font-black uppercase">{item.label}</span>
          </button>
        ))}
      </nav>

      {showWinner && gameState?.winnerName && (
        <WinnerBanner name={gameState.winnerName} cardId={gameState.winnerCardId || '--'} onClose={() => setShowWinner(false)} />
      )}
    </div>
  );
};

export default App;
