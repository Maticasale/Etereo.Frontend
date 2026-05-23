import { Link } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'

export const authInputStyle: CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 15,
  color: 'var(--color-text-primary)',
  padding: 0,
  fontFamily: "'Inter', system-ui, sans-serif",
  width: '100%',
}

function BotanicalSVG() {
  return (
    <svg
      viewBox="0 0 500 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, right: -40, width: '85%', height: '100%', opacity: 0.4 }}
    >
      <defs>
        <linearGradient id="leafGradAuthShell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(197,160,89,0.6)" />
          <stop offset="100%" stopColor="rgba(197,160,89,0.05)" />
        </linearGradient>
      </defs>
      <g fill="url(#leafGradAuthShell)" stroke="rgba(197,160,89,0.4)" strokeWidth="0.6">
        <path d="M 380 -20 Q 360 200 320 420 T 280 820" fill="none" />
        <path d="M 420 -10 Q 410 220 380 460 T 340 820" fill="none" />
        <path d="M 460 10 Q 470 240 450 480 T 420 820" fill="none" />
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 40 + i * 32
          const x = 360 + Math.sin(i * 0.5) * 50
          const rot = -30 + (i % 2 ? 60 : -20)
          return <ellipse key={i} cx={x} cy={y} rx="6" ry={28 + (i % 3) * 6} transform={`rotate(${rot} ${x} ${y})`} />
        })}
        {Array.from({ length: 18 }).map((_, i) => {
          const y = 100 + i * 38
          const x = 440 + Math.cos(i * 0.7) * 30
          const rot = 20 + (i % 2 ? -50 : 70)
          return <ellipse key={`b${i}`} cx={x} cy={y} rx="5" ry={24 + (i % 3) * 5} transform={`rotate(${rot} ${x} ${y})`} />
        })}
      </g>
    </svg>
  )
}

interface AuthFrameProps {
  eyebrow: string
  title: ReactNode
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export default function AuthFrame({ eyebrow, title, subtitle, children, footer }: AuthFrameProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        background: 'var(--color-tertiary)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            background: `
              radial-gradient(ellipse at 30% 80%, rgba(197,160,89,0.22) 0%, transparent 55%),
              radial-gradient(ellipse at 70% 20%, rgba(249,245,240,0.06) 0%, transparent 60%),
              linear-gradient(180deg, #5a4530 0%, #4A3728 60%, #2a1d12 100%)
            `,
          }}
        >
          <BotanicalSVG />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 200,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
            padding: '0 40px',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 168,
              color: 'var(--color-tertiary)',
              lineHeight: 0.95,
              fontWeight: 400,
              display: 'inline-block',
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}
          >
            Etéreo
          </span>
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: 'var(--color-secondary)',
              opacity: 0.95,
              fontWeight: 500,
            }}
          >
            belleza · cuidado · bienestar
          </div>
          <p
            style={{
              marginTop: 40,
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 18,
              lineHeight: 1.7,
              color: 'var(--color-tertiary)',
              opacity: 0.78,
              fontStyle: 'italic',
              fontWeight: 300,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
          >
            "Un refugio donde el tiempo se detiene y el cuidado se vuelve un acto de amor propio."
          </p>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 44,
            right: 44,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--color-tertiary)',
            opacity: 0.55,
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          <span>Moreno 212 · 1° A</span>
          <span>@etereo.salondebelleza</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 75px',
          position: 'relative',
          alignItems: 'center',
          background: 'var(--color-tertiary)',
          overflowY: 'auto',
        }}
      >
        <Link
          to="/"
          style={{
            position: 'absolute',
            top: 32,
            right: 36,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ← Volver al inicio
        </Link>

        <div style={{ maxWidth: 430, width: '100%' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--color-secondary)',
              marginBottom: 20,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ display: 'inline-block', width: 18, height: 1, background: 'var(--color-secondary)' }} />
            {eyebrow}
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 52,
              margin: 0,
              color: 'var(--color-text-primary)',
              lineHeight: 1.05,
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginTop: 10,
              marginBottom: 36,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>

          {children}

          {footer ? (
            <div
              style={{
                textAlign: 'center',
                marginTop: 36,
                fontSize: 14,
                color: 'var(--color-text-secondary)',
              }}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
