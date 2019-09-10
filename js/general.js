const FIELD_SPLIT_SYM = "|";
const REG_SPLIT_SYM = ";";
const LIST_SPLIT_SYM = "▲"; /*change*/

const requestServer = (() => {
  const checkedResponse = response => {
    //console.log(response);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response;
  };

  const requestDataTypeObj = {
    text: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    json: { "Content-Type": "application/json" }
  };

  const getRequestInit = ({ metodoHttp, tipoRpta, data, requestDataType }) => {
    let headers = new Headers(getLoginConfig());
    
    //if (tipoRpta === "arraybuffer") initObj["responseType"] = "arrayBuffer";
    const initObj = { method: metodoHttp, headers };
    if (metodoHttp !== "GET") {
      headers.append("Content-Type", requestDataTypeObj[requestDataType]["Content-Type"]);
      initObj["body"] = requestDataType === "json" ? JSON.stringify(data): data;      
    }

    return initObj;
  };
  let NWApiUrl = "https://edmiraya.dynu.net/";
  const getAbsolutePath = relativeUrl => {
    const urlBase = NWApiUrl;
    //const urlBase = window.sessionStorage.getItem("urlBase");
    return urlBase + relativeUrl;
  };
  const getLoginConfig = () => {
    return {
      ajax: "true",
      usuario: sessionStorage.getItem("usuario"),
      token: sessionStorage.getItem("token")
    };
  };

  const fnFetch = (pRequestObj, pCallback, pTipoRpta = "text") => {
    fetch(pRequestObj)
      .then(response => checkedResponse(response))
      .then(response => {
        console.log(response);
        if(pTipoRpta==="json") pTipoRpta="text";
        const result = response[pTipoRpta]();
        console.log("fetch", result);
        //response[pTipoRpta]();
        return result;
      }
      )
      .then(body => pCallback(body))
      .catch(err => console.log(err));
  };
  const requestServer = (url, metodoCallBack, options = {}) => {
    let defaults = {
      metodoHttp: "GET",      
      tipoRpta: "text",
      data: undefined,
      requestDataType: undefined
    };
    let settings = Object.assign({}, defaults, options);
    url = getAbsolutePath(url);
    let requestObj = new Request(url, getRequestInit(settings));
    fnFetch(requestObj, metodoCallBack, settings.tipoRpta);
  };

  const get = (url, metodoCallBack) => {
    requestServer(url, metodoCallBack);
  };

  const postJsonToGetText = (url, metodoCallback, data) => {
    let options = {
      metodoHttp: "POST",
      data: { "Data": data },
      requestDataType: "json"
    };
    requestServer(url, metodoCallback, options);
  };

  const post = (url, metodoCallback, data) => {
    let frm = new FormData();
    frm.append("Data", data);

    let options = {
      metodoHttp: "POST",
      data: frm
    };

    requestServer(url, metodoCallback, options);
  };

  const postDownload = (url, metodoCallback, data) => {
    let frm = new FormData();
    frm.append("Data", data);

    let options = {
      metodoHttp: "POST",
      data: frm,
      tipoRpta: "arraybuffer"
    };
    requestServer(url, metodoCallback, options);
  };

  return Object.freeze({ get, post, postJsonToGetText, postDownload });
})();

const get = requestServer.get;
const post = requestServer.post;
const postJsonToGetText = requestServer.postJsonToGetText;
const postDownload = requestServer.postDownload;

const IsNullOrUndefined = v => [null, undefined].includes(v);
const IsWhiteSpace = v => (typeof v === "string" ? v.trim() === "" : undefined);
const IsNullOrWhiteSpace = v => IsNullOrUndefined(v) && IsWhiteSpace(v);

const crearCombo = (cbo, lista, primerItem = null) => {
  let contenido = "";
  if (!IsNullOrWhiteSpace(primerItem))
    contenido += `<option value=''>${primerItem}</option>`;

  let k, v; //key, value
  lista.foreach(val => {
    [k, v] = val.split("|");
    contenido += `<option value='${k}'>${v}</option>`;
  });

  if (cbo !== undefined) {
    cbo.innerHTML = contenido;
    cbo.value = "";
  }
};

const deserializeToMatrix = rpta => {
  //return a matrix from string
  return rpta
    .split(REG_SPLIT_SYM)
    .map(val => val.split(FIELD_SPLIT_SYM).map(val => uSetType(val)));
};

