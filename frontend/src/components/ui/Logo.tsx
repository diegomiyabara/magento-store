interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { cube: 20, textClass: 'text-base',  subClass: 'text-[0.58rem]' },
  md: { cube: 26, textClass: 'text-xl',    subClass: 'text-[0.62rem]' },
  lg: { cube: 34, textClass: 'text-2xl',   subClass: 'text-xs'        },
};

export default function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const { cube, textClass, subClass } = sizes[size];
  const nameColor  = variant === 'light' ? '#ffffff'      : '#1e293b';
  const techColor  = variant === 'light' ? 'rgba(255,255,255,0.55)' : '#64748b';

  return (
    <span className="flex items-center gap-2.5 select-none">
      {/* isometric cube — top: blue, right: orange, left: dark-blue */}
      <svg
        width={cube}
        height={cube}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* top face */}
        <polygon points="10,0 20,5 10,10 0,5" fill="#1d4ed8" />
        {/* right face */}
        <polygon points="20,5 20,15 10,20 10,10" fill="#f97316" />
        {/* left face */}
        <polygon points="0,5 10,10 10,20 0,15" fill="#1e40af" />
      </svg>

      {/* wordmark */}
      <span className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-tight ${textClass}`}
          style={{ color: nameColor, lineHeight: 1 }}
        >
          DM3D
        </span>
        <span
          className={`font-semibold uppercase tracking-[0.18em] ${subClass}`}
          style={{ color: techColor, marginTop: 2 }}
        >
          Tech
        </span>
      </span>
    </span>
  );
}
