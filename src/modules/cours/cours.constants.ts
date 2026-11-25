export const COURSE_CATEGORIES = ['web', 'data', 'other'] as const

export type CourseCategory = (typeof COURSE_CATEGORIES)[number]

export const COURSE_LEVELS = ['starter', 'intermedaire', 'advenced'] as const

export type CourseLevel = (typeof COURSE_LEVELS)[number]
