import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import logo from '../../public/heroes-logo.png';
import CartDrawer from './CartDrawer';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon } from "lucide-react";
import { Heart } from "lucide-react";
import { useFavorite } from "@/contexts/FavoriteContext";

const Header = () => {
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { favorites } = useFavorite();

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) {
      // not logged in → go to login page
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      if (user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      navigate("/login");
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
                  <img className="w-14 h-10 rounded-lg flex items-center justify-center"   src={logo} alt={'heroes-logo'} />
              <span className="text-2xl font-bold text-heroes-red">Heroes Technology</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link to="/" className="text-gray-700 hover:text-heroes-red transition-colors">
                الرئيسية
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-heroes-red transition-colors">
                المنتجات
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-heroes-red transition-colors">
                الفئات
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-heroes-red transition-colors">
                اتصل بنا
              </Link>
            </nav>

            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-heroes-red"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
              <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => navigate("/favorites")}
              >
                <Heart className="h-5 w-5" />

                {favorites.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-heroes-red">
                      {favorites.length}
                    </Badge>
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={handleProfileClick}>
                <UserIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
