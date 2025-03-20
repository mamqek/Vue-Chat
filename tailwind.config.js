import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	safelist: ["dark"],
	prefix: "tw-",

    content: [
        "./src/**/*.{vue,js,ts,jsx,tsx}",  // Targets only files in your package
        "./shadcn-vue-components/**/*.{vue,js,ts,jsx,tsx}", // If you are using shadcn-vue components
    ],

	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
			screens: {
				xlg: { max: `1440px` },
				lg: { max: `991px` },
				md: { max: `767px` },
				sm: { max: `576px` },
				xsm: { max: `425px` },
				'min-xlg': { min: `1440px` },
				'min-lg': { min: `991px` },
				'min-md': { min: `767px` },
				'min-sm': { min: `576px` },
				'min-xsm': { min: `425px` },
			},
    		colors: {
    			border: 'hsl(var(--shadcn-border))',
    			input: 'hsl(var(--shadcn-input))',
    			ring: 'hsl(var(--shadcn-ring))',
    			background: 'hsl(var(--shadcn-background))',
    			foreground: 'hsl(var(--shadcn-foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--shadcn-primary))',
    				foreground: 'hsl(var(--shadcn-primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--shadcn-secondary))',
    				foreground: 'hsl(var(--shadcn-secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--shadcn-destructive))',
    				foreground: 'hsl(var(--shadcn-destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--shadcn-muted))',
    				foreground: 'hsl(var(--shadcn-muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--shadcn-accent))',
    				foreground: 'hsl(var(--shadcn-accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--shadcn-popover))',
    				foreground: 'hsl(var(--shadcn-popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--shadcn-card))',
    				foreground: 'hsl(var(--shadcn-card-foreground))'
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			xl: 'calc(var(--shadcn-radius) + 4px)',
    			lg: 'var(--shadcn-radius)',
    			md: 'calc(var(--shadcn-radius) - 2px)',
    			sm: 'calc(var(--shadcn-radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: 0
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
    					height: 0
    				}
    			},
    			'collapsible-down': {
    				from: {
    					height: 0
    				},
    				to: {
    					height: 'var(--radix-collapsible-content-height)'
    				}
    			},
    			'collapsible-up': {
    				from: {
    					height: 'var(--radix-collapsible-content-height)'
    				},
    				to: {
    					height: 0
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'collapsible-down': 'collapsible-down 0.2s ease-in-out',
    			'collapsible-up': 'collapsible-up 0.2s ease-in-out'
    		}
    	}
    },
	plugins: [
		animate,
		containerQueries
    ],
}