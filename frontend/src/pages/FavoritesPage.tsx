import { useFavorite } from "@/contexts/FavoriteContext";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header.tsx";

const FavoritesPage = () => {
    const { favorites } = useFavorite();

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-8 text-center">المفضلة</h1>

                {favorites.length === 0 ? (
                    <p className="text-center text-gray-500">
                        لا توجد منتجات في المفضلة
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favorites.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;