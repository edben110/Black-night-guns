# Black Night Guns 

Juego de acción 2D desarrollado con HTML5 Canvas, JavaScript vanilla y CSS.

## Descripción

Juego de acción donde controlas un personaje que debe enfrentarse a oleadas de enemigos. Incluye sistema de combate cuerpo a cuerpo, disparos, recarga de munición, curaciones y recolección de objetos.

## Controles

- **A/D**: Mover izquierda/derecha
- **W/S**: Subir/Bajar
- **Espacio**: Saltar
- **J**: Atacar cuerpo a cuerpo
- **K**: Disparar
- **R**: Recargar
- **H**: Curar (consume vendajes)
- **F**: Recoger objetos
- **P**: Pausa
- **Enter**: Reiniciar después de perder

## Estructura del Proyecto

```
Black-night-guns/
├── index.html          # Archivo HTML principal
├── styles.css          # Estilos del juego
├── game.js            # Lógica del juego
├── vercel.json        # Configuración para Vercel
├── package.json       # Metadatos del proyecto
├── .gitignore         # Archivos ignorados por Git
└── README.md          # Este archivo
```

## Despliegue

### GitHub Pages

1. **Crear repositorio en GitHub**:
   - Ve a https://github.com/new
   - Crea un repositorio nuevo (puede ser público o privado)
   - No inicialices con README

2. **Subir el código**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

3. **Activar GitHub Pages**:
   - Ve a Settings → Pages
   - En "Source", selecciona "main" branch
   - Guarda y espera unos minutos
   - Tu sitio estará en: `https://TU_USUARIO.github.io/TU_REPOSITORIO`

### Vercel

1. **Desde la interfaz web** (Recomendado):
   - Ve a https://vercel.com
   - Inicia sesión con GitHub
   - Click en "New Project"
   - Importa tu repositorio
   - ¡Vercel detectará automáticamente el proyecto!
   - Click "Deploy"

2. **Desde CLI**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Actualizaciones**:
   - Cada push a main desplegará automáticamente

### AWS (Amazon Web Services)

#### Opción 1: AWS Amplify (Más fácil)

1. **Desde AWS Console**:
   - Ve a AWS Amplify
   - Click "Get Started" → "Host web app"
   - Conecta tu repositorio GitHub
   - Selecciona tu repositorio y rama
   - AWS detectará automáticamente la configuración
   - Click "Save and deploy"

2. **Configuración de build**:
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands:
           - echo "No build required for static site"
     artifacts:
       baseDirectory: /
       files:
         - '**/*'
     cache:
       paths: []
   ```

#### Opción 2: S3 + CloudFront (Más control)

1. **Crear bucket S3**:
   ```bash
   aws s3 mb s3://black-night-guns-game
   aws s3 sync . s3://black-night-guns-game --exclude ".git/*" --exclude "README.md"
   ```

2. **Configurar como sitio web**:
   - En S3 Console, ve a tu bucket
   - Properties → Static website hosting
   - Habilita y establece index.html como documento de índice

3. **Hacer público**:
   - Permissions → Block public access: desactivar
   - Bucket Policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::black-night-guns-game/*"
     }]
   }
   ```

4. **Opcional - CloudFront para HTTPS**:
   - Crea una distribución CloudFront
   - Origin: tu bucket S3
   - Viewer Protocol Policy: Redirect HTTP to HTTPS

### Azure Static Web Apps

#### Opción 1: Desde Azure Portal

1. **Crear recurso**:
   - Ve a Azure Portal
   - Busca "Static Web Apps"
   - Click "Create"
   - Selecciona tu suscripción y grupo de recursos
   - Nombre: black-night-guns
   - Region: la más cercana

2. **Configurar GitHub**:
   - Autoriza Azure a acceder a GitHub
   - Selecciona tu repositorio y rama
   - Build Presets: Custom
   - App location: `/`
   - No configurar API o output location
   - Click "Review + Create"

#### Opción 2: Desde Azure CLI

```bash
# Instalar Azure CLI si no lo tienes
# Windows: https://aka.ms/installazurecliwindows

# Login
az login

# Crear Static Web App
az staticwebapp create \
  --name black-night-guns \
  --resource-group TU_GRUPO_RECURSOS \
  --location "Central US" \
  --source https://github.com/TU_USUARIO/TU_REPOSITORIO \
  --branch main \
  --app-location "/" \
  --login-with-github
```

3. **Configuración automática**:
   - Azure creará un archivo `.github/workflows/azure-static-web-apps-*.yml`
   - Este archivo automatizará los despliegues futuros

#### Archivo de configuración (staticwebapp.config.json)

Crea este archivo para configuraciones avanzadas:

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "mimeTypes": {
    ".json": "application/json",
    ".js": "text/javascript",
    ".css": "text/css"
  }
}
```

## Prueba Local

### Opción 1: Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Opción 2: Node.js http-server
```bash
npx http-server -p 8000
```

### Opción 3: VS Code Live Server
- Instala la extensión "Live Server"
- Click derecho en index.html → "Open with Live Server"

Abre tu navegador en: http://localhost:8000

## Características

- Combate cuerpo a cuerpo
- Sistema de disparos con munición limitada
- Sistema de recarga
- Sistema de salud y curaciones
- Recolección de objetos (munición y vendajes)
- Sistema de pausa
- Contador de enemigos derrotados
- Mecánica de salto
- Knockback al recibir daño
- Barras de progreso para acciones

## Tecnologías

- HTML5 Canvas
- JavaScript ES6+
- CSS3

## Notas de Despliegue

### GitHub Pages
- **Gratis** para repositorios públicos
- **Fácil** de configurar
- Solo sitios estáticos
- URL: `usuario.github.io/repositorio`

### Vercel
- **Gratis** para proyectos personales
- **Deploy automático** con Git
- **HTTPS gratis**
- **Preview deployments** para PRs
- URL: `proyecto.vercel.app`

### AWS
- **Capa gratuita** disponible (12 meses)
- **Muy escalable**
- Requiere configuración más compleja
- Control total de infraestructura

### Azure
- **Capa gratuita** disponible
- **Integración con GitHub Actions**
- **HTTPS automático**
- **Global CDN**
- URL: `nombre.azurestaticapps.net`

## Solución de Problemas

### El juego no carga
- Verifica que todos los archivos estén en la misma carpeta
- Abre la consola del navegador (F12) para ver errores
- Asegúrate de que las rutas en index.html sean correctas

### En GitHub Pages aparece el código en lugar del juego
- Asegúrate de que el archivo se llame `index.html` (no `index.htm` o `Index.html`)
- Verifica que GitHub Pages esté habilitado en Settings

### En Vercel muestra error 404
- Verifica que `vercel.json` esté en la raíz del proyecto
- Asegúrate de que el proyecto esté en la rama correcta

## Licencia

MIT License - Siéntete libre de usar y modificar este código.

## Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit tus cambios: `git commit -m 'Agregar nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

---

¡Disfruta el juego! 🎮🚀
