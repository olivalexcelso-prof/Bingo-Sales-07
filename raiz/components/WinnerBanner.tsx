
import React from 'react';
import { Icons } from '../constants';

interface Props {
  name: string;
  cardId: string;
  onClose: () => void;
}

const WinnerBanner: React.FC<Props> = ({ name, cardId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate__animated animate__fadeIn">
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.4)] relative overflow-hidden animate__animated animate__zoomIn">
        <div className="absolute top-0 left-0 w-full h-2 bg-white/30 animate-pulse"></div>
        
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <Icons.Trophy className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
        
        <h2 className="text-slate-900 text-3xl font-black mb-2 uppercase tracking-tighter">
          BINGO!!
        </h2>
        
        <p className="text-slate-800 text-lg font-bold mb-4">
          Temos um ganhador(a)!
        </p>
        
        <div className="bg-slate-900/10 rounded-xl p-4 mb-6 border border-white/20">
          <p className="text-slate-900 text-xl font-black uppercase">{name}</p>
          <p className="text-slate-800 text-sm font-semibold">Cartela: {cardId}</p>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl hover:bg-slate-800 transition-colors uppercase"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default WinnerBanner;
