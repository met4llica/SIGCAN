'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  Dog,
  CalendarClock,
  Stethoscope,
  Syringe,
  Package,
  Eye,
  Map,
  HandHelping,
  ShieldCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
  PawPrint,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      { href: '/turnos', label: 'Turnos', icon: CalendarClock },
      { href: '/operativos', label: 'Operativos', icon: Stethoscope },
      { href: '/procedimientos', label: 'Procedimientos', icon: Syringe },
    ],
  },
  {
    label: 'Registros',
    items: [
      { href: '/vecinos', label: 'Vecinos', icon: Users },
      { href: '/animales', label: 'Animales', icon: Dog },
      { href: '/veterinarios', label: 'Veterinarios', icon: ShieldCheck },
      { href: '/voluntarios', label: 'Voluntarios', icon: HandHelping },
      { href: '/insumos', label: 'Insumos', icon: Package },
    ],
  },
  {
    label: 'Comunidad',
    items: [{ href: '/avistamientos', label: 'Avistamientos', icon: Eye }],
  },
  {
    label: 'Administración',
    items: [
      { href: '/zonas', label: 'Zonas', icon: Map },
      { href: '/usuarios', label: 'Usuarios', icon: ShieldCheck },
      { href: '/reportes', label: 'Reportes', icon: BarChart3 },
    ],
  },
];

const ROL_LABEL: Record<string, string> = { admin: 'Administrador', operador: 'Operador', veterinario: 'Veterinario' };

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ nombre: string; apellido: string; rol: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (pathname === '/login') return null;

  const NavLinks = () => (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
      {NAV.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 mb-1">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-sidebar text-sidebar-foreground px-4 py-3">
        <a href="/" className="flex items-center gap-2 font-bold">
          <PawPrint className="h-5 w-5 text-sidebar-primary" /> SIGCAN
        </a>
        <button onClick={() => setOpen(!open)} aria-label="Abrir menú">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-sidebar text-sidebar-foreground w-64 shrink-0 flex-col lg:flex lg:sticky lg:top-0 lg:h-screen',
          open ? 'flex fixed inset-0 z-50' : 'hidden'
        )}
      >
        <div className="px-5 py-4 hidden lg:flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-sidebar-primary" />
          <div>
            <div className="font-bold leading-none">SIGCAN</div>
            <div className="text-xs text-sidebar-foreground/50 mt-0.5">Zoonosis · Río Grande</div>
          </div>
        </div>

        <NavLinks />

        <div className="border-t border-sidebar-border px-4 py-2.5 shrink-0">
          {user && (
            <div className="mb-1.5">
              <p className="text-sm font-medium leading-tight">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-sidebar-foreground/50 leading-tight">{ROL_LABEL[user.rol] || user.rol}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-sidebar-foreground/75 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
