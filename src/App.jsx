import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import CustomRequest from './pages/CustomRequest'
import CartCheckout from './pages/CartCheckout'
import About from './pages/About'
import Shipping from './pages/Shipping'
import Faq from './pages/Faq'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardHome from './pages/admin/DashboardHome'
import ProductsAdmin from './pages/admin/ProductsAdmin'
import OrdersAdmin from './pages/admin/OrdersAdmin'
import CustomRequestsAdmin from './pages/admin/CustomRequestsAdmin'
import CustomersAdmin from './pages/admin/CustomersAdmin'
import SettingsAdmin from './pages/admin/SettingsAdmin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/custom-design" element={<CustomRequest />} />
      <Route path="/cart" element={<CartCheckout />} />
      <Route path="/about" element={<About />} />
      <Route path="/shipping" element={<Shipping />} />
      <Route path="/faq" element={<Faq />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="custom-requests" element={<CustomRequestsAdmin />} />
        <Route path="customers" element={<CustomersAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>
    </Routes>
  )
}
