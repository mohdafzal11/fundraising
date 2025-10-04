import { useState } from "react";

interface LogoProps {
  logo?: string | null;
  name?: string;
}

function Logo({ logo, name }: LogoProps) {
  const [hasImageError, setHasImageError] = useState(false);

  return logo && !hasImageError ? (
    <img
      src={logo}
      alt={name || "Investor Logo"}
      className="w-40 h-16 object-contain rounded-lg  bg-slate-50 dark:bg-slate-300 px-4 py-2"
      onError={() => setHasImageError(true)}
    />
  ) : (
    <div
      className="w-12 h-12 rounded-full flex items-center tracking-wider justify-center text-white font-bold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-gray-100 dark:ring-gray-600"
      role="img"
      aria-label={`Initials for ${name || "unknown investor"}`}
    >
      {name
        ? name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "??"}
    </div>
  );
}

export default Logo;