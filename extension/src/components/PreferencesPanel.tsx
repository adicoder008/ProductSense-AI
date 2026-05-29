import { useState } from "react"
import type { UserPreferences, UserPriority } from "@productsense/shared"
import { savePreferences } from "~lib/api-client"

const PRIORITIES: { id: UserPriority; label: string }[] = [
  { id: "battery", label: "Battery" },
  { id: "gaming", label: "Gaming" },
  { id: "portability", label: "Portability" },
  { id: "camera", label: "Camera" },
  { id: "build_quality", label: "Build Quality" },
  { id: "value", label: "Value" },
  { id: "performance", label: "Performance" },
  { id: "design", label: "Design" }
]

interface PreferencesPanelProps {
  preferences: UserPreferences
  onSave: (prefs: UserPreferences) => void
}

export function PreferencesPanel({ preferences, onSave }: PreferencesPanelProps) {
  const [budget, setBudget] = useState(preferences.budget?.toString() ?? "")
  const [priorities, setPriorities] = useState<UserPriority[]>(
    preferences.priorities ?? []
  )
  const [saving, setSaving] = useState(false)

  function togglePriority(id: UserPriority) {
    setPriorities((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    setSaving(true)
    const prefs: UserPreferences = {
      ...preferences,
      budget: budget ? parseFloat(budget) : undefined,
      priorities,
      currency: "INR"
    }
    try {
      await savePreferences(prefs)
      onSave(prefs)
    } catch {
      onSave(prefs)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-xs font-medium text-ps-muted">Budget (₹)</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="50000"
          className="mt-1 w-full bg-ps-bg border border-ps-border rounded-lg px-3 py-2 text-sm text-ps-text focus:outline-none focus:border-ps-primary"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ps-muted">Priorities</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRIORITIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => togglePriority(id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                priorities.includes(id)
                  ? "border-ps-primary bg-ps-primary/20 text-ps-primary"
                  : "border-ps-border text-ps-muted hover:border-ps-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-lg bg-ps-primary text-white text-sm font-medium hover:bg-ps-primary-hover disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  )
}
