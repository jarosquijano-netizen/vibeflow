'use client';

const MONO = "'JetBrains Mono', monospace";

const ICON_MAP: Record<string, string> = {
  local_fire_department: '🔥',
  bolt: '⚡',
  psychology: '🧠',
  rocket_launch: '🚀',
  shield: '🛡',
  star: '★',
  hive: '⬡',
  deployed_code: '⬒',
  terminal: '>_',
  groups: '⊕',
  bookmark: '◈',
  target: '◎',
  speed: '◷',
  sync: '↻',
  workspace_premium: '♦',
  database: '⬡',
};

interface ArcadeHexBadgeProps {
  icon: string;
  color: string;
  shadowColor: string;
  size?: 'sm' | 'md' | 'lg';
  earned?: boolean;
  onClick?: () => void;
}

export default function ArcadeHexBadge({
  icon,
  color,
  shadowColor,
  size = 'md',
  earned = true,
  onClick,
}: ArcadeHexBadgeProps) {
  const px = size === 'sm' ? 48 : size === 'md' ? 56 : 80;
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 22 : 32;
  const symbol = ICON_MAP[icon] ?? '◆';

  const hexClip = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

  const baseStyle: React.CSSProperties = {
    width: px,
    height: px,
    clipPath: hexClip,
    background: '#1F1F25',
    border: earned ? `1px solid ${color}4D` : '1px solid #3B4B3D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 200ms ease',
    flexShrink: 0,
    filter: earned ? 'none' : 'grayscale(1)',
    opacity: earned ? 1 : 0.4,
    boxShadow: earned ? `0 0 15px ${shadowColor}` : 'none',
    position: 'relative',
  };

  return (
    <div
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!earned || !onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = `${color}1A`;
        el.style.boxShadow = `0 0 25px ${shadowColor}`;
        el.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        if (!earned || !onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = '#1F1F25';
        el.style.boxShadow = `0 0 15px ${shadowColor}`;
        el.style.transform = 'scale(1)';
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: iconSize,
          color: earned ? color : '#B9CBB9',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {symbol}
      </span>
    </div>
  );
}
