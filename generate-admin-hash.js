/**
 *
 * Script para generar el hash de la contraseña del primer usuario admin.
 * Ejecuta con Node 18+ (usa Web Crypto, disponible nativamente):
 *
 *   node generate-admin-hash.js TuContraseñaSegura123
 *
 * Copia el hash resultante y reemplázalo en schema_users.sql
 * en el campo password_hash del INSERT.
 */

const SALT = "bethel-msbn-2026"; // debe coincidir EXACTAMENTE con functions/_lib/auth.js

async function hashPassword(password) {
  const data = new TextEncoder().encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const password = process.argv[2];

if (!password) {
  console.log("Uso: node generate-admin-hash.js TuContraseña");
  process.exit(1);
}

hashPassword(password).then((hash) => {
  console.log("\nHash generado:\n");
  console.log(hash);
  console.log("\nCópialo y reemplaza __REEMPLAZAR_CON_HASH_GENERADO__ en schema_users.sql\n");
});