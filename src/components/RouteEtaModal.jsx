'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPinned, Navigation, TrafficCone, TriangleAlert, X } from 'lucide-react';

let googleMapsLoaderPromise = null;

function loadGoogleMaps(apiKey) {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Maps can only load in the browser.'));
    }

    if (window.google?.maps?.importLibrary) {
        return Promise.resolve(window.google);
    }

    if (!googleMapsLoaderPromise) {
        googleMapsLoaderPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-google-maps-loader="true"]');

            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.google));
                existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps script.')));
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async`;
            script.async = true;
            script.defer = true;
            script.dataset.googleMapsLoader = 'true';
            script.onload = () => {
                if (window.google?.maps?.importLibrary) {
                    resolve(window.google);
                } else {
                    reject(new Error('Google Maps loaded, but the Maps library is unavailable.'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load Google Maps script.'));
            document.head.appendChild(script);
        });
    }

    return googleMapsLoaderPromise;
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported in this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    reject(new Error('Location access was denied. Please enable it to calculate live ETA.'));
                    return;
                }

                reject(new Error('Unable to read your current location.'));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000,
            }
        );
    });
}

function normalizeLatLng(point) {
    if (!point) return null;

    if (typeof point.toJSON === 'function') {
        const json = point.toJSON();
        return { lat: json.lat, lng: json.lng };
    }

    if (typeof point.lat === 'function' && typeof point.lng === 'function') {
        return { lat: point.lat(), lng: point.lng() };
    }

    return { lat: point.lat, lng: point.lng };
}

function formatDuration(durationMillis) {
    if (!durationMillis && durationMillis !== 0) return 'Unavailable';

    const totalMinutes = Math.max(1, Math.round(durationMillis / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${totalMinutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
}

function formatArrivalTime(durationMillis) {
    if (!durationMillis && durationMillis !== 0) return 'Unavailable';

    const arrival = new Date(Date.now() + durationMillis);
    return arrival.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatDistance(distanceMeters) {
    if (!distanceMeters && distanceMeters !== 0) return 'Unavailable';

    if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)} m`;
    }

    return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function createMarkerContent(label, tone) {
    const el = document.createElement('div');
    el.style.display = 'grid';
    el.style.placeItems = 'center';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '999px';
    el.style.border = '3px solid white';
    el.style.background = tone;
    el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
    el.title = label;
    return el;
}

