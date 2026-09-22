# Script para servir CAINE Evolution localmente
# Ejecutar con: python server.py

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

PORT = 8000

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(('localhost', PORT), CORSRequestHandler)
    print(f'🎪 CAINE Evolution corriendo en http://localhost:{PORT}')
    print('Presiona Ctrl+C para detener')
    server.serve_forever()

if __name__ == '__main__':
    run()