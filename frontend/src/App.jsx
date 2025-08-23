import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { FaEnvelope, FaPhoneAlt, FaTag, FaNetworkWired, FaDesktop, FaCodeBranch } from 'react-icons/fa';
import { useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0)
  const [ip, setIp] = useState('...');
  const [browser, setBrowser] = useState('...');
  const [browserVersion, setBrowserVersion] = useState('...');

  useEffect(() => {
    // Detecta navegador e versão
    function getBrowserInfo() {
      const ua = navigator.userAgent;
      let browser = 'Desconhecido';
      let version = '';
      if (ua.indexOf('Chrome') > -1) {
        browser = 'CHROME';
        version = ua.match(/Chrome\/([0-9.]+)/)[1];
      } else if (ua.indexOf('Firefox') > -1) {
        browser = 'FIREFOX';
        version = ua.match(/Firefox\/([0-9.]+)/)[1];
      } else if (ua.indexOf('Safari') > -1) {
        browser = 'SAFARI';
        version = ua.match(/Version\/([0-9.]+)/)[1];
      } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
        browser = 'IE';
        version = ua.match(/(MSIE |rv:)([0-9.]+)/)[2];
      }
      return { browser, version };
    }
    const info = getBrowserInfo();
    setBrowser(info.browser);
    setBrowserVersion(info.version);
    // Busca IP público
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Desconhecido'));
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* Rodapé React com ícones */}
      <footer className="footer-react">
        <div className="footer-row">
          <FaEnvelope /> <span className="footer-info">CORE.MS.AMBULATORIAL@GMAIL.COM</span>
          &nbsp;&nbsp;
          <FaPhoneAlt /> <span className="footer-info">(67) 3378-3550</span>
        </div>
        <div className="footer-row">
          <FaTag /> <b>VERSÃO</b> 1.0.0
          &nbsp;-&nbsp;<FaNetworkWired /> <b>IP</b>: {ip}
          &nbsp;-&nbsp;<FaDesktop /> <b>NAVEGADOR</b>: {browser}
          &nbsp;-&nbsp;<FaCodeBranch /> <b>VERSÃO NAVEGADOR</b>: {browserVersion}
        </div>
      </footer>
    </>
  )
}

export default App
