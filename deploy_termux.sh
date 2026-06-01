#!/data/data/com.termux/files/usr/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  جاغوار occasions — سكريبت النشر الكامل
#  شغّله في Termux: bash deploy_termux.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🐆 جاغوار occasions — نشر الموقع"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. تحديد مجلد الجاغوار ──────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JAGUAR_DIR="$SCRIPT_DIR"

ok "مجلد الموقع: $JAGUAR_DIR"

# ── 2. فحص الملفات الأساسية ─────────────────
for f in index.html assets/css/styles.css assets/js/app.js assets/js/shared.js assets/js/config.js; do
  [ -f "$JAGUAR_DIR/$f" ] || err "الملف غير موجود: $f"
done
ok "جميع الملفات الأساسية موجودة"

# ── 3. نسخ إلى مجلد Jaguar website v3 ───────
DEST=~/storage/shared/"Jaguar website"/"Jaguar v3"/jaguar_occasions_site_v3/jaguar_occasions_clean
mkdir -p "$DEST"
cp -r "$JAGUAR_DIR"/. "$DEST"/
ok "تم النسخ إلى: $DEST"

# ── 4. تحديث رقم الإصدار في الروابط ─────────
cd "$DEST"
NEWVER="v$(date +%Y%m%d%H%M)"

# index.html
sed -i "s/?v=[0-9]*\"/?${NEWVER}\"/g"   index.html
sed -i "s/?v=[0-9]*'/?${NEWVER}'/g"     index.html
ok "تم تحديث رقم الإصدار في index.html → $NEWVER"

# ── 5. إنشاء site.webmanifest إذا لم يكن موجود ──
if [ ! -f "$DEST/site.webmanifest" ]; then
cat > "$DEST/site.webmanifest" << 'MANIFEST'
{
  "name": "جاغوار occasions",
  "short_name": "جاغوار",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    { "src": "assets/logo/favicon-512-transparent.png", "sizes": "512x512", "type": "image/png" }
  ]
}
MANIFEST
ok "تم إنشاء site.webmanifest"
else
  warn "site.webmanifest موجود مسبقاً، لم يُعدَّل"
fi

# ── 6. إنشاء sw.js (Service Worker) إذا لم يكن موجود ──
if [ ! -f "$DEST/sw.js" ]; then
cat > "$DEST/sw.js" << 'SWEOF'
const CACHE = 'jaguar-v1';
const ASSETS = ['/', 'index.html', 'assets/css/styles.css',
  'assets/js/app.js', 'assets/js/shared.js', 'assets/js/config.js',
  'assets/js/supabaseClient.js', 'assets/images/default-hero.webp'];
self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e =>
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
SWEOF
ok "تم إنشاء sw.js"
else
  warn "sw.js موجود مسبقاً"
fi

# ── 7. ملخص الملفات ──────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📂 ملفات الموقع النهائية:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find "$DEST" -not -path "*/logo/*" -not -name "*.png" -not -name "*.webp" \
  -type f | sort | sed "s|$DEST/||"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ok "اكتمل النشر بنجاح 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
