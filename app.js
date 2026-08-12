const BIN_EMPTY = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23555555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='3 6 5 6 21 6'></polyline><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path></svg>";
const BIN_FULL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23555555' stroke='%23333333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='3 6 5 6 21 6'></polyline><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path><line x1='10' y1='11' x2='10' y2='17' stroke='%23ffffff'></line><line x1='14' y1='11' x2='14' y2='17' stroke='%23ffffff'></line></svg>";
const { useState, useEffect, useRef } = React;

const playSound = (type) => {
    try {
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
    } catch(e) {}
};

function SeismicExplorer() {
    const [config, setConfig] = useState(null);
    const [windows, setWindows] = useState({});
    const [desktopIcons, setDesktopIcons] = useState([]);
    const [recycledItems, setRecycledItems] = useState([]);
    const [showStartMenu, setShowStartMenu] = useState(false);
    const [showRecycleBin, setShowRecycleBin] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [draggedIconId, setDraggedIconId] = useState(null);
    const [dragStartPos, setDragStartPos] = useState(null);
    const [iconPositions, setIconPositions] = useState({});
    const desktopRef = useRef(null);

    // Load config
    useEffect(() => {
        fetch('config.json')
            .then(r => r.json())
            .then(data => {
                setConfig(data);
                
                const storedIcons = localStorage.getItem('desktopIcons');
                const storedPositions = localStorage.getItem('iconPositions');
                
                let initialIcons = data.projects;
                if (storedIcons) {
                    try {
                        initialIcons = JSON.parse(storedIcons);
                    } catch(e) {}
                }
                setDesktopIcons(initialIcons);

                let initialPositions = {};
                if (storedPositions) {
                    try {
                        initialPositions = JSON.parse(storedPositions);
                    } catch(e) {}
                }

                const updatedPositions = { ...initialPositions };
                initialIcons.forEach((project, index) => {
                    if (!updatedPositions[project.id]) {
                        const col = Math.floor(index / 5);
                        const row = index % 5;
                        updatedPositions[project.id] = {
                            x: 20 + col * 100,
                            y: 20 + row * 100
                        };
                    }
                });

                setIconPositions(updatedPositions);

                const storedRecycled = localStorage.getItem('recycledItems');
                if (storedRecycled) {
                    try {
                        setRecycledItems(JSON.parse(storedRecycled));
                    } catch(e) {}
                }
            });
    }, []);

    // Save state
    useEffect(() => {
        if (desktopIcons.length > 0) {
            localStorage.setItem('desktopIcons', JSON.stringify(desktopIcons));
        }
    }, [desktopIcons]);

    useEffect(() => {
        localStorage.setItem('iconPositions', JSON.stringify(iconPositions));
    }, [iconPositions]);

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
                x: 100,
                y: 100,
                width: 900,
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

    const toggleMaximizeWindow = (windowId) => {
        playAudio('click');
        setWindows(prev => ({
            ...prev,
            [windowId]: { ...prev[windowId], maximized: !prev[windowId].maximized }
        }));
    };

    const toggleWindowTaskbar = (windowId) => {
        playAudio('click');
        setWindows(prev => {
            const currentWin = prev[windowId];
            if (!currentWin) return prev;

            if (currentWin.minimized) {
                return {
                    ...prev,
                    [windowId]: { ...prev[windowId], minimized: false, focused: true }
                };
            } else {
                return {
                    ...prev,
                    [windowId]: { ...prev[windowId], minimized: true }
                };
            }
        });
    };

    const deleteIcon = (projectId, e) => {
        e.stopPropagation();
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

    const handleIconMouseDown = (e, projectId) => {
        if (e.button !== 0 || e.detail === 2) return;
        e.preventDefault();
        setDraggedIconId(projectId);
        setDragStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (draggedIconId && dragStartPos && desktopRef.current) {
            const distance = Math.sqrt(
                Math.pow(e.clientX - dragStartPos.x, 2) + 
                Math.pow(e.clientY - dragStartPos.y, 2)
            );
            
            if (distance > 10) {
                const rect = desktopRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left - 40, window.innerWidth - 100));
                const y = Math.max(0, Math.min(e.clientY - rect.top - 50, window.innerHeight - 150));
                
                setIconPositions(prev => ({
                    ...prev,
                    [draggedIconId]: { x, y }
                }));
            }
        }
    };

    const handleMouseUp = () => {
        if (draggedIconId) {
            setIconPositions(prev => ({ ...prev }));
        }
        setDraggedIconId(null);
        setDragStartPos(null);
    };

    const handleDoubleClick = (project) => {
        openWindow(project);
    };

    const handleContextMenu = (e, projectId) => {
        e.preventDefault();
        deleteIcon(projectId, e);
    };

    if (!config) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

    return (
        <div 
            ref={desktopRef}
            id="desktop"
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setShowStartMenu(false)}
        >
            {/* Desktop Icons */}
            {desktopIcons.map(project => {
                const pos = iconPositions[project.id] || { x: 20, y: 20 };
                return (
                    <div
                        key={project.id}
                        className="desktop-icon"
                        style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            cursor: draggedIconId === project.id ? 'grabbing' : 'grab',
                            userSelect: 'none'
                        }}
                        onMouseDown={(e) => handleIconMouseDown(e, project.id)}
                        onDoubleClick={() => handleDoubleClick(project)}
                        onContextMenu={(e) => handleContextMenu(e, project.id)}
                    >
                        <div className="icon-image">
                            <img src={project.logo} alt={project.name} style={{ pointerEvents: 'none' }} />
                        </div>
                        <div className="icon-label">{project.name}</div>
                    </div>
                );
            })}

            {/* Recycle Bin */}
