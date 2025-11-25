import { useMemo, useState, useEffect } from 'react';
import type { SentimentResult } from '../lib/sentiment-engine';
import { giphyClient } from '../lib/giphy-client';

interface Props {
    text: string;
    onChange: (text: string) => void;
    result: SentimentResult | null;
    loading: boolean;
}

export const ExpressiveView: React.FC<Props> = ({ text, onChange, result, loading }) => {
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [currentTag, setCurrentTag] = useState<string>('');

    // Determine the sentiment tag/category
    const sentimentTag = useMemo(() => {
        if (loading) return 'thinking';
        if (!result || !text) return 'listening';

        const score = result ? result.score : 3;

        if (score < 1.8) return 'sad crying';
        if (score < 2.6) return 'sad face';
        if (score < 3.4) return 'meh';
        if (score < 4.2) return 'happy';
        return 'excited';
    }, [result, text, loading]);

    // Fetch GIF when tag changes
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (sentimentTag !== currentTag) {
                setCurrentTag(sentimentTag);
                const url = await giphyClient.getRandomSticker(sentimentTag);
                if (url) {
                    setGifUrl(url);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [sentimentTag, currentTag]);

    const { gradient, emojiScale, emoji, isRestless } = useMemo(() => {
        if (loading) {
            return {
                gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                emojiScale: 1.1,
                emoji: '🤔',
                isRestless: false
            };
        }

        if (!result || !text) {
            return {
                gradient: 'radial-gradient(circle at center, #ffffff 0%, #d1d5db 100%)',
                emojiScale: 1,
                emoji: '👂',
                isRestless: true
            };
        }

        const score = result ? result.score : 3;

        let colorStart, colorEnd;
        let scale = 1;
        let emojiChar = '😐';

        if (score < 2.0) {
            colorStart = '#fee2e2';
            colorEnd = '#fecaca';
            scale = 1.0;
            emojiChar = score < 1.5 ? '😭' : '☹️';
        } else if (score < 2.8) {
            colorStart = '#ffedd5';
            colorEnd = '#fed7aa';
            scale = 1.0;
            emojiChar = '😕';
        } else if (score < 3.2) {
            colorStart = '#f3f4f6';
            colorEnd = '#e5e7eb';
            scale = 1.0;
            emojiChar = '😐';
        } else if (score < 4.2) {
            colorStart = '#dcfce7';
            colorEnd = '#bbf7d0';
            scale = 1.1;
            emojiChar = '🙂';
        } else {
            colorStart = '#d1fae5';
            colorEnd = '#a7f3d0';
            scale = 1.3;
            emojiChar = '🤩';
        }

        return {
            gradient: `linear-gradient(135deg, ${colorStart} 0%, ${colorEnd} 100%)`,
            emojiScale: scale,
            emoji: emojiChar,
            isRestless: false
        };
    }, [result, text, loading]);

    return (
        <div
            className={`min-h-screen w-full flex flex-col items-center justify-center p-8 transition-all duration-1000 ease-in-out ${isRestless ? 'animate-breathing-glow' : ''}`}
            style={{ background: gradient }}
        >
            <div className="max-w-2xl w-full space-y-12 text-center">

                <div className="h-48 flex items-center justify-center">
                    <div
                        className="transition-all duration-500 ease-spring"
                        style={{ transform: `scale(${emojiScale})` }}
                    >
                        {gifUrl ? (
                            <img
                                src={gifUrl}
                                alt="Sentiment Sticker"
                                className="h-40 w-40 object-contain drop-shadow-xl"
                            />
                        ) : (
                            <div className="text-9xl">{emoji}</div>
                        )}
                    </div>
                </div>

                <textarea
                    className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 text-base text-left text-gray-800 placeholder:text-gray-500/70 focus:outline-none focus:ring-2 focus:ring-white/60 shadow-lg transition-all resize-none h-48"
                    placeholder="Share a random thought"
                    value={text}
                    onChange={(e) => onChange(e.target.value)}
                />

                <div className={`text-gray-600 font-medium text-sm uppercase tracking-widest transition-all duration-500 ${result ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    Sentiment{result ? `: ${result.score.toFixed(1)} / 5.0` : ''}
                </div>

            </div>
        </div>
    );
};