const serializeToMatrix = pMatrix => {
  //return a serialized string from matrix
  return pMatrix.map(val => val.join(FIELD_SPLIT_SYM)).join(REG_SPLIT_SYM);
  //return pMatrix.reduce((acum, val) => acum + val.join(FIELD_SPLIT_SYM), ).join(REG_SPLIT_SYM);
};

const matrixToAlert = pMatrix => {
  let texto = serializeToMatrix(pMatrix);
  texto.replace(REG_SPLIT_SYM, REG_SPLIT_SYM + "\n");
  alert(texto);
};

const subMatrixHijos = (pMatrix, pIndexPadreId, pPadreId) =>
  pMatrix.filter(rw => rw[pIndexPadreId] === pPadreId);

/****************************************/

function imprimir(contenido) {
  pagina = document.body;
  var ventana = window.frames["print_frame"];
  ventana.document.body.innerHTML = "";
  ventana.document.write(contenido);
  ventana.focus();
  ventana.print();
  ventana.close();
  document.body = pagina;
}

function descargarArchivo(data, tipoDato, archivo) {
  if (
    navigator.appVersion.toString().indexOf("Safari") > 0 &&
    !(navigator.appVersion.toString().indexOf("Chrome") > 0)
  ) {
    window.open("data:" + tipoDato + encodeURI(data));
  } else {
    var blob = new Blob(
      tipoDato == "text/csv" || tipoDato == "application/vnd.ms-excel"
        ? ["\ufeff", data]
        : [data],
      { type: tipoDato }
    );
    if ("msSaveBlob" in navigator) {
      navigator.msSaveBlob(blob, archivo);
    } else {
      var link = document.createElement("a");
      document.body.appendChild(link);
      link.download = archivo;
      link.href = window.URL.createObjectURL(blob);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function guardarUrl() {
  var urlBase = document.getElementById("hdfRaiz").value;
  window.sessionStorage.setItem("urlBase", urlBase);
}

var Fecha = (function() {
  function Fecha() {}

  Fecha.esFecha = function(Cadena) {
    var Fecha = new String(Cadena);
    var RealFecha = new Date();
    var Ano = new String(
      Fecha.substring(Fecha.lastIndexOf("/") + 1, Fecha.length)
    );
    var Mes = new String(
      Fecha.substring(Fecha.indexOf("/") + 1, Fecha.lastIndexOf("/"))
    );
    var Dia = new String(Fecha.substring(0, Fecha.indexOf("/")));
    if (isNaN(Ano) || Ano.length < 4 || parseFloat(Ano) < 1900) {
      return false;
    }
    if (isNaN(Mes) || parseFloat(Mes) < 1 || parseFloat(Mes) > 12) {
      return false;
    }
    if (isNaN(Dia) || parseInt(Dia, 10) < 1 || parseInt(Dia, 10) > 31) {
      return false;
    }
    if (Mes == 4 || Mes == 6 || Mes == 9 || Mes == 11 || Mes == 2) {
      if ((Mes == 2 && Dia > 28) || Dia > 30) {
        return false;
      }
    }
    return true;
  };

  Fecha.compararFechas = function(Fecha1, Fecha2) {
    var bRes = false;
    if (Fecha1 != "" && Fecha2 != "") {
      var sDia1 = Fecha1.substr(0, 2);
      var sMes1 = Fecha1.substr(3, 2);
      var sAno1 = Fecha1.substr(6, 4);
      var sDia2 = Fecha2.substr(0, 2);
      var sMes2 = Fecha2.substr(3, 2);
      var sAno2 = Fecha2.substr(6, 4);
      if (sAno1 > sAno2) bRes = true;
      else {
        if (sAno1 == sAno2) {
          if (sMes1 > sMes2) bRes = true;
          else {
            if (sMes1 == sMes2)
              if (sDia1 >= sDia2) {
                bRes = true;
              }
          }
        }
      }
    } else {
      return true;
    }
    return bRes;
  };

  function validarFechaMenorHoy(Tex, Mensaje, Obligatorio) {
    var Texto = document.getElementById(Tex);
    if (Texto != null) {
      if (Obligatorio) {
        if (Texto.value == "") {
          alert("Ingresa " + Mensaje);
          Texto.focus();
        }
        return false;
      }
      if (!esFecha(Texto.value)) {
        alert(Mensaje + " Invalida");
        Texto.select();
        Texto.focus();
        return false;
      }
      if (!compararFechas(fechaActual(), Texto.value)) {
        alert(Mensaje + " debe ser menor o igual a la fecha de hoy.");
        Texto.select();
        Texto.focus();
        return false;
      }
    }
    return true;
  }

  function validarFechaMayorHoy(Tex, Mensaje, Obligatorio) {
    var Texto = document.getElementById(Tex);
    if (Texto != null) {
      if (Obligatorio) {
        if (Texto.value == "") {
          alert("Ingresa " + Mensaje);
          Texto.focus();
        }
        return false;
      }
      if (!esFecha(Texto.value)) {
        alert(Mensaje + " Invalida");
        Texto.focus();
        return false;
      }
      if (!compararFechas(Texto.value, fechaActual())) {
        alert(Mensaje + " debe ser mayor o igual a la fecha de hoy.");
        Texto.focus();
        return false;
      }
    }
    return true;
  }

  function fechaActual() {
    var Fecha = new Date();
    var Ano = Fecha.getYear();
    if (Ano < 1000) Ano += 1900;
    var Dia = Fecha.getDay();
    var Mes = Fecha.getMonth() + 1;
    if (Mes < 10) Mes = "0" + Mes;
    var Dia = Fecha.getDate();
    if (Dia < 10) Dia = "0" + Dia;
    return Dia + "/" + Mes + "/" + Ano;
  }

  function validarFechaHora(Tex, Mensaje, Obligatorio) {
    var Texto = document.getElementById(Tex);
    if (Texto != null) {
      if (Obligatorio) {
        if (Texto.value.replace(/^\s+|\s+$/g, "").length == 0) {
          alert(Mensaje + " debe ser una Fecha");
          Texto.select();
          Texto.focus();
          return false;
        }
      }
      if (Texto.value.replace(/^\s+|\s+$/g, "").length > 0) {
        if (!esFecha(Texto.value)) {
          alert(Mensaje + " Invalida");
          Texto.focus();
          return false;
        }
      }
    }
    return true;
  }
  return Fecha;
})();
window.Fecha = Fecha;

function navegar(url) {
  var urlBase = window.sessionStorage.getItem("urlBase");
  window.location.href = urlBase + url;
}

const cifrarXOR = (text, clave = 10) =>
  Array.from(text).reduce(
    (acum, val) => acum + String.fromCharCode(val.charCodeAt(0) ^ clave),
    ""
  );

function setToken(url, callback) {
  var urlBase = window.sessionStorage.getItem("urlBase");
  var xhr = new XMLHttpRequest();
  xhr.open("get", urlBase + url);
  xhr.setRequestHeader("token", "yes");
  xhr.onreadystatechange = function() {
    if (xhr.status == 200 && xhr.readyState == 4) {
      callback(xhr.responseText);
    }
  };
  xhr.send();
}

function validarDatos() {
  try {
    var mensaje = validarRequeridos("Requerido");
    var spnValida = document.getElementById("spnValida");
    if (mensaje == "") {
      mensaje = validarNumeros("Numero");
      if (mensaje == "") spnValida.innerHTML = "";
      else spnValida.innerHTML = "<ul>" + mensaje + "</ul>";
    } else {
      spnValida.innerHTML = "<ul>" + mensaje + "</ul>";
    }
  } catch (err) {
    console.log(err);
  }
  return mensaje == "";
}

function validarRequeridos(clase) {
  var controles = document.getElementsByClassName(clase);
  var control;
  var nControles = controles.length;
  var fila;
  var mensaje = "";
  for (var j = 0; j < nControles; j++) {
    control = controles[j];
    if (control.value == "") {
      fila = control.parentNode.parentNode;
      mensaje += "<li>Ingresa ";
      mensaje += control.getAttribute("data-msg");
      mensaje += "</li>";
      control.style.borderColor = "red";
    } else {
      control.style.borderColor = "";
    }
  }
  return mensaje;
}

function validarNumeros(clase) {
  var controles = document.getElementsByClassName(clase);
  var control;
  var nControles = controles.length;
  var fila;
  var mensaje = "";
  for (var j = 0; j < nControles; j++) {
    control = controles[j];
    if (isNaN(control.value)) {
      fila = control.parentNode.parentNode;
      mensaje += "<li>";
      mensaje += control.getAttribute("data-msg");
      mensaje += " debe ser numérico</li>";
      control.style.borderColor = "red";
    } else {
      if (control.value * 1 < 0) {
        fila = control.parentNode.parentNode;
        mensaje += "<li>";
        mensaje += control.getAttribute("data-msg");
        mensaje += " debe ser numérico mayor o igual a cero</li>";
        control.style.borderColor = "red";
      } else control.style.borderColor = "";
    }
  }
  return mensaje;
}
