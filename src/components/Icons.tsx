/** インラインSVGアイコン集（線で描いた単純な形。色はcurrentColorに追従） */
type IconProps = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const HomeIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 11 12 4l9 7" />
    <path d="M5 10v9h14v-9" />
  </svg>
)

export const GridIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
)

export const PencilIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 20h4l11-11-4-4L4 16v4z" />
    <path d="M13 7l4 4" />
  </svg>
)

export const BookIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2z" />
    <path d="M4 5v16" />
  </svg>
)

export const ChartIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 20h16" />
    <path d="M7 16v-5" />
    <path d="M12 16V7" />
    <path d="M17 16v-8" />
  </svg>
)

export const GearIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
  </svg>
)

export const BackIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M15 4 7 12l8 8" />
  </svg>
)

export const CheckIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 12.5 9.5 18 20 6" />
  </svg>
)

export const CircleIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
  </svg>
)

export const CrossIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
)

export const PlayIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} fill="currentColor" stroke="none">
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
)

export const PauseIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} fill="currentColor" stroke="none">
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </svg>
)

export const NextIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} fill="currentColor" stroke="none">
    <path d="M6 4.5v15l9-7.5z" />
    <rect x="16" y="4.5" width="3" height="15" rx="1" />
  </svg>
)

export const PrevIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} fill="currentColor" stroke="none">
    <path d="M18 4.5v15l-9-7.5z" />
    <rect x="5" y="4.5" width="3" height="15" rx="1" />
  </svg>
)

export const ResetIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 10a8 8 0 1 1 1.7 6.9" />
    <path d="M4 4v6h6" />
  </svg>
)

export const FlameIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3s5.5 4.5 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 9 9 7 9.5 5c1 1.5 2 2 2.5 2 0-1.5 0-3 0-4z" />
  </svg>
)

export const StarIcon = ({ size = 20, filled = false }: IconProps & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
  </svg>
)

export const ClockIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)
