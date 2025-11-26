import { render, screen } from '@testing-library/react'
import Header from '@/components/header'

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null, logout: jest.fn() })
}))

describe('Header', () => {
  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('My Medium')).toBeInTheDocument()
  })
})