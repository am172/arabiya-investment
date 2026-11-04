const LINES_IMAGE = '/images/lines-bg.png';

export default function LinesBackdrop() {
    return (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
            <div
                className="absolute inset-0 bg-center bg-no-repeat bg-cover"
                style={{ backgroundImage: `url(${LINES_IMAGE})` }}
            />
            <div className="absolute inset-0 bg-background/90" />
        </div>
    );
}