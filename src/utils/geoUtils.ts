import { type FeatureCollection, type Feature, type LineString, type MultiLineString } from '@turf/helpers'

/**
 * Parses a WKT (Well-Known Text) LineString or MultiLineString into a GeoJSON Feature.
 * @param {string} wktString - The WKT string to parse.
 * @returns {Object} A GeoJSON Feature object.
 */
export function parseMultiLineString(wktString: string): Feature<LineString | MultiLineString> {
  // Remove the type identifier and parentheses
  const cleanedString = wktString.replace(/^(MULTI)?LINESTRING\s*\(*/, '').replace(/\)*$/, '')
  
  // Split into individual linestrings
  const lineStrings = cleanedString.split(/\),\s*\(/)
  
  // Parse coordinates
  const coordinates = lineStrings.map(lineString => 
    lineString.split(',').map(coordPair => {
      const [lng, lat] = coordPair.trim().split(/\s+/).map(Number)
      return [lng, lat]
    })
  )
  
  // Create GeoJSON Feature
  if (coordinates.length === 1) {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates[0]
      }
    }
  } else {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates
      }
    }
  }
}