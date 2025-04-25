
export default function Button ({
    children, 
    onClick, 
    type = "button", 
    classes = "", 
    disabled = false ,
    ...props
}) {
    return (
        <button 
            className={classes}
            disabled={disabled}
            type={type}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}