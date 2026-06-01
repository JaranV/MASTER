function TotalFooter(props: TotalFooterProps) {
    return (
        <div>
            <hr />
            <p>Total: {"$" + props.total}</p>
            {props.mode === "subscription" && <p>(Monthly)</p>}
        </div>
    )
}

interface TotalFooterProps {
    total: number
    mode: "checkout" | "subscription"
}

export default TotalFooter