<div
    className="recycle-bin"
    onDoubleClick={() => openWindow({
        id: 'recycle-bin',
        name: 'Recycle Bin',
        logo: recycledItems.length > 0 ? BIN_FULL : BIN_EMPTY,
        isRecycleBin: true
    })}
    style={{ cursor: 'pointer', userSelect: 'none' }}
>
    <div className="bin-image">
        <img 
            src={recycledItems.length > 0 ? BIN_FULL : BIN_EMPTY} 
            alt="Recycle Bin" 
            style={{ width: '32px', height: '32px', pointerEvents: 'none' }} 
        />
    </div>
    <div className="bin-label">Recycle Bin ({recycledItems.length})</div>
</div>

            {/* Taskbar */}
            <div className="taskbar">
                <button 
                    className="start-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowStartMenu(!showStartMenu);
                    }}
                >
                    <img src={config.seismic.logo} alt="Seismic" className="start-logo" />
                </button>

                <div className="taskbar-separator"></div>

                <div className="taskbar-buttons">
                    {Object.values(windows).map(w => (
                        <button
                            key={w.id}
                            className={`taskbar-btn ${!w.minimized ? 'active' : ''}`}
                            onClick={() => toggleWindowTaskbar(w.id)}
                        >
                            <img src={w.project.logo} alt={w.project.name} style={{ pointerEvents: 'none' }} />
                            {w.project.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Menu */}
            {showStartMenu && (
                <div 
                    className="start-menu"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="start-menu-item">
    🗂️ Programs
    <div className="submenu">
        {config.projects.map(p => (
            <a 
                key={p.id}
                className="submenu-item"
                href={p.twitter || p.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => {
                    playAudio('click');
                    setShowStartMenu(false);
                }}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <img src={p.logo} alt={p.name} style={{ pointerEvents: 'none', width: '16px', height: '16px' }} />
                {p.name}
            </a>
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
                                    openWindow({
                                        id: 'seismic-about',
                                        name: 'About Seismic',
                                        logo: config.seismic.logo,
                                        url: config.seismic.url || config.seismic.docs || 'https://seismic.systems'
                                    });
                                }}
                            >
                                ℹ️ About Seismic
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
                            <a href={config.seismic.docs} target="_blank" rel="noopener noreferrer" className="submenu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                📚 Seismic Docs
                            </a>
                            <a href={config.seismic.discord} target="_blank" rel="noopener noreferrer" className="submenu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                💬 Discord
                            </a>
                            <a href={config.seismic.twitter} target="_blank" rel="noopener noreferrer" className="submenu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
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
            onMaximize={() => toggleMaximizeWindow(window.id)}
            recycledItems={recycledItems}
            onRestoreItem={restoreIcon}
            onEmptyBin={emptyRecycleBin}
        />
    )
))}
        </div>
    );
}

