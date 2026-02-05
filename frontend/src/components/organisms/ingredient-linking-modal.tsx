/**
 * Ingredient Linking Modal
 * Allows users to link recipe ingredients to master ingredients for accurate cost tracking
 */

import * as React from 'react'
import { Modal, ModalHeader, ModalTitle, ModalBody } from './modal'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/ui/status-dot'
import { useIngredients } from '@/hooks/use-ingredients'
import { useLinkIngredient } from '@/hooks/use-recipes'
import type { UnlinkedIngredient } from '@/lib/api-types'
import { cn } from '@/lib/utils'

interface IngredientLinkingModalProps {
  open: boolean
  onClose: () => void
  unlinkedIngredients: UnlinkedIngredient[]
}

interface GroupedIngredients {
  [recipeName: string]: UnlinkedIngredient[]
}

export function IngredientLinkingModal({
  open,
  onClose,
  unlinkedIngredients,
}: IngredientLinkingModalProps) {
  const { data: ingredients, isLoading: ingredientsLoading } = useIngredients()
  const linkIngredient = useLinkIngredient()

  // Track selected values for each ingredient
  const [selections, setSelections] = React.useState<Record<string, string>>({})

  // Track which items have been successfully linked
  const [linkedItems, setLinkedItems] = React.useState<Set<string>>(new Set())

  // Group unlinked ingredients by recipe
  const groupedIngredients = React.useMemo(() => {
    const grouped: GroupedIngredients = {}
    unlinkedIngredients.forEach((item) => {
      if (!grouped[item.recipe_name]) {
        grouped[item.recipe_name] = []
      }
      grouped[item.recipe_name].push(item)
    })
    return grouped
  }, [unlinkedIngredients])

  // Generate a unique key for each unlinked ingredient
  const getItemKey = (item: UnlinkedIngredient) =>
    `${item.recipe_id}-${item.ingredient_index}`

  // Handle selection change
  const handleSelectionChange = (item: UnlinkedIngredient, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [getItemKey(item)]: value,
    }))
  }

  // Handle linking an ingredient
  const handleLink = async (item: UnlinkedIngredient) => {
    const key = getItemKey(item)
    const masterId = selections[key]

    if (!masterId) {
      return
    }

    try {
      await linkIngredient.mutateAsync({
        recipeId: item.recipe_id,
        ingredientIndex: item.ingredient_index,
        masterIngredientId: masterId,
      })

      // Mark as linked
      setLinkedItems((prev) => new Set(prev).add(key))

      // Clear selection
      setSelections((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } catch (error) {
      console.error('Failed to link ingredient:', error)
    }
  }

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelections({})
      setLinkedItems(new Set())
    }
  }, [open])

  // Get suggestion text for an ingredient
  const getSuggestion = (item: UnlinkedIngredient) => {
    if (!item.linked_id || !ingredients) return null
    const suggested = ingredients.find((i) => i.id === item.linked_id)
    return suggested ? `Suggested: ${suggested.name}` : null
  }

  // Filter out already-linked items
  const remainingIngredients = React.useMemo(() => {
    const remaining: GroupedIngredients = {}
    Object.entries(groupedIngredients).forEach(([recipeName, items]) => {
      const unlinked = items.filter(
        (item) => !linkedItems.has(getItemKey(item))
      )
      if (unlinked.length > 0) {
        remaining[recipeName] = unlinked
      }
    })
    return remaining
  }, [groupedIngredients, linkedItems])

  const remainingCount = Object.values(remainingIngredients).flat().length

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <ModalTitle>Link Recipe Ingredients</ModalTitle>
      </ModalHeader>

      <ModalBody>
        {ingredientsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : remainingCount === 0 ? (
          <div className="text-center py-8">
            <Text variant="muted">All ingredients are linked!</Text>
            <Button variant="primary" onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Text variant="muted" size="sm">
              Select a master ingredient to link each recipe ingredient. This
              enables automatic cost updates when ingredient prices change.
            </Text>

            {Object.entries(remainingIngredients).map(([recipeName, items]) => (
              <div key={recipeName} className="space-y-3">
                <Text weight="semibold" size="sm">
                  {recipeName}
                </Text>

                {items.map((item) => {
                  const key = getItemKey(item)
                  const isLinking =
                    linkIngredient.isPending &&
                    linkIngredient.variables?.recipeId === item.recipe_id &&
                    linkIngredient.variables?.ingredientIndex ===
                      item.ingredient_index
                  const suggestion = getSuggestion(item)

                  return (
                    <div
                      key={key}
                      className="bg-surface-bg rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusDot variant="warning" size="sm" />
                          <Text size="sm">{item.ingredient_name}</Text>
                          {item.unit_cost > 0 && (
                            <Text size="xs" variant="muted">
                              (${item.unit_cost.toFixed(4)}/unit)
                            </Text>
                          )}
                        </div>
                        {item.confidence > 0 && (
                          <Badge variant="muted" size="sm">
                            {Math.round(item.confidence * 100)}% match
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 items-center">
                        <Select
                          value={selections[key] || item.linked_id || ''}
                          onChange={(e) =>
                            handleSelectionChange(item, e.target.value)
                          }
                          className="flex-1"
                          disabled={isLinking}
                        >
                          <option value="">-- Select master ingredient --</option>
                          {ingredients?.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.category || 'Uncategorized'})
                              {ing.cost_per_unit
                                ? ` - $${ing.cost_per_unit.toFixed(4)}/unit`
                                : ''}
                            </option>
                          ))}
                        </Select>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleLink(item)}
                          disabled={
                            isLinking ||
                            (!selections[key] && !item.linked_id)
                          }
                        >
                          {isLinking ? <Spinner size="sm" /> : 'Link'}
                        </Button>
                      </div>

                      {suggestion && (
                        <Text size="xs" variant="muted">
                          {suggestion}
                        </Text>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}
