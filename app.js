const { useState, useEffect, useRef } = React;

// Windows XP Sounds
const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'click':
            oscillator.frequency.value = 1000;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'open':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'close':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
};

function SeismicExplorer() {
    const [config, setConfig] = useState(null);
    const [windows, setWindows] = useState({});
    const [desktopIcons, setDesktopIcons] = useState([]);
    const [recycledItems, setRecycledItems] = useState([]);
    const [showStartMenu, setShowStartMenu] = useState(false);
    const [showRecycleBin, setShowRecycleBin] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [draggedIcon, setDraggedIcon] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Load config
    useEffect(() => {
        fetch('config.json')
            .then(r => r.json())
            .then(data => {
                setConfig(data);
                setDesktopIcons(data.projects.map(p => ({ ...p, visible: true })));
                const stored = localStorage.getItem('desktopIcons');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        setDesktopIcons(parsed);
                    } catch(e) {}
                }
                const storedRecycled = localStorage.getItem('recycledItems');
                if (storedRecycled) {
                    try {
                        setRecycledItems(JSON.parse(storedRecycled));
                    } catch(e) {}
                }
            });
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (desktopIcons.length > 0) {
            localStorage.setItem('desktopIcons', JSON.stringify(desktopIcons));
        }
    }, [desktopIcons]);

    useEffect(() => {
        localStorage.setItem('recycledItems', JSON.stringify(recycledItems));
    }, [recycledItems]);

    const playAudio = (type) => {
        if (soundEnabled) playSound(type);
    };

    const openWindow = (project) => {
        playAudio('open');
        const windowId = `window-${project.id}`;
        setWindows(prev => ({
            ...prev,
            [windowId]: {
                id: windowId,
                project,
                x: Math.random() * 200 + 100,
                y: Math.random() * 200 + 100,
                width: 800,
                height: 600,
                minimized: false,
                focused: true
            }
        }));
        setShowStartMenu(false);
    };

    const closeWindow = (windowId) => {
        playAudio('close');
        setWindows(prev => {
            const newWindows = { ...prev };
            delete newWindows[windowId];
            return newWindows;
        });
    };

    const minimizeWindow = (windowId) => {
        playAudio('click');
        setWindows(prev => ({
            ...prev,
            [windowId]: { ...prev[windowId], minimized: true }
        }));
    };

    const toggleMaximize = (windowId) => {
        playAudio('click');
        setWindows(prev => ({
            ...prev,
            [windowId]: { 
                ...prev[windowId], 
                maximized: !prev[windowId].maximized,
                x: prev[windowId].maximized ? 100 : 0,
                y: prev[windowId].maximized ? 100 : 0,
                width: prev[windowId].maximized ? 800 : window.innerWidth,
                height: prev[windowId].maximized ? 600 : window.innerHeight - 28
            }
        }));
    };

    const restoreWindow = (windowId) => {
        playAudio('click');
        setWindows(prev => ({
            ...prev,
            [windowId]: { ...prev[windowId], minimized: false, focused: true }
        }));
    };

    const deleteIcon = (projectId) => {
        playAudio('click');
        const icon = desktopIcons.find(i => i.id === projectId);
        if (icon) {
            setDesktopIcons(prev => prev.filter(i => i.id !== projectId));
            setRecycledItems(prev => [...prev, icon]);
        }
    };

    const restoreIcon = (projectId) => {
        playAudio('click');
        const icon = recycledItems.find(i => i.id === projectId);
        if (icon) {
            setDesktopIcons(prev => [...prev, icon]);
            setRecycledItems(prev => prev.filter(i => i.id !== projectId));
        }
    };

    const emptyRecycleBin = () => {
        playAudio('click');
        setRecycledItems([]);
    };

    const handleIconDragStart = (e, project) => {
        setDraggedIcon(project.id);
        const icon = desktopIcons.find(i => i.id === project.id);
        if (icon) {
            setDragOffset({
                x: e.clientX - icon.x,
                y: e.clientY - icon.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (draggedIcon) {
            setDesktopIcons(prev => prev.map(icon => 
                icon.id === draggedIcon 
                    ? { ...icon, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
                    : icon
            ));
        }
    };

    const handleMouseUp = () => {
        setDraggedIcon(null);
    };

    if (!config) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

    return (
        <div 
            id="desktop" 
            style={{ position: 'relative', width: '100vw', height: '100vh' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={() => { setShowStartMenu(false); setSelectedIcon(null); }}
        >
            {/* Desktop Icons */}
            {desktopIcons.map(project => (
                <div
                    key={project.id}
                    className={`desktop-icon ${selectedIcon === project.id ? 'selected' : ''}`}
                    style={{
                        left: `${project.x || Math.random() * 600}px`,
                        top: `${project.y || Math.random() * 400}px`,
                        cursor: draggedIcon === project.id ? 'grabbing' : 'pointer'
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedIcon(project.id);
                        if (e.detail === 1) {
                            handleIconDragStart(e, project);
                        }
                    }}
                    onDoubleClick={() => openWindow(project)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        deleteIcon(project.id);
                    }}
                >
                    <div className="icon-image">
                        <img src={project.logo} alt={project.name} />
                    </div>
                    <div className="icon-label">{project.name}</div>
                </div>
            ))}

            {/* Recycle Bin */}
            <div
                className="recycle-bin"
                onDoubleClick={() => setShowRecycleBin(true)}
                onClick={() => setSelectedIcon('recycle-bin')}
            >
                <div className="bin-image">
                    <span style={{ fontSize: '40px' }}>🗑️</span>
                </div>
                <div className="bin-label">Recycle Bin ({recycledItems.length})</div>
            </div>

            {/* Taskbar */}
            <div className="taskbar">
                <button 
                    className="start-button"
                    onClick={() => setShowStartMenu(!showStartMenu)}
                >
                    <img src={config.seismic.logo} alt="Seismic" />
                    Start
                </button>

                <div className="taskbar-separator"></div>

                <div className="taskbar-buttons">
                    {Object.values(windows).filter(w => !w.minimized).map(w => (
                        <button
                            key={w.id}
                            className={`taskbar-btn ${w.focused ? 'active' : ''}`}
                            onClick={() => restoreWindow(w.id)}
                        >
                            <img src={w.project.logo} alt={w.project.name} />
                            {w.project.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Menu */}
            {showStartMenu && (
                <div className="start-menu" onClick={(e) => e.stopPropagation()}>
                    <div className="start-menu-item" onClick={() => { setShowStartMenu(false); setShowRecycleBin(true); }}>
                        🗂️ Programs
                        <div className="submenu">
                            {config.projects.map(p => (
                                <div 
                                    key={p.id}
                                    className="submenu-item"
                                    onClick={() => openWindow(p)}
                                >
                                    <img src={p.logo} alt={p.name} />
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="start-menu-item separator"></div>

                    <div className="start-menu-item">
                        📄 Documents
                        <div className="submenu">
                            <div 
                                className="submenu-item"
                                onClick={() => {
                                    alert('Seismic is a privacy-enabled blockchain for secure financial applications.');
                                    setShowStartMenu(false);
                                }}
                            >
                                About Seismic
                            </div>
                        </div>
                    </div>

                    <div className="start-menu-item">
                        ⚙️ Settings
                        <div className="submenu">
                            <div 
                                className="submenu-item"
                                onClick={() => {
                                    setSoundEnabled(!soundEnabled);
                                    playAudio('click');
                                }}
                            >
                                {soundEnabled ? '🔊' : '🔇'} Sound ({soundEnabled ? 'On' : 'Off'})
                            </div>
                        </div>
                    </div>

                    <div className="start-menu-item">
                        ℹ️ Help
                        <div className="submenu">
                            <a href={config.seismic.docs} target="_blank" className="submenu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                📚 Seismic Docs
                            </a>
                            <a href={config.seismic.discord} target="_blank" className="submenu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                💬 Discord
                            </a>
                            <a href={config.seismic.twitter} target="_blank" className="submenu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                🐦 Twitter
                            </a>
                        </div>
                    </div>

                    <div className="start-menu-item separator"></div>

                    <div 
                        className="start-menu-item"
                        onClick={() => {
                            if (confirm('Are you sure you want to shut down?')) {
                                alert('Thanks for using Seismic Explorer!');
                            }
                            setShowStartMenu(false);
                        }}
                    >
                        🔌 Shut Down...
                    </div>
                </div>
            )}

            {/* Recycle Bin Modal */}
            {showRecycleBin && (
                <div className="modal-overlay" onClick={() => setShowRecycleBin(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">
                            <span>Recycle Bin</span>
                            <button 
                                className="window-btn"
                                onClick={() => setShowRecycleBin(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {recycledItems.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                    The Recycle Bin is empty.
                                </div>
                            ) : (
                                recycledItems.map(item => (
                                    <div key={item.id} className="recycled-item">
                                        <span className="recycled-item-name">{item.name}</span>
                                        <button 
                                            className="restore-btn"
                                            onClick={() => restoreIcon(item.id)}
                                        >
                                            Restore
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        {recycledItems.length > 0 && (
                            <div className="modal-buttons">
                                <button className="modal-btn" onClick={emptyRecycleBin}>
                                    Empty Bin
                                </button>
                                <button className="modal-btn" onClick={() => setShowRecycleBin(false)}>
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Windows */}
            {Object.values(windows).map(window => (
                !window.minimized && (
                    <Window 
                        key={window.id}
                        window={window}
                        onClose={() => closeWindow(window.id)}
                        onMinimize={() => minimizeWindow(window.id)}
                        onMaximize={() => toggleMaximize(window.id)}
                        onRestore={() => restoreWindow(window.id)}
                    />
                )
            ))}
        </div>
    );
}

function Window({ window, onClose, onMinimize, onMaximize, onRestore }) {
    const [isLoading, setIsLoading] = useState(true);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [windowPos, setWindowPos] = useState({ x: window.x, y: window.y });

    const handleMouseDown = (e) => {
        setDragOffset({
            x: e.clientX - windowPos.x,
            y: e.clientY - windowPos.y
        });
    };

    const handleMouseMove = (e) => {
        setWindowPos({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
        });
    };

    return (
        <div
            className="window"
            style={{
                left: `${windowPos.x}px`,
                top: `${windowPos.y}px`,
                width: `${window.width}px`,
                height: `${window.height}px`,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setDragOffset({ x: 0, y: 0 })}
        >
            <div className="window-title" onMouseDown={handleMouseDown}>
                <span>{window.project.name}</span>
                <div className="window-controls">
                    <button className="window-btn" onClick={onMinimize}>_</button>
                    <button className="window-btn" onClick={onMaximize}>□</button>
                    <button className="window-btn" onClick={onClose}>✕</button>
                </div>
            </div>
            <div className="window-content">
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-bar">
                            <div className="loading-progress"></div>
                        </div>
                        <div className="loading-text">Loading...</div>
                    </div>
                )}
                <iframe
                    className="window-iframe"
                    src={window.project.url}
                    title={window.project.name}
                    onLoad={() => setIsLoading(false)}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                />
            </div>
        </div>
    );
}

ReactDOM.render(<SeismicExplorer />, document.getElementById('root'));
