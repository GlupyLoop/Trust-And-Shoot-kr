import Image from "next/image"

type CountryFlagProps = {
  country: string
  className?: string
  width?: number
  height?: number
}

export default function CountryFlag({ country, className = "", width = 22, height = 16 }: CountryFlagProps) {
  // Normalize country name to lowercase for file path
  const normalizedCountry = country.toLowerCase()

  // Map of supported countries with variations
  const countryMap: Record<string, string> = {
    belgium: "belgium",
    france: "france",
    germany: "germany",
    switzerland: "switzerland",
    netherlands: "netherlands",
    // Add variations of country names
    belgique: "belgium",
    frankreich: "germany",
    allemagne: "germany",
    suisse: "switzerland",
    schweiz: "switzerland",
    "pays-bas": "netherlands",
    holland: "netherlands",
  }

  // Get the normalized country code
  const countryCode = countryMap[normalizedCountry]

  // Check if country is supported
  if (!countryCode) {
    return null
  }

  return (
    <Image
      src={`/flags/${countryCode}.svg`}
      alt={`${country} flag`}
      width={width}
      height={height}
      className={className}
    />
  )
}
