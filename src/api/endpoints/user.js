import { request } from '../client'

export function signup(body) {
  return request('/users/signup', { method: 'POST', body });
}