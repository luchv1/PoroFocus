export default function Input({ label, type="text", error, classes, ...props}) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input type={type} className={classes} {...props} />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    )
}