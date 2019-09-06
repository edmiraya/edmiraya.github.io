window.onload = () => {
  divTitulo.innerHTML = "Hello PWA World";
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(r => console.log("Service Worker registered"))
      .catch(console.log);
  }
};
