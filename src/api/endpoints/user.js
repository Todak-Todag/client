import { request } from 'react'

export function signup(body) {
  return request('/users/signup', { method: 'POST', body });
}