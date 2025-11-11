import React, { useState, useCallback } from 'react';
import { Sparkles, Send, Copy, AlertTriangle, Loader2, Zap, CheckCircle, MessageSquare, Briefcase, Hash } from 'lucide-react';

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

const apiKey = process.env.REACT_APP_API_KEY;

const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            // For non-200 responses, try again (unless it's a 4xx error)
            if (response.status >= 400 && response.status < 500) {
                 throw new Error(`Client error: ${response.statusText}`, { cause: response.status });
            }
            throw new Error(`Server error: ${response.statusText}`);
        } catch (error) {
            if (i === maxRetries - 1) {
                // Last attempt failed, throw the final error
                throw error;
            }
            // Wait for 2^i seconds before the next retry
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            // console.log(`Retry attempt ${i + 1} after ${delay}ms...`);
        }
    }
};

const responseSchema = {
    type: "OBJECT",
    properties: {
        professional: { "type": "STRING", "description": "The message rewritten with a strictly professional, formal, and clear tone." },
        friendly: { "type": "STRING", "description": "The message rewritten with an approachable, casual, and warm tone suitable for a close colleague." },
        concise: { "type": "STRING", "description": "The core message rewritten to be as short and direct as possible, eliminating all unnecessary words." },
        custom: { "type": "STRING", "description": "The message rewritten using the specific custom tone provided by the user. Only include this key if the user requested a custom tone." }
    },
    required: ["professional", "friendly", "concise"]
};

// --- Custom Components ---