function RouteEtaModal({ item, onClose }) {
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [etaData, setEtaData] = useState(null);
    const mapRef = useRef(null);
    const overlaysRef = useRef([]);

    useEffect(() => {
        if (!item) return undefined;

        let cancelled = false;

        const clearOverlays = () => {
            overlaysRef.current.forEach((overlay) => {
                if (typeof overlay.setMap === 'function') {
                    overlay.setMap(null);
                }
            });
            overlaysRef.current = [];
        };

        const initializeRoute = async () => {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                setStatus('error');
                setError('Google Maps is not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local.');
                return;
            }

            if (!item.address) {
                setStatus('error');
                setError('This listing does not include a farm location, so ETA cannot be calculated.');
                return;
            }

            try {
                setStatus('locating');
                const consumerLocation = await getCurrentPosition();
                if (cancelled) return;

                setStatus('loading-map');
                await loadGoogleMaps(apiKey);
                if (cancelled) return;

                const [{ Map, TrafficLayer, LatLngBounds }, { Route }, { AdvancedMarkerElement }] = await Promise.all([
                    window.google.maps.importLibrary('maps'),
                    window.google.maps.importLibrary('routes'),
                    window.google.maps.importLibrary('marker'),
                ]);

                if (cancelled || !mapRef.current) return;

                const map = new Map(mapRef.current, {
                    center: consumerLocation,
                    zoom: 12,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });

                const trafficLayer = new TrafficLayer();
                trafficLayer.setMap(map);
                overlaysRef.current.push(trafficLayer);

                setStatus('routing');
                const { routes } = await Route.computeRoutes({
                    origin: item.address,
                    destination: consumerLocation,
                    travelMode: 'DRIVING',
                    routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
                    extraComputations: ['TRAFFIC_ON_POLYLINE'],
                    fields: ['path', 'speedPaths', 'distanceMeters', 'durationMillis', 'staticDurationMillis'],
                });

                if (cancelled) return;

                const route = routes?.[0];
                if (!route?.path?.length) {
                    throw new Error('No driveable route was found for this listing.');
                }

                const speedColors = {
                    NORMAL: '#2ea169',
                    SLOW: '#e9c46a',
                    TRAFFIC_JAM: '#e63946',
                };

                const routePoints = route.path.map(normalizeLatLng).filter(Boolean);
                const speedPaths = route.speedPaths || [];

                if (speedPaths.length > 0) {
                    speedPaths.forEach((segment) => {
                        const segmentPath = (segment.path || []).map(normalizeLatLng).filter(Boolean);
                        if (segmentPath.length < 2) return;

                        const polyline = new window.google.maps.Polyline({
                            path: segmentPath,
                            strokeColor: speedColors[segment.speed] || '#2ea169',
                            strokeOpacity: 0.95,
                            strokeWeight: 6,
                            map,
                        });

                        overlaysRef.current.push(polyline);
                    });
                } else {
                    const fallbackPolyline = new window.google.maps.Polyline({
                        path: routePoints,
                        strokeColor: '#2ea169',
                        strokeOpacity: 0.95,
                        strokeWeight: 6,
                        map,
                    });

                    overlaysRef.current.push(fallbackPolyline);
                }

                const startPoint = routePoints[0];
                const endPoint = routePoints[routePoints.length - 1];

                if (startPoint) {
                    overlaysRef.current.push(
                        new AdvancedMarkerElement({
                            map,
                            position: startPoint,
                            title: `${item.farmerName}'s location`,
                            content: createMarkerContent('Farm', '#2ea169'),
                        })
                    );
                }

                if (endPoint) {
                    overlaysRef.current.push(
                        new AdvancedMarkerElement({
                            map,
                            position: endPoint,
                            title: 'Your current location',
                            content: createMarkerContent('You', '#1d4ed8'),
                        })
                    );
                }

                const bounds = new LatLngBounds();
                routePoints.forEach((point) => bounds.extend(point));
                map.fitBounds(bounds, 60);

                const liveDurationMillis = route.durationMillis ?? null;
                const normalDurationMillis = route.staticDurationMillis ?? route.durationMillis ?? null;
                const trafficDelayMillis =
                    liveDurationMillis != null && normalDurationMillis != null
                        ? Math.max(0, liveDurationMillis - normalDurationMillis)
                        : null;

                setEtaData({
                    liveEta: formatDuration(liveDurationMillis),
                    normalEta: formatDuration(normalDurationMillis),
                    arrivalTime: formatArrivalTime(liveDurationMillis),
                    distance: formatDistance(route.distanceMeters),
                    trafficDelay:
                        trafficDelayMillis != null && trafficDelayMillis > 0
                            ? formatDuration(trafficDelayMillis)
                            : 'No major delay',
                    routeFound: true,
                });
                setStatus('ready');
            } catch (routeError) {
                console.error('ETA route error:', routeError);
                if (!cancelled) {
                    clearOverlays();
                    setStatus('error');
                    setError(routeError.message || 'Unable to calculate live ETA right now.');
                }
            }
        };

        initializeRoute();

        return () => {
            cancelled = true;
            clearOverlays();
        };
    }, [item]);

    if (!item) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1.5rem',
                zIndex: 2000,
            }}
        >
            <div
                className="glass-panel"
                style={{
                    width: 'min(980px, 100%)',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '1.5rem',
                    position: 'relative',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="btn"
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.8)',
                    }}
                >
                    <X size={18} />
                </button>

                <div style={{ marginBottom: '1.25rem', paddingRight: '3rem' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <MapPinned color="var(--primary)" /> Live Route & ETA
                    </h2>
                    <p style={{ margin: '0.6rem 0 0 0', color: 'var(--text-muted)' }}>
                        {item.title} from {item.farmerName} - {item.address || 'Farm location unavailable'}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem' }}>
                    <div
                        style={{
                            minHeight: '420px',
                            borderRadius: '18px',
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.55)',
                        }}
                    >
                        {(status === 'loading-map' || status === 'routing' || status === 'locating') && (
                            <div
                                style={{
                                    minHeight: '420px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: 'var(--text-muted)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                }}
                            >
                                {status === 'locating' && 'Reading your current location...'}
                                {status === 'loading-map' && 'Loading live map...'}
                                {status === 'routing' && 'Computing traffic-aware route and ETA...'}
                            </div>
                        )}
                        {status === 'error' ? (
                            <div
                                style={{
                                    minHeight: '420px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    color: 'var(--danger)',
                                }}
                            >
                                <div>
                                    <TriangleAlert size={40} style={{ marginBottom: '1rem' }} />
                                    <p style={{ margin: 0 }}>{error}</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={mapRef}
                                style={{
                                    display: status === 'ready' ? 'block' : 'none',
                                    width: '100%',
                                    minHeight: '420px',
                                }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
                        <div className="glass-panel" style={{ padding: '1.25rem' }}>
                            <h3 style={{ margin: '0 0 1rem 0' }}>Delivery Snapshot</h3>
                            <div style={{ display: 'grid', gap: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Live ETA</span>
                                    <strong>{etaData?.liveEta || '--'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Expected arrival</span>
                                    <strong>{etaData?.arrivalTime || '--'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Distance</span>
                                    <strong>{etaData?.distance || '--'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Normal traffic ETA</span>
                                    <strong>{etaData?.normalEta || '--'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Traffic impact</span>
                                    <strong>{etaData?.trafficDelay || '--'}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(230, 244, 234, 0.55)' }}>
                            <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrafficCone size={18} color="#e9c46a" /> Traffic Legend
                            </h3>
                            <div style={{ display: 'grid', gap: '0.7rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ width: '14px', height: '14px', borderRadius: '999px', background: '#2ea169' }}></span>
                                    Normal flow
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ width: '14px', height: '14px', borderRadius: '999px', background: '#e9c46a' }}></span>
                                    Slow movement
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ width: '14px', height: '14px', borderRadius: '999px', background: '#e63946' }}></span>
                                    Traffic jam
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.25rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                <Navigation size={16} style={{ verticalAlign: 'text-bottom', marginRight: '0.4rem' }} />
                                ETA is computed from the farmer location to your current device location using live traffic-aware routing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RouteEtaModal;
