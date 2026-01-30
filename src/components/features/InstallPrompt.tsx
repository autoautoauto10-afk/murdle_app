'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        if (iOS) {
            // iOS: Show install button that opens guide
            setShowInstallButton(true);
        } else {
            // Android/Chrome: Listen for beforeinstallprompt
            const handler = (e: Event) => {
                e.preventDefault();
                setDeferredPrompt(e as BeforeInstallPromptEvent);
                setShowInstallButton(true);
            };

            window.addEventListener('beforeinstallprompt', handler);

            return () => {
                window.removeEventListener('beforeinstallprompt', handler);
            };
        }
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            // Show iOS guide modal
            setShowIOSGuide(true);
        } else if (deferredPrompt) {
            // Show native install prompt
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setShowInstallButton(false);
            }

            setDeferredPrompt(null);
        }
    };

    if (isInstalled || !showInstallButton) {
        return null;
    }

    return (
        <>
            {/* Install Button */}
            <button
                onClick={handleInstallClick}
                className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 transition-colors"
                style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
            >
                <span>📱</span>
                <span className="font-medium">アプリをインストール</span>
            </button>

            {/* iOS Install Guide Modal */}
            {showIOSGuide && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowIOSGuide(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4">アプリをインストール</h3>
                        <div className="space-y-3 text-sm">
                            <p className="flex items-start gap-2">
                                <span className="text-2xl">1️⃣</span>
                                <span>画面下部の<strong>共有ボタン</strong> <span className="text-2xl">📤</span> をタップ</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-2xl">2️⃣</span>
                                <span><strong>「ホーム画面に追加」</strong>を選択</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-2xl">3️⃣</span>
                                <span>右上の<strong>「追加」</strong>をタップ</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setShowIOSGuide(false)}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
