// types.ts

export type HoverArea = 
  | 'volumeLeft' 
  | 'intentLeft' 
  | 'standby' 
  | 'intentRight' 
  | 'volumeRight'
  | 'bookmarkPrev'
  | 'bookmarkNext'

  export type NavigationState = {
    currentArea: HoverArea | null
    previousArea: HoverArea | null
    hoverStartTime: number | null
    accumulatedCount: number
    direction: NavigationDirection | null
  }
  
  export type NavigationIndicator = {
    count: number
    direction: NavigationDirection | null
  }
  
  export type BookmarkState = {
    page: number | null
    active: boolean
  }
  
  export type NavigationDirection = 'prev' | 'next'
