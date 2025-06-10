cat > postcss.config.js << 'EOF'
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

module.exports = config
EOF