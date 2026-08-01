import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  StickyNote,
  FolderKanban,
  BarChart3,
  Settings,
  Search,
  Plus,
  Bell,
  Clock3,
  Circle,
  CheckCircle2,
  MoreHorizontal,
  ArrowUpRight,
  Sparkles,
  X,
  Trash2,
  Download,
  Upload,
  RotateCw,
  Flag,
  Menu,
  ListTodo,
  Coffee,
  Code2,
  Rocket,
  Palette,
  DatabaseBackup,
  LogOut,
  LockKeyhole,
  UserPlus,
  ShieldCheck,
  Camera,
  Play,
  Pause,
  Volume2,
  Pencil,
  FolderPlus,
  Minus,
  Square,
  Copy,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
  BlurText,
  FadeUp,
  HoverLift,
  ScaleIn,
  ViewTransition,
} from "./components/amicro";
import "./styles.css";
import "./titlebar.css";

const initialTasks = [
  {
    id: 1,
    title: "Revisar pull requests del equipo",
    project: "SZENDEX",
    date: new Date().toISOString(),
    time: "09:30",
    priority: "Alta",
    done: false,
    estimate: 45,
  },
  {
    id: 2,
    title: "Preparar planning del sprint",
    project: "Producto",
    date: new Date().toISOString(),
    time: "11:00",
    priority: "Media",
    done: false,
    estimate: 60,
  },
  {
    id: 3,
    title: "Refactorizar módulo de autenticación",
    project: "Core",
    date: addDays(new Date(), 1).toISOString(),
    time: "10:00",
    priority: "Alta",
    done: false,
    estimate: 120,
  },
  {
    id: 4,
    title: "Actualizar documentación de la API",
    project: "Docs",
    date: addDays(new Date(), 2).toISOString(),
    time: "12:30",
    priority: "Baja",
    done: false,
    estimate: 40,
  },
  {
    id: 5,
    title: "Deploy de la versión 2.4.0",
    project: "SZENDEX",
    date: addDays(new Date(), 3).toISOString(),
    time: "16:00",
    priority: "Alta",
    done: false,
    estimate: 90,
  },
  {
    id: 6,
    title: "Configurar entorno local",
    project: "Core",
    date: addDays(new Date(), -1).toISOString(),
    time: "09:00",
    priority: "Media",
    done: true,
    estimate: 30,
  },
];
const initialNotes = [
  {
    id: 1,
    title: "Ideas para la retrospectiva",
    body: "Hablar sobre el tiempo de revisión de PRs y proponer bloques de focus compartidos.",
    color: "orange",
    updated: "hace 20 min",
  },
  {
    id: 2,
    title: "Comandos útiles",
    body: "docker compose up -d\nnpm run db:migrate\ngh pr checkout",
    color: "blue",
    updated: "ayer",
  },
  {
    id: 3,
    title: "Pendiente con backend",
    body: "Revisar paginación del endpoint /events antes del siguiente deploy.",
    color: "violet",
    updated: "hace 2 días",
  },
];
const nav = [
  ["dashboard", "Resumen", LayoutDashboard],
  ["tasks", "Mis tareas", CheckSquare],
  ["calendar", "Calendario", CalendarDays],
  ["notes", "Notas", StickyNote],
  ["projects", "Proyectos", FolderKanban],
  ["stats", "Estadísticas", BarChart3],
];
const defaultProjects = [
  {
    id: "szendex",
    name: "SZENDEX",
    description: "Producto principal",
    color: "coral",
  },
  {
    id: "core",
    name: "Core",
    description: "Plataforma y arquitectura",
    color: "violet",
  },
  {
    id: "producto",
    name: "Producto",
    description: "Discovery y planificación",
    color: "blue",
  },
  {
    id: "docs",
    name: "Docs",
    description: "Documentación técnica",
    color: "green",
  },
  {
    id: "personal",
    name: "Personal",
    description: "Organización personal",
    color: "orange",
  },
];
const hasWindowsTitlebar =
  window.lorentasker?.platform === "win32" ||
  new URLSearchParams(window.location.search).has("windowsTitlebar");

function WindowTitlebar() {
  const [maximized, setMaximized] = useState(false);
  useEffect(() => {
    window.lorentasker?.isWindowMaximized?.().then(setMaximized);
    return window.lorentasker?.onWindowMaximized?.(setMaximized);
  }, []);
  const toggleMaximize = async () =>
    setMaximized((await window.lorentasker?.toggleMaximizeWindow?.()) || false);
  return (
    <div className="window-titlebar" onDoubleClick={toggleMaximize}>
      <div className="window-title">
        <img src="./icon.png" alt="" />
        <strong>Lorentasker</strong>
        <span>Developer workspace</span>
      </div>
      <div className="window-drag-space" />
      <div
        className="window-controls"
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <button
          title="Minimizar"
          aria-label="Minimizar"
          onClick={() => window.lorentasker?.minimizeWindow?.()}
        >
          <Minus />
        </button>
        <button
          title={maximized ? "Restaurar" : "Maximizar"}
          aria-label={maximized ? "Restaurar" : "Maximizar"}
          onClick={toggleMaximize}
        >
          {maximized ? <Copy /> : <Square />}
        </button>
        <button
          className="window-close"
          title="Cerrar"
          aria-label="Cerrar"
          onClick={() => window.lorentasker?.closeWindow?.()}
        >
          <X />
        </button>
      </div>
    </div>
  );
}

