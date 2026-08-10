// Thin wrapper around Google's "Material Symbols Outlined" icon font,
// matching the icon system used throughout the Stitch & Soul redesign.
// Usage: <Icon name="shopping_basket" className="text-primary" size={20} />
export default function Icon({ name, className = '', size = 24, filled = false }) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
