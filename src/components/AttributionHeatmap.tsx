import React from 'react';
import type { AttributionToken } from '../lib/attribution-analyzer';

interface Props {
    text: string;
    tokens: AttributionToken[];
    onTokenClick: (token: AttributionToken) => void;
}

export const AttributionHeatmap: React.FC<Props> = ({ text, tokens, onTokenClick }) => {
    const renderContent = () => {
        if (tokens.length === 0) return <span className="text-gray-500 italic">Waiting for analysis...</span>;

        const elements = [];
        let lastIndex = 0;

        // Sort tokens by index
        const sortedTokens = [...tokens].sort((a, b) => a.originalIndex - b.originalIndex);

        sortedTokens.forEach((token, i) => {
            // Add text before token (whitespace, punctuation)
            if (token.originalIndex > lastIndex) {
                elements.push(
                    <span key={`text-${i}`} className="text-gray-400">
                        {text.substring(lastIndex, token.originalIndex)}
                    </span>
                );
            }

            // Determine color based on contribution
            // Green for positive, Red for negative
            // We use a non-linear scale for better visibility of small contributions
            const c = token.contribution;
            let bgColor = 'transparent';
            let textColor = 'inherit';
            let borderColor = 'transparent';

            const intensity = Math.min(Math.abs(c) * 5, 1); // Scale up small values

            if (c > 0.01) {
                // Green (Positive)
                bgColor = `rgba(180, 224, 60, ${intensity * 0.5})`; // Lime primary with opacity
                borderColor = `rgba(160, 204, 53, ${intensity})`;
                textColor = '#000';
            } else if (c < -0.01) {
                // Red/Orange (Negative) - keeping semantic red but adjusting for light theme
                bgColor = `rgba(252, 165, 165, ${intensity * 0.5})`;
                borderColor = `rgba(248, 113, 113, ${intensity})`;
                textColor = '#000';
            }

            elements.push(
                <span
                    key={`token-${i}`}
                    className="cursor-pointer rounded px-0.5 transition-all hover:scale-105 inline-block border mx-[1px]"
                    style={{ backgroundColor: bgColor, color: textColor, borderColor: borderColor }}
                    onClick={() => onTokenClick(token)}
                    title={`Contribution: ${c > 0 ? '+' : ''}${c.toFixed(3)}`}
                >
                    {token.text}
                </span>
            );

            lastIndex = token.originalIndex + token.text.length;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            elements.push(
                <span key="text-end" className="text-gray-400">
                    {text.substring(lastIndex)}
                </span>
            );
        }

        return elements;
    };

    return (
        <div className="p-4 bg-white rounded-lg border border-gray-200 leading-normal text-base font-mono shadow-sm min-h-[80px]">
            {renderContent()}
        </div>
    );
};