const Card = ({ title, text, icon: Icon, colorClass, isGenerating, gradientClass }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        // Use the older execCommand for better iFrame compatibility
        try {
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = text;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Could not copy text: ', err);
            // Optionally set a UI error state here
        }
    };

    return (
        <div className={`p-5 rounded-xl shadow-lg border ${colorClass} transition-all duration-300 flex flex-col h-full bg-white/90 hover:shadow-xl hover:-translate-y-1`}>
            <div className={`flex items-center justify-between mb-3 pb-2 border-b ${gradientClass} bg-clip-text`}>
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    {title}
                </h3>
                <button
                    onClick={copyToClipboard}
                    disabled={isGenerating || !text}
                    className={`p-2 rounded-full transition duration-150 ${
                        copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                    title="Copy to Clipboard"
                >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-grow min-h-[100px] overflow-y-auto">
                {isGenerating ? (
                    <div className="flex items-center justify-center h-full text-indigo-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-sm font-medium">Generating...</span>
                    </div>
                ) : text ? (
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{text}</p>
                ) : (
                    <p className="text-gray-400 text-sm italic">Rewrite will appear here.</p>
                )}
            </div>
        </div>
    );
};

// --- Main App Component ---

const App = () => {
    const [draft, setDraft] = useState('');
    const [customTone, setCustomTone] = useState('');
    const [rewrites, setRewrites] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // FIX: Define hasCustomTone here so it is available in the render scope
    const hasCustomTone = customTone.trim().length > 0;

    const rewriteText = useCallback(async () => {
        if (!draft.trim()) {
            setError("Please enter some text to rewrite.");
            setRewrites(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        // Initialize rewrites structure for smooth loading state display
        const initialRewrites = { professional: '', friendly: '', concise: '' };
        if (hasCustomTone) {
            initialRewrites.custom = '';
        }
        setRewrites(initialRewrites);
        
        // Removed the duplicate local declaration of hasCustomTone here.
        
        let systemPrompt = `You are an expert copywriter. Your task is to rewrite the user's provided draft into three distinct tones: Professional, Friendly, and Concise.`;
        let userQuery = `Original Draft:\n---\n${draft.trim()}\n---\nRewrite this draft into the Professional, Friendly, and Concise tones.`;
        
        // Add custom tone instruction dynamically
        if (hasCustomTone) {
            systemPrompt += ` Additionally, you must provide a fourth rewrite in a custom tone and label it with the key 'custom' in the JSON response.`;
            userQuery += ` Also, provide a fourth rewrite using this tone: "${customTone.trim()}".`;
        }

        systemPrompt += ` You MUST return the result as a single JSON object conforming strictly to the provided schema. Do not add any conversational text or markdown outside of the JSON block.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            }
        };

        try {
            const response = await fetchWithRetry(`${API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (jsonText) {
                const parsedJson = JSON.parse(jsonText);
                setRewrites(parsedJson);
            } else {
                setError("AI generation failed to produce a valid response. Please try again.");
            }

        } catch (err) {
            console.error("API Call Error:", err);
            setError(`Failed to connect to the AI service. Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [draft, customTone, hasCustomTone]); // Added hasCustomTone to dependency list

    // Define base cards with improved icons and colors
    let cardMap = [
        { 
            key: 'professional', 
            title: 'Professional', 
            icon: Briefcase, 
            colorClass: 'border-indigo-200',
            gradientClass: 'border-gray-200 bg-gradient-to-r from-indigo-500 to-blue-500'
        },
        { 
            key: 'friendly', 
            title: 'Friendly', 
            icon: MessageSquare, 
            colorClass: 'border-green-200',
            gradientClass: 'border-gray-200 bg-gradient-to-r from-green-500 to-teal-500'
        },
        { 
            key: 'concise', 
            title: 'Concise', 
            icon: Hash, 
            colorClass: 'border-yellow-200',
            gradientClass: 'border-gray-200 bg-gradient-to-r from-yellow-500 to-orange-500'
        },
    ];
    
    // Add custom card if a tone is defined
    if (hasCustomTone) {
        cardMap.push({
            key: 'custom',
            title: customTone.trim() + ' (Custom)',
            icon: Zap,
            colorClass: 'border-purple-300',
            gradientClass: 'border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500'
        });
    }


    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-8 font-['Inter']">
            <script src="https://cdn.tailwindcss.com"></script>
            <div className="max-w-screen-2xl mx-auto p-4 sm:p-8 h-screen flex flex-col">
                <header className="text-center py-8 mb-8 bg-white shadow-xl rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                        <Zap className="w-10 h-10 text-indigo-500 animate-pulse" />
                        AI Message Rewriter
                    </h1>
                    <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto px-4">Instantly adapt your tone: Professional, Friendly, Concise, and **Custom**. Transform your communication with AI-powered rewrites.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Input Panel (Col 1) --- */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-2xl h-fit sticky top-4 border-t-4 border-indigo-500">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-bold">1</span>
                            </span>
                            Your Original Draft
                        </h2>
                        <textarea
                            value={draft}
                            onChange={(e) => {
                                setDraft(e.target.value);
                                if (error) setError(null); // Clear error on new input
                            }}
                            rows={8}
                            placeholder="Paste your email, chat message, or draft here..."
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none text-sm shadow-inner"
                            disabled={isLoading}
                        ></textarea>
                        
                        <div className="mt-6">
                            <label htmlFor="custom-tone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">2</span>
                                Optional: Custom Tone (e.g., Sarcastic, Excited, Formal)
                            </label>
                            <input
                                id="custom-tone"
                                type="text"
                                value={customTone}
                                onChange={(e) => setCustomTone(e.target.value)}
                                placeholder="Enter a custom tone (e.g., 'Like a Pirate')"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm shadow-inner"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center text-sm animate-pulse">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={rewriteText}
                            disabled={isLoading || !draft.trim()}
                            className="w-full mt-6 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 transform hover:scale-[1.02] disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Rewriting Tones...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Get {hasCustomTone ? '4' : '3'} Rewrites
                                </>
                            )}
                        </button>
                    </div>

                    {/* --- Output Cards (Cols 2-3) --- */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold">3</span>
                            </span>
                            <h2 className="text-2xl font-semibold text-gray-800">Your Rewritten Messages</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cardMap.map((card) => (
                                <div key={card.key} className={card.key === 'custom' ? 'md:col-span-2 lg:col-span-1' : ''}>
                                    <Card
                                        title={card.title}
                                        text={rewrites ? rewrites[card.key] : ''}
                                        icon={card.icon}
                                        colorClass={card.colorClass}
                                        isGenerating={isLoading && (!rewrites || rewrites[card.key] === '')}
                                        gradientClass={card.gradientClass}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;