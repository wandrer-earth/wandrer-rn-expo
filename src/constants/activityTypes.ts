export const ACTIVITY_TYPES = {
  BIKE: 'bike',
  FOOT: 'foot',
  COMBINED: 'combined',
} as const

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES]

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.BIKE]: 'Bike',
  [ACTIVITY_TYPES.FOOT]: 'Foot',
  [ACTIVITY_TYPES.COMBINED]: 'Both',
} as const

export const ACTIVITY_TYPE_OPTIONS = [
  { value: ACTIVITY_TYPES.BIKE, label: ACTIVITY_TYPE_LABELS[ACTIVITY_TYPES.BIKE] },
  { value: ACTIVITY_TYPES.FOOT, label: ACTIVITY_TYPE_LABELS[ACTIVITY_TYPES.FOOT] },
  { value: ACTIVITY_TYPES.COMBINED, label: ACTIVITY_TYPE_LABELS[ACTIVITY_TYPES.COMBINED] },
]

export const isFoot = (activityType: ActivityType) => activityType === ACTIVITY_TYPES.FOOT
export const isBike = (activityType: ActivityType) => activityType === ACTIVITY_TYPES.BIKE
export const isCombined = (activityType: ActivityType) => activityType === ACTIVITY_TYPES.COMBINED