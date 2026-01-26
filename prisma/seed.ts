import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('เริ่มสร้างข้อมูลเริ่มต้น...')

  // สร้างหมวดหมู่นิยาย
  const genres = [
    'แฟนตาซี',
    'โรแมนติก',
    'แอ็คชั่น',
    'สืบสวน',
    'สยองขวัญ',
    'คอมเมดี้',
    'ดราม่า',
    'ไซไฟ',
    'ย้อนยุค',
    'วาย',
    'ยูริ',
    'สไลซ์ออฟไลฟ์',
    'ผจญภัย',
    'กีฬา',
  ]

  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    console.log(`สร้างหมวดหมู่: ${name}`)
  }

  console.log('สร้างข้อมูลเริ่มต้นเสร็จสิ้น!')
}

main()
  .catch((e) => {
    console.error('เกิดข้อผิดพลาด:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })