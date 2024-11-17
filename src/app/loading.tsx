import { LoaderCircle } from "lucide-react";

// components/LoadingScreen.js
export default function Loading() {
  return (
    <div className="flex items-center justify-center fixed top-1/2 left-1/2 transform -translate-x-1/3 -translate-y-1/2">
      <div className="flex items-center">
        <LoaderCircle className="animate-spin text-gray-500" size={30} />
        {"RELIC AI".split("").map((letter, index) => (
          <div
            key={index}
            className="h-28 w-28 rounded-md flex items-center justify-center text-2xl font-semibold text-gray-500 animate-pulse"
            style={{
              animationDelay: `${index * 0.2}s`, // Add delay for each letter to create a staggered effect
            }}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}
