import React from 'react';
import { User } from 'lucide-react';
import { AvatarStyle } from '../types';

interface AvatarProps {
  style: AvatarStyle;
  seed: string;
  image?: string; // Base64 image from GenAI
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  style,
  seed,
  image,
  size = 64,
  className = '',
}) => {
  // Blank/Placeholder style
  if (style === 'blank') {
    return (
      <div
        className={`rounded-full border-2 border-dashed border-xmas-gold/30 bg-xmas-gold/5 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <User size={size * 0.4} className="text-xmas-gold/50" />
      </div>
    );
  }

  // If we have a generated image, use it
  if (image) {
    return (
      <div
        className={`overflow-hidden rounded-full bg-stone-100 border border-stone-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={`data:image/png;base64,${image}`}
          alt="Avatar"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to DiceBear
  const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;

  return (
    <div
      className={`overflow-hidden rounded-full bg-stone-100 border border-stone-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={url} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
};
