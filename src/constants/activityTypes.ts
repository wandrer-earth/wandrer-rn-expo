export const ACTIVITY_TYPES = {
  BIKE: 'bike',
  FOOT: 'foot',
} as const

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES]

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.BIKE]: 'Bike',
  [ACTIVITY_TYPES.FOOT]: 'Foot',
} as const

export const ACTIVITY_TYPE_OPTIONS = [
  { value: ACTIVITY_TYPES.BIKE, label: ACTIVITY_TYPE_LABELS[ACTIVITY_TYPES.BIKE] },
  { value: ACTIVITY_TYPES.FOOT, label: ACTIVITY_TYPE_LABELS[ACTIVITY_TYPES.FOOT] },
]