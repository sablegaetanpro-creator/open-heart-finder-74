import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				/* Dating App Specific Colors */
				message: {
					DEFAULT: 'hsl(var(--message))',
					foreground: 'hsl(var(--message-foreground))',
					glow: 'hsl(var(--message-glow))'
				},
				like: {
					DEFAULT: 'hsl(var(--like))',
					foreground: 'hsl(var(--like-foreground))'
				},
				dislike: {
					DEFAULT: 'hsl(var(--dislike))',
					foreground: 'hsl(var(--dislike-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'love-pulse': {
					'0%, 100%': { 
						transform: 'scale(1)',
						filter: 'drop-shadow(0 0 0px hsl(var(--like)))'
					},
					'50%': { 
						transform: 'scale(1.05)',
						filter: 'drop-shadow(0 0 20px hsl(var(--like) / 0.6))'
					}
				},
				'swipe-right': {
					'0%': { transform: 'translateX(0) rotate(0deg)' },
					'100%': { transform: 'translateX(300px) rotate(30deg)' }
				},
				'swipe-left': {
					'0%': { transform: 'translateX(0) rotate(0deg)' },
					'100%': { transform: 'translateX(-300px) rotate(-30deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'love-pulse': 'love-pulse 2s ease-in-out infinite',
				'swipe-right': 'swipe-right 0.3s ease-out forwards',
				'swipe-left': 'swipe-left 0.3s ease-out forwards',
				'float': 'float 3s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-love': 'var(--gradient-love)',
				'gradient-message': 'var(--gradient-message)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'love': 'var(--shadow-love)',
				'message': 'var(--shadow-message)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
