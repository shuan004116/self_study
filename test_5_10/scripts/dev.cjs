const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')

async function main() {
  // 1. 启动 Vite 开发服务器
  const { createServer } = require('vite')
  const viteServer = await createServer({
    root: ROOT,
    configFile: path.join(ROOT, 'vite.config.ts')
  })
  await viteServer.listen()

  const address = viteServer.httpServer?.address()
  const url = `http://localhost:${address.port}`
  console.log(`✓ Vite dev server: ${url}`)

  // 2. 获取 Electron 二进制路径
  const electronPkg = path.join(ROOT, 'node_modules', 'electron')
  const pathFile = path.join(electronPkg, 'path.txt')

  if (!fs.existsSync(electronPkg) || !fs.existsSync(pathFile)) {
    console.error('✗ Electron not installed')
    process.exit(1)
  }

  const exeName = fs.readFileSync(pathFile, 'utf-8').trim()
  const electronBin = path.join(electronPkg, 'dist', exeName)

  if (!fs.existsSync(electronBin)) {
    console.error(`✗ Electron binary not found at: ${electronBin}`)
    process.exit(1)
  }

  console.log(`✓ Electron binary: ${electronBin}`)

  // 3. 启动 Electron
  // 必须移除 ELECTRON_RUN_AS_NODE，否则 Electron 会以 Node.js 模式运行
  const env = { ...process.env, NODE_ENV: 'development' }
  delete env.ELECTRON_RUN_AS_NODE

  const electronProcess = spawn(electronBin, ['.'], {
    cwd: ROOT,
    env,
    stdio: 'inherit'
  })

  electronProcess.on('close', () => {
    viteServer.close()
    process.exit()
  })

  process.on('SIGINT', () => {
    electronProcess.kill()
    viteServer.close()
    process.exit()
  })
}

main().catch(console.error)
