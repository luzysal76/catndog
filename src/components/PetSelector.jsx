import React from 'react'
import { usePetContext } from '../App.jsx'
import { PET_SPECIES } from '../constants/types.js'

export default function PetSelector() {
  const { pets, activePetId, setActivePetId } = usePetContext()

  if (!pets || pets.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-4">
      {pets.map((pet) => {
        const species = PET_SPECIES.find(s => s.id === pet.species) || PET_SPECIES[4]
        const isActive = pet.id === activePetId
        return (
          <button
            key={pet.id}
            onClick={() => setActivePetId(pet.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full
                        text-sm font-medium whitespace-nowrap transition-all
                        ${isActive
                          ? 'bg-brand-primary text-white shadow-md scale-105'
                          : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <span>{species.emoji}</span>
            <span>{pet.name}</span>
          </button>
        )
      })}
    </div>
  )
}
