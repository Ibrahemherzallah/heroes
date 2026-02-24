// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";

import Index from "@/pages/Index";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import ProductDetails from "@/pages/ProductDetails";
import Contact from "@/pages/Contact";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProfile from "@/pages/AdminProfile";
import NotFound from "@/pages/NotFound";
import ShippingPolicy from "@/pages/ShippingPolicy";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";

import ProtectedRoute from "./ProtectedRoute";          // admin-only
import UserProtectedRoute from "./UserProtectedRoute";  // logged-in users
import { FavoriteProvider } from "./contexts/FavoriteContext";
import FavoritesPage from "@/pages/FavoritesPage.tsx";

function App() {
  return (
      <CartProvider>
          <FavoriteProvider>
              <Router>
                  <div className="App">
                      <Routes>
                          {/* Public pages */}
                          <Route path="/" element={<Index />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/policy" element={<ShippingPolicy />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          {/* Auth pages */}
                          <Route path="/login" element={<Login />} />
                          {/* optional: keep admin login URL as alias */}
                          <Route path="/admin/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />

                          {/* User protected page */}
                          <Route path="/profile" element={
                                  <UserProtectedRoute>
                                      <Profile />
                                  </UserProtectedRoute>
                              }
                          />

                          {/* Admin protected pages */}
                          <Route path="/admin/dashboard" element={
                                  <ProtectedRoute>
                                      <AdminDashboard />
                                  </ProtectedRoute>
                              }
                          />

                          <Route path="/admin/profile" element={
                                  <ProtectedRoute>
                                      <AdminProfile />
                                  </ProtectedRoute>
                              }
                          />

                          {/* 404 */}
                          <Route path="*" element={<NotFound />} />
                      </Routes>
                      <Toaster />
                  </div>
              </Router>
          </FavoriteProvider>
      </CartProvider>
  );
}

export default App;