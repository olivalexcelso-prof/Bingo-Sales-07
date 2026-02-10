
import React from 'react';
import { BingoCard } from '../types';
import { Icons } from '../constants';

interface Props {
  card: BingoCard;
  isApproaching?: boolean;
  approximationType?: string;
  ballsMissing?: number;
}

const BingoGrid: React.FC<Props> = ({ card, isApproaching, approximationType, ballsMissing }) => {
  return (
    <div className={`relative bg-slate-900 rounded-2xl p-3 border-2 transition-all duration-500 ${isApproaching ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-[1.02]' : 'border-slate-800'}`}>
      {/* 3.3 INDICADOR DE APROXIMAÇÃO */}
      {isApproaching && (
        <div className="absolute -top-3 -right-3 z-20 bg-red-600 rounded-full p-2 text-white heart-pulse flex items-center gap-1 shadow-xl border-2 border-white/20">
          <Icons.Heart className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase">{ballsMissing} BOLA(S)</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[10px] text-slate-600 font-black">ID: {card.id.split('-')[0]}</span>
        {approximationType && (
          <span className="text-[10px] text-red-500 font-black uppercase animate-pulse">
            Rumo a {approximationType}!
          </span>
        )}
      </div>

      <div className="bingo-grid bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        {['B','I','N','G','O'].map((letter) => (
          <div key={letter} className="bg-slate-700/50 py-1 text-center text-[10px] font-black text-slate-400">
            {letter}
          </div>
        ))}
        {card.numbers.map((row, rowIndex) => 
          row.map((num, colIndex) => {
            // Marcação definida 100% pelo servidor no array 'marked'
            const isMarked = card.marked[rowIndex][colIndex];
            return (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`bingo-cell border border-slate-700/30 text-xs font-black transition-all duration-300 ${
                  isMarked 
                  ? 'bg-yellow-500 text-slate-950 scale-95 shadow-inner' 
                  : 'text-slate-400 bg-slate-900/40'
                }`}
              >
                {num === null ? '⭐' : num}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BingoGrid;
