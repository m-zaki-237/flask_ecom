import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "./components/ui/toast"
import { Login } from "./pages/auth/Login"
import Dashboard from "./pages/admin/Dashboard"
import Products from "./pages/admin/Products"
import Register from "./pages/auth/Register"
import Orders from "./pages/admin/Orders"
import Users from "./pages/admin/Users"
import AuditLogs from "./pages/admin/AuditLogs"
import SupportTickets from "./pages/admin/SupportTicket"
import Payments from "./pages/admin/Payments"
import Home from "./pages/customer/Home"
import ProductDetail from "./pages/customer/ProductDetails"
import Cart from "./pages/customer/Cart"
import { CustomerOrders } from "./pages/customer/Orders"
import Wishlist from "./pages/customer/Wishlist"
import { Tickets } from "./pages/customer/Ticket"
import SellerDashboard from "./pages/seller/Dashboard"
import SellerProducts from "./pages/seller/Products"
import SellerPayments from "./pages/seller/Payments"
import SellerOrders from "./pages/seller/Orders"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to='login'/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/admin/dashboard" element={<Dashboard/>}/>
        <Route path='/admin/products' element={<Products/>}/>
        <Route path='/admin/orders' element={<Orders/>}/>
        <Route path='/admin/payments' element={<Payments/>}/>
        <Route path="/admin/users" element={<Users/>}/>
        <Route path="/admin/audit_logs" element={<AuditLogs/>}/>
        <Route path="/admin/support_tickets" element={<SupportTickets/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/product/:product_id" element={<ProductDetail/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/orders" element={<CustomerOrders/>}/>
        <Route path="/wishlist" element={<Wishlist/>}/>
        <Route path="/support_tickets" element={<Tickets/>}/>
        <Route path="/seller/dashboard" element={<SellerDashboard/>}/>
        <Route path="/seller/products" element={<SellerProducts/>}/>
        <Route path="/seller/payments" element={<SellerPayments/>}/>
        <Route path="/seller/orders" element={<SellerOrders/>}/>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App