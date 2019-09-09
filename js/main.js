

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(r => console.log("Service Worker registered"))
      .catch(err => console.log("Error with Service Worker", err));
  }
}

window.onload = () => {
  divTitulo.innerHTML = "Hello PWA World";
  registerServiceWorker();
  get("listarMenus", mostrarMenu);
}

const mostrarMenu=(rpta)=>{
  divPagina.innerHTML = rpta;
}