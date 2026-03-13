import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TEST_USERS = [
  { name: 'Anthony', email: 'anthony@karute.test', role: 'OWNER' as const, initials: 'AL' },
  { name: 'Jon', email: 'jon@karute.test', role: 'STYLIST' as const, initials: 'JC' },
  { name: 'Liam', email: 'liam@karute.test', role: 'STYLIST' as const, initials: 'LM' },
]

async function main() {
  console.log('Seeding database...')

  // Create or find org
  let org = await prisma.organization.findFirst({ where: { slug: 'sakura-clinic' } })
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'さくら整体院',
        slug: 'sakura-clinic',
        plan: 'PRO',
      },
    })
    console.log('Created org:', org.name)
  } else {
    console.log('Org already exists:', org.name)
  }

  for (const user of TEST_USERS) {
    // Create Supabase auth user
    let authUserId: string

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existing = existingUsers?.users.find((u) => u.email === user.email)

    if (existing) {
      authUserId = existing.id
      // Update password
      await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: 'test123' })
      console.log(`Auth user ${user.email} already exists, password updated`)
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: 'test123',
        email_confirm: true,
      })
      if (error) {
        console.error(`Failed to create auth user ${user.email}:`, error.message)
        continue
      }
      authUserId = data.user.id
      console.log(`Created auth user: ${user.email}`)
    }

    // Create or update staff record
    const existingStaff = await prisma.staff.findUnique({ where: { userId: authUserId } })
    if (existingStaff) {
      await prisma.staff.update({
        where: { userId: authUserId },
        data: { name: user.name, role: user.role, email: user.email },
      })
      console.log(`Updated staff: ${user.name}`)
    } else {
      await prisma.staff.create({
        data: {
          orgId: org.id,
          userId: authUserId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
      console.log(`Created staff: ${user.name}`)
    }
  }

  console.log('\nSeed complete! Test accounts:')
  TEST_USERS.forEach((u) => {
    console.log(`  ${u.name}: ${u.email} / test123`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
