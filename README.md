# Registro de socios y firmas para Render

Aplicación Flask con firma táctil y Word basado en plantillas/censura.docx.
La página pública / permite leer la solicitud completa y registrar SIN CLAVE; la administración protegida permite buscar,
ver firmas, descargar el Word completo y eliminar individualmente con otra clave.
El RUT se valida por módulo 11, se guarda como xx.xxx.xxx-x y no se admite duplicado.
RUT de siete dígitos se completa con cero inicial para conservar el mismo formato.
Firmas PNG guardadas en la misma base de datos, no en el disco temporal de Render.

## Montar en Render paso a paso

1. Descomprime este ZIP. Crea un repositorio en GitHub y sube EL CONTENIDO de
   censura_web (app.py, requirements.txt, render.yaml, templates, static, plantillas).
   No subas datos reales, claves ni local.db. La plantilla Word debe ir incluida.
2. En Render: New > Postgres. Crea la base en la misma región que el servicio.
   Copia su Internal Database URL. Selecciona un plan cuya duración y respaldo
   sean adecuados: los planes gratuitos pueden tener caducidad y restricciones.
3. New > Web Service > conecta el repositorio. Runtime: Python 3.
   Root Directory: vacío si app.py está en la raíz; censura_web si subiste la carpeta.
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app --workers 2 --threads 2 --timeout 120
   Health Check Path: /health
4. En Environment, añade estas filas KEY / VALUE:

| KEY | VALUE |
| --- | --- |
| SECRET_KEY | Un valor aleatorio largo (no cambiarlo en cada reinicio) |
| ADMIN_PASSWORD | Tu clave para consultar y descargar |
| DELETE_PASSWORD | Otra clave para eliminar registros |
| DATABASE_URL | Internal Database URL de Postgres |

   Genera SECRET_KEY con: python -c "import secrets; print(secrets.token_hex(32))"
   No incluyas comillas en los valores ni publiques las claves en GitHub.
5. Deploy Web Service. Abre la URL onrender.com para registrar personas.
   Entra en /admin con ADMIN_PASSWORD para ver la nómina y descargar Word.
   Para borrar: introduce DELETE_PASSWORD en la fila y confirma la eliminación.

También puedes importar render.yaml mediante New > Blueprint, después de crear
Postgres, e ingresar las variables solicitadas. No crea una base automáticamente.

## Uso

- Nombre y apellidos, RUT, firma con dedo o mouse, declaración de respaldo y Guardar.
- La firma permanece en pantalla si hay error. Se limpia sólo al guardar correctamente.
- La página pública no muestra nombres, RUT ni firmas de otras personas.
- Word incluye todos los registros por orden de ingreso, aunque hayas aplicado búsqueda.
- Puedes elegir la fecha de la solicitud al descargar. Si no eliges fecha conserva
  literalmente «XX de octubre de 2026» de la plantilla: complétala antes de presentar.
- Exportación mantiene el texto original. No verifica afiliación sindical, porcentajes
  de socios, requisitos jurídicos ni documentos complementarios mencionados en él.
- La captura es una imagen de firma manuscrita; no es firma electrónica avanzada.
- Eliminar no tiene deshacer. Mantén respaldos de PostgreSQL además de las descargas Word.
- SECRET_KEY estable asegura continuidad de sesiones y CSRF; cookies HTTPS en Render.
- No hay clave predeterminada. En Render se exige DATABASE_URL y las tres claves.

## Prueba local (no es el almacenamiento de producción)

Python 3.11 o superior. Ejecuta pip install -r requirements.txt.
Configura SECRET_KEY, ADMIN_PASSWORD y DELETE_PASSWORD en el entorno de tu terminal
(los archivos .env NO se cargan automáticamente). Sin DATABASE_URL utiliza local.db
sólo en local. Ejecuta python app.py. Abre http://localhost:5000.

## Archivos

app.py: servidor, validación, PostgreSQL, protección y exportación Word.
templates/: páginas. static/: diseño y captura por Pointer Events.
plantillas/censura.docx: Word original. Puedes sustituirlo manteniendo la primera
 tabla como N.º / Nombre completo / RUT / Firma y al menos una fila de ejemplo.

Verificado con pruebas de registro, duplicados, RUT, firma vacía, acceso privado,
CSRF, eliminación con clave y exportación Word. Antes de recopilar datos reales,
realiza una prueba completa en tu servicio Render y verifica tu política de respaldos.

## Acceso público y claves

Comparte la URL principal (https://tu-servicio.onrender.com/), sin /admin.
No pide clave para ingresar, leer o firmar. /admin sí exige ADMIN_PASSWORD,
porque muestra los datos personales y habilita la descarga. Para eliminar también
se exige DELETE_PASSWORD. DATABASE_URL es la conexión privada del servidor,
no una clave que deba escribir quien firma. SECRET_KEY protege las sesiones;
tampoco se solicita a los visitantes. No retires estas variables de Render.

Actualización: el texto mostrado se lee directamente de la misma plantilla Word
que se descarga. Sustituir esa plantilla cambia el texto visible para nuevas firmas.
No cambies el contenido de la solicitud mientras recolectas firmas para ella.
