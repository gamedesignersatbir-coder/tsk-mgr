import { useNavigate } from 'react-router-dom';

export function Header() {
    const navigate = useNavigate();

    return (
        <div className="flex justify-center py-5">
            <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-3 bg-white dark:bg-slate-900 rounded-t-xl">
                    <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                        <div className="size-6 text-primary">
                            <span className="material-symbols-outlined text-3xl">task_alt</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] font-display">
                            Task Manager
                        </h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-4 items-center">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                        >
                            <span className="truncate">Profile</span>
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-slate-100 dark:border-slate-700"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZbTkMZdDT9oCgixx5jcXrJ-l6dq1U2I5VzUlMBdiBSFJZauS1pdcGa9PXXJMuS8aUXANOztwrluIZLjotmsaPHZ0fuE5noZP-P-cE-wYXMJi7TMXA5bIl6aUT5vasBZI0y8dMBan6lPKi1NZV3VfVMbk_YESJZrki_vwAGnoon7ZYc2BUehZBQNYS20mZu7VyCEmV86vjaVvZHilE9rMSogyv73ADoBh2PQcl9jZSEllXT0FYcgguH9hDp6JBpK8e2wc5aEejByo")' }}
                        ></div>
                    </div>
                </header>
            </div>
        </div>
    );
}

