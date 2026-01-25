import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // ดึง Webhook Secret จาก environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('กรุณาเพิ่ม CLERK_WEBHOOK_SECRET ในไฟล์ .env')
  }

  // ดึง headers จาก request
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // ถ้าไม่มี headers ที่จำเป็น = ไม่ใช่ request จาก Clerk
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('ไม่พบ svix headers', { status: 400 })
  }

  // ดึง body จาก request
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify ว่า request มาจาก Clerk จริง
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }

  // ดึงประเภท event
  const eventType = evt.type

  console.log(`Webhook received: ${eventType}`)

  // จัดการแต่ละประเภท event
  if (eventType === 'user.created') {
    // มีคนสมัครใหม่ → สร้าง User ใน Database
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    if (!email) {
      return new Response('ไม่พบ email', { status: 400 })
    }

    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    await prisma.user.create({
      data: {
        clerkId: id,
        email: email,
        name: name,
        avatar: image_url || null,
      },
    })

    console.log(`สร้าง User สำเร็จ: ${email}`)
  }

  if (eventType === 'user.updated') {
    // User แก้ไขข้อมูล → อัพเดท Database
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: email,
        name: name,
        avatar: image_url || null,
      },
    })

    console.log(`อัพเดท User สำเร็จ: ${email}`)
  }

  if (eventType === 'user.deleted') {
    // User ลบบัญชี → ลบออกจาก Database
    const { id } = evt.data

    if (id) {
      await prisma.user.delete({
        where: { clerkId: id },
      })

      console.log(`ลบ User สำเร็จ: ${id}`)
    }
  }

  return new Response('OK', { status: 200 })
}