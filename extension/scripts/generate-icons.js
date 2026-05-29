const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const dir = path.join(__dirname, "..", "assets")
fs.mkdirSync(dir, { recursive: true })

const sizes = [
  { name: "icon16.png", size: 16 },
  { name: "icon32.png", size: 32 },
  { name: "icon48.png", size: 48 },
  { name: "icon64.png", size: 64 },
  { name: "icon128.png", size: 128 },
  { name: "icon.png", size: 512 }
]

async function main() {
  for (const { name, size } of sizes) {
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 139, g: 92, b: 246, alpha: 1 }
      }
    })
      .png()
      .toFile(path.join(dir, name))
    console.log("Wrote", name)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
