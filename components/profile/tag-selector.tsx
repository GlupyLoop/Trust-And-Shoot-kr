"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"

type TagCategory = {
  id: string
  name: string
  icon: string
  tags: {
    id: string
    name: string
    icon: string
  }[]
}

type TagSelectorProps = {
  categories: TagCategory[]
  selectedTags: Record<string, string[]>
  onChange: (categoryId: string, tagId: string, isSelected: boolean) => void
}

export default function TagSelector({ categories, selectedTags, onChange }: TagSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || "")

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeCategory === category.id
                ? "bg-[#ff7145] text-white"
                : "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]"
            }`}
          >
            <span dangerouslySetInnerHTML={{ __html: category.icon }} className="mr-2" />
            {category.name}
          </button>
        ))}
      </div>

      {/* Selected Tags Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Tags sélectionnés:</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(selectedTags).flatMap(([categoryId, tagIds]) =>
            tagIds.map((tagId) => {
              const category = categories.find((c) => c.id === categoryId)
              const tag = category?.tags.find((t) => t.id === tagId)

              if (!tag) return null

              return (
                <div
                  key={`${categoryId}-${tagId}`}
                  className="bg-[#2a2a2a] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <span dangerouslySetInnerHTML={{ __html: tag.icon }} className="mr-1" />
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => onChange(categoryId, tagId, false)}
                    className="w-4 h-4 rounded-full bg-[#ff7145] text-white flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            }),
          )}
          {Object.values(selectedTags).every((tags) => tags.length === 0) && (
            <span className="text-sm text-gray-500 italic">Aucun tag sélectionné</span>
          )}
        </div>
      </div>

      {/* Tags Grid for Active Category */}
      {categories.map(
        (category) =>
          activeCategory === category.id && (
            <div key={category.id} className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {category.tags.map((tag) => {
                const isSelected = selectedTags[category.id]?.includes(tag.id) || false

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const isCurrentlySelected = selectedTags[activeCategory]?.includes(tag.id) || false
                      onChange(activeCategory, tag.id, !isCurrentlySelected)
                    }}
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                      selectedTags[activeCategory]?.includes(tag.id)
                        ? "bg-[#ff7145]/20 border border-[#ff7145]"
                        : "bg-[#2a2a2a] border border-transparent hover:border-[#3a3a3a]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center ${
                        selectedTags[activeCategory]?.includes(tag.id)
                          ? "bg-[#ff7145] text-white"
                          : "bg-[#3a3a3a] text-transparent"
                      }`}
                    >
                      {selectedTags[activeCategory]?.includes(tag.id) && <Check size={14} />}
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: tag.icon }} className="mr-1" />
                    {tag.name}
                  </button>
                )
              })}
            </div>
          ),
      )}
    </div>
  )
}
