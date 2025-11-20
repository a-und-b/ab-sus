import React from 'react';
import { Participant, FoodCategory, BUFFET_INSPIRATIONS } from '../types';
import { Leaf, WheatOff, MilkOff, Wine, Nut, ChefHat, Sparkles } from 'lucide-react';
import { Avatar } from './Avatar';

interface FoodDisplayProps {
  participants: Participant[];
}

export const FoodDisplay: React.FC<FoodDisplayProps> = ({ participants }) => {
  
  // 1. Get all taken dish names to filter suggestions
  const takenDishNames = participants
    .filter(p => p.food?.name)
    .map(p => p.food!.name.trim().toLowerCase());

  const groupedFood = Object.values(FoodCategory).map(category => {
    // Real items from guests
    const realItems = participants.filter(
        p => p.status === 'attending' && p.food && p.food.category === category && p.food.name.trim().length > 0
    );

    // Suggestions calculation kept for logic consistency but not rendered in list anymore
    const suggestions = (BUFFET_INSPIRATIONS[category] || []).filter(suggestion => {
        return !takenDishNames.includes(suggestion.toLowerCase());
    });

    return {
      category,
      realItems,
      suggestions
    };
  });

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-white overflow-hidden sticky top-24">
      <div className="p-6 border-b border-stone-100 bg-stone-50/50">
        <h3 className="font-serif font-bold text-xmas-dark text-xl flex items-center gap-2">
          <ChefHat className="text-xmas-gold" size={24}/> Das Buffet
        </h3>
        <p className="text-sm text-stone-500 mt-1">Ein Blick auf unsere kulinarische Reise.</p>
      </div>

      <div className="p-6 space-y-8">
        {groupedFood.map((group) => (
          <div key={group.category}>
            <div className="flex items-center gap-3 mb-4">
                <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wider">
                {group.category}
                </h4>
                <div className="h-px flex-grow bg-stone-100"></div>
            </div>
            
            {group.realItems.length === 0 ? (
              <p className="text-stone-300 italic text-sm pl-2">Noch leer...</p>
            ) : (
              <ul className="space-y-2">
                {/* Real Items */}
                {group.realItems.map((p) => {
                  const showName = p.showNameInBuffet !== false; 
                  return (
                    <li key={p.id} className="group relative flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors">
                        {/* Avatar / User */}
                         {showName ? (
                            <div className="relative shrink-0 group/tooltip cursor-help">
                                <Avatar style={p.avatarStyle || 'micah'} seed={p.avatarSeed || p.name} image={p.avatarImage} size={32} className="bg-stone-100 ring-1 ring-stone-100" />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-stone-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg transform translate-y-1 group-hover/tooltip:translate-y-0">
                                    {p.name}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-800"></div>
                                </div>
                            </div>
                         ) : (
                             <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-300">
                                 <ChefHat size={14}/>
                             </div>
                         )}

                        {/* Dish Name */}
                        <span className="font-bold text-stone-800 text-sm flex-grow">{p.food?.name}</span>

                        {/* Icons */}
                        <div className="flex gap-1 shrink-0 opacity-80">
                            {p.food?.isVegan && <span title="Vegan" className="text-green-600 bg-green-50 p-1 rounded"><Leaf size={12}/></span>}
                            {p.food?.isGlutenFree && <span title="Glutenfrei" className="text-amber-600 bg-amber-50 p-1 rounded"><WheatOff size={12}/></span>}
                            {p.food?.isLactoseFree && <span title="Laktosefrei" className="text-blue-500 bg-blue-50 p-1 rounded"><MilkOff size={12}/></span>}
                            {p.food?.containsAlcohol && <span title="Enthält Alkohol" className="text-purple-600 bg-purple-50 p-1 rounded"><Wine size={12}/></span>}
                            {p.food?.containsNuts && <span title="Enthält Nüsse" className="text-stone-400 bg-stone-100 p-1 rounded"><Nut size={12}/></span>}
                        </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};