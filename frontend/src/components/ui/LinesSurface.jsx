const LINES_IMAGE = '/images/lines-bg.png';

export default function LinesSurface({ children, className = '' }) {
    return (
        <div className={`relative overflow-hidden isolate ${className}`}>
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
                <div
                    className="absolute inset-0 bg-top bg-repeat-y"
                    style={{
                        backgroundImage: `url(${LINES_IMAGE})`,
                        backgroundSize: '100% auto'
                    }}
                />
                <div className="absolute inset-0 bg-background/90" />
            </div>
            {children}
        </div>
    );
}