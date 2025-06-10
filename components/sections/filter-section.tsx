"use client"
import { Star, Search, Sliders, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useState } from "react"
import AnimatedSection from "../ui/animated-section"
import { motion } from "framer-motion"
import { PHOTOGRAPHER_TAGS } from "@/constants/photographer-tags"
import CountryFlag from "../ui/country-flag"

type FilterSectionProps = {
  countryFilters: Record<string, boolean>
  tagFilters?: Record<string, string[]>
  handleCountryChange: (country: string) => void
  handleTagChange?: (categoryId: string, tagId: string) => void
  minRating: number
  handleRatingChange: (value: number) => void
  sortBy: "rating" | "name" | "newest"
  sortOrder: "asc" | "desc"
  handleSortChange: (sortBy: "rating" | "name" | "newest") => void
}

export default function FilterSection(props: FilterSectionProps) {
  const {
    countryFilters,
    handleCountryChange,
    tagFilters,
    handleTagChange,
    minRating,
    handleRatingChange,
    sortBy,
    sortOrder,
    handleSortChange,
  } = props

  const [searchFocused, setSearchFocused] = useState(false)
  const [filterSearch, setFilterSearch] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Fonction pour basculer l'état d'expansion d'une catégorie
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Filtrer les tags en fonction de la recherche
  const filteredTags = PHOTOGRAPHER_TAGS.map((category) => {
    if (!filterSearch) return category

    const filteredTags = category.tags.filter((tag) => tag.name.toLowerCase().includes(filterSearch.toLowerCase()))

    return {
      ...category,
      tags: filteredTags,
    }
  }).filter((category) => category.tags.length > 0)

  return (
    <div className="space-y-6">
      <motion.div
        className={`bg-[#2a2a2a] rounded-full p-2 flex items-center transition-all ${
          searchFocused ? "ring-2 ring-[#ff9d7d] shadow-lg" : ""
        }`}
        whileHover={{ scale: 1.02 }}
      >
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search filters..."
          className="bg-transparent border-none outline-none text-white placeholder-gray-400 flex-1 px-2 text-sm"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </motion.div>

      {/* Sort Options */}
      <AnimatedSection delay={0.05} className="space-y-2">
        <h3 className="font-bold uppercase text-sm flex items-center">
          <ArrowUpDown size={14} className="mr-2 text-[#ff7145]" />
          Sort By
        </h3>
        <div className="space-y-1">
          <button
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm ${
              sortBy === "rating" ? "bg-[#ff7145]/20 text-[#ff7145]" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            }`}
            onClick={() => handleSortChange("rating")}
          >
            <span>Rating</span>
            {sortBy === "rating" && (sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
          </button>
          <button
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm ${
              sortBy === "name" ? "bg-[#ff7145]/20 text-[#ff7145]" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            }`}
            onClick={() => handleSortChange("name")}
          >
            <span>Name</span>
            {sortBy === "name" && (sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
          </button>
          <button
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm ${
              sortBy === "newest" ? "bg-[#ff7145]/20 text-[#ff7145]" : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            }`}
            onClick={() => handleSortChange("newest")}
          >
            <span>Newest</span>
            {sortBy === "newest" && (sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}
          </button>
        </div>
      </AnimatedSection>

      {/* Rating Filter */}
      <AnimatedSection delay={0.1} className="space-y-2">
        <h3 className="font-bold uppercase text-sm flex items-center">
          <Star size={14} className="mr-2 text-[#ff7145]" />
          Minimum Rating
        </h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              onClick={() => handleRatingChange(minRating === star ? 0 : star)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="focus:outline-none"
            >
              <Star
                size={24}
                className={`${star <= minRating ? "text-[#ff7145] fill-[#ff7145]" : "text-gray-400"} transition-colors`}
              />
            </motion.button>
          ))}
          {minRating > 0 && (
            <motion.button
              onClick={() => handleRatingChange(0)}
              className="ml-2 text-xs text-gray-400 hover:text-white"
              whileHover={{ scale: 1.1 }}
            >
              (Réinitialiser)
            </motion.button>
          )}
        </div>
        <div className="text-sm text-gray-400">
          {minRating === 0 ? "Toutes les notes" : `${minRating} étoile${minRating > 1 ? "s" : ""} minimum`}
        </div>
      </AnimatedSection>

      {/* Country Filter */}
      <AnimatedSection delay={0.15} className="space-y-2">
        <h3 className="font-bold uppercase text-sm flex items-center">
          <Sliders size={14} className="mr-2 text-[#ff7145]" />
          Country
        </h3>
        <div className="space-y-1">
          {Object.entries(countryFilters).map(([country, isChecked], index) => (
            <AnimatedSection key={country} delay={0.15 + index * 0.05} direction="right">
              <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
                <input
                  type="checkbox"
                  id={country}
                  className="accent-[#ff7145]"
                  checked={isChecked}
                  onChange={() => handleCountryChange(country)}
                />
                <motion.label
                  htmlFor={country}
                  className="cursor-pointer capitalize text-sm flex items-center gap-2"
                  whileHover={{ color: "#ff7145" }}
                >
                  <CountryFlag country={country} width={18} height={13} />
                  {country}
                </motion.label>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </AnimatedSection>

      {/* Tag Filters */}
      {tagFilters && handleTagChange && (
        <div className="mb-6">
          <h4 className="font-medium text-[#fffbea] mb-3">Tags</h4>

          {filteredTags.map((category) => (
            <div key={category.id} className="mb-4">
              <button
                onClick={() => toggleCategory(category.id)}
                className="text-sm text-gray-400 mb-2 flex items-center justify-between w-full hover:text-white"
              >
                <span>{category.name}</span>
                <span>{expandedCategories[category.id] ? "−" : "+"}</span>
              </button>

              {(expandedCategories[category.id] || filterSearch) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {category.tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagChange(category.id, tag.id)}
                      className={`px-2 py-1 rounded-full text-xs flex items-center ${
                        tagFilters[category.id]?.includes(tag.id)
                          ? "bg-[#ff7145] text-white"
                          : "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]"
                      }`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: tag.icon }} className="mr-1" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reset Filters Button */}
      <motion.button
        className="w-full bg-[#2a2a2a] text-white py-2 rounded-md font-medium mt-4 hover:bg-[#3a3a3a]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          // Reset all filters
          Object.keys(countryFilters).forEach((country) => handleCountryChange(country))
          handleRatingChange(0)
          Object.keys(tagFilters || {}).forEach((categoryId) => {
            ;(tagFilters?.[categoryId] || []).forEach((tagId) => {
              handleTagChange?.(categoryId, tagId)
            })
          })
        }}
      >
        Reset Filters
      </motion.button>
    </div>
  )
}
