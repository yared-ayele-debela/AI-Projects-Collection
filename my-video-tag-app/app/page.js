"use client";
import React, { useState } from 'react';

const SparklesIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 17.69 3.883 20.57 7.584c.371.482.857.924 1.39 1.309 3.469 2.45 3.469 7.516 0 9.966-.533.385-1.019.827-1.39 1.309-2.88 3.701-8.375 3.701-11.255 0-.371-.482-.857-.924-1.39-1.309-3.469-2.45-3.469-7.516 0-9.966.533-.385 1.019-.827 1.39-1.309ZM12 8.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0v-.008A.75.75 0 0 1 12 15Z"
      clipRule="evenodd"
    />
    <path d="M7.742 1.066a.75.75 0 0 1 .523.886l-.666 2.001a.75.75 0 0 1-1.415-.471l.666-2.001a.75.75 0 0 1 .892-.415ZM4.21 4.21a.75.75 0 0 1 0 1.061l-1.414 1.414a.75.75 0 1 1-1.06-1.06l1.414-1.414a.75.75 0 0 1 1.06 0ZM1.066 7.742a.75.75 0 0 1 .886-.523l2.001.666a.75.75 0 1 1-.471 1.415l-2.001-.666a.75.75 0 0 1-.415-.892Zm0 8.516a.75.75 0 0 1 .415-.892l2.001-.666a.75.75 0 1 1 .471 1.415l-2.001.666a.75.75 0 0 1-.886-.523ZM4.21 18.73a.75.75 0 0 1 1.06 0l1.414 1.414a.75.75 0 1 1-1.06 1.06l-1.414-1.414a.75.75 0 0 1 0-1.061ZM7.742 21.874a.75.75 0 0 1 .892.415l.666 2.001a.75.75 0 1 1-1.415.471l-.666-2.001a.75.75 0 0 1 .523-.886ZM18.73 4.21a.75.75 0 0 1 1.06 0l1.414 1.414a.75.75 0 1 1-1.06 1.06l-1.414-1.414a.75.75 0 0 1 0-1.061ZM21.874 7.742a.75.75 0 0 1 .415.892l-.666 2.001a.75.75 0 1 1-1.415-.471l.666-2.001a.75.75 0 0 1 .892-.415Z" />
    <path d="M18.73 18.73a.75.75 0 0 1 0 1.061l-1.414 1.414a.75.75 0 1 1-1.06-1.06l1.414-1.414a.75.75 0 0 1 1.06 0ZM21.874 16.258a.75.75 0 0 1 .892.415l.666 2.001a.75.75 0 1 1-1.415.471l-.666-2.001a.75.75 0 0 1 .523-.886Z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Icon for the Copy button
const ClipboardIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h4a2 2 0 002-2v-4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2z"></path>
  </svg>
);

/**
 * Main application component for the Video Tag Generator.
 * Renamed to Home for App Router convention.
 */
export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copyMessage, setCopyMessage] = useState(""); // New state for copy confirmation

  /**
   * Defines the structured JSON schema we expect from the AI model.
   */
  const responseSchema = {
    type: "OBJECT",
    properties: {
      tags: {
        type: "ARRAY",
        items: {
          type: "STRING",
        },
      },
    },
    required: ["tags"],
  };

  /**
   * System instruction to guide the AI model's behavior.
   */
  const systemPrompt = `You are a helpful SEO assistant specializing in video content.
Your task is to generate a list of relevant, specific, and trending tags for a video based on its title and description.
Provide a mix of broad and specific tags.
You must respond with ONLY a valid JSON object that matches the provided schema.
Do not include any other text, explanation, or markdown formatting.`;

  /**
   * Handles the API call to the Gemini model to generate tags.
   */
  const handleGenerateTags = async () => {
    if (!title && !description) {
      setError("Please enter a title or description first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTags([]); // Clear old tags
    setCopyMessage(""); // Clear old copy message

    const userQuery = `Video Title: ${title}\nVideo Description: ${description}`;
    // SECURE: Read the API key from the environment variable
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; 
    
    if (!apiKey) {
        setError("API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.");
        setIsLoading(false);
        return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message ||
            `API Error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (!candidate?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response structure from API.");
      }

      const jsonResponse = JSON.parse(candidate.content.parts[0].text);

      if (jsonResponse.tags && Array.isArray(jsonResponse.tags)) {
        setTags(jsonResponse.tags);
      } else {
        throw new Error("Generated JSON does not contain a 'tags' array.");
      }
    } catch (err) {
      console.error("Error generating tags:", err);
      setError(
        err.message || "An unknown error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copies the generated tags (comma-separated string) to the clipboard.
   * Uses document.execCommand('copy') for better iframe compatibility.
   */
  const handleCopyTags = () => {
    const tagsString = tags.map(tag => tag.trim()).join(', ');

    // Create a temporary textarea element for clipboard copy
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = tagsString;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      console.error('Copy failed:', err);
    }

    document.body.removeChild(tempTextArea);
    
    if (successful) {
      setCopyMessage("Tags copied to clipboard! (Comma-separated)");
    } else {
      setCopyMessage("Failed to copy tags automatically.");
    }
    
    // Clear the message after a short delay
    setTimeout(() => {
      setCopyMessage("");
    }, 3000);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-white text-white p-4 sm:p-8 font-inter">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white">
            AI Video Tag Generator
          </h1>
          <SparklesIcon className="w-8 h-8 text-blue-400 hidden sm:block" />
        </div>

        {/* --- Form --- */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Video Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 'How to Make Sourdough Bread'"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Video Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'A beginner's guide to baking your first loaf of sourdough. We cover starters, folding, and baking...'"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* --- Button --- */}
          <button
            onClick={handleGenerateTags}
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all
              ${
                isLoading
                  ? "bg-blue-800 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              }
            `}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generate Tags
              </>
            )}
          </button>
        </div>

        {/* --- Error Display --- */}
        {error && (
          <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
            <p>
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* --- Results Display --- */}
        {tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            {/* Tag Header and Copy Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Generated Tags
              </h2>
              <button
                onClick={handleCopyTags}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
              >
                <ClipboardIcon className="w-4 h-4 mr-2" />
                Copy All Tags
              </button>
            </div>
            
            {/* Copy Confirmation Message */}
            {copyMessage && (
              <div className="text-green-400 text-sm mb-4">
                {copyMessage}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-700 text-gray-200 text-sm font-medium rounded-full cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}