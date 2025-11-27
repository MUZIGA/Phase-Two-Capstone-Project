'use client'

import React, { ReactElement } from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
  children: React.ReactNode
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-input bg-transparent hover:bg-muted',
  ghost: 'bg-transparent hover:bg-muted',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'default',
  size = 'md',
  asChild,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-md transition disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    className
  )

  if (asChild && React.isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    const merged = cn(child.props.className, classes)
    return React.cloneElement(child, { className: merged })
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}