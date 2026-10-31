// Sesión y roles: verifica que haya usuario, carga su perfil y aplica permisos al menú
import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs }
from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

export const ROLES = {
    admin: "Administrador",
    tecnico: "Técnico",
    usuario: "Usuario"
};

// Qué puede hacer cada rol. "*" = todo
const PERMISOS = {
    admin: ["*"],
    tecnico: [
        "dashboard", "equipos.ver", "equipos.agregar", "equipos.editar",
        "citas", "preventivo", "historial", "reportes",
        "tickets.ver", "tickets.crear", "tickets.ver_todos", "tickets.atender"
    ],
    usuario: ["dashboard", "equipos.ver", "tickets.ver", "tickets.crear"]
};

// Permiso necesario para entrar a cada página
const PAGINAS = {
    "dashboard.html": "dashboard",
    "equipos.html": "equipos.ver",
    "citas.html": "citas",
    "historial.html": "historial",
    "preventivo.html": "preventivo",
    "reportes.html": "reportes",
    "tickets.html": "tickets.ver",
    "usuarios.html": "usuarios"
};

let perfil = null;

export function puede(permiso) {
    if (!perfil) return false;
    const lista = PERMISOS[perfil.rol] || [];
    return lista.includes("*") || lista.includes(permiso);
}

export function perfilActual() {
    return perfil;
}

// Escapa texto antes de meterlo en innerHTML
export function esc(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function armarPerfil(id, data, user) {
    return {
        id,
        nombre: data.nombre || user.email,
        email: data.email || data.correo || user.email,
        rol: ROLES[data.rol] ? data.rol : "usuario"
    };
}

// Busca el perfil por uid, luego por correo; si no existe lo crea con rol "usuario"
async function obtenerPerfil(user) {
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return armarPerfil(snap.id, snap.data(), user);

    for (const campo of ["email", "correo"]) {
        const porCorreo = await getDocs(query(collection(db, "usuarios"), where(campo, "==", user.email)));
        if (!porCorreo.empty) {
            const d = porCorreo.docs[0];
            return armarPerfil(d.id, d.data(), user);
        }
    }

    const nuevo = { nombre: user.email.split("@")[0], email: user.email, rol: "usuario" };
    await setDoc(ref, nuevo);
    return armarPerfil(user.uid, nuevo, user);
}

function prepararMenu() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    sidebar.querySelectorAll("a[href]").forEach(a => {
        const permiso = PAGINAS[a.getAttribute("href")];
        if (permiso && !puede(permiso)) a.remove();
        if (a.getAttribute("href") === "index.html") {
            a.addEventListener("click", async e => {
                e.preventDefault();
                await signOut(auth);
                location.href = "index.html";
            });
        }
    });

    const info = document.createElement("div");
    info.className = "usuario-menu";
    info.innerHTML = `<span>${esc(perfil.nombre)}</span><span class="rol-badge rol-${perfil.rol}">${ROLES[perfil.rol]}</span>`;
    sidebar.querySelector("h3").after(info);

    // Elementos marcados con data-permiso se ocultan si el rol no lo tiene
    document.querySelectorAll("[data-permiso]").forEach(el => {
        if (!puede(el.dataset.permiso)) el.remove();
    });
}

// Llamar al inicio de cada página protegida. Resuelve con el perfil del usuario
export function requerirSesion() {
    return new Promise(resolve => {
        const cancelar = onAuthStateChanged(auth, async user => {
            cancelar();
            if (!user) {
                location.href = "index.html";
                return;
            }
            try {
                perfil = await obtenerPerfil(user);
            } catch (error) {
                console.error("No se pudo cargar el perfil:", error);
                perfil = armarPerfil(user.uid, {}, user);
            }

            const pagina = location.pathname.split("/").pop();
            const permiso = PAGINAS[pagina];
            if (permiso && !puede(permiso)) {
                location.href = "dashboard.html";
                return;
            }

            prepararMenu();
            // Hasta aquí el CSS mantiene ocultos el menú y el contenido
            document.documentElement.classList.add("sesion-lista");
            resolve(perfil);
        });
    });
}