function Window({ window, onClose, onMinimize, onMaximize, recycledItems, onRestoreItem, onEmptyBin }) {
    const [isLoading, setIsLoading] = useState(true);
    const [pos, setPos] = useState({ x: window.x, y: window.y });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleTitleMouseDown = (e) => {
        if (e.button !== 0 || window.maximized) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && !window.maximized) {
                const newX = Math.max(0, e.clientX - dragOffset.x);
                const newY = Math.max(0, e.clientY - dragOffset.y);
                setPos({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset, window.maximized]);

    const windowStyle = window.maximized ? {
        left: '0px',
        top: '0px',
        width: '100vw',
        height: 'calc(100vh - 38px)',
        zIndex: window.focused ? 11 : 10
    } : {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${window.width}px`,
        height: `${window.height}px`,
        zIndex: window.focused ? 11 : 10
    };

    return (
        <div className="window" style={windowStyle}>
            <div 
                className="window-title"
                onMouseDown={handleTitleMouseDown}
                style={{ cursor: window.maximized ? 'default' : (isDragging ? 'grabbing' : 'move'), userSelect: 'none' }}
            >
                <span>{window.project.name}</span>
                <div className="window-controls">
                    <button className="window-btn" onClick={onMinimize} title="Minimize">_</button>
                    <button className="window-btn" onClick={onMaximize} title="Maximize">
                        {window.maximized ? '🗗' : '🗖'}
                    </button>
                    <button className="window-btn" onClick={onClose} title="Close">✕</button>
                </div>
            </div>
            <div className="window-content" style={{ background: '#fff', height: 'calc(100% - 30px)', overflow: 'hidden' }}>
    {window.project.isRecycleBin ? (
        /* Вміст для Кошика у стилі Windows XP */
        <div className="xp-explorer-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: '11px' }}>
            <div className="xp-menu-bar" style={{ display: 'flex', gap: '12px', padding: '3px 6px', background: '#f0f0e8', borderBottom: '1px solid #d0d0c0' }}>
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>Favorites</span>
                <span>Tools</span>
                <span>Help</span>
            </div>

            <div className="xp-explorer-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Лівий боковий панель XP */}
                <div className="xp-sidebar" style={{ width: '180px', background: 'linear-gradient(to bottom, #7ba2e7, #6375d6)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: '#fff', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(to right, #225ad2, #648ee4)', color: 'white', fontWeight: 'bold', padding: '4px 8px' }}>
                            Recycle Bin Tasks
                        </div>
                        <div style={{ background: '#d6dff7', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button 
                                onClick={onEmptyBin}
                                disabled={!recycledItems || recycledItems.length === 0}
                                style={{ background: 'none', border: 'none', color: (recycledItems && recycledItems.length > 0) ? '#0066cc' : '#888', textAlign: 'left', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                            >
                                🗑️ Empty the Recycle Bin
                            </button>
                        </div>
                    </div>
                </div>

                {/* Поле з видаленими елементами */}
                <div className="xp-file-area" style={{ flex: 1, background: '#ffffff', padding: '15px', overflowY: 'auto' }}>
                    {(!recycledItems || recycledItems.length === 0) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '40px', color: '#666' }}>
                            <span style={{ fontSize: '48px', marginBottom: '10px' }}>🗑️</span>
                            <p>The Recycle Bin is empty.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {recycledItems.map(item => (
                                <div 
                                    key={item.id} 
                                    style={{ textAlign: 'center', width: '75px', cursor: 'pointer' }}
                                    title="Right click or click Restore to return icon"
                                >
                                    <img src={item.logo} alt={item.name} style={{ width: '32px', height: '32px' }} />
                                    <div style={{ fontSize: '11px', marginTop: '4px', wordBreak: 'break-word' }}>{item.name}</div>
                                    <button 
                                        onClick={() => onRestoreItem(item.id)}
                                        style={{ fontSize: '9px', marginTop: '4px', cursor: 'pointer' }}
                                    >
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : (
        /* Звичайний iframe для інших вікон */
        <>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-bar">
                        <div className="loading-progress"></div>
                    </div>
                    <div className="loading-text">Loading...</div>
                </div>
            )}
            <iframe
                className={`window-iframe ${isDragging ? 'iframe-dragging' : ''}`}
                src={window.project.url}
                title={window.project.name}
                onLoad={() => setIsLoading(false)}
                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
            />
        </>
    )}
</div>
        </div>
    );
}

ReactDOM.render(<SeismicExplorer />, document.getElementById('root'));