function useStored(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(
    () => localStorage.setItem(key, JSON.stringify(value)),
    [key, value],
  );
  return [value, setValue];
}

const encode = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
async function passwordHash(password, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return encode(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: Uint8Array.from(atob(salt), (c) => c.charCodeAt(0)),
        iterations: 210000,
        hash: "SHA-256",
      },
      material,
      256,
    ),
  );
}
const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem("lt-users")) || [];
  } catch {
    return [];
  }
};
function migrateLegacyData(userId) {
  ["view", "tasks", "notes", "accent", "compact"].forEach((key) => {
    const legacy = localStorage.getItem(`lt-${key}`);
    if (legacy !== null)
      localStorage.setItem(`lt-user-${userId}-${key}`, legacy);
  });
}

function Root() {
  const [session, setSession] = useState(() => {
    const id = localStorage.getItem("lt-session");
    return readUsers().find((u) => u.id === id) || null;
  });
  const login = (user) => {
    localStorage.setItem("lt-session", user.id);
    setSession(user);
  };
  const logout = () => {
    localStorage.removeItem("lt-session");
    setSession(null);
  };
  const updateUser = (changes) => {
    const updated = { ...session, ...changes };
    localStorage.setItem(
      "lt-users",
      JSON.stringify(
        readUsers().map((u) => (u.id === updated.id ? updated : u)),
      ),
    );
    setSession(updated);
  };
  return session ? (
    <WorkspaceApp
      key={session.id}
      user={session}
      onLogout={logout}
      onUpdateUser={updateUser}
    />
  ) : (
    <AuthScreen onAuthenticated={login} />
  );
}

