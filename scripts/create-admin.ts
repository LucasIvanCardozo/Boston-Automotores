#!/usr/bin/env npx tsx
import 'dotenv/config'

/**
 * Script to create an admin user
 * Usage: npx tsx scripts/create-admin.ts <username> <password>
 */

import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { AdminRole } from '../generated/prisma/enums'

const BCRYPT_ROUNDS = 12

async function main() {
  // Get credentials from command line arguments
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/create-admin.ts <username> <password>')
    console.error('Example: npx tsx scripts/create-admin.ts admin mySecurePassword123')
    process.exit(1)
  }

  const [username, password] = args

  // Validate password strength
  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters long')
    process.exit(1)
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    console.error('Error: Password must contain at least one uppercase letter, one lowercase letter, and one number')
    process.exit(1)
  }

  // Validate username
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    console.error('Error: Username can only contain letters, numbers, and underscores')
    process.exit(1)
  }

  if (username.length < 3) {
    console.error('Error: Username must be at least 3 characters long')
    process.exit(1)
  }

  // Initialize Prisma
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Check if username already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    })

    if (existingAdmin) {
      console.error(`Error: Username "${username}" already exists`)
      await prisma.$disconnect()
      process.exit(1)
    }

    // Hash password
    console.log('Hashing password...')
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Create admin
    console.log(`Creating admin user: ${username}...`)
    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash,
        role: AdminRole.admin,
      },
    })

    console.log(`
✅ Admin created successfully!

Username: ${admin.username}
Role: ${admin.role}
Created at: ${admin.createdAt.toISOString()}

You can now log in at /admin/login
    `)
  } catch (error) {
    console.error('Error creating admin:', error)
    await prisma.$disconnect()
    process.exit(1)
  }

  await prisma.$disconnect()
  process.exit(0)
}

main()
