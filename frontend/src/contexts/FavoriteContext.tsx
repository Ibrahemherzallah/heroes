import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product } from "@/contexts/CartContext";

interface FavoriteContextType {
    favorites: Product[];
    addToFavorites: (product: Product) => void;
    removeFromFavorites: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<Product[]>([]);

    // Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("favorites");
        if (stored) {
            setFavorites(JSON.parse(stored));
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (product: Product) => {
        if (!favorites.find((item) => item._id === product._id)) {
            setFavorites([...favorites, product]);
        }
    };

    const removeFromFavorites = (productId: string) => {
        setFavorites(favorites.filter((item) => item._id !== productId));
    };

    const isFavorite = (productId: string) => {
        return favorites.some((item) => item._id === productId);
    };

    return (
        <FavoriteContext.Provider
            value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
        >
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorite = () => {
    const context = useContext(FavoriteContext);
    if (!context) throw new Error("useFavorite must be used within FavoriteProvider");
    return context;
};