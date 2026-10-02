type P = { size?: number };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

export const IconArrowRight = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconExternal = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);
export const IconMenu = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const IconClose = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconCopy = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a1 1 0 0 1 1-1h10" />
  </svg>
);
export const IconCheck = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);
export const IconAlert = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6M12 16.5v.5" />
  </svg>
);
export const IconArrowUp = ({ size = 16 }: P) => (
  <svg {...base(size)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
export const IconArrowDown = ({ size = 14 }: P) => (
  <svg {...base(size)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
export const IconMail = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
export const IconDownload = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);
