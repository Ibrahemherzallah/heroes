import { Product } from "@/contexts/CartContext.tsx";
import SpecialOfferCard from "./SpecialOfferCard";

interface Props {
    products: Product[];
}

const SpecialOffersGrid: React.FC<Props> = ({ products }) => {
    return (
        <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <p className="text-orange-500 font-semibold mb-2">
                        لا تفوّت الفرصة
                    </p>

                    <h2 className="text-3xl font-bold">
                        العروض الخاصة
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <SpecialOfferCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SpecialOffersGrid;