function WorkspaceApp({ user, onLogout, onUpdateUser }) {
  const store = (key) => `lt-user-${user.id}-${key}`;
  const [view, setView] = useStored(store("view"), "dashboard");
  const [tasks, setTasks] = useStored(store("tasks"), initialTasks);
  const [notes, setNotes] = useStored(store("notes"), initialNotes);
  const [accent, setAccent] = useStored(store("accent"), "coral");
  const [compact, setCompact] = useStored(store("compact"), false);
  const [projects, setProjects] = useStored(store("projects"), defaultProjects);
  const [notifications, setNotifications] = useStored(
    store("notifications"),
    [],
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [update, setUpdate] = useState({
    state: "idle",
    message: "Buscar actualizaciones",
  });
  const today = new Date();
  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        addDays(startOfWeek(today, { weekStartsOn: 1 }), i),
      ),
    [],
  );
  useEffect(() => {
    window.lorentasker?.onUpdateStatus((s) => {
      setUpdate(s);
      setToast(s.message);
    });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const todayPending = tasks.filter(
      (t) => !t.done && isToday(new Date(t.date)),
    );
    setNotifications((old) => {
      const retained = old.filter((n) => n.type !== "daily");
      return todayPending.length
        ? [
            {
              id: `daily-${format(today, "yyyy-MM-dd")}`,
              type: "daily",
              title: `${todayPending.length} tareas para hoy`,
              body: "Tu planificación diaria está lista.",
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...retained,
          ]
        : retained;
    });
    const notificationKey = store(`notified-${format(today, "yyyy-MM-dd")}`);
    if (todayPending.length && !localStorage.getItem(notificationKey)) {
      window.lorentasker?.showNotification({
        title: "Tu día en Lorentasker",
        body: `Tienes ${todayPending.length} tareas previstas para hoy.`,
      });
      localStorage.setItem(notificationKey, "1");
    }
  }, [tasks.length]);
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setModal("task");
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.querySelector(".search input")?.focus();
      }
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleTask = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const addTask = (data) => {
    setTasks([
      { id: Date.now(), done: false, estimate: 30, ...data },
      ...tasks,
    ]);
    setModal(null);
    setToast("Tarea añadida a tu panel");
  };
  const saveTask = (data) => {
    if (data.id)
      setTasks(tasks.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
    else addTask(data);
    setModal(null);
    setToast(data.id ? "Tarea actualizada" : "Tarea añadida a tu panel");
  };
  const deleteProject = (id) => {
    const project = projects.find((p) => p.id === id);
    if (
      !project ||
      !window.confirm(
        `¿Eliminar el proyecto “${project.name}”? Sus tareas pasarán a Sin proyecto.`,
      )
    )
      return;
    setTasks(
      tasks.map((t) =>
        t.project === project.name ? { ...t, project: "Sin proyecto" } : t,
      ),
    );
    setProjects(projects.filter((p) => p.id !== id));
    setToast(`Proyecto “${project.name}” eliminado`);
  };
  const addProject = (data) => {
    setProjects([...projects, { id: crypto.randomUUID(), ...data }]);
    setModal(null);
    setToast("Proyecto creado");
  };
  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.project.toLowerCase().includes(query.toLowerCase()),
  );
  const open = tasks.filter((t) => !t.done).length;
  const done = tasks.filter((t) => t.done).length;
  const focusMinutes = tasks
    .filter((t) => t.done)
    .reduce((n, t) => n + (t.estimate || 0), 0);

  return (
    <div
      className={`app accent-${accent} ${compact ? "compact" : ""} ${hasWindowsTitlebar ? "with-titlebar" : ""}`}
    >
      {hasWindowsTitlebar && <WindowTitlebar />}
      <aside className="sidebar">
        <div className="brand">
          <img src="./icon.png" />
          <div>
            <strong>Lorentasker</strong>
            <span>Developer workspace</span>
          </div>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => setView(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "tasks" && <b>{open}</b>}
            </button>
          ))}
        </nav>
        <div className="side-projects">
          <div className="side-label">
            PROYECTOS{" "}
            <button onClick={() => setModal("project")} title="Nuevo proyecto">
              <Plus size={14} />
            </button>
          </div>
          {projects.slice(0, 5).map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setView("tasks");
                setQuery(p.name);
              }}
            >
              <i className={p.color} />
              {p.name}
              <span>
                {tasks.filter((t) => t.project === p.name && !t.done).length}
              </span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button
            onClick={() => setView("settings")}
            className={view === "settings" ? "active" : ""}
          >
            <Settings size={18} /> Ajustes
          </button>
          <div className="profile" onDoubleClick={() => setModal("profile")}>
            <div className={`avatar ${user.avatar ? "has-photo" : ""}`}>
              {user.avatar ? (
                <img src={user.avatar} />
              ) : (
                user.name
                  .split(/\s+/)
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>@{user.username} · Local</span>
            </div>
            <button
              className="profile-edit"
              title="Editar perfil"
              onClick={() => setModal("profile")}
            >
              <Pencil size={14} />
            </button>
            <button className="logout" title="Cerrar sesión" onClick={onLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main>
        <header>
          <button className="mobile">
            <Menu />
          </button>
          <div className="search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tareas, notas o proyectos..."
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="header-actions">
            <button
              className="icon"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={19} />
              {notifications.some((n) => !n.read) && <i />}
            </button>
            <button className="primary" onClick={() => setModal("task")}>
              <Plus size={18} /> Nueva tarea <kbd>⌘ N</kbd>
            </button>
          </div>
          {notificationsOpen && (
            <NotificationCenter
              notifications={notifications}
              setNotifications={setNotifications}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </header>
        <section className="content">
          <AnimatePresence mode="wait">
            <ViewTransition viewKey={view}>
              {view === "dashboard" && (
                <Dashboard
                  {...{
                    tasks: filtered,
                    toggleTask,
                    today,
                    week,
                    open,
                    done,
                    focusMinutes,
                    setView,
                    setModal,
                    notes,
                    user,
                  }}
                />
              )}
              {view === "tasks" && (
                <Tasks
                  tasks={filtered}
                  toggleTask={toggleTask}
                  setTasks={setTasks}
                  onAdd={() => setModal("task")}
                  onEdit={(task) => setModal({ type: "task", task })}
                />
              )}
              {view === "calendar" && (
                <CalendarView tasks={filtered} toggleTask={toggleTask} />
              )}
              {view === "notes" && <Notes notes={notes} setNotes={setNotes} />}
              {view === "projects" && (
                <Projects
                  tasks={tasks}
                  projects={projects}
                  onAdd={() => setModal("project")}
                  onDelete={deleteProject}
                  onOpen={(name) => {
                    setQuery(name);
                    setView("tasks");
                  }}
                />
              )}
              {view === "stats" && (
                <Stats tasks={tasks} focusMinutes={focusMinutes} />
              )}
              {view === "settings" && (
                <SettingsView
                  {...{
                    accent,
                    setAccent,
                    compact,
                    setCompact,
                    update,
                    setUpdate,
                    user,
                    onLogout,
                    onEditProfile: () => setModal("profile"),
                    tasks,
                    notes,
                    projects,
                    setTasks,
                    setNotes,
                    setProjects,
                    setToast,
                  }}
                />
              )}
            </ViewTransition>
          </AnimatePresence>
        </section>
      </main>
      {(modal === "task" || modal?.type === "task") && (
        <TaskModal
          task={modal?.task}
          projects={projects}
          onClose={() => setModal(null)}
          onSave={saveTask}
        />
      )}
      {modal === "profile" && (
        <ProfileModal
          user={user}
          onClose={() => setModal(null)}
          onSave={(data) => {
            onUpdateUser(data);
            setModal(null);
            setToast("Perfil actualizado");
          }}
        />
      )}
      {modal === "project" && (
        <ProjectModal onClose={() => setModal(null)} onSave={addProject} />
      )}
      {modal === "focus" && (
        <FocusModal
          tasks={tasks.filter((t) => !t.done)}
          onClose={() => setModal(null)}
        />
      )}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState(readUsers().length ? "login" : "register");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const normalized = username.trim().toLowerCase();
      const users = readUsers();
      if (!normalized || !password)
        throw new Error("Completa el usuario y la contraseña.");
      if (mode === "register") {
        if (name.trim().length < 2) throw new Error("Indica tu nombre.");
        if (!/^[a-z0-9._-]{3,24}$/.test(normalized))
          throw new Error("El usuario debe tener entre 3 y 24 caracteres.");
        if (password.length < 8)
          throw new Error("La contraseña debe tener al menos 8 caracteres.");
        if (password !== confirm)
          throw new Error("Las contraseñas no coinciden.");
        if (users.some((u) => u.username === normalized))
          throw new Error("Ese usuario ya existe en este equipo.");
        const salt = encode(crypto.getRandomValues(new Uint8Array(16)));
        const user = {
          id: crypto.randomUUID(),
          name: name.trim(),
          username: normalized,
          salt,
          passwordHash: await passwordHash(password, salt),
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("lt-users", JSON.stringify([...users, user]));
        if (users.length === 0) migrateLegacyData(user.id);
        onAuthenticated(user);
      } else {
        const user = users.find((u) => u.username === normalized);
        if (
          !user ||
          (await passwordHash(password, user.salt)) !== user.passwordHash
        )
          throw new Error("Usuario o contraseña incorrectos.");
        onAuthenticated(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`auth-shell ${hasWindowsTitlebar ? "with-titlebar" : ""}`}>
      {hasWindowsTitlebar && <WindowTitlebar />}
      <div className="auth-glow" />
      <section className="auth-brand">
        <img src="./icon.png" />
        <span>LORENTASKER</span>
        <h1>
          Tu trabajo.
          <br />
          <em>Tu ritmo.</em>
        </h1>
        <p>
          Un workspace local, privado y enfocado para convertir ideas en trabajo
          terminado.
        </p>
        <div className="auth-points">
          <div>
            <CheckCircle2 /> Tareas, notas y proyectos separados por usuario
          </div>
          <div>
            <ShieldCheck /> Tus datos nunca salen de este equipo
          </div>
          <div>
            <Rocket /> Actualizaciones abiertas desde GitHub
          </div>
        </div>
        <small>OPEN SOURCE · LOCAL FIRST</small>
      </section>
      <section className="auth-panel">
        <ScaleIn className="auth-motion">
          <div className="auth-card">
            <div className="auth-card-head">
              <span>
                {mode === "login"
                  ? "BIENVENIDO DE NUEVO"
                  : "TU ESPACIO EMPIEZA AQUÍ"}
              </span>
              <h2>
                {mode === "login" ? "Inicia sesión" : "Crea tu cuenta local"}
              </h2>
              <p>
                {mode === "login"
                  ? "Continúa donde lo dejaste."
                  : "No necesitas email ni conexión a internet."}
              </p>
            </div>
            <div className="auth-tabs">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Entrar
              </button>
              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Registrarme
              </button>
            </div>
            <form onSubmit={submit}>
              {mode === "register" && (
                <label>
                  Nombre visible
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Lorenzo"
                    autoFocus
                  />
                </label>
              )}
              <label>
                Nombre de usuario
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu_usuario"
                  autoFocus={mode === "login"}
                  autoCapitalize="none"
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </label>
              {mode === "register" && (
                <label>
                  Repite la contraseña
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
              )}
              {error && <div className="auth-error">{error}</div>}
              <button className="primary auth-submit" disabled={busy}>
                {mode === "login" ? <LockKeyhole /> : <UserPlus />}
                {busy
                  ? "Procesando…"
                  : mode === "login"
                    ? "Entrar en Lorentasker"
                    : "Crear mi espacio"}
              </button>
            </form>
            <p className="local-notice">
              <ShieldCheck /> Esta cuenta solo existe en este dispositivo. Si
              borras los datos de la aplicación, también se eliminará.
            </p>
          </div>
        </ScaleIn>
      </section>
    </div>
  );
}

function PageTitle({ eyebrow, title, desc, action }) {
  return (
    <FadeUp duration={0.38}>
      <div className="page-title">
        <div>
          <span>{eyebrow}</span>
          <h1>
            <BlurText text={title} />
          </h1>
          <p>{desc}</p>
        </div>
        {action}
      </div>
    </FadeUp>
  );
}
function Dashboard({
  tasks,
  toggleTask,
  today,
  week,
  open,
  done,
  focusMinutes,
  setView,
  setModal,
  notes,
  user,
}) {
  const todayTasks = tasks.filter((t) => isSameDay(new Date(t.date), today));
  return (
    <>
      <PageTitle
        eyebrow={format(today, "EEEE, d 'de' MMMM", { locale: es })}
        title={`Buenos días, ${user.name.split(" ")[0]}`}
        desc="Aquí tienes una vista clara de todo lo que importa hoy."
        action={
          <button className="ghost" onClick={() => setModal("focus")}>
            <Sparkles size={17} /> Modo focus
          </button>
        }
      />
      <div className="metrics">
        <Metric
          icon={ListTodo}
          label="Tareas pendientes"
          value={open}
          meta="3 para hoy"
          color="coral"
        />
        <Metric
          icon={CheckCircle2}
          label="Completadas"
          value={done}
          meta="Esta semana"
          color="green"
          progress={Math.min(100, (done / (open + done)) * 100)}
        />
        <Metric
          icon={Clock3}
          label="Tiempo enfocado"
          value={`${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m`}
          meta="Objetivo 20h"
          color="blue"
          progress={(focusMinutes / 1200) * 100}
        />
        <Metric
          icon={Rocket}
          label="Racha productiva"
          value="6 días"
          meta="Mejor: 12 días"
          color="violet"
        />
      </div>
      <div className="grid-main">
        <div className="card tasks-card">
          <CardHead
            title="Para hoy"
            subtitle={`${todayTasks.filter((t) => !t.done).length} tareas pendientes`}
            action={
              <button onClick={() => setView("tasks")}>
                Ver todas <ArrowUpRight size={15} />
              </button>
            }
          />
          <div className="task-list">
            {todayTasks.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} />
            ))}
          </div>
          <button className="add-row" onClick={() => setModal("task")}>
            <Plus size={16} /> Añadir una tarea
          </button>
        </div>
        <div className="card week-card">
          <CardHead
            title="Tu semana"
            subtitle={`${format(week[0], "d MMM", { locale: es })} — ${format(week[6], "d MMM", { locale: es })}`}
          />
          <div className="week-grid">
            {week.map((d) => {
              const count = tasks.filter(
                (t) => isSameDay(new Date(t.date), d) && !t.done,
              ).length;
              return (
                <div
                  className={`day ${isToday(d) ? "today" : ""}`}
                  key={d.toISOString()}
                >
                  <span>{format(d, "EEE", { locale: es })}</span>
                  <strong>{format(d, "d")}</strong>
                  <i className={count ? "has" : ""}>{count || "·"}</i>
                </div>
              );
            })}
          </div>
          <div className="weekly-progress">
            <div>
              <span>Progreso semanal</span>
              <strong>{Math.round((done / (open + done)) * 100) || 0}%</strong>
            </div>
            <div className="progress">
              <i style={{ width: `${(done / (open + done)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid-bottom">
        <div className="card">
          <CardHead
            title="Notas recientes"
            action={
              <button onClick={() => setView("notes")}>
                Ver notas <ArrowUpRight size={15} />
              </button>
            }
          />
          <div className="notes-preview">
            {notes.slice(0, 3).map((n) => (
              <div className={`note-mini ${n.color}`} key={n.id}>
                <StickyNote size={17} />
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <span>{n.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card activity">
          <CardHead title="Actividad" subtitle="Últimos 7 días" />
          <div className="chart">
            {[35, 58, 42, 76, 64, 92, 48].map((n, i) => (
              <div key={i}>
                <i style={{ height: `${n}%` }} />
                <span>{["L", "M", "X", "J", "V", "S", "D"][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card focus-card">
          <div className="focus-icon">
            <Code2 />
          </div>
          <span>SIGUIENTE BLOQUE</span>
          <h3>Deep work</h3>
          <p>Refactorizar autenticación</p>
          <div>
            <Clock3 size={15} /> 10:00 · 90 minutos
          </div>
          <button onClick={() => setModal("task")}>
            Preparar sesión <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value, meta, color, progress }) {
  return (
    <HoverLift>
      <div className="metric">
        <div className={`metric-icon ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{meta}</small>
          {progress !== undefined && (
            <div className="tiny-progress">
              <i style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          )}
        </div>
      </div>
    </HoverLift>
  );
}
function CardHead({ title, subtitle, action }) {
  return (
    <div className="card-head">
      <div>
        <h3>{title}</h3>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {action}
    </div>
  );
}
function TaskRow({ task, onToggle, onDelete, onEdit }) {
  return (
    <div className={`task-row ${task.done ? "done" : ""}`}>
      <button className="check" onClick={onToggle}>
        {task.done ? <CheckCircle2 /> : <Circle />}
      </button>
      <div className="task-copy">
        <strong>{task.title}</strong>
        <span>
          <i className={`dot ${task.project.toLowerCase()}`} />
          {task.project} · <Clock3 size={12} />
          {task.time}
        </span>
      </div>
      <em className={`priority ${task.priority.toLowerCase()}`}>
        {task.priority}
      </em>
      {onDelete && (
        <button className="delete" title="Eliminar" onClick={onDelete}>
          <Trash2 size={16} />
        </button>
      )}
      <button className="more" title="Editar" onClick={onEdit}>
        <Pencil size={15} />
      </button>
    </div>
  );
}

function Tasks({ tasks, toggleTask, setTasks, onAdd, onEdit }) {
  const [filter, setFilter] = useState("Todas");
  return (
    <>
      <PageTitle
        eyebrow="ORGANIZACIÓN"
        title="Mis tareas"
        desc="Captura, prioriza y termina lo importante."
        action={
          <button className="primary" onClick={onAdd}>
            <Plus size={18} /> Nueva tarea
          </button>
        }
      />
      <div className="toolbar">
        {["Todas", "Pendientes", "Completadas", "Alta"].map((x) => (
          <button
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="card full-list">
        <CardHead title="Tareas" subtitle={`${tasks.length} en total`} />
        {tasks
          .filter(
            (t) =>
              filter === "Todas" ||
              (filter === "Pendientes" && !t.done) ||
              (filter === "Completadas" && t.done) ||
              (filter === "Alta" && t.priority === "Alta"),
          )
          .map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={() => toggleTask(t.id)}
              onDelete={() => setTasks(tasks.filter((x) => x.id !== t.id))}
              onEdit={() => onEdit(t)}
            />
          ))}
      </div>
    </>
  );
}
function CalendarView({ tasks, toggleTask }) {
  const days = Array.from({ length: 14 }, (_, i) =>
    addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i),
  );
  return (
    <>
      <PageTitle
        eyebrow="PLANIFICACIÓN"
        title="Calendario"
        desc="Dos semanas, una sola vista y cero sorpresas."
      />
      <div className="calendar-grid">
        {days.map((d) => (
          <div
            className={`calendar-day card ${isToday(d) ? "today" : ""}`}
            key={d.toISOString()}
          >
            <div>
              <span>{format(d, "EEE", { locale: es })}</span>
              <strong>{format(d, "d")}</strong>
            </div>
            {tasks
              .filter((t) => isSameDay(new Date(t.date), d))
              .map((t) => (
                <button
                  onClick={() => toggleTask(t.id)}
                  className={t.done ? "done" : ""}
                  key={t.id}
                >
                  <i />
                  {t.time} {t.title}
                </button>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
function Notes({ notes, setNotes }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    setNotes([
      {
        id: Date.now(),
        title: draft,
        body: "Haz clic para seguir desarrollando esta nota.",
        color: ["orange", "blue", "violet"][notes.length % 3],
        updated: "ahora",
      },
      ...notes,
    ]);
    setDraft("");
  };
  return (
    <>
      <PageTitle
        eyebrow="MEMORIA EXTERNA"
        title="Notas"
        desc="Ideas, snippets y contexto siempre a mano."
      />
      <div className="quick-note">
        <StickyNote />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Captura una idea rápida..."
        />
        <button onClick={add}>Guardar</button>
      </div>
      <div className="notes-grid">
        {notes.map((n) => (
          <article className={`note-card card ${n.color}`} key={n.id}>
            <div>
              <StickyNote />
              <button
                onClick={() => setNotes(notes.filter((x) => x.id !== n.id))}
              >
                <X />
              </button>
            </div>
            <h3>{n.title}</h3>
            <p>{n.body}</p>
            <span>{n.updated}</span>
          </article>
        ))}
      </div>
    </>
  );
}
function Projects({ tasks, projects, onAdd, onDelete, onOpen }) {
  return (
    <>
      <PageTitle
        eyebrow="ESPACIOS DE TRABAJO"
        title="Proyectos"
        desc="El contexto de cada frente, sin mezclar prioridades."
        action={
          <button className="primary" onClick={onAdd}>
            <FolderPlus size={17} /> Nuevo proyecto
          </button>
        }
      />
      <div className="project-grid">
        {projects.map((p) => {
          const ts = tasks.filter((t) => t.project === p.name);
          const complete = ts.filter((t) => t.done).length;
          return (
            <div className="project-card card" key={p.id}>
              <div className="project-actions">
                <button onClick={() => onOpen(p.name)}>Abrir</button>
                <button
                  className="danger"
                  title="Eliminar proyecto"
                  onClick={() => onDelete(p.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <i className={p.color}>
                <FolderKanban />
              </i>
              <span>{ts.length} tareas</span>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <div className="progress">
                <i
                  style={{
                    width: `${ts.length ? (complete / ts.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <small>
                {complete} de {ts.length} completadas
              </small>
            </div>
          );
        })}
      </div>
    </>
  );
}
function Stats({ tasks, focusMinutes }) {
  const total = tasks.length,
    complete = tasks.filter((t) => t.done).length;
  return (
    <>
      <PageTitle
        eyebrow="TU RITMO"
        title="Estadísticas"
        desc="Señales útiles para trabajar mejor, no para trabajar más."
      />
      <div className="stats-hero card">
        <div>
          <span>Índice de ejecución</span>
          <strong>{Math.round((complete / total) * 100) || 0}%</strong>
          <p>Basado en tus tareas completadas</p>
        </div>
        <div
          className="ring"
          style={{ "--p": `${(complete / total) * 360}deg` }}
        >
          <CheckCircle2 />
        </div>
      </div>
      <div className="metrics">
        <Metric
          icon={CheckSquare}
          label="Total registradas"
          value={total}
          meta="Histórico local"
          color="coral"
        />
        <Metric
          icon={Clock3}
          label="Tiempo completado"
          value={`${focusMinutes} min`}
          meta="Estimación acumulada"
          color="blue"
        />
        <Metric
          icon={Flag}
          label="Alta prioridad"
          value={tasks.filter((t) => t.priority === "Alta").length}
          meta="Requieren atención"
          color="violet"
        />
        <Metric
          icon={Coffee}
          label="Balance"
          value="Saludable"
          meta="Ritmo sostenible"
          color="green"
        />
      </div>
    </>
  );
}
function SettingsView({
  accent,
  setAccent,
  compact,
  setCompact,
  update,
  setUpdate,
  user,
  onLogout,
  onEditProfile,
  tasks,
  notes,
  projects,
  setTasks,
  setNotes,
  setProjects,
  setToast,
}) {
  const check = () => {
    setUpdate({ state: "checking", message: "Buscando actualizaciones…" });
    window.lorentasker?.checkUpdates() ||
      setTimeout(
        () =>
          setUpdate({
            state: "dev",
            message: "Disponible al instalar la aplicación",
          }),
        800,
      );
  };
  const exportAll = async () => {
    const path = await window.lorentasker?.exportData({
      version: 1,
      user: { name: user.name, username: user.username },
      tasks,
      notes,
      projects,
      exportedAt: new Date().toISOString(),
    });
    if (path) setToast("Copia de seguridad exportada");
  };
  const importAll = async () => {
    try {
      const data = await window.lorentasker?.importData();
      if (!data) return;
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (Array.isArray(data.projects)) setProjects(data.projects);
      setToast("Copia importada correctamente");
    } catch {
      setToast("El archivo no es una copia válida");
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="LORENTASKER"
        title="Ajustes"
        desc="Haz que tu espacio de trabajo se sienta realmente tuyo."
      />
      <div className="settings-grid">
        <div className="card settings-card">
          <h3>
            <Palette /> Apariencia
          </h3>
          <div className="setting">
            <div>
              <strong>Color de acento</strong>
              <span>Define la energía visual del dashboard</span>
            </div>
            <div className="swatches">
              {["coral", "violet", "blue", "green"].map((x) => (
                <button
                  className={`${x} ${accent === x ? "active" : ""}`}
                  onClick={() => setAccent(x)}
                  key={x}
                />
              ))}
            </div>
          </div>
          <div className="setting">
            <div>
              <strong>Modo compacto</strong>
              <span>Muestra más información por pantalla</span>
            </div>
            <button
              className={`switch ${compact ? "on" : ""}`}
              onClick={() => setCompact(!compact)}
            >
              <i />
            </button>
          </div>
        </div>
        <div className="card settings-card">
          <h3>
            <DatabaseBackup /> Datos y cuenta
          </h3>
          <div className="setting">
            <div>
              <strong>{user.name}</strong>
              <span>@{user.username} · cuenta local</span>
            </div>
            <button className="secondary" onClick={onEditProfile}>
              <Camera size={14} /> Editar perfil
            </button>
          </div>
          <div className="setting">
            <div>
              <strong>Copia de seguridad</strong>
              <span>Exporta o recupera tareas, notas y proyectos</span>
            </div>
            <div className="setting-buttons">
              <button className="secondary" onClick={importAll}>
                <Upload size={14} /> Importar
              </button>
              <button className="secondary" onClick={exportAll}>
                <Download size={14} /> Exportar
              </button>
            </div>
          </div>
          <div className="setting">
            <div>
              <strong>Sesión local</strong>
              <span>Los datos están aislados para este usuario</span>
            </div>
            <button className="secondary" onClick={onLogout}>
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
        <div className="card settings-card updates">
          <h3>
            <RotateCw /> Actualizaciones
          </h3>
          <p>
            Lorentasker descarga las nuevas versiones directamente desde GitHub
            Releases.
          </p>
          <button
            className="primary"
            onClick={
              update.state === "ready"
                ? () => window.lorentasker?.installUpdate()
                : check
            }
          >
            {update.state === "checking" ? (
              <RotateCw className="spin" />
            ) : (
              <Download />
            )}
            {update.state === "idle"
              ? "Buscar actualizaciones"
              : update.message}
          </button>
          <small>Versión 1.3.1 · Motion by Amicro</small>
        </div>
      </div>
    </>
  );
}

function NotificationCenter({ notifications, setNotifications, onClose }) {
  const markAll = () =>
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  return (
    <div className="notification-panel">
      <div className="notification-head">
        <div>
          <span>CENTRO DE ACTIVIDAD</span>
          <h3>Notificaciones</h3>
        </div>
        <button onClick={onClose}>
          <X />
        </button>
      </div>
      {notifications.length ? (
        <>
          <div className="notification-list">
            {notifications.map((n) => (
              <button
                key={n.id}
                className={n.read ? "read" : ""}
                onClick={() =>
                  setNotifications(
                    notifications.map((x) =>
                      x.id === n.id ? { ...x, read: true } : x,
                    ),
                  )
                }
              >
                <i />
                <div>
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="notification-footer">
            <button onClick={markAll}>Marcar todo como leído</button>
            <button onClick={() => setNotifications([])}>Borrar todo</button>
          </div>
        </>
      ) : (
        <div className="empty-notifications">
          <Bell />
          <strong>Todo al día</strong>
          <span>No tienes notificaciones pendientes.</span>
        </div>
      )}
    </div>
  );
}

function ProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const choose = async () => {
    const selected = await window.lorentasker?.pickAvatar();
    if (selected) setAvatar(selected);
  };
  return (
    <div className="modal-backdrop">
      <form
        className="modal profile-modal"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave({ name: name.trim(), avatar });
        }}
      >
        <div className="modal-head">
          <div>
            <span>PERFIL LOCAL</span>
            <h2>Personaliza tu identidad</h2>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <button type="button" className="avatar-picker" onClick={choose}>
          {avatar ? <img src={avatar} /> : <Camera />}
          <span>Cambiar foto</span>
        </button>
        <label>
          Nombre visible
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Usuario
          <input value={user.username} disabled />
        </label>
        <div className="modal-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => setAvatar("")}
          >
            Quitar foto
          </button>
          <button className="primary">Guardar perfil</button>
        </div>
      </form>
    </div>
  );
}

function ProjectModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("coral");
  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim())
            onSave({
              name: name.trim(),
              description: description.trim() || "Proyecto personal",
              color,
            });
        }}
      >
        <div className="modal-head">
          <div>
            <span>NUEVO PROYECTO</span>
            <h2>Crea un espacio de trabajo</h2>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <label>
          Nombre
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Web corporativa"
          />
        </label>
        <label>
          Descripción
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Objetivo principal del proyecto"
          />
        </label>
        <label>
          Color
          <div className="swatches project-swatches">
            {["coral", "violet", "blue", "green"].map((x) => (
              <button
                type="button"
                className={`${x} ${color === x ? "active" : ""}`}
                onClick={() => setColor(x)}
                key={x}
              />
            ))}
          </div>
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">
            <FolderPlus /> Crear proyecto
          </button>
        </div>
      </form>
    </div>
  );
}

function FocusModal({ tasks, onClose }) {
  const [task, setTask] = useState(tasks[0]?.id || "");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const tick = setInterval(
      () =>
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(tick);
            setRunning(false);
            window.lorentasker?.showNotification({
              title: "Sesión completada",
              body: "Buen trabajo. Tómate un descanso antes del siguiente bloque.",
            });
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(tick);
  }, [running]);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0"),
    secs = String(seconds % 60).padStart(2, "0");
  return (
    <div className="modal-backdrop">
      <div className="focus-modal">
        <button className="focus-close" onClick={onClose}>
          <X />
        </button>
        <span>MODO FOCUS</span>
        <h2>
          {mins}:{secs}
        </h2>
        <select value={task} onChange={(e) => setTask(e.target.value)}>
          {tasks.map((t) => (
            <option value={t.id} key={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <div className="focus-controls">
          <button className="primary" onClick={() => setRunning(!running)}>
            {running ? <Pause /> : <Play />}
            {running ? "Pausar" : "Empezar"}
          </button>
          <button
            className="secondary"
            onClick={() => {
              setRunning(false);
              setSeconds(25 * 60);
            }}
          >
            Reiniciar
          </button>
        </div>
        <div className="focus-presets">
          {[15, 25, 45, 60].map((m) => (
            <button
              onClick={() => {
                setRunning(false);
                setSeconds(m * 60);
              }}
              key={m}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskModal({ task, projects, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title || "");
  const [project, setProject] = useState(
    task?.project || projects[0]?.name || "Sin proyecto",
  );
  const [priority, setPriority] = useState(task?.priority || "Media");
  const [date, setDate] = useState(
    format(task?.date ? new Date(task.date) : new Date(), "yyyy-MM-dd"),
  );
  const [time, setTime] = useState(task?.time || "09:00");
  const [estimate, setEstimate] = useState(task?.estimate || 30);
  const submit = (e) => {
    e.preventDefault();
    if (title.trim())
      onSave({
        ...(task || {}),
        title: title.trim(),
        project,
        priority,
        date: new Date(`${date}T12:00:00`).toISOString(),
        time,
        estimate: Number(estimate),
      });
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span>{task ? "EDITAR TAREA" : "NUEVA TAREA"}</span>
            <h2>{task ? "Actualiza los detalles" : "¿Qué hay que hacer?"}</h2>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <label>
          Título
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Revisar implementación del login"
          />
        </label>
        <div className="form-row">
          <label>
            Proyecto
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
              <option>Sin proyecto</option>
            </select>
          </label>
          <label>
            Prioridad
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Fecha
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Hora
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>
        <label>
          Estimación (minutos)
          <input
            type="number"
            min="5"
            step="5"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            {task ? <Pencil /> : <Plus />}{" "}
            {task ? "Guardar cambios" : "Crear tarea"}
          </button>
        </div>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
