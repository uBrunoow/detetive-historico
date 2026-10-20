export const SETTINGS_KEY = "detetive-historico:v1:settings";

/**
 * Script que roda no <head>, antes da pintura, para aplicar as preferências
 * (movimento, tamanho do texto) sem a página piscar.
 */
export const settingsBootScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  SETTINGS_KEY,
)})||"{}");var e=document.documentElement;e.dataset.reduceMotion=String(!!s.reduceMotion);e.dataset.textSize=s.textSize==="large"?"large":"normal";}catch(_){}})();`;
