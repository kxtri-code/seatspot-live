import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-white text-black hover:bg-slate-200 shadow-sm",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm", // <--- ADDED THIS
      outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-white",
      ghost: "hover:bg-slate-800 text-slate-300 hover:text-white",
      link: "text-blue-500 underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-12 px-6 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-14 rounded-2xl px-8",
      icon: "h-10 w-10",
    }

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }