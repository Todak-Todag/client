import { request } from '../client'

export function getRegions({signal} = {}) {
  return request('/regions', {signal});
}