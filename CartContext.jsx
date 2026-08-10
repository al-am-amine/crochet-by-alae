import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function addItem(item) {
    // item: { productId, name, price, showPrice, color, size, notes, image }
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.color === item.color && i.size === item.size,
      )
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function updateQty(index, qty) {
    setItems((prev) =>
      prev.map((i, idx) => (idx === index ? { ...i, qty: Math.max(1, qty) } : i)).filter((i) => i.qty > 0),
    )
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + (i.showPrice ? (i.price || 0) * i.qty : 0), 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
