'use client';

import React, { useEffect, useRef } from "react"
import { setCookie, getCookie } from "cookies-next"

function TerminalComponent() {
  useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/vm");
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched id");
          console.log(data.id)
          setCookie("id", data.id)
        } else {
          console.error("Failed to fetch id");
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (!getCookie("id")) {
      fetchId();
    }
  }, []);

  const terminalRef = useRef(null);
  const ws = useRef(null);
  let inp = "";

  var baseTheme = {
    foreground: '#eff0eb',
    background: '#282a36',
    selection: '#97979b33',
    black: '#282a36',
    brightBlack: '#686868',
    red: '#ff5c57',
    brightRed: '#ff5c57',
    green: '#5af78e',
    brightGreen: '#5af78e',
    yellow: '#f3f99d',
    brightYellow: '#f3f99d',
    blue: '#57c7ff',
    brightBlue: '#57c7ff',
    magenta: '#ff6ac1',
    brightMagenta: '#ff6ac1',
    cyan: '#9aedfe',
    brightCyan: '#9aedfe',
    white: '#f1f1f0',
    brightWhite: '#eff0eb'
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { Terminal } = require("@xterm/xterm");
      const { FitAddon } = require("@xterm/addon-fit");

      const term = new Terminal(
        {
          fontFamily: `'Fira Code', ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace`,
          fontSize: 16,
          theme: baseTheme,
          convertEol: true,
          cursorBlink: true,
        }
      );
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
  
      term.open(terminalRef.current);
      fitAddon.fit();
  
      term.onKey((e) => {
        const ev = e.domEvent;
        if (ev.key === "Enter") {
          term.write("\r\n");
          ws.current.send(inp);
          inp = "";
        }
        else if (ev.key === "Backspace") {
          if (inp.length === 0) return;
          term.write("\b \b");
          inp = inp.slice(0, -1);
        }
        else {
          if (ev.key.length != 1) return;
          term.write(ev.key);
          inp += ev.key;
        }
      });
  
      ws.current = new WebSocket("ws://localhost:8000/api/vm/");
      ws.current.onopen = () => {
        console.log("Connected to the websocket server");
      }
      ws.current.onmessage = (event) => {
        term.write(event.data);
      }
  
      return () => {
        term.dispose(); 
      };
    }
    
  }, []);

  return <div ref={terminalRef} style={{ height: "100%" }}/>;
}

export default TerminalComponent;