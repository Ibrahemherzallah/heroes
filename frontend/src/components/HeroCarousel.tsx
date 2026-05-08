import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type HeroSlide = {
    _id?: string;
    title: string;
    subtitle: string;
    image: string;
    mobileImage?: string;
    linkUrl: string;
    order: number;
    isActive: boolean;
};

type HeroCarouselProps = {
    isAdmin: boolean;
    onEditSlide?: (slide: HeroSlide) => void;
    onAddSlide?: () => void;
};

export default function HeroCarousel({isAdmin, onEditSlide, onAddSlide}: HeroCarouselProps) {
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_ENV}/api/hero-slides`);
                const data = await res.json();
                setHeroSlides(data.slides || []);
            } catch (error) {
                console.error("Failed to fetch hero slides", error);
            }
        };

        fetchSlides();
    }, []);

    useEffect(() => {
        if (heroSlides.length === 0) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [heroSlides]);

    const goToNext = () => {
        if (heroSlides.length === 0) return;
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const goToPrev = () => {
        if (heroSlides.length === 0) return;
        setCurrentSlide((prev) =>
            prev === 0 ? heroSlides.length - 1 : prev - 1
        );
    };

    if (heroSlides.length === 0) {
        return (
            <section className="relative overflow-hidden">
                <div className="h-[420px] md:h-[520px] flex flex-col items-center justify-center bg-gray-100">
                    <p className="text-gray-500">لا توجد صور للعرض حالياً</p>

                    {isAdmin && (
                        <div className="mt-6">
                            <button onClick={onAddSlide} className="flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors shadow">
                                <Plus size={16} />
                                إضافة صورة
                            </button>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden">
            <div className="relative h-[240px] sm:h-[300px] md:h-[520px] w-full">
                {isAdmin && (
                    <div className="absolute top-3 left-3 z-30">
                        <button onClick={onAddSlide} className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors shadow">
                            + إضافة صورة
                        </button>
                    </div>
                )}
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide._id}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                    >
                        <Link to={slide.linkUrl || "/products"} className="block w-full h-full">
                            <picture className="block w-full h-full">
                                {slide.mobileImage && (
                                    <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
                                )}

                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center"/>
                            </picture>
                        </Link>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="container mx-auto px-4 text-center text-white">
                                {isAdmin && (
                                    <div className="mt-3 md:mt-6 pointer-events-auto">
                                        <button
                                            onClick={() => onEditSlide?.(slide)}
                                            className="inline-flex items-center gap-2 bg-white/90 text-black px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium hover:bg-white transition-colors"
                                        >
                                            <Pencil size={16} />
                                            تعديل هذه الصورة
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={goToPrev} className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-20 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow">
                    <ChevronRight size={20} />
                </button>

                <button onClick={goToNext} className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-20 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow">
                    <ChevronLeft size={20} />
                </button>

                <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {heroSlides.map((_, index) => (
                        <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full transition-all ${
                                currentSlide === index ? "bg-white w-5 md:w-6" : "bg-white/60"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}