import Header from "@/components/Header";

const ShippingPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Page Title */}
                    <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
                        سياسة التوصيل والاسترجاع
                    </h1>

                    {/* ================== Shipping Policy ================== */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            📦 سياسة التوصيل
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-4">
                            في <span className="font-semibold">Heroess.top</span> نحرص على توصيل
                            طلباتكم من قطع الإلكترونيات بسرعة وأمان، مع الالتزام بأعلى معايير
                            الجودة.
                        </p>

                        <ul className="list-disc pr-6 space-y-3 text-gray-600">
                            <li>
                                <strong>نطاق التوصيل:</strong> فلسطين (الضفة الغربية وقطاع غزة)،
                                الأردن، وبعض الدول الأخرى حسب توفر الشحن.
                            </li>
                            <li>
                                <strong>مدة التوصيل:</strong>
                                <ul className="list-disc pr-6 mt-2 space-y-1">
                                    <li>الضفة الغربية: 1 – 3 أيام عمل</li>
                                    <li>الداخل: 2 – 5 أيام عمل</li>
                                    <li>القدس: 2 – 5 يوم عمل</li>
                                </ul>
                            </li>
                            <li>
                                <strong>تكلفة الشحن:</strong> يتم احتسابها حسب الموقع والوزن،
                                وتظهر بشكل واضح قبل تأكيد الطلب.
                            </li>
                            <li>
                                <strong>تتبع الطلب:</strong> يتم إرسال رقم تتبع عبر البريد
                                الإلكتروني أو رسالة نصية بعد الشحن.
                            </li>
                        </ul>
                    </div>

                    {/* ================== Return Policy ================== */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            🔄 سياسة الاسترجاع والاستبدال
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-4">
                            نهدف إلى رضاكم الكامل. في حال وجود أي مشكلة في المنتج، يمكنكم
                            الاستفادة من سياسة الاسترجاع أو الاستبدال وفق الشروط التالية:
                        </p>

                        <ul className="list-disc pr-6 space-y-3 text-gray-600">
                            <li>يحق للعميل طلب الاسترجاع أو الاستبدال خلال <strong>7 أيام</strong> من تاريخ الاستلام.</li>
                            <li>يجب أن يكون المنتج في حالته الأصلية وغير مستخدم.</li>
                            <li>لا يتم قبول استرجاع القطع الإلكترونية الحساسة بعد فتحها إلا في حال وجود عيب مصنعي.</li>
                            <li>في حال كان الخطأ من طرفنا، نتحمل كامل تكاليف الشحن.</li>
                            <li>في حال رغبة العميل بالاسترجاع بدون سبب فني، يتحمل تكاليف الشحن.</li>
                        </ul>
                    </div>

                    {/* ================== FAQ ================== */}
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                            ❓ الأسئلة الشائعة حول التوصيل
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    متى يتم شحن طلبي؟
                                </h3>
                                <p className="text-gray-600">
                                    يتم تجهيز الطلبات خلال 24 ساعة من تأكيد الدفع، ثم تسليمها لشركة
                                    الشحن.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    هل يمكن تغيير عنوان التوصيل؟
                                </h3>
                                <p className="text-gray-600">
                                    نعم، يمكن تعديل العنوان قبل شحن الطلب فقط من خلال التواصل مع
                                    خدمة العملاء.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    ماذا أفعل إذا وصلني منتج تالف؟
                                </h3>
                                <p className="text-gray-600">
                                    يرجى التواصل معنا خلال 48 ساعة مع إرفاق صور واضحة للمنتج
                                    والتغليف، وسنقوم بحل المشكلة فورًا.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">
                                    هل يوجد توصيل مجاني؟
                                </h3>
                                <p className="text-gray-600">
                                    نعم، التوصيل مجاني للطلبات التي تتجاوز قيمة معينة (يتم تحديدها
                                    أثناء العروض).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ShippingPolicy;
