'use client';
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/useAuthContext";
import { useRouter } from "next/navigation";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function CreditStorePage() {
    const { user } = useAuthContext();
    const router = useRouter();

    const [amount, setAmount] = useState({
        currency: "KRW",
        value: 1000,
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);

    const products = [
        {
            id: 'credit_1',
            name: '1 Credit',
            price: 1000,
            credits: 1,
            desc: '1회 분석 이용권'
        },
        {
            id: 'credit_3',
            name: '3 Credits',
            price: 2000,
            credits: 3,
            desc: '3회 분석 이용권 (할인)',
            popular: true
        }
    ];

    useEffect(() => {
        async function fetchPaymentWidgets() {
            try {
                const tossPayments = await loadTossPayments(clientKey);
                const customerKey = user ? user.uid.replace(/[^a-zA-Z0-9-_.= @]/g, '_') : ANONYMOUS;
                const widgets = tossPayments.widgets({ customerKey });
                setWidgets(widgets);
            } catch (error) {
                console.error("Error fetching payment widget:", error);
            }
        }

        fetchPaymentWidgets();
    }, [user]);

    useEffect(() => {
        async function renderPaymentWidgets() {
            if (widgets == null) {
                return;
            }

            await widgets.setAmount(amount);

            await widgets.renderPaymentMethods({
                selector: "#payment-method",
                variantKey: "DEFAULT",
            });

            await widgets.renderAgreement({
                selector: "#agreement",
                variantKey: "AGREEMENT",
            });

            setReady(true);
        }

        renderPaymentWidgets();
    }, [widgets]);

    const handleProductSelect = async (product) => {
        setSelectedProduct(product);
        const newAmount = {
            currency: "KRW",
            value: product.price,
        };
        setAmount(newAmount);

        if (widgets) {
            await widgets.setAmount(newAmount);
        }
    };

    useEffect(() => {
        if (!selectedProduct && products.length > 0) {
            handleProductSelect(products[0]);
        }
    }, []);

    const handlePayment = async () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!selectedProduct) {
            alert("상품을 선택해주세요.");
            return;
        }

        try {
            // orderId 생성 (타임스탬프 기반)
            const orderId = `ORDER_${user.uid}_${Date.now()}`;

            await widgets.requestPayment({
                orderId: orderId,
                orderName: selectedProduct.name,
                // successUrl에 필요한 정보 전달
                successUrl: `${window.location.origin}/credit/success?userId=${user.uid}&creditsToAdd=${selectedProduct.credits}`,
                failUrl: `${window.location.origin}/credit/fail`,
                customerEmail: user.email,
                customerName: user.displayName || "Customer",
            });
        } catch (error) {
            console.error('결제 요청 에러:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        크레딧 충전소
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Saju 분석을 위한 크레딧을 충전하세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedProduct?.id === product.id
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg scale-[1.02]'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200'
                                }`}
                        >
                            {product.popular && (
                                <span className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    BEST
                                </span>
                            )}
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {product.name}
                                </h3>
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    ₩{product.price.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {product.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div id="payment-method" />
                    <div id="agreement" />

                    <button
                        className="w-full mt-8 py-4 px-6 rounded-xl font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!ready}
                        onClick={handlePayment}
                    >
                        {selectedProduct ? `${selectedProduct.price.toLocaleString()}원 결제하기` : '상품을 선택해주세요'}
                    </button>

                    <p className="mt-4 text-xs text-center text-slate-400">
                        위 주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}