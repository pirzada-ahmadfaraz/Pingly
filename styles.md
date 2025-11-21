# Codebase Styles & Design System

## 1. Color Palette

The project uses CSS variables for theming, supporting both Light and Dark modes. These are defined in `frontend/src/index.css`.

### Light Mode (Default)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `--background` | `0 0% 100%` | Main background color (White) |
| `--foreground` | `0 0% 3.9%` | Main text color (Almost Black) |
| `--card` | `0 0% 100%` | Card background |
| `--card-foreground` | `0 0% 3.9%` | Card text color |
| `--popover` | `0 0% 100%` | Popover background |
| `--popover-foreground` | `0 0% 3.9%` | Popover text color |
| `--primary` | `0 0% 9%` | Primary action color (Very Dark Grey) |
| `--primary-foreground` | `0 0% 98%` | Text on primary color |
| `--secondary` | `0 0% 96.1%` | Secondary action color (Light Grey) |
| `--secondary-foreground` | `0 0% 9%` | Text on secondary color |
| `--muted` | `0 0% 96.1%` | Muted background |
| `--muted-foreground` | `0 0% 45.1%` | Muted text |
| `--accent` | `0 0% 96.1%` | Accent background |
| `--accent-foreground` | `0 0% 9%` | Accent text |
| `--destructive` | `0 84.2% 60.2%` | Destructive action color (Red) |
| `--destructive-foreground` | `0 0% 98%` | Text on destructive color |
| `--border` | `0 0% 89.8%` | Border color |
| `--input` | `0 0% 89.8%` | Input border color |
| `--ring` | `0 0% 3.9%` | Focus ring color |
| `--radius` | `0.5rem` | Default border radius |

### Dark Mode (`.dark` class)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `--background` | `0 0% 3.9%` | Main background color (Very Dark Grey) |
| `--foreground` | `0 0% 98%` | Main text color (Off White) |
| `--card` | `0 0% 3.9%` | Card background |
| `--card-foreground` | `0 0% 98%` | Card text color |
| `--popover` | `0 0% 3.9%` | Popover background |
| `--popover-foreground` | `0 0% 98%` | Popover text color |
| `--primary` | `0 0% 98%` | Primary action color (Off White) |
| `--primary-foreground` | `0 0% 9%` | Text on primary color |
| `--secondary` | `0 0% 14.9%` | Secondary action color (Dark Grey) |
| `--secondary-foreground` | `0 0% 98%` | Text on secondary color |
| `--muted` | `0 0% 14.9%` | Muted background |
| `--muted-foreground` | `0 0% 63.9%` | Muted text |
| `--accent` | `0 0% 14.9%` | Accent background |
| `--accent-foreground` | `0 0% 98%` | Accent text |
| `--destructive` | `0 62.8% 30.6%` | Destructive action color (Dark Red) |
| `--destructive-foreground` | `0 0% 98%` | Text on destructive color |
| `--border` | `0 0% 14.9%` | Border color |
| `--input` | `0 0% 14.9%` | Input border color |
| `--ring` | `0 0% 83.1%` | Focus ring color |

### Chart Colors
| Variable | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| `--chart-1` | `12 76% 61%` | `220 70% 50%` |
| `--chart-2` | `173 58% 39%` | `160 60% 45%` |
| `--chart-3` | `197 37% 24%` | `30 80% 55%` |
| `--chart-4` | `43 74% 66%` | `280 65% 60%` |
| `--chart-5` | `27 87% 67%` | `340 75% 55%` |

## 2. Typography

Defined in `frontend/src/index.css`.

- **Body Font**: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`
- **Code Font**: `source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace`

## 3. Tailwind Configuration

Key extensions from `frontend/tailwind.config.js`.

### Border Radius
- `lg`: `var(--radius)`
- `md`: `calc(var(--radius) - 2px)`
- `sm`: `calc(var(--radius) - 4px)`

### Animations
- **Accordion Down**: `accordion-down 0.2s ease-out`
- **Accordion Up**: `accordion-up 0.2s ease-out`

### Keyframes
**accordion-down**
- From: `height: 0`
- To: `height: var(--radix-accordion-content-height)`

**accordion-up**
- From: `height: var(--radix-accordion-content-height)`
- To: `height: 0`

## 4. Global Styles & Effects

Defined in `frontend/src/App.css`.

### Grid Background
A custom grid background pattern is applied to `.grid-background`.
- **Color**: `#000000`
- **Pattern**: Linear gradients creating a 50px grid with `rgba(255, 255, 255, 0.03)`.

### Interactive Elements
Buttons and links have a custom transition and hover effect:
- **Transition**: `color 0.3s, background-color 0.3s, border-color 0.3s, transform 0.2s`
- **Hover**: `transform: translateY(-1px)`

### Animations
- **Slide Up**: `@keyframes slide-up` (TranslateY 100px -> 0, Opacity 0 -> 1)
- **Utility Class**: `.animate-slide-up` (0.3s ease-out)
- **Delays**: `.delay-100` (0.1s), `.delay-200` (0.2s)
