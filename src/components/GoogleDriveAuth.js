import React, { useState, useEffect, useRef } from "react";

// Helper to wait until the gapi script has finished loading
const waitForGapi = () => {
  if (window.gapi) return Promise.resolve();
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.gapi) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
};

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function GoogleDriveAuth({ onAuthenticated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [showFolderOptions, setShowFolderOptions] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState("");
  const [newFolderName, setNewFolderName] = useState("MediPanel_Storage");
  const [subfolderName, setSubfolderName] = useState("");
  const [rootFolderId, setRootFolderId] = useState("");
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const [subfolders, setSubfolders] = useState([]);
  const tokenClient = useRef(null);

  // Inicialización de GAPI y tokenClient
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await waitForGapi();
      if (!isMounted) return;

      if (!CLIENT_ID || !API_KEY) {
        console.error(
          "Missing Google API configuration. Please set REACT_APP_GOOGLE_CLIENT_ID and REACT_APP_GOOGLE_API_KEY in your .env file."
        );
        return;
      }

      async function start() {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        });

        if (!isMounted) return;

        let savedToken = localStorage.getItem("drive_token");
        let savedExp = parseInt(localStorage.getItem("drive_token_exp"), 10);
        const savedEmail = localStorage.getItem("drive_email");
        let savedFolderPath = localStorage.getItem("drive_folder_path");
        let savedFolderId = localStorage.getItem("drive_folder_id");

        if (!savedFolderId) {
          try {
            const res = await fetch(`${API_URL}/config/drive-folder`);
            const data = await res.json();
            if (data.folderId) {
              savedFolderId = data.folderId;
              savedFolderPath = `https://drive.google.com/drive/folders/${data.folderId}`;
              localStorage.setItem("drive_folder_id", savedFolderId);
              localStorage.setItem("drive_folder_path", savedFolderPath);
            }
          } catch (err) {
            console.error("Failed to load folder ID from server", err);
          }
        }

        if ((!savedToken || !savedExp || Date.now() >= savedExp) && localStorage.getItem("token")) {
          try {
            const jwt = localStorage.getItem("token");
            const resp = await fetch(`${API_URL}/config/drive-token`, {
              headers: { Authorization: `Bearer ${jwt}` }
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data.token && data.exp && Date.now() < data.exp) {
                savedToken = data.token;
                savedExp = data.exp;
                localStorage.setItem("drive_token", data.token);
                localStorage.setItem("drive_token_exp", data.exp.toString());
              }
            }
          } catch (err) {
            console.error("Failed to load Drive token from server", err);
          }
        }

        if (!isMounted) return;

        if (savedToken && savedExp && Date.now() < savedExp) {
          setToken(savedToken);
          window.gapi.client.setToken({ access_token: savedToken });
          if (savedEmail) setUserEmail(savedEmail);
          if (savedFolderPath) setFolderPath(savedFolderPath);
          if (savedFolderId) setRootFolderId(savedFolderId);
          setIsAuthenticated(true);
          setShowFolderOptions(false);
          if (onAuthenticated) onAuthenticated(true);
        } else if (tokenClient.current) {
          tokenClient.current.requestAccessToken({ prompt: "" });
        }
      }

      window.gapi.load("client", start);

      tokenClient.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope:
          "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email",
        callback: async (tokenResponse) => {
          if (!isMounted) return;
          const accessToken = tokenResponse.access_token;
          const expiration = Date.now() + tokenResponse.expires_in * 1000;
          setToken(accessToken);
          window.gapi.client.setToken({ access_token: accessToken });
          try {
            const userInfo = await window.gapi.client.request({
              path: "https://www.googleapis.com/oauth2/v2/userinfo",
            });
            if (!isMounted) return;
            setUserEmail(userInfo.result.email);
            localStorage.setItem("drive_email", userInfo.result.email);
          } catch (err) {
            console.error("Failed to fetch user info", err);
          }
          localStorage.setItem("drive_token", accessToken);
          localStorage.setItem("drive_token_exp", expiration.toString());
          try {
            const jwt = localStorage.getItem("token");
            await fetch(`${API_URL}/config/drive-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`
              },
              body: JSON.stringify({ token: accessToken, exp: expiration })
            });
          } catch (err) {
            console.error("Failed to store token on server", err);
          }
          if (!isMounted) return;
          setIsAuthenticated(true);
          setShowFolderOptions(true);
          if (onAuthenticated) onAuthenticated(true);
          setIsLoading(false);
        },
      });
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Refresco automático del access_token antes de expirar
  useEffect(() => {
    const intervalId = setInterval(() => {
      const exp = parseInt(localStorage.getItem("drive_token_exp"), 10);
      if (Date.now() > exp - 60_000 && tokenClient.current) {
        tokenClient.current.requestAccessToken({ prompt: "" });
      }
    }, 60_000);
    return () => clearInterval(intervalId);
  }, []);

  // Helper para cargar subcarpetas desde el backend
  const loadSubfolders = () => {
    if (!isAuthenticated) return;
    const jwt = localStorage.getItem("token");
    fetch(`${API_URL}/config/subfolders`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setSubfolders)
      .catch((err) => console.error("Failed to fetch subfolders", err));
  };

  // Carga inicial de subcarpetas
  useEffect(() => {
    loadSubfolders();
  }, [isAuthenticated]);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    tokenClient.current.requestAccessToken();
  };

  const shareWithServiceAccount = async (folderId) => {
    try {
      const res = await fetch(`${API_URL}/config/service-account`);
      const data = await res.json();
      if (res.ok && data.email) {
        await window.gapi.client.drive.permissions.create({
          fileId: folderId,
          resource: {
            role: "writer",
            type: "user",
            emailAddress: data.email,
          },
        });
        return true;
      } else {
        throw new Error("Service account email unavailable");
      }
    } catch (err) {
      console.error("Failed to share folder with service account", err);
      alert("Error al compartir la carpeta con la cuenta de servicio");
      return false;
    }
  };

  const handleCreateFolder = async () => {
    setIsCreatingRoot(true);
    try {
      const response = await window.gapi.client.drive.files.create({
        resource: {
          name: newFolderName || "MediPanel_Storage",
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id,name",
      });

      const folderId = response.result.id;
      const path = `https://drive.google.com/drive/folders/${folderId}`;

      const shared = await shareWithServiceAccount(folderId);
      if (!shared) return;

      const res = await fetch(`${API_URL}/config/drive-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          payload.error || payload.message || "Failed to store folder ID"
        );
      }

      setFolderPath(path);
      setRootFolderId(folderId);
      localStorage.setItem("drive_folder_path", path);
      localStorage.setItem("drive_folder_id", folderId);

      alert(`Carpeta creada exitosamente: ${response.result.name}`);
    } catch (err) {
      console.error("Error al crear la carpeta", err);
      alert("Error al crear la carpeta");
    } finally {
      setIsCreatingRoot(false);
    }
  };

  const handleCreateSubfolder = async () => {
    if (!rootFolderId || !subfolderName.trim()) return;
    setIsCreatingSub(true);
    try {
      const res = await fetch(`${API_URL}/config/subfolders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subfolderName.trim() }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          payload.error || payload.message || "Failed to create subfolder"
        );
      }
      await res.json();
      alert("Subcarpeta creada en el servidor");
      setSubfolderName("");
      loadSubfolders();
    } catch (err) {
      console.error("Error al crear subcarpeta", err);
      alert("Error al crear la subcarpeta en el servidor");
    } finally {
      setIsCreatingSub(false);
    }
  };

  const handleDeleteSubfolder = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/config/subfolders/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          payload.error || payload.message || "Failed to delete subfolder"
        );
      }
      await res.json().catch(() => ({}));
      loadSubfolders();
    } catch (err) {
      console.error("Error al eliminar subcarpeta", err);
      alert("Error al eliminar la subcarpeta en el servidor");
    }
  };

  const handleFolderPathSubmit = async (e) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    const trimmed = folderPath.trim();
    setFolderPath(trimmed);
    localStorage.setItem("drive_folder_path", trimmed);
    const idMatch = trimmed.match(/[-\\w]{25,}/);
    if (idMatch) {
      setRootFolderId(idMatch[0]);
      localStorage.setItem("drive_folder_id", idMatch[0]);
      const shared = await shareWithServiceAccount(idMatch[0]);
      if (!shared) return;
      try {
        const res = await fetch(`${API_URL}/config/drive-folder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: idMatch[0] }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload.error || payload.message || "Failed to store folder ID"
          );
        }
      } catch (err) {
        console.error("Failed to store folder ID", err);
        alert("Error al configurar la carpeta en el servidor");
        return;
      }
    }
    alert(`Carpeta configurada: ${trimmed}`);
    setShowFolderOptions(false);
  };

  const handleSignOut = () => {
    if (token) {
      window.google.accounts.oauth2.revoke(token, () => {
        window.gapi.client.setToken("");
      });
    }
    if (localStorage.getItem("token")) {
      const jwt = localStorage.getItem("token");
      fetch(`${API_URL}/config/drive-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({ token: "", exp: 0 })
      }).catch(() => {});
    }
    localStorage.removeItem("drive_token");
    localStorage.removeItem("drive_token_exp");
    localStorage.removeItem("drive_email");
    localStorage.removeItem("drive_folder_path");
    localStorage.removeItem("drive_folder_id");
    setIsAuthenticated(false);
    setShowFolderOptions(false);
    setFolderPath("");
    setRootFolderId("");
    setUserEmail("");
    setToken("");
    if (onAuthenticated) onAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">📁</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Conectar con Google Drive
          </h3>
          <p className="text-slate-600 mb-6">
            Conecta tu cuenta de Google Drive para almacenar archivos de forma segura
          </p>
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Iniciar sesión con Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Google Drive Conectado
            </h3>
            <p className="text-sm text-slate-600">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          Desconectar
        </button>
      </div>

      {showFolderOptions && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-semibold text-slate-700 mb-3">
              Configurar Carpeta de Almacenamiento
            </h4>
            <form onSubmit={handleFolderPathSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ruta de la carpeta
                </label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="/MediPanel_Storage"
                />
              </div>        
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Usar esta carpeta
              </button>
            </form>
            {/* ... el resto de opciones de crear carpeta principal y subcarpeta ... */}
          </div>
        </div>
      )}

      {folderPath && !showFolderOptions && (
        <div className="bg-green-50 p-4 rounded-xl space-y-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-lg">📁</span>
              <div>
                <p className="font-medium text-slate-800">Carpeta configurada</p>
                <p className="text-sm text-slate-600">{folderPath}</p>
              </div>
            </div>
            <button
              onClick={() => setShowFolderOptions(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Cambiar carpeta
            </button>
          </div>

          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Subcarpetas</h4>
            <ul className="space-y-2">
              {subfolders.map((sf) => (
                <li
                  key={sf.folderId}
                  className="flex items-center justify-between bg-white p-2 rounded-lg shadow"
                >
                  <span>{sf.name}</span>
                  <button
                    onClick={() => handleDeleteSubfolder(sf.folderId)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex mt-3 space-x-2">
              <input
                type="text"
                value={subfolderName}
                onChange={(e) => setSubfolderName(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nueva subcarpeta"
              />
              <button
                onClick={handleCreateSubfolder}
                disabled={isCreatingSub}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isCreatingSub ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleDriveAuth;
