const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')

console.log('1/2 Building Vite...')
execSync('npx vite build', { cwd: ROOT, stdio: 'inherit' })

console.log('2/2 Packaging Electron...')
execSync('npx electron-builder --win --config electron-builder.yml', {
  cwd: ROOT,
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/'
  }
})

console.log('✓ Build complete! Check release/ folder.')
