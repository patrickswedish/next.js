import { Suspense } from 'react'
import { connection } from 'next/server'

const slugs = ['alpha', 'bravo', 'charlie', 'delta', 'echo']

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }))
}

async function DynamicHole() {
  await connection()
  return null
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <main>
      <h1>{slug}</h1>
      <p>Prerendered content for {slug}</p>
      <Suspense fallback={null}>
        <DynamicHole />
      </Suspense>
    </main>
  )
}
